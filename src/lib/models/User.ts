import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    connectedPlatforms: {
      type: [String],
      default: [],
    },
    watchlist: {
      type: [String], // Array of IMDB IDs
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent mongoose from recreating the model if it already exists
export default mongoose.models.User || mongoose.model('User', UserSchema);
