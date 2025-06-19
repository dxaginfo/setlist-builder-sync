const Setlist = require('../models/setlist.model');
const Band = require('../models/band.model');
const Song = require('../models/song.model');
const { ApiError } = require('../middleware/error');
const logger = require('../config/logger');

/**
 * Get all setlists for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSetlists = async (req, res, next) => {
  try {
    const { band, search, sort = 'createdAt', limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {
      $or: [
        { owner: req.user._id }, // User owns the setlist
      ],
    };
    
    // Add band filter if provided
    if (band) {
      query.band = band;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or.push(
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      );
    }
    
    // Add setlists from bands where user is a member
    const userBands = await Band.find({ 'members.user': req.user._id });
    if (userBands.length > 0) {
      const bandIds = userBands.map(band => band._id);
      query.$or.push({ band: { $in: bandIds } });
    }
    
    // Count total
    const total = await Setlist.countDocuments(query);
    
    // Get setlists
    const setlists = await Setlist.find(query)
      .sort({ [sort]: sort === 'name' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('band', 'name')
      .populate('owner', 'name email');
    
    res.status(200).json({
      status: 'success',
      results: setlists.length,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: {
        setlists,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createSetlist = async (req, res, next) => {
  try {
    const { name, description, band, isPublic, venue, date, songs, tags } = req.body;
    
    // Check if user can create setlist for the band
    if (band) {
      const userBand = await Band.findOne({
        _id: band,
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id, 'members.permissions': { $in: ['admin', 'editor'] } },
        ],
      });
      
      if (!userBand) {
        throw new ApiError(403, 'You do not have permission to create a setlist for this band');
      }
    }
    
    // Create setlist
    const setlist = await Setlist.create({
      name,
      description,
      owner: req.user._id,
      band,
      isPublic,
      venue,
      date,
      songs: songs || [],
      tags: tags || [],
      lastModifiedBy: req.user._id,
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        setlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSetlist = async (req, res, next) => {
  try {
    const { setlistId } = req.params;
    
    // Find setlist
    const setlist = await Setlist.findById(setlistId)
      .populate('band', 'name')
      .populate('owner', 'name email')
      .populate('songs.song');
    
    if (!setlist) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has access to the setlist
    const isOwner = setlist.owner._id.toString() === req.user._id.toString();
    const isBandMember = setlist.band && await Band.findOne({
      _id: setlist.band._id,
      'members.user': req.user._id,
    });
    
    if (!isOwner && !isBandMember && !setlist.isPublic) {
      throw new ApiError(403, 'You do not have permission to view this setlist');
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        setlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateSetlist = async (req, res, next) => {
  try {
    const { setlistId } = req.params;
    const updates = req.body;
    
    // Find setlist
    const setlist = await Setlist.findById(setlistId);
    
    if (!setlist) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has permission to update the setlist
    const isOwner = setlist.owner.toString() === req.user._id.toString();
    const isBandAdmin = setlist.band && await Band.findOne({
      _id: setlist.band,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.permissions': { $in: ['admin', 'editor'] } },
      ],
    });
    
    if (!isOwner && !isBandAdmin) {
      throw new ApiError(403, 'You do not have permission to update this setlist');
    }
    
    // Update version and last modified by
    updates.version = (setlist.version || 1) + 1;
    updates.lastModifiedBy = req.user._id;
    
    // Update setlist
    const updatedSetlist = await Setlist.findByIdAndUpdate(
      setlistId,
      updates,
      { new: true, runValidators: true }
    ).populate('band', 'name')
      .populate('owner', 'name email')
      .populate('songs.song');
    
    res.status(200).json({
      status: 'success',
      data: {
        setlist: updatedSetlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteSetlist = async (req, res, next) => {
  try {
    const { setlistId } = req.params;
    
    // Find setlist
    const setlist = await Setlist.findById(setlistId);
    
    if (!setlist) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has permission to delete the setlist
    const isOwner = setlist.owner.toString() === req.user._id.toString();
    const isBandAdmin = setlist.band && await Band.findOne({
      _id: setlist.band,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.permissions': 'admin' },
      ],
    });
    
    if (!isOwner && !isBandAdmin) {
      throw new ApiError(403, 'You do not have permission to delete this setlist');
    }
    
    // Delete setlist
    await Setlist.findByIdAndDelete(setlistId);
    
    res.status(200).json({
      status: 'success',
      message: 'Setlist deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a song to a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addSongToSetlist = async (req, res, next) => {
  try {
    const { setlistId } = req.params;
    const { songId, order, notes, key, capo, duration, segue } = req.body;
    
    // Find setlist
    const setlist = await Setlist.findById(setlistId);
    
    if (!setlist) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has permission to update the setlist
    const isOwner = setlist.owner.toString() === req.user._id.toString();
    const isBandMember = setlist.band && await Band.findOne({
      _id: setlist.band,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.permissions': { $in: ['admin', 'editor'] } },
      ],
    });
    
    if (!isOwner && !isBandMember) {
      throw new ApiError(403, 'You do not have permission to update this setlist');
    }
    
    // Find song
    const song = await Song.findById(songId);
    
    if (!song) {
      throw new ApiError(404, 'Song not found');
    }
    
    // Add song to setlist
    setlist.songs.push({
      song: songId,
      order: order || setlist.songs.length + 1,
      notes,
      key,
      capo,
      duration: duration || song.duration,
      segue,
    });
    
    // Update version and last modified by
    setlist.version = (setlist.version || 1) + 1;
    setlist.lastModifiedBy = req.user._id;
    
    // Save setlist
    await setlist.save();
    
    // Populate and return
    const updatedSetlist = await Setlist.findById(setlistId)
      .populate('band', 'name')
      .populate('owner', 'name email')
      .populate('songs.song');
    
    res.status(200).json({
      status: 'success',
      data: {
        setlist: updatedSetlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a song in a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateSongInSetlist = async (req, res, next) => {
  try {
    const { setlistId, songId } = req.params;
    const updates = req.body;
    
    // Find setlist
    const setlist = await Setlist.findById(setlistId);
    
    if (!setlist) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has permission to update the setlist
    const isOwner = setlist.owner.toString() === req.user._id.toString();
    const isBandMember = setlist.band && await Band.findOne({
      _id: setlist.band,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.permissions': { $in: ['admin', 'editor'] } },
      ],
    });
    
    if (!isOwner && !isBandMember) {
      throw new ApiError(403, 'You do not have permission to update this setlist');
    }
    
    // Find song in setlist
    const songIndex = setlist.songs.findIndex(s => s._id.toString() === songId);
    
    if (songIndex === -1) {
      throw new ApiError(404, 'Song not found in setlist');
    }
    
    // Update song in setlist
    Object.keys(updates).forEach(key => {
      setlist.songs[songIndex][key] = updates[key];
    });
    
    // Update version and last modified by
    setlist.version = (setlist.version || 1) + 1;
    setlist.lastModifiedBy = req.user._id;
    
    // Save setlist
    await setlist.save();
    
    // Populate and return
    const updatedSetlist = await Setlist.findById(setlistId)
      .populate('band', 'name')
      .populate('owner', 'name email')
      .populate('songs.song');
    
    res.status(200).json({
      status: 'success',
      data: {
        setlist: updatedSetlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a song from a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const removeSongFromSetlist = async (req, res, next) => {
  try {
    const { setlistId, songId } = req.params;
    
    // Find setlist
    const setlist = await Setlist.findById(setlistId);
    
    if (!setlist) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has permission to update the setlist
    const isOwner = setlist.owner.toString() === req.user._id.toString();
    const isBandMember = setlist.band && await Band.findOne({
      _id: setlist.band,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.permissions': { $in: ['admin', 'editor'] } },
      ],
    });
    
    if (!isOwner && !isBandMember) {
      throw new ApiError(403, 'You do not have permission to update this setlist');
    }
    
    // Remove song from setlist
    setlist.songs = setlist.songs.filter(song => song._id.toString() !== songId);
    
    // Update version and last modified by
    setlist.version = (setlist.version || 1) + 1;
    setlist.lastModifiedBy = req.user._id;
    
    // Save setlist
    await setlist.save();
    
    // Populate and return
    const updatedSetlist = await Setlist.findById(setlistId)
      .populate('band', 'name')
      .populate('owner', 'name email')
      .populate('songs.song');
    
    res.status(200).json({
      status: 'success',
      data: {
        setlist: updatedSetlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder songs in a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const reorderSongs = async (req, res, next) => {
  try {
    const { setlistId } = req.params;
    const { songs } = req.body;
    
    if (!Array.isArray(songs)) {
      throw new ApiError(400, 'Songs must be an array of { id, order } objects');
    }
    
    // Find setlist
    const setlist = await Setlist.findById(setlistId);
    
    if (!setlist) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has permission to update the setlist
    const isOwner = setlist.owner.toString() === req.user._id.toString();
    const isBandMember = setlist.band && await Band.findOne({
      _id: setlist.band,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.permissions': { $in: ['admin', 'editor'] } },
      ],
    });
    
    if (!isOwner && !isBandMember) {
      throw new ApiError(403, 'You do not have permission to update this setlist');
    }
    
    // Update song orders
    songs.forEach(({ id, order }) => {
      const song = setlist.songs.find(s => s._id.toString() === id);
      if (song) {
        song.order = order;
      }
    });
    
    // Update version and last modified by
    setlist.version = (setlist.version || 1) + 1;
    setlist.lastModifiedBy = req.user._id;
    
    // Save setlist
    await setlist.save();
    
    // Populate and return
    const updatedSetlist = await Setlist.findById(setlistId)
      .populate('band', 'name')
      .populate('owner', 'name email')
      .populate('songs.song');
    
    res.status(200).json({
      status: 'success',
      data: {
        setlist: updatedSetlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clone a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const cloneSetlist = async (req, res, next) => {
  try {
    const { setlistId } = req.params;
    const { name, band } = req.body;
    
    // Find setlist to clone
    const setlistToClone = await Setlist.findById(setlistId);
    
    if (!setlistToClone) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has access to the setlist
    const isOwner = setlistToClone.owner.toString() === req.user._id.toString();
    const isBandMember = setlistToClone.band && await Band.findOne({
      _id: setlistToClone.band,
      'members.user': req.user._id,
    });
    
    if (!isOwner && !isBandMember && !setlistToClone.isPublic) {
      throw new ApiError(403, 'You do not have permission to clone this setlist');
    }
    
    // Check if user can create setlist for the band
    if (band) {
      const userBand = await Band.findOne({
        _id: band,
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id, 'members.permissions': { $in: ['admin', 'editor'] } },
        ],
      });
      
      if (!userBand) {
        throw new ApiError(403, 'You do not have permission to create a setlist for this band');
      }
    }
    
    // Create new setlist
    const newSetlist = new Setlist({
      name: name || `Copy of ${setlistToClone.name}`,
      description: setlistToClone.description,
      owner: req.user._id,
      band: band || null,
      isPublic: false,
      venue: setlistToClone.venue,
      date: new Date(),
      songs: setlistToClone.songs,
      tags: setlistToClone.tags,
      notes: setlistToClone.notes,
      version: 1,
      lastModifiedBy: req.user._id,
    });
    
    // Save new setlist
    await newSetlist.save();
    
    // Populate and return
    const populatedSetlist = await Setlist.findById(newSetlist._id)
      .populate('band', 'name')
      .populate('owner', 'name email')
      .populate('songs.song');
    
    res.status(201).json({
      status: 'success',
      data: {
        setlist: populatedSetlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const exportSetlist = async (req, res, next) => {
  try {
    const { setlistId } = req.params;
    const { format = 'json' } = req.query;
    
    // Find setlist
    const setlist = await Setlist.findById(setlistId)
      .populate('band', 'name')
      .populate('owner', 'name email')
      .populate('songs.song');
    
    if (!setlist) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has access to the setlist
    const isOwner = setlist.owner._id.toString() === req.user._id.toString();
    const isBandMember = setlist.band && await Band.findOne({
      _id: setlist.band._id,
      'members.user': req.user._id,
    });
    
    if (!isOwner && !isBandMember && !setlist.isPublic) {
      throw new ApiError(403, 'You do not have permission to export this setlist');
    }
    
    // Export based on format
    if (format === 'json') {
      res.status(200).json({
        status: 'success',
        data: {
          setlist,
        },
      });
    } else if (format === 'pdf') {
      // TODO: Implement PDF export
      res.status(200).json({
        status: 'success',
        message: 'PDF export not implemented yet',
      });
    } else if (format === 'csv') {
      // TODO: Implement CSV export
      res.status(200).json({
        status: 'success',
        message: 'CSV export not implemented yet',
      });
    } else {
      throw new ApiError(400, 'Invalid export format');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Share a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const shareSetlist = async (req, res, next) => {
  try {
    const { setlistId } = req.params;
    const { isPublic } = req.body;
    
    // Find setlist
    const setlist = await Setlist.findById(setlistId);
    
    if (!setlist) {
      throw new ApiError(404, 'Setlist not found');
    }
    
    // Check if user has permission to share the setlist
    const isOwner = setlist.owner.toString() === req.user._id.toString();
    const isBandAdmin = setlist.band && await Band.findOne({
      _id: setlist.band,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.permissions': 'admin' },
      ],
    });
    
    if (!isOwner && !isBandAdmin) {
      throw new ApiError(403, 'You do not have permission to share this setlist');
    }
    
    // Update setlist
    setlist.isPublic = isPublic;
    setlist.version = (setlist.version || 1) + 1;
    setlist.lastModifiedBy = req.user._id;
    
    // Save setlist
    await setlist.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        isPublic: setlist.isPublic,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSetlists,
  createSetlist,
  getSetlist,
  updateSetlist,
  deleteSetlist,
  addSongToSetlist,
  updateSongInSetlist,
  removeSongFromSetlist,
  reorderSongs,
  cloneSetlist,
  exportSetlist,
  shareSetlist,
};