import mongoose, { Schema, Document, Model } from 'mongoose';


export interface IMediaResource extends Document {
  resourceId: string;
  contentId: string;
  url: string;
  resourceType: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 媒体元数据
 */
const MediaResourceSchema: Schema<IMediaResource> = new Schema(
  {
    resourceId: {
      type: String,
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    resourceType: {
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
    },
  },
);

const MediaResourceModel: Model<IMediaResource> = mongoose.model<IMediaResource>('MediaResource', MediaResourceSchema);

export default MediaResourceModel;

