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
      await RedisHelper.set(redisKey, moodRecord);
      return responseFormatHandler(res, 200, '获取记录成功', {
        data: moodRecord,
        dataFrom: 'db'
      });
    } catch (error) {
      logError(error as Error, { userId });
      return responseFormatHandler(res, 500, '服务端错误');
    }
  }
}

export default MoodController;