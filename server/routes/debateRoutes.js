const express = require('express')
const router = express.Router()
const { startDebate, runRound, addModeratorMessage, endDebate, getDebateHistory, getDebateById } = require('../controllers/debateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startDebate);
router.post('/round', protect, runRound);
router.post('/moderator', protect, addModeratorMessage);
router.post('/end', protect, endDebate);
router.get('/history', protect, getDebateHistory);
router.get('/:id', protect, getDebateById);

module.exports = router;