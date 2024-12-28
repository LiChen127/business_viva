/**
 * 鉴权后的路由
 */

import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import UserController from '@/controller/user.controller';
import UserProfileController from '@/controller/userProfile.controller';
import { logAPICall } from '@/utils/logger';


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
// 删除用户
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

export default AdminRouter;
