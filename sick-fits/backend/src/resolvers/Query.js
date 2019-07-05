const { forwardTo } = require('prisma-binding');
const bcrypt = require('bcryptjs');

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
  async signin(parent, { email, password }, ctx, info) {
    // check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`Not such user found for ${email}`);
    }
    // check if their password is correct
    const valid = await bcrypt.compaire(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    // generated the JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // return the user
    return user;
  },
};

module.exports = Query;
