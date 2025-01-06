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

export const ActionToIncrementUserExp = [
  'putPost', // 发表帖子
  'putComment', // 发表评论
  'likeContent',
  'beLiked',
  'takeSpecialAction',
  'putDailyMood',
  'putMoodNote'
];
export const ActionToIncrementUserExpTypeSet = new Map([

  ['putPost', 50],// 发表帖子
  ['putComment', 20], // 发表评论
  ['likeContent', 5], // 点赞内容
  ['beLiked', 10], // 被点赞
  ['takeSpecialAction', 50], // 做一些活动
  ['putDailyMood', 20], // 提交mood
  ['putMoodNote', 50]  // 提交情绪日记
]
);


export type UserExpModel = {
  level: string;
  score: number,
  experiencePoints: number;
}

export const UserExpData: UserExpModel[] = [
  { level: 'level1', score: 1, experiencePoints: 0 },
  { level: 'level2', score: 2, experiencePoints: 100 },
  { level: 'level3', score: 3, experiencePoints: 300 },
  { level: 'level4', score: 4, experiencePoints: 700 },
  { level: 'level5', score: 5, experiencePoints: 1500 },
  { level: 'level6', score: 6, experiencePoints: 3100 },
  { level: 'level7', score: 7, experiencePoints: 6300 },
  { level: 'level8', score: 8, experiencePoints: 12700 },
  { level: 'level9', score: 9, experiencePoints: 25000 },
  { level: 'level10', score: 10, experiencePoints: 51100 },
];

export type ActionLine = {
  action: string;
  score: number;
};

// export const ActionLineCollection: ActionLine[] = [
//   { action: ActionToIncrementUserExp.putPost, score: 50 },
//   { action: ActionToIncrementUserExp.putComment, score: 20 },
//   { action: ActionToIncrementUserExp.likeContent, score: 5 },
//   { action: ActionToIncrementUserExp.beLiked, score: 10 },
//   { action: ActionToIncrementUserExp.takeSpecialAction, score: 50 },
//   { action: ActionToIncrementUserExp.putDailyMood, score: 20 },
//   { action: ActionToIncrementUserExp.putMoodNote, score: 50 },
// ];