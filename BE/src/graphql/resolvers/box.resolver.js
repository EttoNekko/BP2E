const { getBoxes, getBox, getBoxById } = require('../../daos/box.dao');

module.exports = {
  Query: {
    boxes: (root, args, context, info) => getBoxes(),
    box: (root, args, context, info) => getBox(args),
    boxById: (root, args, context, info) => getBoxById(args),
  },
  // Mutation: {},
};
