const mongoose = require('mongoose');

const setlistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    band: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Band',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    venue: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
    },
    songs: [
      {
        song: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Song',
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
        notes: {
          type: String,
        },
        duration: {
          type: Number, // Duration in seconds
        },
        key: {
          type: String,
          trim: true,
        },
        capo: {
          type: Number,
          default: 0,
        },
        segue: {
          type: Boolean,
          default: false,
        }
      }
    ],
    tags: [
      {
        type: String,
        trim: true,
      }
    ],
    lastPerformed: {
      type: Date,
    },
    notes: {
      type: String,
    },
    totalDuration: {
      type: Number, // Total duration in seconds
      default: 0,
    },
    version: {
      type: Number,
      default: 1,
    },
    lastModifiedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

// Create index on band and owner fields for faster queries
setlistSchema.index({ band: 1, owner: 1 });

// Update total duration before saving
setlistSchema.pre('save', function(next) {
  if (this.songs && this.songs.length > 0) {
    this.totalDuration = this.songs.reduce((total, song) => {
      return total + (song.duration || 0);
    }, 0);
  } else {
    this.totalDuration = 0;
  }
  next();
});

// Create Setlist model
const Setlist = mongoose.model('Setlist', setlistSchema);

module.exports = Setlist;