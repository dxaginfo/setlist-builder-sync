const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Import setlist controller (to be implemented)
const setlistController = require('../controllers/setlist.controller');

// Apply auth middleware to all routes
router.use(auth);

// Get all setlists for the current user
router.get('/', setlistController.getSetlists);

// Create a new setlist
router.post('/', setlistController.createSetlist);

// Get a specific setlist
router.get('/:setlistId', setlistController.getSetlist);

// Update a setlist
router.put('/:setlistId', setlistController.updateSetlist);

// Delete a setlist
router.delete('/:setlistId', setlistController.deleteSetlist);

// Add a song to a setlist
router.post('/:setlistId/songs', setlistController.addSongToSetlist);

// Update a song in a setlist
router.put('/:setlistId/songs/:songId', setlistController.updateSongInSetlist);

// Remove a song from a setlist
router.delete('/:setlistId/songs/:songId', setlistController.removeSongFromSetlist);

// Reorder songs in a setlist
router.put('/:setlistId/songs/reorder', setlistController.reorderSongs);

// Clone a setlist
router.post('/:setlistId/clone', setlistController.cloneSetlist);

// Export a setlist
router.get('/:setlistId/export', setlistController.exportSetlist);

// Share a setlist
router.post('/:setlistId/share', setlistController.shareSetlist);

module.exports = router;