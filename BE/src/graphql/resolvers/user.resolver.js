const {
  getUsers,
  getUserById,
  getUserByAddres,
  checkUserById,
  checkUserByAddress,
} = require('../../daos/user.dao');

module.exports = {
  Query: {
    users: (root, args, context, info) => getUsers(),
    userById: (root, args, context, info) => getUserById(args),
    userByAddress: (root, args, context, info) => getUserByAddress(args),
  },
  Mutation: {
    userById: (root, args, context, info) => checkUserById(args),
    userByAddress: (root, args, context, info) => checkUserByAddress(args),
  },
};
