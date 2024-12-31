
type User = {
  id?: string; // 主键
  username: string; // 电话号
  nickname?: string; // 用户名 
  passwordHash: string; // 密码
  profilePicture?: string; // 头像
  email?: string; // 邮箱
  createdAt?: Date; // 创建时间
  updatedAt: Date; // 更新时间
}

/**
 * 用户概况
 */
type UserProfile = {
  id: number;
  userId: number;
  gender: string;
  age: number;
  location: string;
  introduction: string;
  moodStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 推荐系统元数据
 */
type RecommendationRules = {
  id: number;
  ruleName: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 任务调度表
 */
type ScheduledTasks = {
  id: number;
  ruleId: number; // 外键关联 RecommendationRules 表
  scheduledTime: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 管理平台操作日志
 */

enum ActionType {
  LOGIN = 'login',
  CHANGE = 'change',
  PROFILE = 'profile',
  RECOMMENDATION = 'recommendation',
  ADMIN = 'admin',
}

type ActionsLog = {
  id: number;
  userId: number; // 外键关联 User 表
  actionType: ActionType;
  details: Text;
  timeStamp: Date; // 操作时间
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 帖子
 */
type Posts = {
  id: bigint;
  userId: bigint;
  title: string;
  // content: string;
  // tags: string[];
  // category: string; // 基础信息存到Mysql，详细信息存到MongoDB
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 帖子评论
 */
type PostComments = {
  id: bigint;
  postId: bigint;
  userId: bigint;
  // content: string;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 帖子点赞
 */
type PostLikes = {
  id: bigint;
  postId: bigint;
  userId: bigint;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 帖子收藏
 */
type PostCollects = {
  id: bigint;
  postId: bigint;
  userId: bigint;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 帖子举报
 */
type PostReports = {
  id: bigint;
  postId: bigint;
  userId: bigint;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 帖子分享
 */
type PostShares = {
  id: bigint;
  postId: bigint;
  userId: bigint;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 评论点赞
 */
type CommentLikes = {
  id: bigint;
  commentId: bigint;
  userId: bigint;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 评论举报
 */
type CommentReports = {
  id: bigint;
  commentId: bigint;
  userId: bigint;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 评论分享
 */
type CommentShares = {
  id: bigint;
  commentId: bigint;
  userId: bigint;
  createdAt: Date;
  updatedAt: Date;
}


export {
  User,
  UserProfile,
  RecommendationRules,
  ScheduledTasks,
  ActionsLog
}