import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  // const authHeader = req.get('Authorization');
  //
  // if (!authHeader) {
  //   const error = new Error('Not authorizated');
  //   error.statusCode = 401;
  //
  //   throw error;
  // }

  const token = req.get('Authorization').split(' ')[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, 'somesupersecretsecret');
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('Not authorizated');
    error.statusCode = 401;

    throw error;
  }

  req.userId = decodedToken.userId;

  next();
};
