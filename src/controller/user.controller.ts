"use strict";
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserService from '../service/db/user.service';
import { User } from '@/db/models/User.model';
import RedisHelper from '@/utils/redisHelper';
import bcrypt from 'bcryptjs';
import logger, { logUserAction, logError, logAPICall, } from '@/utils/logger';
import { responseFormatHandler } from '@/utils/responseFormatHandler';
import { sequelize } from '@/config/sequelize.config';
import { usernameRegex, passwordRegex } from '@/utils/regexp';

/**
 * 用户相关
 */

export default class UserController {
  // 用户登录注册的密码加盐值
  static readonly saltRounds = 10;
  // 用户注册
  static async signUp(req: Request, res: Response) {
    const { username, nickname, password, role } = req.body as {
      username: string;
      nickname: string;
      password: string;
      role: 'admin' | 'user' | 'superAdmin';
    };
    if (!username || !nickname || !password || !role) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    // 正则验证
    if (!usernameRegex.test(username)) {
      return responseFormatHandler(res, 400, '用户名格式错误');
    }
    if (!passwordRegex.test(password)) {
      return responseFormatHandler(res, 400, '密码格式错误');
    }
    // 密码加密
    const passwordHash = await bcrypt.hash(password, UserController.saltRounds);
    const user = {
      username,
      nickname,
      passwordHash,
      role,
    } as User;
    let transaction;
    try {
      // 事务处理
      logUserAction('SIGNUP_start_mysql_transaction', username);
      transaction = await sequelize.transaction();
      if (await UserService.getUserByUsername(username)) {
        return responseFormatHandler(res, 400, '已经存在重复的手机号');
      }
      const newUser = await UserService.createUser(user);
      logUserAction('SIGNUP', newUser.id, {
        username: newUser.username,
        nickname: newUser.nickname
      });
      const result = {
        userId: newUser.id,
        username: newUser.username,
        nickname: newUser.nickname,
      }
      return responseFormatHandler(res, 201, '注册成功', result);
    } catch (error) {
      logError(
        error as Error,
        { username, nickname }
      )
      await transaction?.rollback();
      return responseFormatHandler(res, 500, '注册失败');
    }
  }

  static async resetPassword(req: Request, res: Response) {
    // 重置并清除token
    const userId = req.params.userId;
    const password = req.body.password;
    if (!userId || !password) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      const passwordHash = await bcrypt.hash(password, UserController.saltRounds);
      logUserAction('resetPassword', userId, {
        passwordHash,
      });
      await UserService.updateUserOneField(userId, 'passwordHash', passwordHash);
      res.clearCookie('token');
      return responseFormatHandler(res, 200, '重置密码成功');
    } catch (error) {
      console.error(error);
      return responseFormatHandler(res, 500, '重置密码失败');
    }
  }

  static async login(req: Request, res: Response) {
    const { userId, username, password } = req.body;
    if (!userId || !username || !password) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      // 获取用户信息
      const userInfo = await UserService.getUserById(userId);
      if (!userInfo) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      // 验证用户名
      if (userInfo.username !== username) {
        return responseFormatHandler(res, 401, '用户名错误');
      }
      // 验证密码
      const storedHash = userInfo.passwordHash;
      // 加盐密码验证
      const isMatch = await bcrypt.compare(password, storedHash);
      if (!isMatch) {
        return responseFormatHandler(res, 401, '密码错误');
      }
      // 生成token传给cookie
      const token = jwt.sign({ userId, username }, process.env.JWT_SECRET || 'viva_jwt_secret', { expiresIn: '1h' });
      const cookieOption = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
      }
      res.cookie('token', token, cookieOption);
      logUserAction('login', userId, {
        username: userInfo.username,
      });
      return responseFormatHandler(res, 200, '登录成功');
    } catch (error) {
      console.error(error);
      return responseFormatHandler(res, 500, '登录失败');
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return responseFormatHandler(res, 200, '登出成功');
  }

  static async getUserInfo(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    const key = RedisHelper.defineKey(userId, 'user');
    if (await RedisHelper.get(key)) {
      return responseFormatHandler(res, 200, '获取用户信息成功', {
        user: await RedisHelper.get(key),
        dataFrom: 'redis',
      });
    }
    try {
      const userInfo = await UserService.getUserById(userId);
      if (!userInfo) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      await RedisHelper.set(key, userInfo, 60 * 10); // 10分钟
      return responseFormatHandler(res, 200, '获取用户信息成功', {
        user: userInfo,
        dataFrom: 'db',
      });
    } catch (error) {
      console.error(error);
      return responseFormatHandler(res, 500, '获取用户信息失败');
    }
  }

  static async updateUserInfo(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    const userInfo = await UserService.getUserById(userId);
    if (!userInfo) {
      return responseFormatHandler(res, 404, '用户不存在');
    }
    const { nickname, profilePicture, email } = req.body;
    const user = {
      nickname,
      profilePicture,
      email,
    } as User;
    try {
      await UserService.updateUser(userId, user);
      logUserAction('updateUserInfo', userId, user);
      return responseFormatHandler(res, 200, '更新用户信息成功');
    } catch (error) {
      console.error(error);
      logError(error as Error, {
        userId,
        message: '更新用户信息失败',
      });
      return responseFormatHandler(res, 500, '更新用户信息失败');
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      await UserService.deleteUser(userId);
      logUserAction('DELETE', userId, {
        username: userId,
      });
      return responseFormatHandler(res, 200, '删除用户成功');
    } catch (error) {
      console.error(error);
      logError(error as Error, {
        userId,
        message: '删除用户失败',
      });
      return responseFormatHandler(res, 500, '删除用户失败');
    }
  }

  static async getUserList(req: Request, res: Response) {
    const { page, pageSize, search } = req.query as {
      page?: number;
      pageSize?: number;
      search?: string;
    };
    try {
      const userList = await UserService.getUserList(page, pageSize, search);
      return responseFormatHandler(res, 200, '获取用户列表成功', { userList });
    } catch (error) {
      console.error(error);
      return responseFormatHandler(res, 500, '获取用户列表失败');
    }
  }

}