const Box = require('../models/box');

exports.getBoxes = async () => {
  const result = await Box.find();
  return result;
};

exports.getBox = async ({ boxId }) => {
  const result = await Box.findOne({ boxId: boxId });
  return result;
};

exports.getBoxById = async ({ _id }) => {
  const result = await Box.findById(_id);
  return result;
};
