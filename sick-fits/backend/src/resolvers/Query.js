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
    // console.log('Query order ctx.request.userId: ', ctx.request.userId);
    // console.log('Query order args: ', args);
    const order = await ctx.db.query.order({ where: { id: args.id } }, info);
    // console.log('Query order order.user.id: ', order.user.id);
    // check if the user is owner  or have permission to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    // console.log('Query order ownsOrder: ', ownsOrder);
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN'
    );
    // console.log(
    //   'Query order hasPermissionToSeeOrder: ',
    //   hasPermissionToSeeOrder
    // );
    // console.log(
    //   'Query order !ownsOrder && !hasPermissionToSeeOrder: ',
    //   !ownsOrder && !hasPermissionToSeeOrder
    // );
    if (!ownsOrder && !hasPermissionToSeeOrder) {
      throw new Error("You can't have permissions to see this order!");
    }
    // return the order
    // console.log('Query order: ', order);
    return order;
  },
  // orders: forwardTo('db'),
  async orders(parent, arg, ctx, info) {
    // check if logged in
    // const user = {
    //   id: 'cjxqkx4kt2dbz0b683a82v5lw',
    // };
    const user = await ctx.db.query.user({
      where: { id: ctx.request.userId },
    });
    console.log('Query orders user.id: ', user.id);
    console.log('Query orders arg: ', arg);
    if (!user) {
      throw new Error('You must be logged in!');
    }
    // check if the user has the permissions to query the current user all the orders
    // hasPermission(ctx.request.user, ['ADMIN']);
    // run query all the orders
    const existingOrders = await ctx.db.query.orders(
      { where: { user: { id: user.id } } },
      info
    );
    // const [existingOrders] = await ctx.db.query.orders({}, `{ id }`);
    // const existingOrders = [
    //   {
    //     id: 'cjyg0458hxblq0b360d4t2rri',
    //   },
    //   {
    //     id: 'cjyfpvi39s3wn0b36dlt62xll',
    //   },
    //   {
    //     id: 'cjyfped6mrw650b36j40fbb1l',
    //   },
    // ];
    console.log('Query orders existingOrders.length: ', existingOrders.length);
    return existingOrders;
  },
};

module.exports = Query;
