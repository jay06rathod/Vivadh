const Debate = require('../models/Debate');
const OpenAI = require('openai')
const Anthropic = require('@anthropic-ai/sdk')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY});
const gemini = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY});
const deepseek = new OpenAI({ 
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com'
});

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


const callGPT = async (messages, systemPrompt, res) => {
    const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt}, ...messages],
        stream: true
    });

    let fullResponse = '';
    for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
            fullResponse += text;
            res.write(`data: ${JSON.stringify({model: 'gpt', text})}\n\n`);
        }
    }
    return fullResponse;
};

const callClaude = async (messages, systemPrompt, res) => {
  const stream = await anthropic.messages.stream({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 150,
    system: systemPrompt,
    messages
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      const text = chunk.delta?.text || '';
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ model: 'claude', text })}\n\n`);
      }
    }
  }
  return fullResponse;
};

const callGemini = async (messages, systemPrompt, res) => {
  const model = gemini.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt
  });

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessageStream(lastMessage);

  let fullResponse = '';
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ model: 'gemini', text })}\n\n`);
    }
  }
  return fullResponse;
};

const callDeepSeek = async (messages, systemPrompt, res) => {
  const stream = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    stream: true
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ model: 'deepseek', text })}\n\n`);
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
        const history = debate.message.map(m => ({
            role: m.model === 'user' ? 'user' : 'assistant',
            content: `${m.model.toUpperCase()}: ${m.content}`
        }));

        //add current round prompt
        const roundPrompt = `This is round ${roundNumber}. Respond to the debate so far.`;
        const messages = [...history, { role: 'user', content: roundPrompt }];

        const models = ['gpt', 'gemini', 'deepseek', 'claude'];

        for (const modelName of models) {
      const role = debate.roles[modelName];
      const systemPrompt = buildSystemPrompt(modelName, role, debate.topic);

      res.write(`data: ${JSON.stringify({ event: 'model_start', model: modelName })}\n\n`);

      let response = '';

      if (modelName === 'gpt') response = await callGPT(messages, systemPrompt, res);
      else if (modelName === 'gemini') response = await callGemini(messages, systemPrompt, res);
      else if (modelName === 'deepseek') response = await callDeepSeek(messages, systemPrompt, res);
      else if (modelName === 'claude') response = await callClaude(messages, systemPrompt, res);

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
        res.status(500).json({ message: error.message });
    }
};

const endDebate = async (req,res) => {
    try {
        const debates = await Debate.find({ user: req.user._id}).select('topic rounds createdAt summary');
        res.json(debates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDebateById = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    res.json(debate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startDebate, runRound, addModeratorMessage, endDebate, getDebateHistory, getDebateById };