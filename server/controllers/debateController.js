const Debate = require('../models/Debate');
const OpenAI = require('openai')

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// All models run through Groq's free API
const groqModels = {
  llama: 'llama-3.3-70b-versatile',
  gemma: 'gemma2-9b-it',
  mixtral: 'mixtral-8x7b-32768',
  deepseek: 'deepseek-r1-distill-llama-70b'
};
const buildSystemPrompt = (modelName, role, topic) => {
    const rolePrompts = {
        'Proposition': 'You argue strongly in favor of the statement.',
        'Opposition': 'You argue strongly against the statement.',
        'Devil\'s Advocate': 'You challenge whoever seems to be winning the argument.',
        'Skeptic': 'You question everything and demand evidence.',
        'Pragmatist': 'You focus on real world feasibility and practicality.',
        'Visionary': 'You think big picture and future focused.',
        'Contrarian': 'You disagree on principle and challenge assumptions.'        
    };

    const roleInstruction = role ? rolePrompts[role] : '';

  return `You are ${modelName} AI participating in a debate about: "${topic}".
${roleInstruction}
Keep your responses concise and punchy — 2 to 3 sentences max per bubble.
Be direct, confident, and stay in character as ${modelName}.
Do not repeat what others have said, build on or challenge it.`;
}


const callGroqModel = async (modelName, messages, systemPrompt, res) => {
  const stream = await groq.chat.completions.create({
    model: groqModels[modelName],
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    stream: true
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ model: modelName, text })}\n\n`);
    }
  }
  return fullResponse;
};


const runRound = async (req,res) => {
    const { debateId, roundNumber } = req.body;

    try {
        const debate = await Debate.findById(debateId);
        if (!debate) return res.status(404).json({ message: 'Debate not found' });

        //SSE Headers: Server Sent Events, which opens the server-client connection forever until closed on certain condition
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        //build conversation history for context
        const history = debate.messages.map(m => ({
            role: m.model === 'user' ? 'user' : 'assistant',
            content: `${m.model.toUpperCase()}: ${m.content}`
        }));

        //add current round prompt
        const roundPrompt = `This is round ${roundNumber}. Respond to the debate so far.`;
        const messages = [...history, { role: 'user', content: roundPrompt }];

        const models = ['llama', 'gemma', 'mixtral', 'deepseek'];

        for (const modelName of models) {
      const role = debate.roles[modelName];
      const systemPrompt = buildSystemPrompt(modelName, role, debate.topic);

      res.write(`data: ${JSON.stringify({ event: 'model_start', model: modelName })}\n\n`);

      const response = await callGroqModel(modelName, messages, systemPrompt, res);

      // save message to DB
      debate.messages.push({
        model: modelName,
        role: role || 'none',
        content: response,
        round: roundNumber
      });

      res.write(`data: ${JSON.stringify({ event: 'model_done', model: modelName })}\n\n`);
    }

    await debate.save();

    res.write(`data: ${JSON.stringify({ event: 'round_done', roundNumber })}\n\n`);
    res.end()
    } catch(err){
        res.write(`data: ${JSON.stringify({ event: 'error', message: err.message})}\n\n`);
        res.end()
    }
};

const startDebate = async (req, res) => {
    try {
        const { topic, rounds, roles } = req.body;
        const debate = await Debate.create({
            user: req.user._id,
            topic,
            rounds,
            roles: roles || {}
        });
        res.status(201).json({ debateId: debate._id });
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

const addModeratorMessage = async (req,res) => {
    try {
        const { debateId, content } = req.body;
        const debate = await Debate.findById(debateId);
        debate.messages.push({ model: 'user', role: 'moderator', content, round: req.body.roundNumber });
        await debate.save();
        res.json({ message: 'Moderator message saved' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const endDebate = async (req,res) => {
    try {
        const { debateId } = req.body;
        const debate = await Debate.findById(debateId);
        if (!debate) return res.status(404).json({ message: 'Debate not found' });
        if (debate.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Build transcript for summary
        const transcript = debate.messages.map(m =>
            `${m.model.toUpperCase()} (${m.role || 'none'}, Round ${m.round}): ${m.content}`
        ).join('\n\n');

        // Generate summary via Groq/Llama
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are a debate summarizer. Provide a concise summary of the debate: key arguments from each side, points of agreement/disagreement, and which arguments were strongest. Keep it to 3-4 sentences.' },
                { role: 'user', content: `Debate topic: "${debate.topic}"\n\nTranscript:\n${transcript}` }
            ]
        });

        const summary = completion.choices[0]?.message?.content || 'Summary could not be generated.';
        debate.summary = summary;
        await debate.save();

        res.json({ message: 'Debate ended', summary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDebateById = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    if (debate.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(debate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getDebateHistory = async (req, res) => {
  try {
    const debates = await Debate.find({ user: req.user._id }).select('topic rounds createdAt summary');
    res.json(debates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startDebate, runRound, addModeratorMessage, endDebate, getDebateHistory, getDebateById };