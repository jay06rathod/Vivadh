const Debate = require('../models/Debate');
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const groqModels = {
  llama:    'llama-3.3-70b-versatile',              // ✅ production
  gemma:    'llama-3.1-8b-instant',                 // ✅ production
  mixtral:  'meta-llama/llama-4-scout-17b-16e-instruct', // ✅ preview
  deepseek: 'openai/gpt-oss-20b'                        // ✅ preview
};

const buildSystemPrompt = (modelName, role, topic, tone) => {
  const rolePrompts = {
    'proposition':      'You argue strongly in favor of the statement.',
    'opposition':       'You argue strongly against the statement.',
    'devils-advocate':  'You challenge whoever seems to be winning the argument.',
    'skeptic':          'You question everything and demand evidence.',
    'pragmatist':       'You focus on real world feasibility and practicality.',
    'visionary':        'You think big picture and future focused.',
    'contrarian':       'You disagree on principle and challenge assumptions.'
  };

  const tonePrompts = {
    'formal':     'Speak in a formal, academic, structured tone. Use precise language.',
    'aggressive': 'Speak aggressively and combatively. Be sharp, blunt, and ruthless in your arguments.',
    'socratic':   'Speak in a socratic style. Ask probing questions and challenge assumptions methodically.',
    'satirical':  'Speak with wit, irony, and satire. Be clever and irreverent.'
  };

  const roleInstruction = role ? (rolePrompts[role] || '') : '';
  const toneInstruction = tone ? (tonePrompts[tone] || '') : '';

  return `You are ${modelName} AI participating in a debate about: "${topic}".
  ${roleInstruction}
  ${toneInstruction}
  Keep your responses concise and punchy — 2 to 3 sentences max per bubble.
  Be direct, confident, and stay in character as ${modelName}.
  Do not repeat what others have said, build on or challenge it.
  Write in plain conversational English only — no markdown, no bullet points, no asterisks, no bold, no headers. Just speak naturally like a human in a debate.`;
  };


const stripMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')          // **bold** → bold
    .replace(/\*(.*?)\*/g, '$1')              // *italic* → italic
    .replace(/^#{1,6}\s+/gm, '')              // ### headings
    .replace(/^[\-\*]\s+/gm, ' ')            // bullet points → space not empty
    .replace(/^\d+\.\s+/gm, ' ')             // numbered lists → space not empty
    .replace(/`{1,3}[^`]*`{1,3}/g, '')       // `code` blocks
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // [links](url)
    .replace(/^>\s+/gm, '')                   // > blockquotes
    .replace(/---+/g, '')                     // horizontal rules
    .replace(/\n{3,}/g, '\n\n')              // collapse excessive newlines
};

const callGroqModel = async (modelName, messages, systemPrompt, res) => {
  const stream = await groq.chat.completions.create({
    model: groqModels[modelName],
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    stream: true
  });

  let fullResponse = '';
  let insideThink = false;
  let thinkBuffer = '';

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (!text) continue;

    fullResponse += text;
    thinkBuffer += text;

    if (thinkBuffer.includes('<think>')) insideThink = true;
    if (thinkBuffer.includes('</think>')) {
      insideThink = false;
      const afterThink = thinkBuffer.split('</think>').pop();
      thinkBuffer = '';
      // Stream as-is, no stripMarkdown during streaming
      if (afterThink) {
        res.write(`data: ${JSON.stringify({ type: 'token', content: afterThink })}\n\n`);
      }
      continue;
    }

    if (!insideThink) {
      // Stream as-is — no processing during streaming
      res.write(`data: ${JSON.stringify({ type: 'token', content: text })}\n\n`);
      thinkBuffer = '';
    }
  }

  // Only strip on the final saved version — not during streaming
  const withoutThink = fullResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  return stripMarkdown(withoutThink);
};



const runRound = async (req, res) => {
  const debateId = req.params.id;
  const { round: roundNumber, moderatorMessage } = req.body; // ← added moderatorMessage

  try {
    const debate = await Debate.findById(debateId);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const models = ['llama', 'gemma', 'mixtral', 'deepseek'];
    const currentRoundMessages = [];

    for (const modelName of models) {
      const role = debate.roles[modelName];
      const systemPrompt = buildSystemPrompt(modelName, role, debate.topic, debate.tone);

      const allMessages = [
        ...debate.messages.map(m => ({
          role: 'assistant',
          content: `${(m.modelId || 'user').toUpperCase()} (${m.role || 'none'}, Round ${m.round}): ${m.content}`
        })),
        ...currentRoundMessages.map(m => ({
          role: 'assistant',
          content: `${m.modelId.toUpperCase()} (${m.role || 'none'}, Round ${m.round}): ${m.content}`
        }))
      ];
      const history = allMessages.slice(-10);
      // Much more explicit prompt so models actually engage with each other
      const roundPrompt = moderatorMessage
        ? `The moderator just said: "${moderatorMessage}". This is still round ${roundNumber}. Read everything above carefully and respond directly to what others have argued AND address the moderator's point. Be specific — name the argument you're challenging.`
        : roundNumber === 1
          ? `This is round ${roundNumber} of the debate. Make your opening argument about the topic. Be direct and confident.`
          : `This is round ${roundNumber}. Read every message above carefully. Respond directly to the specific points made by the other models — challenge them, build on them, or dismantle them. Be specific about who said what.`;

      const messages = [...history, { role: 'user', content: roundPrompt }];

      res.write(`data: ${JSON.stringify({ type: 'model_start', modelId: modelName })}\n\n`);

      const response = await callGroqModel(modelName, messages, systemPrompt, res);

      currentRoundMessages.push({
        modelId: modelName,
        role: role || 'none',
        content: response,
        round: roundNumber
      });

      debate.messages.push({
        modelId: modelName,
        role: role || 'none',
        content: response,
        round: roundNumber
      });

      res.write(`data: ${JSON.stringify({ type: 'model_end', modelId: modelName })}\n\n`);
    }

    await debate.save();
    res.write(`data: ${JSON.stringify({ type: 'round_end', roundNumber })}\n\n`);
    res.end();

  } catch (err) {
    console.error('runRound error:', err.message);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
};

const startDebate = async (req, res) => {
  try {
    const { topic, rounds, roles, tone } = req.body;
    const parsedRounds = Number(rounds);
    const finalRounds = isNaN(parsedRounds) ? 3 : parsedRounds;

    const debate = await Debate.create({
      user: req.user._id,
      topic,
      rounds: finalRounds,
      tone: tone || undefined,
      roles: roles || {}
    });

    res.status(201).json({ debateId: debate._id });
  } catch(err) {
    console.error('startDebate error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const addModeratorMessage = async (req, res) => {
  const debateId = req.params.id;
  const { content, roundNumber } = req.body;
  try {
    const debate = await Debate.findById(debateId);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });

    // BUG 3 FIX — was model:'user', schema uses modelId
    debate.messages.push({ modelId: 'user', role: 'moderator', content, round: roundNumber });
    await debate.save();
    res.json({ message: 'Moderator message saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const endDebate = async (req, res) => {
  const debateId = req.params.id;
  try {
    const debate = await Debate.findById(debateId);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    if (debate.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const transcript = debate.messages.map(m =>
      `${(m.modelId || 'user').toUpperCase()} (${m.role || 'none'}, Round ${m.round}): ${m.content}`
    ).join('\n\n');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a debate summarizer. Provide a concise summary of the debate: key arguments from each side, points of agreement/disagreement, and which arguments were strongest. Keep it to 3-4 sentences.' },
        { role: 'user', content: `Debate topic: "${debate.topic}"\n\nTranscript:\n${transcript}` }
      ]
    });

    const summary = completion.choices[0]?.message?.content || 'Summary could not be generated.';
    debate.summary = summary;
    debate.status = 'completed'; // ← THIS WAS MISSING
    await debate.save();

    res.json({ message: 'Debate ended', summary });
  } catch (err) {
    console.error('endDebate error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const getDebateById = async (req, res) => {
  try {
    // Add this line ↓
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Debate not found' });
    }

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
    const debates = await Debate.find({ user: req.user._id })
      .select('topic rounds tone roles createdAt summary')
      .sort({ createdAt: -1 });
    res.json(debates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startDebate, runRound, addModeratorMessage, endDebate, getDebateHistory, getDebateById };