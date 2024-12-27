
type User = {
  id: string; // 
  userId: number;
  nickname: string;
  passwordHash: string;
  profilePicture: string;
  email: string;
  username: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
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