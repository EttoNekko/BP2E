const { getBoxes, getBox } = require('../../daos/box.dao');

module.exports = {
  Query: {
    boxes: (root, args, context, info) => getBoxes(),
    box: (root, args, context, info) => getBox(args),
  },
  // Mutation: {},
};
