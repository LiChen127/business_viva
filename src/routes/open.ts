/**
 * 开放路由
 */

import UserController from '@/controller/user.controller';
import { Router } from 'express';

const OpenRouter = Router();

/**
 * 用户注册
 */
OpenRouter.post('/signup', async (req, res) => {
  await UserController.signUp(req, res);
});

/**
 * 用户登录
 */
OpenRouter.post('/login', async (req, res) => {
  await UserController.login(req, res);
});

/**
 * 用户登出
 */
OpenRouter.post('/logout', async (req, res) => {
  await UserController.logout(req, res);
});

export default OpenRouter;