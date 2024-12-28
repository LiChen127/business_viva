"use strict";
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserService from '../service/db/user.service';
import { User } from '@/db/models/User.model';
import RedisHelper from '@/utils/redisHelper';
import bcrypt from 'bcryptjs';
import logger, { logUserAction, logError, logAPICall, } from '@/utils/logger';


/**
 * 用户相关
 */

export default class UserController {
  // static salt = crypto.randomBytes(16).toString('hex');
  static saltRounds = 10;
  /**
   * 用户注册
   * @param req 
   * @param res 
   */
  static async signUp(req: Request, res: Response) {
    const { username, nickname, password, role } = req.body as {
      username: string;
      nickname: string;
      password: string;
      role: 'admin' | 'user' | 'superAdmin';
    };
    if (!username || !nickname || !password || !role) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    // 密码加密
    const passwordHash = await bcrypt.hash(password, UserController.saltRounds);
    const user = {
      username,
      nickname,
      passwordHash,
      role,
    } as User;

    try {
      if (await UserService.getUserByUsername(username)) {
        return res.status(400).json({
          code: 400,
          message: '该用户已存在',
        })
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
      return res.status(201).json({
        code: 201,
        message: '注册成功',
        user: result,
      })
    } catch (error) {
      logError(
        error as Error,
        { username, nickname }
      )
      return res.status(500).json({
        code: 500,
        message: '注册失败',
      })
    }
  }

  static async resetPassword(req: Request, res: Response) {
    // 重置并清除token
    const userId = req.params.userId;
    const password = req.body.password;
    if (!userId || !password) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    try {
      const passwordHash = await bcrypt.hash(password, UserController.saltRounds);
      logUserAction('resetPassword', userId, {
        passwordHash,
      });
      await UserService.updateUserOneField(userId, 'passwordHash', passwordHash);
      res.clearCookie('token');
      return res.status(200).json({
        code: 200,
        message: '重置密码成功',
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '重置密码失败',
      })
    }
  }

  static async login(req: Request, res: Response) {
    const { userId, username, password } = req.body;
    if (!userId || !username || !password) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    try {
      // 获取用户信息
      const userInfo = await UserService.getUserById(userId);
      if (!userInfo) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        })
      }
      // 验证密码
      const storedHash = userInfo.passwordHash;
      const isMatch = await bcrypt.compare(password, storedHash);
      if (!isMatch) {
        return res.status(401).json({
          code: 401,
          message: '密码错误',
        })
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

      return res.status(200).json({
        code: 200,
        message: '登录成功',
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '登录失败',
      })
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.status(200).json({
      code: 200,
      message: '登出成功',
    })
  }

  static async getUserInfo(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    const key = RedisHelper.defineKey(userId, 'user');
    if (await RedisHelper.get(key)) {
      return res.status(200).json({
        code: 200,
        message: '获取用户信息成功',
        user: await RedisHelper.get(key),
        dataFrom: 'redis',
      })
    }
    try {
      const userInfo = await UserService.getUserById(userId);
      if (!userInfo) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        })
      }
      await RedisHelper.set(key, userInfo, 60 * 10); // 10分钟
      return res.status(200).json({
        code: 200,
        message: '获取用户信息成功',
        user: userInfo,
        dataFrom: 'db',
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '获取用户信息失败',
      })

    }
  }

  static async updateUserInfo(req: Request, res: Response) {
    const userId = req.params.userId;
    const startTime = Date.now();
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    const userInfo = await UserService.getUserById(userId);
    if (!userInfo) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      })
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
      return res.status(200).json({
        code: 200,
        message: '更新用户信息成功',
      })
    } catch (error) {
      console.error(error);
      logError(error as Error, {
        userId,
        message: '更新用户信息失败',
      });
      return res.status(500).json({
        code: 500,
        message: '更新用户信息失败',
      })
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    try {
      await UserService.deleteUser(userId);
      logUserAction('DELETE', userId, {
        username: userId,
      });
      return res.status(200).json({
        code: 200,
        message: '删除用户成功',
      })

    } catch (error) {
      console.error(error);
      logError(error as Error, {
        userId,
        message: '删除用户失败',
      });
      return res.status(500).json({
        code: 500,
        message: '删除用户失败',
      })
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
      return res.status(200).json({
        code: 200,
        message: '获取用户列表成功',
        userList,
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '获取用户列表失败',
      })

    }
  }

}