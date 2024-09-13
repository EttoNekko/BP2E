const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: () => true,
        message: '',
      },
    },
    userName: {
      type: String,
      default: this.address,
    },
    currentGold: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentSilver: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentBronze: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentNFT: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentBoxesOwned: [
      {
        boxType: {
          type: mongoose.Types.ObjectId,
          required: true,
          unique: true,
          ref: 'box',
        },
        quantity: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    runHistory: [
      {
        date: {
          type: Date,
          default: Date.now(),
        },
        steps: Number,
      },
    ],
  },
  { timestamps: true, virtuals: true },
);

const User = mongoose.model('user', userSchema);

module.exports = User;
