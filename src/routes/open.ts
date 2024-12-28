/**
 * 开放路由
 */

import UserController from '@/controller/user.controller';
import { Router } from 'express';

const OpenRouter = Router();

/**
 * 用户注册
 */
OpenRouter.post('/signup', UserController.signUp);

/**
 * 用户登录
 */
OpenRouter.post('/login', UserController.login);


export default OpenRouter;