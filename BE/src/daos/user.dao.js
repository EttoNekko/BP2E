const User = require('../models/user');
const Box = require('../models/box');

exports.getUsers = async () => {
  const result = await User.find();
  return result;
};

exports.getUserById = async ({ _id }) => {
  let result = await User.findById(_id);
  for (let i = 0; i < result.currentBoxesOwned.length; i++) {
    let temp = result.currentBoxesOwned[i];
    const box = await Box.findOne({ boxId: temp.boxId });
    temp.box = box;
  }

  return result;
};

exports.getUserByAddress = async ({ address }) => {
  let result = await User.findOne({ address: address });
  for (let i = 0; i < result.currentBoxesOwned.length; i++) {
    let temp = result.currentBoxesOwned[i];
    const box = await Box.findOne({ boxId: temp.boxId });
    temp.box = box;
  }
  return result;
};

exports.checkUserById = async ({ _id, input }) => {
  let result = await User.findByIdAndUpdate(_id, input, {
    new: true,
    upsert: true,
  });
  for (let i = 0; i < result.currentBoxesOwned.length; i++) {
    let temp = result.currentBoxesOwned[i];
    const box = await Box.findOne({ boxId: temp.boxId });
    temp.box = box;
  }
  return result;
};

exports.checkUserByAddress = async ({ address, input }) => {
  const result = await User.findOneAndUpdate({ address: address }, input, {
    new: true,
    upsert: true,
  });
  for (let i = 0; i < result.currentBoxesOwned.length; i++) {
    let temp = result.currentBoxesOwned[i];
    const box = await Box.findOne({ boxId: temp.boxId });
    temp.box = box;
  }
  return result;
};
