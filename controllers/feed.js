import Post from '../modules/post';
import post from '../modules/post';
import User from '../modules/user';
import socket from '../socket';

import { validationResult } from 'express-validator/check';
import fs from 'fs';
import path from 'path';

const PER_PAGE = 2;

export const getPosts = async (req, res, next) => {
  const page = Number(req.query.page) || 1;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE);

    if (!posts.length) {
      const error = new Error('Post is empty');
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({
      message: 'Posts fetched successfully',
      posts,
      totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

export const createPost = (req, res, next) => {
  const { title, content } = req.body;
  const imageUrl = req.file.path;
  let creator;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation error, entered data is incorrect');
    error.statusCode = 422;

    throw error;
  }

  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;

    throw error;
  }

  const post = new Post({
    title,
    content,
    imageUrl,
    creator: req.userId
  });

  post
    .save()
    .then(post => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);

      return user.save();
    })
    .then(user => {
      socket.getIO().emit('posts', {
        action: 'create',
        post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
      });

      res.status(201).json({
        message: 'Post created successfully',
        post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

export const getPost = (req, res, next) => {
  const { postId } = req.params;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }

      return res.status(200).json({
        message: 'Fetched post',
        post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

export const putPost = (req, res, next) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    const error = new Error('No image picked');
    error.statusCode = 422;

    throw error;
  }

  Post.findById(postId)
    .populate('creator')
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }

      if (post.creator._id.toString() !== req.userId) {
        const error = new Error('Unauthorized user');
        error.statusCode = 401;

        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then(post => {
      socket.getIO().emit('posts', { action: 'update', post });

      res.status(200).json({ message: 'Post updated successfully', post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

export const deletePost = (req, res, next) => {
  const { postId } = req.params;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Unauthorized user');
        error.statusCode = 401;

        throw error;
      }

      clearImage(post.imageUrl);

      return Post.findByIdAndRemove(postId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(() => {
      socket.getIO().emit('posts', { action: 'delete', post: postId });

      res.status(200).json({
        message: 'Post deleted successfully'
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
