"use strict";

import { sequelize } from '@/config/sequelize.config';
import { UserProfileService } from '@/service/db/userProfile.service';
import UserService from '@/service/db/user.service';
import { logUserAction } from '@/utils/logger';
import RedisHelper from '@/utils/redisHelper';
import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';

export default class UserProfileController {
  static async setUserProfile(req: Request, res: Response) {
    const { userId, gender, age, location, introduction, moodStatus } = req.body;
    if (!userId || !gender || !age || !location || !introduction || !moodStatus) {
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
        moodStatus,
      }
      logUserAction('setUserProfile', userId, userProfile);
      // const result = await UserProfileService.setUserProfile(userId, userProfile);
      await UserProfileService.setUserProfile(userId, userProfile);
      return res.status(200).json({
        code: 200,
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
      const userProfileInDb = await UserProfileService.getUserProfileByUserId(userId);
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
    const { userId, gender, age, location, introduction, moodStatus } = req.body;
    if (!userId || !gender || !age || !location || !introduction || !moodStatus) {
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
        moodStatus,
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

  static async getUserProfileList(req: Request, res: Response) {
    const { userId, search, page, pageSize } = req.query as {
      userId: string;
      search?: string;
      page?: string | number;
      pageSize?: string | number;
    }
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少userId',
      })
    }
    try {
      // 查找一下是不是管理员
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(400).json({
          code: 400,
          message: '管理员不存在'
        })
      }
      if (user.role !== 'admin' && user.role !== 'superAdmin') {
        return res.status(400).json({
          code: 400,
          message: '用户没有权限'
        })
      }
      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      // 查询总数
      const countSql = `
        SELECT
          COUNT(*) AS count
        FROM
          users u
        INNER JOIN
          userprofiles up
        ON
          u.id = up.userId
        WHERE
          (:search IS NULL OR u.username LIKE :searchPattern OR u.nickname LIKE :searchPattern);
      `;

      const countResult = await sequelize.query(countSql, {
        replacements: {
          search: search || null,
          searchPattern: `%${search || ''}%`,
        },
        type: QueryTypes.SELECT,
      }) as any;

      const totalCount = countResult[0]?.count || 0;

      // 查询分页数据
      const listSql = `
        SELECT
          u.id AS userId,
          u.username,
          u.nickname,
          u.email,
          u.role,
          up.id AS profileId,
          up.gender,
          up.age,
          up.location,
          up.introduction,
          up.moodStatus
        FROM
          users u
        INNER JOIN
          userprofiles up
        ON
          u.id = up.userId
        WHERE
          (:search IS NULL OR u.username LIKE :searchPattern OR u.nickname LIKE :searchPattern)
        ORDER BY
          u.createdAt DESC
        LIMIT
          :limit
        OFFSET
          :offset;
      `;

      const listResult = await sequelize.query(listSql, {
        replacements: {
          search: search || null,
          searchPattern: `%${search || ''}%`,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      return res.status(200).json({
        code: 200,
        data: {
          count: totalCount,
          list: listResult,
        },
        message: '获取用户概况列表成功',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '获取用户概况列表失败'
      })
    }
  }
  // @todo: 之后数据量多了之后优化  迁移到getUserProfileList
  static async getAllUserProfile(req: Request, res: Response) {
    const { userId } = req.query as {
      userId: string;
    }
    const redisKey = RedisHelper.defineKey(userId, 'allUserProfile');
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少userId',
      })
    }

    try {
      if (await RedisHelper.get(redisKey)) {
        return res.status(200).json({
          code: 200,
          data: await RedisHelper.get(redisKey),
          message: '获取用户概况列表成功',
          dataFrom: 'redis',
        })
      }
      const userProfiles = await UserProfileService.getAllUserProfile();
      await RedisHelper.set(redisKey, userProfiles, 60 * 10 * 24); // 1天
      return res.status(200).json({
        code: 200,
        data: userProfiles,
        message: '获取用户概况列表成功',
        dataFrom: 'db',
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '获取用户概况列表失败',
      })
    }
  }
}

