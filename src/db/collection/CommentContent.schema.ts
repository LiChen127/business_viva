import mongoose, { Schema, Document, Model } from 'mongoose';

// export interface ICommentContent extends Document {
//   postId: string;
//   commentId: string;
//   content: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

const CommentContentSchema = new Schema(
  {
    commentId: {
      type: String,
      required: true,
      unique: true, // 保证每个评论内容唯一
      index: true,  // 提高查询效率
    },
    postId: {
      type: String,
      required: true,
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

const CommentContentModel = mongoose.model('comments', CommentContentSchema);

export default CommentContentModel;

