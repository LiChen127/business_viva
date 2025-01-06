import SensitiveSerivce from "@/service/db/sensitive.service";
import UserService from "@/service/db/user.service";
import { logError } from "@/utils/logger";
import RedisHelper from "@/utils/redisHelper";
import { responseFormatHandler } from "@/utils/responseFormatHandler";
import { Request, Response } from "express";

class SensitiveController {
  protected static publicRedisKey: string = RedisHelper.defineKey('sensitiveKey', 'getSensitiveWord');
  static async putWordIn(req: Request, res: Response) {
    const { userId, word } = req.body as {
      userId: string;
      word: string;
    };
    if (!userId || !word) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 400, '该用户不存在');
      }
      if (user.role !== 'superAdmin' && user.role !== 'admin') {
        return responseFormatHandler(res, 400, '该用户没有权限');
      }
      // const publicRedisKey = RedisHelper.defineKey(userId, 'getSensitiveWord');
      // 先清除redis缓存
      await Promise.all([
        RedisHelper.delete(this.publicRedisKey),
        SensitiveSerivce.createWord(word)
      ]);
      return responseFormatHandler(res, 201, '添加成功');
    } catch (e) {
      logError(e as Error, { userId: userId, word: word });
      return responseFormatHandler(res, 500, '服务端错误');
    }
  }

  static async getWordList(req: Request, res: Response) {
    const { userId, page, pageSize, search } = req.query as {
      userId: string;
      page?: string;
      pageSize?: string;
      search?: string;
    };
    if (!userId) {
      return responseFormatHandler(res, 400, '缺少userId');
    }
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 400, '该用户不存在');
      }
      if (user.role !== 'superAdmin' && user.role !== 'admin') {
        return responseFormatHandler(res, 400, '该用户没有权限');
      }
      const redisValue = await RedisHelper.get(this.publicRedisKey);
      if (redisValue) {
        return responseFormatHandler(res, 200, '获取成功', {
          data: redisValue,
          dataFrom: 'redis'
        });
      }
      const result = await SensitiveSerivce.getAllWords();
      await RedisHelper.set(this.publicRedisKey, result, 60 * 60 * 24 * 7);
      return responseFormatHandler(res, 200, '获取成功', {
        data: result,
        dataFrom: 'db'
      });
    } catch (e) {
      logError(e as Error, { userId: userId });
      return responseFormatHandler(res, 500, '服务端错误');
    }
  }

  static async deleteWord(req: Request, res: Response) {
    const { userId, wordId } = req.body as {
      userId: string;
      wordId: string;
    }
    if (!userId || !wordId) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 400, '该用户不存在');
      }
      if (user.role !== 'superAdmin' && user.role !== 'admin') {
        return responseFormatHandler(res, 400, '该用户没有权限');
      }
      const word = await SensitiveSerivce.getWordById(BigInt(wordId));
      if (!word) {
        return responseFormatHandler(res, 400, '该敏感词不存在');
      }
      await Promise.all([
        SensitiveSerivce.removeWordInDb(BigInt(wordId)),
        RedisHelper.delete(this.publicRedisKey)
      ]);
      return responseFormatHandler(res, 200, '删除成功');
    } catch (error) {
      logError(error as Error, { wordId: wordId });
      return responseFormatHandler(res, 500, '服务端错误');
    }
  }
}

export default SensitiveController;