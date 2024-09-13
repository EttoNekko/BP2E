const Box = require('../models/box');

exports.getBoxes = async () => {
  const result = await Box.find();
  return result;
};

exports.getBox = async ({ id }) => {
  const result = await Box.findById(id);
  return result;
};
