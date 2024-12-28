/**
 * 鉴权后的路由
 */

import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import UserController from '@/controller/user.controller';


const AdminRouter = Router();

/**
 * 用户路由
 */

// 重置密码
AdminRouter.post('/reset-password/:userId', authMiddleware, async (req, res) => {
  await UserController.resetPassword(req, res);
});
// 获取用户列表
AdminRouter.get('/getUserList', authMiddleware, async (req, res) => {
  await UserController.getUserList(req, res);
});
// 获取用户信息
AdminRouter.get('/getUserInfo/:userId', authMiddleware, async (req, res) => {
  await UserController.getUserInfo(req, res);
});
// 删除用户
AdminRouter.delete('/deleteUser/:userId', authMiddleware, async (req, res) => {
  await UserController.deleteUser(req, res);
});
// 更新用户
AdminRouter.put('/updateUserInfo/:userId', authMiddleware, async (req, res) => {
  await UserController.updateUserInfo(req, res);
});


export default AdminRouter;
