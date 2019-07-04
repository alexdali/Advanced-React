const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// middleware to handle cookies
server.express.use(cookieParser());
// middleware to populate current user (with JWT)
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
