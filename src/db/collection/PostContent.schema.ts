import mongoose from 'mongoose';

const PostContentSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: [true, 'Post ID is required'],
    unique: true,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  tags: [{
    type: String
  }],
}, {
  collection: 'posts',
  timestamps: true,
  strict: true,
  validateBeforeSave: true,
  autoCreate: false
});

const PostContentModel = mongoose.model('Posts', PostContentSchema, 'posts');

export default PostContentModel;

