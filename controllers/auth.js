import User from '../modules/user';

import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator/check';
import jwt from 'jsonwebtoken';

export const signup = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Post is empty');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email,
        name,
        password: hashedPassword
      });

      return user.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'User craeted',
        userId: result._id
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

export const login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        const error = new Error('User is not exist, please another one');
        error.statusCode = 401;

        throw error;
      }
      loadedUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Password is not match please enter right password');
        error.statusCode = 401;

        throw error;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        'somesupersecretsecret',
        {
          expiresIn: '1h'
        }
      );

      res.status(200).json({
        token,
        userId: loadedUser._id.toString()
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};
