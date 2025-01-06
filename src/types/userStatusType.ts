/**
 * 用户状态相关全局管理数据结构
 */

// import { level } from "winston";

export enum UserRole {
  user = 'user',
  admin = 'admin',
  super = 'superAdmin'
};

export enum UserGender {
  male = 'male',
  female = 'female',
  other = 'other'
};

export enum ActionToIncrementUserExp {
  putPost = 'putPost', // 发表帖子
  putComment = 'putComment', // 发表评论
  likeContent = 'likeContent',
  beLiked = 'beLiked',
  takeSpecialAction = 'takeSpecialAction',
  putDailyMood = 'putDailyMood',
  putMoodNote = 'putMoodNote'
};

export type UserExpModel = {
  level: string;
  experiencePoints: number;
}

export const UserExpData: UserExpModel[] = [
  { level: 'level1', experiencePoints: 0 },
  { level: 'level2', experiencePoints: 100 },
  { level: 'level3', experiencePoints: 300 },
  { level: 'level4', experiencePoints: 700 },
  { level: 'level5', experiencePoints: 1500 },
  { level: 'level6', experiencePoints: 3100 },
  { level: 'level7', experiencePoints: 6300 },
  { level: 'level8', experiencePoints: 12700 },
  { level: 'level9', experiencePoints: 25000 },
  { level: 'level10', experiencePoints: 51100 },
];

export type ActionLine = {
  action: string;
  score: number;
};

export const ActionLineCollection: ActionLine[] = [
  { action: ActionToIncrementUserExp.putPost, score: 50 },
  { action: ActionToIncrementUserExp.putComment, score: 20 },
  { action: ActionToIncrementUserExp.likeContent, score: 5 },
  { action: ActionToIncrementUserExp.beLiked, score: 10 },
  { action: ActionToIncrementUserExp.takeSpecialAction, score: 50 },
  { action: ActionToIncrementUserExp.putDailyMood, score: 20 },
  { action: ActionToIncrementUserExp.putMoodNote, score: 50 },
];