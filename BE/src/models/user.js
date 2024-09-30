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
      default: function () {
        return this.address;
      },
    },
    gmail: {
      type: String,
      default: null,
    },
    googleRefreshToken: String,
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
    currentMoney: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentBoxesOwned: [
      {
        boxId: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    totalStep: {
      type: Number,
      default: 0,
      min: 0,
    },
    runHistory: [
      {
        date: {
          type: String,
          default: new Date().toISOString(),
        },
        steps: Number,
      },
    ],
  },
  { timestamps: true, virtuals: true },
);

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('userName')) user.userName = user.address;

  next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
