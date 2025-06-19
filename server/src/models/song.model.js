const mongoose = require('mongoose');

const songSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
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
    duration: {
      type: Number, // Duration in seconds
    },
    key: {
      type: String,
      trim: true,
    },
    bpm: {
      type: Number,
    },
    timeSignature: {
      type: String,
      default: '4/4',
    },
    tags: [
      {
        type: String,
        trim: true,
      }
    ],
    lyrics: {
      type: String,
    },
    chords: {
      type: String,
    },
    tabs: {
      type: String,
    },
    notes: {
      type: String,
    },
    audioFile: {
      url: {
        type: String,
      },
      name: {
        type: String,
      },
      type: {
        type: String,
      },
      size: {
        type: Number,
      },
    },
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
        },
        size: {
          type: Number,
        },
      }
    ],
    version: {
      type: Number,
      default: 1,
    },
    lastModifiedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    isOriginal: {
      type: Boolean,
      default: false,
    },
    isCover: {
      type: Boolean,
      default: false,
    },
    genres: [
      {
        type: String,
        trim: true,
      }
    ],
    year: {
      type: Number,
    },
    lastPerformed: {
      type: Date,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    }
  },
  {
    timestamps: true,
  }
);

// Create index on band and owner fields for faster queries
songSchema.index({ band: 1, owner: 1 });
songSchema.index({ title: 'text', artist: 'text' });

// Create Song model
const Song = mongoose.model('Song', songSchema);

module.exports = Song;