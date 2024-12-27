import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICrawledData extends Document {
  crawledId: number;
  crawledSource: string; // 爬虫来源
  crawledUrl: string; // 爬虫链接
  crawledData: Record<string, any>; // 爬虫数据
  crawledStatus: CrawlerStatus; // 爬虫状态
  createdAt: Date;
  updatedAt: Date;
}

enum CrawlerStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * 爬取数据
 */
const CrawledDataSchema: Schema<ICrawledData> = new Schema(
  {
    crawledId: {
      type: Number,
      required: true,
    },
    crawledSource: {
      type: String,
      required: true,
    },
    crawledUrl: {
      type: String,
      required: true,
    },
    crawledData: {
      type: Object,
      required: true,
    },
    crawledStatus: {
      type: String,
      enum: Object.values(CrawlerStatus),
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

const CrawledDataModel: Model<ICrawledData> = mongoose.model<ICrawledData>('CrawledData', CrawledDataSchema);

export default CrawledDataModel;

