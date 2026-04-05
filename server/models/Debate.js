const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  modelId: String,
  role: String,
  content: String,
  round: Number
});

const debateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  rounds: {
  type: Number,
  enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  required: true
  },
  tone: {
    type: String,
    enum: ['formal', 'aggressive', 'socratic', 'satirical'],
  },
  roles: {
    llama: String,
    gemma: String,
    mixtral: String,
    deepseek: String
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing'
  },
  messages: [messageSchema],
  summary: String
}, { timestamps: true });

module.exports = mongoose.model('Debate', debateSchema);