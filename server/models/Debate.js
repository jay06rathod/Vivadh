const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  model: String,
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
    enum: [3],
    required: true
  },
  roles: {
    llama: String,
    gemma: String,
    mixtral: String,
    deepseek: String
  },
  messages: [messageSchema],
  summary: String
}, { timestamps: true });

module.exports = mongoose.model('Debate', debateSchema);