import * as authControllers from '../controllers/auth';
import User from '../modules/user';

import express from 'express';
import { body, check } from 'express-validator/check';

const router = express.Router();

router.put(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email!')
      .custom((email, { req }) => {
        return User.findOne({ email }).then(user => {
          if (user) {
            return Promise.reject('Email is already exist, please pick another one');
          }
        });
      })
      .normalizeEmail()
      .trim(),
    body('password').isLength({ min: 5 }).trim(),
    body('name').trim().not().isEmail()
  ],
  authControllers.signup
);

router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email!')
      .custom((email, { req }) => {
        return User.findOne({ email }).then(user => {
          if (user) {
            return Promise.reject('Email is already exist, please pick another one');
          }
        });
      })
      .normalizeEmail()
      .trim(),
    body('password').isLength({ min: 5 }).trim()
  ],
  authControllers.login
);

export default router;
