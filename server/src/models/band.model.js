const mongoose = require('mongoose');

const bandSchema = mongoose.Schema(
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
    logo: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    genres: [
      {
        type: String,
        trim: true,
      }
    ],
    members: [
      {
        user: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          trim: true,
        },
        instrument: {
          type: String,
          trim: true,
        },
        permissions: {
          type: String,
          enum: ['admin', 'editor', 'viewer'],
          default: 'viewer',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    socialLinks: {
      facebook: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
      youtube: {
        type: String,
        trim: true,
      },
      spotify: {
        type: String,
        trim: true,
      },
    },
    inviteCode: {
      code: {
        type: String,
      },
      expires: {
        type: Date,
      },
    }
  },
  {
    timestamps: true,
  }
);

// Add virtual fields for setlists and songs
bandSchema.virtual('setlists', {
  ref: 'Setlist',
  localField: '_id',
  foreignField: 'band',
});

bandSchema.virtual('songs', {
  ref: 'Song',
  localField: '_id',
  foreignField: 'band',
});

// Add instance method to check if a user is a member
bandSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Add instance method to check if a user has admin permissions
bandSchema.methods.isAdmin = function(userId) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member && member.permissions === 'admin';
};

// Create Band model
const Band = mongoose.model('Band', bandSchema);

module.exports = Band;