const { forwardTo } = require('prisma-binding');
const bcrypt = require('bcryptjs');
const { hasPermission } = require('../utils');

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
  async users(parent, arg, ctx, info) {
    // check if logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    // check if the user has the permissions to query all the users
    // console.log('Query resolvers: users -> ctx.request.user', ctx.request.user);
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // run query all the users
    return ctx.db.query.users({}, info);
  },
};

module.exports = Query;
