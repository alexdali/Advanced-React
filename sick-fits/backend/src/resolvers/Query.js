const { forwardTo } = require('prisma-binding');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, arg, ctx, info) {
    // check if there is a current userId in request
    if (!ctx.request.userId) {
      return null;
    }
    // run query for User by userId from database
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info
    );
  },
};

module.exports = Query;
