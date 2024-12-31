"use strict";

/**
 * 帖子Controller
 */

import PostResposity from "@/service/resposity/post.resposity";
import PostService from "@/service/db/post.service";
import RedisHelper from "@/utils/redisHelper";
import { logUserAction, logError } from "@/utils/logger";
import { Request, Response } from "express";
import { Posts } from "@/db/models/Posts.model";
import UserService from "@/service/db/user.service";
import mongoose from "mongoose";
import { sequelize } from "@/config/sequelize.config";


export default class PostController {
  /**
   * 发布帖子
   */
  static async createPost(req: Request, res: Response) {
    const { userId, title, content, tags } = req.body as {
      userId: string;
      title: string;
      content: string;
      tags?: string[];
    };
    if (!userId || !title || !content) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    // mondodb会话
    const mongooseSession = await mongoose.startSession();
    // mysql事务
    const transaction = await sequelize.transaction();
    try {
      // 开启会话
      mongooseSession.startTransaction();
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        })
      }
      // 查看是否有重复的帖子
      const currentPost = await PostService.getPostByTitle(title);
      if (currentPost) {
        return res.status(400).json({
          code: 400,
          message: '重名的帖子',
        })
      }
      const postToMysql = {
        userId,
        title,
        tags,
      };
      // 先存入mysql获取postId
      const postInMysql = await PostService.createPost(postToMysql);
      const postId = postInMysql.id;
      // 再存入mongodb
      const postToMongodb = {
        postId,
        content,
        tags,
      };
      await PostResposity.createPost(postToMongodb);
      await mongooseSession.commitTransaction();
      await transaction.commit();
      return res.status(200).json({
        code: 200,
        message: '发布帖子成功',
        postId,
      })
    } catch (error) {
      logError(error as Error, { userId, title });
      // 回滚事务和会话
      await transaction.rollback();
      await mongooseSession.abortTransaction();
      return res.status(500).json({
        code: 500,
        message: '发布帖子失败',
      })
    } finally {
      // 关闭会话
      mongooseSession.endSession();
    }
  }
  /**
   * 获取帖子内容
   */
  static async getCurrentPostDetail(req: Request, res: Response) {
    const { postId, userId } = req.query as {
      postId: string;
      userId: string;
    };
    if (!postId || !userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    const redisKey = RedisHelper.defineKey('getCurrentPostDetail', postId);
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        })
      }
      if (await RedisHelper.get(redisKey)) {
        return res.status(200).json({
          code: 200,
          message: '获取帖子内容成功',
          result: await RedisHelper.get(redisKey),
          dataFrom: 'redis',
        })
      }
      const postInMysql = await PostService.getPostById(BigInt(postId));
      if (!postInMysql) {
        return res.status(404).json({
          code: 404,
          message: '帖子不存在',
        })
      }
      const content = await PostResposity.getPostByPostId(BigInt(postId));
      if (!content) {
        return res.status(404).json({
          code: 404,
          message: '帖子内容不存在',
        })
      }
      const result = {
        ...postInMysql.toJSON(),
        content: content[0].content,
      }
      RedisHelper.set(redisKey, result);
      return res.status(200).json({
        code: 200,
        message: '获取帖子内容成功',
        result,
        dataFrom: 'db',
      })
    } catch (error) {
      logError(error as Error, { postId, userId });
      return res.status(500).json({
        code: 500,
        message: '获取帖子内容失败',
      })
    }
  }
  /**
   * 查看帖子列表
   */
  static async getPostsList(req: Request, res: Response) {
    const userId = req.params.userId;
    const redisKey = RedisHelper.defineKey('getPostsList', userId);
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    const { page, pageSize, search, tags } = req.query as {
      page?: string;
      pageSize?: string;
      search?: string;
      tags?: string[];
    };
    try {
      let result: any = null;
      if (!page || !pageSize || !search || !tags) {
        // 帖子元数据 mysql
        if (await RedisHelper.get(redisKey)) {
          result = await RedisHelper.get(redisKey) as {
            postId: string;
            title: string;
            tags: string[];
            content: string;
          }[];
          return res.status(200).json({
            code: 200,
            message: '获取全部帖子列表成功',
            result,
            dataFrom: 'redis',
          })
        } else {
          const postsMeta = await PostService.getAllPostsMeta();
          const postIds = postsMeta.map(post => post.id);
          const postsContent = await PostResposity.getPostByPostId(postIds);
          result = postsMeta.map((post, index) => ({
            ...post.toJSON(),
            content: postsContent[index].content,
          }));
          RedisHelper.set(redisKey, result);
          return res.status(200).json({
            code: 200,
            message: '获取全部帖子列表成功',
            result,
            dataFrom: 'db',
          })
        }
      } else {
        const posts = await PostService.getPostListWithCondition(page, pageSize, search, tags);
        result = {
          posts: posts.rows,
          total: posts.count,
        }
        return res.status(200).json({
          code: 200,
          message: '获取帖子列表成功',
          result,
          dataFrom: 'db',
        })
      }
    } catch (error) {
      logError(error as Error, { userId, page, pageSize, search });
      return res.status(500).json({
        code: 500,
        message: '获取帖子列表失败',
      })
    }
  }

  /**
   * 查看当前用户帖子
   */
  static async getUserPosts(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    try {
      const postsInMysql = await PostService.getPostByUserId(userId);
      const postsInMongodb = await PostResposity.getPostByPostId(postsInMysql.map(post => post.id));
      const result = postsInMysql.map((post, index) => ({
        ...post.toJSON(),
        content: postsInMongodb[index].content,
      }));
      return res.status(200).json({
        code: 200,
        message: '获取用户帖子成功',
        posts: result,
      })
    } catch (error) {
      logError(error as Error, { userId });
      return res.status(500).json({
        code: 500,
        message: '获取用户帖子失败',
      })
    }
  }
  /**
   * 删除帖子
   */
  static async deletePost(req: Request, res: Response) {
    const { postId, userId } = req.body as {
      postId: string;
      userId: string;
    };
    if (!postId || !userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    const mongooseSession = await mongoose.startSession();
    const transaction = await sequelize.transaction();
    try {
      // 开启会话
      mongooseSession.startTransaction();
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        })
      }
      await PostService.deletePost(BigInt(postId));
      await PostResposity.deletePostContent(BigInt(postId));
      await mongooseSession.commitTransaction();
      await transaction.commit();
      return res.status(200).json({
        code: 200,
        message: '删除帖子成功',
      })
    } catch (error) {
      logError(error as Error, { postId, userId });
      return res.status(500).json({
        code: 500,
        message: '删除帖子失败',
      })
    } finally {
      // 关闭会话
      mongooseSession.endSession();
    }
  }
}