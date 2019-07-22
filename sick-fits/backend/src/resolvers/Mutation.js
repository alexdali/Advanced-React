const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // check if user is logged in
    const user = await ctx.db.query.user({
      where: { id: ctx.request.userId },
    });
    if (!user) {
      throw new Error('You must be logged in to do that!');
    }
    // create item
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // relationship between the Item and the User
          user: {
            connect: {
              id: user.id,
            },
          },
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
    // throw new Error('Dont');
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);
    // console.log('deleteItem => item', item.user.id);
    // 2. check if user is logged in and own that item or have the permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );
    if (!ownsItem && !hasPermission) {
      throw new Error("You don't have permissions to do that!");
    }
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
    // console.log('TCL: resetPassword -> updateUser', updateUser);
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
  async updatePermissions(parent, args, ctx, info) {
    // check if logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    // query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info
    );
    // check if has the permission to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // update the permission
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: { set: args.permissions },
        },
        where: { id: args.userId },
      },
      info
    );
    // return updated the user
  },
  async addToCart(parent, args, ctx, info) {
    // check if the user signed in
    // console.log('addToCart args.id - ', args.id);
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be sign in sooon');
    }
    // check if that item is already in their cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });
    // if it is, then increment by(+1)
    if (existingCartItem) {
      console.log('This Item is already in their cart!');
      return ctx.db.mutation.updateCartItem({
        data: {
          quantity: existingCartItem.quantity + 1,
        },
        where: { id: existingCartItem.id },
      });
    }
    // if it's not, then create a fresh CartItem for that user
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id },
        },
      },
    });
  },
  async removeFromCart(parent, args, ctx, info) {
    // find the Cart Item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: { id: args.id },
      },
      `{ id user { id }}`
    );
    // make sure if found it
    if (!cartItem) throw new Error('No item Found!');
    // make sure is own that cart item
    if (cartItem.user.id !== ctx.request.userId)
      throw new Error("'You don't own that cart item");
    // delete the Cart Item
    console.log('mutation cartItem.id', cartItem.id);
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id },
      },
      info
    );
  },
  async createOrder(parent, args, ctx, info) {
    // Check if user logged in
    const { userId } = ctx.request;
    if (!userId)
      throw new Error('You must be signed in to complet this order!');
    const user = await ctx.db.query.user(
      {
        where: {
          id: userId,
        },
      }`{
        id
        name
        email
        cart
          {
            id
            quantity
            item
              { id title image description price
              }
          }
        }`
    );
    // recalculate the total sum for the price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    );
    console.log('createOrder Mutation amount: ', amount);
    // create the stripe charge
    // convert the cartItems to the OrderItems
    // Create the Order
    // clean up cart: delete cartItems
    // return the Order to the client
  },
};

module.exports = Mutations;
