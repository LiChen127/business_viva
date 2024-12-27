import mongoose, { Schema, Document, Model } from "mongoose";


export interface IContent extends Document {
  title: string;
  body: string;
  tags?: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 内容数据
 */
const ContentSchema: Schema<IContent> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      trim: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }, // 自动维护时间戳
  },
);
// 创建模型
const ContentModel: Model<IContent> = mongoose.model<IContent>('Content', ContentSchema);

export default ContentModel;
