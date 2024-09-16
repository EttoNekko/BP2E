const {
  getUsers,
  getUserById,
  getUserByAddres,
} = require('../../daos/user.dao');

module.exports = {
  Query: {
    users: (root, args, context, info) => getUsers(),
    userById: (root, args, context, info) => getUserById(args),
    userByAdress: (root, args, context, info) => getUserByAddres(args),
  },
  // Mutation: {},
};
