/**
 * 内容数据
 */

type Content = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  category: string; // 分类
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 媒体数据
 */

type MediaResource = {
  resourceId: number;
  contentId: number; // 关联 内容集合
  resourceType: string; // 资源类型
  url: string; // 资源路径
  metaData: Record<string, any>; // 元数据
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 内容版本
 */

type ContentVersion = {
  versionId: number;
  contentId: number; // 关联 内容集合
  contentVersion: string; // 版本号
}

/**
 * 用户行为数据
 */

enum InteractionType {
  // 阅读
  READ = 'read',
  // 点赞
  LIKE = 'like',
  // 点踩
  DISLIKE = 'dislike',
  // 分享
  SHARE = 'share',
  // 评论
  COMMENT = 'comment',
  // 收藏
  COLLECT = 'collect',
}

type UserInteraction = {
  interactionId: number;
  userId: number;
  contentId: number;
  interactionType: InteractionType;
  interactionData: Record<string, any>; // 互动数据
  timestamp: Date; // 互动时间
}

// 爬虫状态
enum CrawlerStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * 爬虫数据
 */

type CrawlerData = {
  crawledId: number;
  crawledSource: string; // 爬虫来源
  crawledUrl: string; // 爬虫链接
  crawledData: Record<string, any>; // 爬虫数据
  crawledStatus: CrawlerStatus; // 爬虫状态
  createdAt: Date;
  updatedAt: Date;
}

