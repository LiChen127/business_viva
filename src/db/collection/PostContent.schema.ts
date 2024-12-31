import mongoose, { Schema, Document, Model } from 'mongoose';

// export interface IPostContent extends Document {
//   // postId: string;
//   content: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

const PostContentSchema = new Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true, // 保证每个帖子内容唯一
      index: true,  // 提高查询效率
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [String], // 附件列表
    tags: [String], // 标签
  },
  {
    timestamps: true,
  }
);

const PostContentModel = mongoose.model('PostContent', PostContentSchema);


export default PostContentModel;

