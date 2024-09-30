const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema(
  {
    boxId: {
      type: Number,
      required: true,
      unique: true,
    },
    goldChance: {
      type: Number,
      required: true,
    },
    silverChance: {
      type: Number,
      required: true,
    },
    bronzeChance: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, virtuals: true },
);

const Box = mongoose.model('box', boxSchema);

module.exports = Box;
