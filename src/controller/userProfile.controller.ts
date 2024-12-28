"use strict";

import { UserProfileService } from '@/service/db/user.profile';
import { logUserAction } from '@/utils/logger';
import RedisHelper from '@/utils/redisHelper';
import { Request, Response } from 'express';

export default class UserProfileController {
  static async setUserProfile(req: Request, res: Response) {
    const { userId, gender, age, location, introduction } = req.body;
    if (!userId || !gender || !age || !location || !introduction) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }

    try {
      const userProfile = {
        gender,
        age,
        location,
        introduction,
      }
      logUserAction('setUserProfile', userId, userProfile);
      const result = await UserProfileService.setUserProfile(userId, userProfile);
      return res.status(200).json({
        code: 200,
        data: result,
        message: '设置用户概况成功',
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '设置用户概况失败',
      })
    }
  }

  /**
   * 上传头像
   */
  // static async uploadProfilePicture(req: Request, res: Response) {
  //   const { userId, base64Image, fileName } = req.body;
  //   if (!userId || !base64Image || !fileName) {
  //     return res.status(400).json({
  //       code: 400,
  //       message: '缺少必要参数',
  //     })
  //   }
  //   // 去User表中查一下是否存在
  //   const currentUser = await UserService.getUserById(userId);
  //   if (!currentUser) {
  //     return res.status(400).json({
  //       code: 400,
  //       message: '用户不存在',
  //     })
  //   }
  //   // // 上传头像逻辑
  //   try {
  //     const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  //     if (!matches) {
  //       return res.status(400).json({
  //         code: 400,
  //         message: '无效的base64图片数据',
  //       })
  //     }

  //     const fileType = matches[1]; // image/png
  //     const base64Data = matches[2]; // 图片的base64数据

  //     const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  //     if (!allowedTypes.includes(fileType)) {
  //       return res.status(400).json({
  //         code: 400,
  //         message: '不支持的图片格式',
  //       })
  //     }

  //   } catch (error) {

  //   }
  // }

  /**
   * getUserProfile
   */
  static async getUserProfile(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    try {
      const redisKey = RedisHelper.defineKey(userId, 'userProfile');
      const userProfile = await RedisHelper.get(redisKey);
      if (userProfile) {
        return res.status(200).json({
          code: 200,
          data: userProfile,
          message: '获取用户概况成功',
          dataFrom: 'redis',
        })
      }
      const userProfileInDb = await UserProfileService.getUserProfile(userId);
      if (!userProfileInDb) {
        return res.status(404).json({
          code: 404,
          message: '用户概况不存在',
        })
      }
      // 存一下redis
      await RedisHelper.set(redisKey, userProfileInDb, 60 * 10 * 24); // 1天
      return res.status(200).json({
        code: 200,
        data: userProfileInDb,
        message: '获取用户概况成功',
        dataFrom: 'db',
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '获取用户概况失败',
      })
    }
  }

  static async updateUserProfile(req: Request, res: Response) {
    const { userId, gender, age, location, introduction } = req.body;
    if (!userId || !gender || !age || !location || !introduction) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    try {
      const newuseProfile = {
        gender,
        age,
        location,
        introduction,
      }
      logUserAction('updateUserProfile', userId, newuseProfile);
      const result = await UserProfileService.updateUserProfile(userId, newuseProfile);
      return res.status(200).json({
        code: 200,
        data: result,
        message: '更新用户概况成功',
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '更新用户概况失败',
      })
    }
  }
}
