const Mutations = {
  async createItem(parent, args, ctx, info) {
    // check if user is logged in
    // const user = {};
    // const newargs = {
    //   ...args,
    //   user,
    // };
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args, // ...newargs,
        },
      },
      info
    );

    return item;
  },
};

module.exports = Mutations;
