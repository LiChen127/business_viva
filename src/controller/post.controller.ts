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
   * 查看帖子列表
   */
  static async getPostsList(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    const { page, pageSize, search } = req.query as {
      page?: string;
      pageSize?: string;
      search?: string;
    };
    try {
      let resultList: any[] = [];
      if (!page || !pageSize || !search) {
        // 帖子元数据 mysql
        const postsMeta = await PostService.getAllPostsMeta();
        const postIds = postsMeta.map(post => post.id);

        const postsContent = await PostResposity.getPostByPostId(postIds);
        resultList = postsMeta.map((post, index) => ({
          ...post.toJSON(),
          content: postsContent[index].content,
        }));
      }
    } catch (error) {
      logError(error as Error, { userId, page, pageSize, search });
      return res.status(500).json({
        code: 500,
        message: '获取帖子列表失败',
      })
    }
    // const posts = await PostService.getPostList(userId, page, pageSize, search);
    // return res.status(200).json({
    //   code: 200,
    //   message: '获取帖子列表成功',
    //   posts,
    // })
  }
}