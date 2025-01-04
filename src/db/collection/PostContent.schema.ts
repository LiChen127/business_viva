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

// 添加保存前的中间件
PostContentSchema.pre('save', function (next) {
  console.log('Saving post content:', this);
  next();
});

// 添加保存后的中间件
PostContentSchema.post('save', function (doc) {
  console.log('Post content saved:', doc);
});

const PostContentModel = mongoose.model('Posts', PostContentSchema, 'posts');

export default PostContentModel;

