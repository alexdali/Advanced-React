const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // check if user is logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info
    );

    return item;
  },
  updateItem(parent, args, ctx, info) {
    // check if user is logged in
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id, title }`);
    // 2. check if user is logged in and own that item or have the permissions
    // TODO
    // 3. delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    // check if email isn't exist in database
    // TODO
    // hash password
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    );
    // create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // Expiry - 1 year
    });
    // Finally return the user to the browser
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`Not such user found for ${email}`);
    }
    // check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
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
  signout(parent, args, ctx, info) {
    // Delete the cookie with the token
    ctx.response.clearCookie('token');
    // return the success message of Sign Out
    return { message: 'GoodBye!' };
  },
  async resetRequest(parent, args, ctx, info) {
    // Check if there user with that email
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`Not such user found for ${args.email}`);
    }
    // Generate reset token by randomyseBytes
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    // Create ResetTokenExpiry
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    // Put it onto user
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    // console.log('Mutation - resetRequest. res: ', res);
    // Send Email with reset token
    // console.log('transport.options', transport.options);
    const mailRes = await transport.sendMail({
      from: 'support@sickfits.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your password Reset token is here!
      \n\n
      <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    });
    // console.log('Mutation - resetRequest. After mail send: ', mailRes);
    // return the success message
    return { message: 'Thanks!' };
  },
  async resetPassword(parent, args, ctx, info) {
    // Check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Your Passwords don't match!");
    }
    // Check if its a legit reset token
    // Check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }
    // Hash new password
    const password = await bcrypt.hash(args.password, 10);
    // Save the new password to the user and remove old resetToken fields
    const updateUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    console.log('TCL: resetPassword -> updateUser', updateUser)
    // Generate JWT token
    const token = jwt.sign({ userId: updateUser.id }, process.env.APP_SECRET);
    // Set JWT token onto cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // return the new user
    return updateUser;
  },
};

module.exports = Mutations;
