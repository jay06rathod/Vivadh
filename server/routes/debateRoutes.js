const express = require('express')
const router = express.Router()
const { startDebate, runRound, addModeratorMessage, endDebate, getDebateHistory, getDebateById } = require('../controllers/debateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startDebate);
router.post('/:id/round', protect, runRound);
router.post('/:id/moderator', protect, addModeratorMessage);
router.post('/:id/end', protect, endDebate);
router.get('/history', protect, getDebateHistory);
router.get('/:id', protect, getDebateById);

module.exports = router;