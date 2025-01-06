/**
 * 用户情绪管理
 */
import { Request, Response } from "express";
import RedisHelper from "@/utils/redisHelper";
import { logUserAction, logError } from "@/utils/logger";
import { responseFormatHandler } from "@/utils/responseFormatHandler";
import UserService from "@/service/db/user.service";
import MoodService from "@/service/db/mood.service";
import { Mood } from "@/service/db/mood.service";
import { sequelize } from "@/config/sequelize.config";
import { Transaction } from "sequelize";
import { UserProfileService } from "@/service/db/userProfile.service";

class MoodController {
  /**
   * 记录今天的情绪等级
   */
  static recordDayMood = async (req: Request, res: Response) => {
    const { userId, moodGrade } = req.body as {
      userId: string;
      moodGrade: string;
    }
    if (!userId || !moodGrade) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 400, '用户不存在');
      }
      const formatedMoodGrade = Number(moodGrade);
      if (formatedMoodGrade > 100 || formatedMoodGrade < 0) {
        return responseFormatHandler(res, 400, 'moodGrade参数不符合标准');
      }
      const insertData = {
        userId: userId,
        moodGrade: formatedMoodGrade
      }
      const result = await MoodService.createMoodeRecord(insertData);
      if (result) {
        return responseFormatHandler(res, 201, '记录成功', result);
      }
      return responseFormatHandler(res, 500, '记录失败');
    } catch (error) {
      logError(error as Error, { userId });
      return responseFormatHandler(res, 500, '服务端错误');
    }
  }

  /**
   * 更新日记
   */
  static async updateRecordWithNote(req: Request, res: Response) {
    const { moodId, userId, noteTitle, noteDetail, moodGrade } = req.body as {
      moodId: string;
      userId: string;
      noteTitle: string;
      moodGrade: string;
      noteDetail: string;
    }
    if (!moodId || !userId || noteTitle.length === 0 || noteDetail.length === 0) {
      return responseFormatHandler(res, 400, '缺少参数');
    }
    // 开启事务
    const transaction = await sequelize.transaction();
    try {
      const redisKey = RedisHelper.defineKey(moodId, 'getMoodDetail');
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      const moodRecord = await MoodService.getByMoodId(BigInt(moodId));
      if (!moodRecord) {
        return responseFormatHandler(res, 400, 'moodRecord不存在');
      }
      const updateRecord = {
        moodId: BigInt(moodId),
        userId: userId,
        moodGrade: Number(moodGrade),
        noteTitle: noteTitle,
        noteDetail: noteDetail
      }
      const result = await MoodService.updateMoodRecord(updateRecord);
      await RedisHelper.delete(redisKey);
      await transaction.commit();
      return responseFormatHandler(res, 200, '更新成功', result);
    } catch (error) {
      logError(error as Error, { userId, moodId });
      await transaction.rollback();
      return responseFormatHandler(res, 500, '服务端错误');
    }
  }

  /**
   * 删除日记及其记录
   */
  static async deleteMoodRecord(req: Request, res: Response) {
    const { userId, moodId } = req.body as {
      userId: string;
      moodId: string;
    }
    const transaction = await sequelize.transaction();
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 400, '用户不存在');
      }
      const formatMoodId = BigInt(moodId);
      const moodRecord = await MoodService.getByMoodId(formatMoodId);
      if (!moodRecord) {
        return responseFormatHandler(res, 400, '记录不存在');
      }
      const result = await MoodService.deleteMoodRecord(formatMoodId);
      await transaction.commit();
      return responseFormatHandler(res, 200, '删除mood成功', result);
    } catch (error) {
      logError(error as Error, { userId, moodId });
      await transaction.rollback();
      return responseFormatHandler(res, 500, '服务端错误');
    }
  }

  static async getMoodDetail(req: Request, res: Response) {
    const { userId, moodId } = req.query as {
      userId: string;
      moodId: string;
    }
    if (!userId || !moodId) {
      return responseFormatHandler(res, 400, '缺少参数');
    }
    const redisKey = RedisHelper.defineKey(moodId, 'getMoodDetail');
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 400, '用户不存在');
      }
      const moodRecord = await MoodService.getByMoodId(BigInt(moodId));
      if (!moodRecord) {
        return responseFormatHandler(res, 400, '记录不存在');
      }
      const redisValue = await RedisHelper.get(redisKey);
      if (redisValue) {
        return responseFormatHandler(res, 200, '获取记录成功', {
          data: redisValue,
          dataFrom: 'redis'
        })
      }
      await RedisHelper.set(redisKey, moodRecord, 60 * 5);
      return responseFormatHandler(res, 200, '获取记录成功', {
        data: moodRecord,
        dataFrom: 'db'
      });
    } catch (error) {
      logError(error as Error, { userId });
      return responseFormatHandler(res, 500, '服务端错误');
    }
  }
  /**
   * 获取用户情绪列表支持分页搜索筛选
   * 筛选支持时间筛选
   * createAt: 2025-01-05 11:34:38
   */
  static async getUserMoodList(req: Request, res: Response) {
    const { userId, page, pageSize, dateTime, search } = req.query as {
      userId: string;
      page?: string;
      pageSize?: string;
      dateTime?: string;
      search?: string;
    }
    if (!userId) {
      return responseFormatHandler(res, 400, '缺少必要参数userId');
    }
    try {
      const redisKey = RedisHelper.defineKey(userId, 'getUserMoodListAll');
      if (!page && !pageSize && !search) {
        const redisList = await RedisHelper.get(redisKey)
        if (redisList) {
          return responseFormatHandler(res, 200, '请求moodListAll成功', {
            data: redisList,
            dataFrom: 'redis'
          });
        }
      }
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 400, '用户不存在');
      }
      if (user.role !== 'admin' && user.role !== 'superAdmin') {
        return responseFormatHandler(res, 400, '没有权限');
      }
      if (dateTime) {
        // 写一个正则过滤一下
        // 格式2024-01-05
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(dateTime)) {
          return responseFormatHandler(res, 400, '日期格式不正确, 应为YYYY-MM-DD格式');
        }
      }
      const userList = await UserService.getUserList(Number(page), Number(pageSize), search);
      let userIdList: string[];
      let userProfileList: any[];
      let moodList: any[];
      let resultList: any[];
      if (Array.isArray(userList)) {
        userIdList = userList.map(u => u.id);
        [userProfileList, moodList] = await Promise.all([
          UserProfileService.getUserProfileListByUserIds(userIdList),
          MoodService.getMoodRecordListByUserId(userIdList, dateTime)
        ])
        resultList = userList.map((user, index) => {
          return {
            userId: user.id,
            nickname: user.nickname,
            username: user.username,
            gender: userProfileList[index].gender,
            location: userProfileList[index].location,
            moodGrade: moodList[index].moodGrade,
            moodNoteTitle: moodList[index].noteTitle,
            createTime: moodList[index].createdAt,
            lastUpdateTime: moodList[index].updatedAt
          };
        })
        if (resultList.length > 0) {
          await RedisHelper.set(redisKey, { list: resultList }, 60 * 10); // 十分钟缓存
        }
        return responseFormatHandler(res, 200, '请求moodListAll成功', {
          data: {
            list: resultList
          },
          dataFrom: 'db'
        });
      }
      const processedUserList = userList.list;
      const count = userList.total;
      userIdList = processedUserList.map(u => u.id);
      [userProfileList, moodList] = await Promise.all([
        UserProfileService.getUserProfileListByUserIds(userIdList),
        MoodService.getMoodRecordListByUserId(userIdList)
      ])
      resultList = processedUserList.map((user, index) => {
        return {
          userId: user.id,
          nickname: user.nickname,
          username: user.username,
          gender: userProfileList[index].gender,
          location: userProfileList[index].location,
          moodGrade: moodList[index].moodGrade,
          moodNoteTitle: moodList[index].noteTitle,
          createTime: moodList[index].createdAt,
          lastUpdateTime: moodList[index].updatedAt
        };
      });
      return responseFormatHandler(res, 200, '请求成功', {
        data: {
          list: resultList,
          count: count,
        },
        dataFrom: 'db'
      });
    } catch (error) {
      logError(error as Error, { userId });
      return responseFormatHandler(res, 500, '服务端错误');
    }
  }
}

export default MoodController;