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
  async order(parent, args, ctx, info) {
    // Check if the current user logged in
    if (!ctx.request.userId) {
      throw new Error("You aren't logged in!");
    }
    // query the current order
    // console.log('Query order args: ', args);
    const order = await ctx.db.query.order({ where: { id: args.id } }, info);
    // check if the user is owner  or have permission to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN'
    );
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error("You can't have permissions to see this order!");
    }
    // return the order
    // console.log('Query order: ', order);
    return order;
  },
};

module.exports = Query;
