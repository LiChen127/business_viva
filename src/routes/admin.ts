/**
 * 鉴权后的路由
 */

import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import UserController from '@/controller/user.controller';
import UserProfileController from '@/controller/userProfile.controller';
import { logAPICall } from '@/utils/logger';
import PostController from '@/controller/post.controller';
import MoodController from '@/controller/mood.controller';
import SensitiveController from '@/controller/sensitive.controller';


const AdminRouter = Router();

/**
 * 用户路由
 */

// 重置密码
AdminRouter.post('/reset-password/:userId', authMiddleware, async (req, res) => {
  logAPICall('resetPassword', req.url, req.body);
  await UserController.resetPassword(req, res);
});
// 获取用户列表
AdminRouter.get('/getUserList', authMiddleware, async (req, res) => {
  logAPICall('getUserList', req.url, req.body);
  await UserController.getUserList(req, res);
});
// 获取用户信息
AdminRouter.get('/getUserInfo/:userId', authMiddleware, async (req, res) => {
  logAPICall('getUserInfo', req.url, req.body);
  await UserController.getUserInfo(req, res);
});
// 注销用户
AdminRouter.delete('/deleteUser/:userId', authMiddleware, async (req, res) => {
  logAPICall('deleteUser', req.url, req.body);
  await UserController.deleteUser(req, res);
});
// 更新用户
AdminRouter.put('/updateUserInfo/:userId', authMiddleware, async (req, res) => {
  logAPICall('updateUserInfo', req.url, req.body);
  await UserController.updateUserInfo(req, res);
});


/**
 * 用户资料路由
 */

// 设置用户资料
AdminRouter.post('/setUserProfile', authMiddleware, async (req, res) => {
  logAPICall('setUserProfile', req.url, req.body);
  await UserProfileController.setUserProfile(req, res);
});
// 获取用户资料
AdminRouter.get("/getUserProfile/:userId", authMiddleware, async (req, res) => {
  await UserProfileController.getUserProfile(req, res);
})
// 更新用户资料
AdminRouter.put("/updateUserProfile/:userId", authMiddleware, async (req, res) => {
  logAPICall('updateUserProfile', req.url, req.body);
  await UserProfileController.updateUserProfile(req, res);
})
// CMS获取用户资料列表
AdminRouter.get("/getUserProfileList", authMiddleware, async (req, res) => {
  logAPICall('getUserProfileList', req.url, req.body);
  await UserProfileController.getAllUserProfile(req, res);
})
// 封禁用户
AdminRouter.post('/banUser', authMiddleware, async (req, res) => {
  logAPICall('banUser', req.url, req.body);
  await UserProfileController.banUser(req, res);
})

/**
 * 树洞社区相关
 */

/**
 * 帖子相关
 */
// 获取当前帖子内容
AdminRouter.get("/getCurrentPostDetail", authMiddleware, async (req, res) => {
  logAPICall('getCurrentPostDetail', req.url, req.body);
  await PostController.getCurrentPostDetail(req, res);
})
// 发布帖子
AdminRouter.post("/postPost", authMiddleware, async (req, res) => {
  logAPICall('postPost', req.url, req.body);
  await PostController.createPost(req, res);
})
// 删除帖子
AdminRouter.delete('/deletePost', authMiddleware, async (req, res) => {
  logAPICall('deletePost', req.url, req.body);
  await PostController.deletePost(req, res);
})
// 给帖子评论
AdminRouter.post('/makeCommentToPost', authMiddleware, async (req, res) => {
  logAPICall('makeCommentToPost', req.url, req.body);
  await PostController.makeCommentToPost(req, res);
})
// 修改帖子(修改了就是重新发布)
AdminRouter.put('/updatePost', authMiddleware, async (req, res) => {
  logAPICall('updatePost', req.url, req.body);
  // @todo: 这里面之后要调用create
  // await PostController.updatePost(req, res);
})
// 获取用户发帖列表
AdminRouter.get('/getUserPosts/:userId', authMiddleware, async (req, res) => {
  logAPICall('getUserPosts', req.url, req.body);
  await PostController.getUserPosts(req, res);
})
// 获取帖子列表
AdminRouter.get('/getPostsList/:userId', authMiddleware, async (req, res) => {
  logAPICall('getPostsList', req.url, req.body);
  await PostController.getPostsList(req, res);
})

/**
 * 点赞帖子
 */
AdminRouter.post('/likePost', authMiddleware, async (req, res) => {
  logAPICall('likePost', req.url, req.body);
  await PostController.likePost(req, res);
})
// // 取消点赞
// AdminRouter.delete('/cancelLikePost', authMiddleware, async (req, res) => {
//   logAPICall('cancelLikePost', req.url, req.body);
//   await PostController.cancelLikePost(req, res);
// })
/**
 * 评论相关
 */
// 用户评论
AdminRouter.post('/postComment', authMiddleware, async (req, res) => {
  logAPICall('postComment', req.url, req.body);
  await PostController.makeCommentToPost(req, res);
})
// 删除评论
AdminRouter.delete('/deleteComment', authMiddleware, async (req, res) => {
  logAPICall('deleteComment', req.url, req.body);
  await PostController.deleteComment(req, res);
})
// 点赞评论
AdminRouter.post('/likeComment', authMiddleware, async (req, res) => {
  logAPICall('likeComment', req.url, req.body);
  await PostController.likeComment(req, res);
})
// // 取消点赞评论
// AdminRouter.delete('/cancelLikeComment', authMiddleware, async (req, res) => {
//   logAPICall('cancelLikeComment', req.url, req.body);
//   await PostController.cancelLikeComment(req, res);
// })
// 获取评论列表
AdminRouter.get('/getCommentList', authMiddleware, async (req, res) => {
  logAPICall('getCommentList', req.url, req.body);
  await PostController.getCommentsInPostWithPostId(req, res);
})
// 获取当前用户评论列表
AdminRouter.get('/getUserComments/:userId', authMiddleware, async (req, res) => {
  logAPICall('getUserComments', req.url, req.body);
  await PostController.getUserComments(req, res);
})
// 回复评论
AdminRouter.post('/replyComment', authMiddleware, async (req, res) => {
  logAPICall('replyComment', req.url, req.body);
  await PostController.replyComment(req, res);
})
// 帖子热点排行榜列表
AdminRouter.get('/getHotPostList', authMiddleware, async (req, res) => {
  logAPICall('getHotPostList', req.url, req.body);
  // await PostController.getHotPostList(req, res);
})

/**
 * 树洞帖子审核相关
 */

// 获取所有的帖子列表
// 注意: 这里CMS系统和用户系统分开
// @remind: 是否需要一个运营系统?
// @todo: 加一个敏感词拦截器
AdminRouter.get('/getPostedAuthList', authMiddleware, async (req, res) => {
  logAPICall('getPostedAuthList', req.url, req.body);
  await PostController.getPostsList(req, res);
})
// 设置状态
/**
 * 注意: 这里写个枚举全局共用
 * enum PostStatus {
 *  PENDING = 'pending',
 *  APPROVED = 'approved',
 *  REJECTED = 'rejected',
 * }
 */
AdminRouter.post('/setPostStatus', authMiddleware, async (req, res) => {
  logAPICall('setPostStatus', req.url, req.body);
  // await PostController.setPostStatus(req, res);
})
// remind: 如何自动化实现？ AI?
// 监控input, 保证审核自动化

// 推送列表 CMS && 用户
AdminRouter.get('/getContentList/:userId', authMiddleware, async (req, res) => {
  logAPICall('getContentList', req.url, req.body);
  // await PostController.getContentList(req, res);
})

// 推送列表审核
/**
 * 注意: 这里写个枚举全局共用
 * @remind: 如何做到动态+自动化
 */
AdminRouter.post('/setPushListStatus', authMiddleware, async (req, res) => {
  logAPICall('setPushListStatus', req.url, req.body);
  // await PostController.setPushListStatus(req, res);
})
/**
 * 多媒体相关
 */
// 获取多媒体列表
AdminRouter.get('/getMediaList', authMiddleware, async (req, res) => {
  logAPICall('getMediaList', req.url, req.body);
  // await MediaController.getMediaList(req, res);
})

/**
 * 个人情绪管理和平台管理
 */
// 获取用户情绪列表
AdminRouter.get('/getUserMoodList', authMiddleware, async (req, res) => {
  logAPICall('getUserMoodList', req.url, req.body);
  await MoodController.getUserMoodList(req, res);
})
// 情绪追踪
// AdminRouter.get('/getMoodsTrace', authMiddleware, async (req, res) => {
//   logAPICall('getMoodsTrace', req.url, req.body);
// })
// 情绪日报/周报/月报/年报
AdminRouter.post('/postMoodRecord', authMiddleware, async (req, res) => {
  logAPICall('postMoodRecord', req.url, req.body);
})
// 获取报告详情
AdminRouter.get('/getMoodRecordDetail', authMiddleware, async (req, res) => {
  logAPICall('getMoodRecordDetail', req.url, req.body);
  await MoodController.getMoodDetail(req, res);
})
// 删除报告
AdminRouter.delete('/deleteMoodRecord', authMiddleware, async (req, res) => {
  logAPICall('deleteMoodRecord', req.url, req.body);
  await MoodController.deleteMoodRecord(req, res);
})
// 每日收录情绪
AdminRouter.post('/postDailyMood', authMiddleware, async (req, res) => {
  logAPICall('postDailyMood', req.url, req.body);
  await MoodController.recordDayMood(req, res);
})
// 更新情绪日记
AdminRouter.post('/updateMoodRecordDetail', authMiddleware, async (req, res) => {
  logAPICall('updateMoodRecordDetail', req.url, req.body);
  await MoodController.updateRecordWithNote(req, res);
})
// 平台获取用户情绪列表
AdminRouter.get('/getUserMoodList', authMiddleware, async (req, res) => {
  logAPICall('getUserMoodList', req.url, req.body);
  await MoodController.getUserMoodList(req, res);
})

/**
 * 等级相关
 */
// 某内容观看时长
AdminRouter.get('/getArticleWatchTime', authMiddleware, async (req, res) => {
  logAPICall('getArticleWatchTime', req.url, req.body);
})
// 某内容观看次数
AdminRouter.get('/getArticleWatchCount', authMiddleware, async (req, res) => {
  logAPICall('getArticleWatchCount', req.url, req.body);
})
// 内容观看总时长+次数
AdminRouter.get('/getArticleWatchTotalCountAndTime', authMiddleware, async (req, res) => {
  logAPICall('getArticleWatchTotalCountAndTime', req.url, req.body);
})
// 获取内容正在观看人数
AdminRouter.get('/getCurrentArticleWatchingCount', authMiddleware, async (req, res) => {
  logAPICall('getCurrentArticleWatchingCount', req.url, req.body);
})
// 内容分享次数
AdminRouter.get('/getArticleShareCount', authMiddleware, async (req, res) => {
  logAPICall('getArticleShareCount', req.url, req.body);
})
// 个人分享总次数
AdminRouter.get('/getPersonalShareTotalCount', authMiddleware, async (req, res) => {
  logAPICall('getPersonalShareTotalCount', req.url, req.body);
})
// 个人观看内容列表统计
AdminRouter.get('/getPersonalWatchArticleList', authMiddleware, async (req, res) => {
  logAPICall('getPersonalWatchArticleList', req.url, req.body);
})
// 个人分享内容列表统计
AdminRouter.get('/getPersonalShareArticleList', authMiddleware, async (req, res) => {
  logAPICall('getPersonalShareArticleList', req.url, req.body);
})
// 个人点赞内容列表统计
AdminRouter.get('/getPersonalLikeArticleList', authMiddleware, async (req, res) => {
  logAPICall('getPersonalLikeArticleList', req.url, req.body);
})
// 个人评论内容列表统计
AdminRouter.get('/getPersonalCommentArticleList', authMiddleware, async (req, res) => {
  logAPICall('getPersonalCommentArticleList', req.url, req.body);
})
// 个人收藏内容列表统计
AdminRouter.get('/getPersonalCollectArticleList', authMiddleware, async (req, res) => {
  logAPICall('getPersonalCollectArticleList', req.url, req.body);
})
// 个人举报内容列表统计
AdminRouter.get('/getPersonalRecordArticleList', authMiddleware, async (req, res) => {
  logAPICall('getPersonalRecordArticleList', req.url, req.body);
})
// 收藏内容
AdminRouter.post('/collectArticle', authMiddleware, async (req, res) => {
  logAPICall('collectArticle', req.url, req.body);
})
// 取消收藏内容
AdminRouter.post('/cancelCollectArticle', authMiddleware, async (req, res) => {
  logAPICall('cancelCollectArticle', req.url, req.body);
})
// 举报内容
AdminRouter.post('/RecordArticle', authMiddleware, async (req, res) => {
  logAPICall('RecordArticle', req.url, req.body);
})
// 取消举报内容
AdminRouter.post('/cancelRecordArticle', authMiddleware, async (req, res) => {
  logAPICall('cancelRecordArticle', req.url, req.body);
})
// 分享内容
AdminRouter.post('/shareArticle', authMiddleware, async (req, res) => {
  logAPICall('shareArticle', req.url, req.body);
})
// 取消分享内容
AdminRouter.post('/cancelShareArticle', authMiddleware, async (req, res) => {
  logAPICall('cancelShareArticle', req.url, req.body);
})
// 根据类型加积分
AdminRouter.post('/addScoreByType', authMiddleware, async (req, res) => {
  logAPICall('addScoreByType', req.url, req.body);
})
// 根据类型减积分
AdminRouter.post('/subScoreByType', authMiddleware, async (req, res) => {
  logAPICall('subScoreByType', req.url, req.body);
})

/**
 * 敏感词管理
 */
// 加敏感词
AdminRouter.post('/putWordInSensitive', authMiddleware, async (req, res) => {
  logAPICall('putWordInSensitive', req.url, req.body);
  await SensitiveController.putWordIn(req, res);
})
// 获取敏感词列表
AdminRouter.get('/getSensitiveWordList', authMiddleware, async (req, res) => {
  logAPICall('getSensitiveWordList', req.url, req.body);
  await SensitiveController.getWordList(req, res);
})
// 删除敏感词
AdminRouter.delete('/deleteWord', authMiddleware, async (req, res) => {
  logAPICall('deleteWord', req.url, req.body);
  await SensitiveController.deleteWord(req, res);
})

/**
 * 用户等级管理
 */
// 增加用户等级
AdminRouter.post('/incrementUserLevel', authMiddleware, async (req, res) => {
  logAPICall('incrementUserLevel', req.url, req.body);
  await UserProfileController.incrementUserLevel(req, res);
})
// 获取用户等级经验状态
AdminRouter.get('/getUserLevelAndExp', authMiddleware, async (req, res) => {
  logAPICall('getUserLevelAndExp', req.url, req.body);
  await UserProfileController.getUserLevelAndExp(req, res);
})
// 增加用户经验
AdminRouter.post('/incrementUserExp', authMiddleware, async (req, res) => {
  logAPICall('incrementUserExp', req.url, req.body);
  await UserProfileController.incrementUserExp(req, res);
})

export default AdminRouter;
