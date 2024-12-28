/**
 * 鉴权后的路由
 */

import { Router } from 'express';
import { authMIddleware } from '@/middleware/auth';
import UserController from '@/controller/user.controller';


const AdminRouter = Router();

/**
 * 用户路由
 */

// 重置密码
AdminRouter.post('/reset-password/:userId', authMIddleware, UserController.resetPassword);
// 获取用户列表
AdminRouter.get('/users', authMIddleware, UserController.getUserList);
// 获取用户信息
AdminRouter.get('/users/:userId', authMIddleware, UserController.getUserInfo);
// 删除用户
AdminRouter.delete('/users/:userId', authMIddleware, UserController.deleteUser);
// 更新用户
AdminRouter.put('/users/:userId', authMIddleware, UserController.updateUserInfo);
// 登出
AdminRouter.post('/logout', authMIddleware, UserController.logout);


export default AdminRouter;
