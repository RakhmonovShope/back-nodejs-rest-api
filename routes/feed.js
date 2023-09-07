import * as feedController from '../controllers/feed';
import isAuth from '../midlleware/is-auth';

import express from 'express';
import { body } from 'express-validator/check';

const router = express.Router();

router.get('/posts', isAuth, feedController.getPosts);

router.post(
  '/post',
  isAuth,
  [body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
  feedController.createPost
);

router.get('/post/:postId', isAuth, feedController.getPost);
router.put(
  '/post/:postId',
  isAuth,
  [body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })],
  feedController.putPost
);

router.delete('/post/:postId', isAuth, feedController.deletePost);

export default router;
