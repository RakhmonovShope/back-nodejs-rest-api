import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String
    },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
