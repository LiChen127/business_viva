import mongoose, { Schema, Document, Model } from 'mongoose';

enum InteractionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  VIEW = 'view',
  COMMENT = 'comment',
}

export interface IUserInteractions extends Document {
  userId: string;
  contentId: string;
  interactionType: InteractionType;
  interactionData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户互动数据
 */
const UserInteractionsSchema: Schema<IUserInteractions> = new Schema(
  {
    userId: {
      type: String,
      required: true
    },
    contentId: {
      type: String,
      required: true,
    },
    interactionType: {
      type: String,
      enum: Object.values(InteractionType),
      required: true,
    },
    interactionData: {
      type: Object,
      default: {},
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
    },
  },
);

const UserInteractionsModel: Model<IUserInteractions> = mongoose.model<IUserInteractions>('UserInteractions', UserInteractionsSchema);

export default UserInteractionsModel;

