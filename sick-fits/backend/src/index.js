const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// middleware to handle cookies
server.express.use(cookieParser());
// middleware to populate current user ID (with JWT)
server.express.use((req, res, next) => {
  // extract token from request
  const { token } = req.cookies;
  // extract the user ID from the token
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the userId onto the req for future requests to access
    req.userId = userId;
  }
  next();
});

// middleware to populate current User
server.express.use(async (req, res, next) => {
  // check if logged in
  if (!req.userId) return next();
  // run query for the User by the user.Id from the req
  const user = await db.query.user(
    {
      where: { id: req.userId },
    },
    `{id, email, name, permissions}`
  );
  // console.log('index.js middleware: user', user);
  // put the user onto the req for future requests
  req.user = user;

  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`Server is running on port http:/localhost:${deets.port}`);
  }
);
