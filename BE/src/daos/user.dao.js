const User = require('../models/user');

exports.getUsers = async () => {
  const result = await User.find();
  return result;
};

exports.getUserById = async ({ id }) => {
  const result = await User.findById(id).populate('currentBoxesOwned.boxType');
  return result;
};

exports.getUserByAddres = async ({ address }) => {
  const result = await User.findOne({ address: address }).populate(
    'currentBoxesOwned.boxType',
  );
  return result;
};
