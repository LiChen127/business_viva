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
import CommentService from "@/service/db/comment.service";
import CommentResposity from "@/service/resposity/comment.resposity";


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
    const [mongooseSession, transaction] = await Promise.all([
      mongoose.startSession(),
      sequelize.transaction(),
    ]);
    try {
      logUserAction('createPost_start_mongooseSession', userId, { title });
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
      logUserAction('createPost_insert_mysql', userId, { title });
      const postInMysql = await PostService.createPost(postToMysql);
      const postId = postInMysql.id;
      // 再存入mongodb
      const postToMongodb = {
        postId,
        content,
        tags,
      };
      logUserAction('createPost_insert_mongodb', userId, { title });
      await PostResposity.createPost(postToMongodb);
      // 提交会话
      await mongooseSession.commitTransaction();
      // 提交mysql事务
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
  /**
   * 给帖子点赞
   */
  static async likePost(req: Request, res: Response) {
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
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        })
      }
      logUserAction('likePost', userId, { postId });
      await PostService.addPostLikeCount(BigInt(postId));
      return res.status(200).json({
        code: 200,
        message: '给帖子点赞成功',
      })
    } catch (error) {
      logError(error as Error, { postId, userId });
      return res.status(500).json({
        code: 500,
        message: '给帖子点赞失败',
      })
    }
  }

  /**
   * 给帖子评论
   */
  static async makeCommentToPost(req: Request, res: Response) {
    const { postId, userId, content } = req.body as {
      postId: string;
      userId: string;
      content: string;
    };
    const redisKeyForPostGet = RedisHelper.defineKey('getCommentsInPostWithPostId', postId);
    if (!postId || !userId || !content) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    const mongooseSession = await mongoose.startSession();
    const transaction = await sequelize.transaction();
    try {
      logUserAction('makeCommentToPost_start_mongooseSession', userId, { postId });
      // 开启会话
      mongooseSession.startTransaction();
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        })
      }
      const post = await PostService.getPostById(BigInt(postId));
      if (!post) {
        return res.status(404).json({
          code: 404,
          message: '帖子不存在',
        })
      }
      logUserAction('makeCommentToPost_clear_redis', userId, { postId });
      // 先清除redis缓存
      await RedisHelper.delete(redisKeyForPostGet);
      // 先inset入mysql
      logUserAction('makeCommentToPost_insert_mysql', userId, { postId });
      const comment = await CommentService.createComment({
        postId: BigInt(postId),
        userId,
      });
      const commentId = comment.id;
      // 再插入mongodb
      logUserAction('makeCommentToPost_insert_mongodb', userId, { postId });
      const result = await CommentResposity.createComment({
        commentId,
        postId: BigInt(postId),
        content,
      });
      // 提交会话
      await mongooseSession.commitTransaction();
      // 提交mysql事务
      await transaction.commit();
      return res.status(200).json({
        code: 200,
        message: '给帖子评论成功',
        result,
      })
    } catch (error) {
      logError(error as Error, { postId, userId });
    } finally {
      // 关闭会话
      mongooseSession.endSession();
    }
  }

  /**
   * 获取一个帖子的评论列表
   */
  static async getCommentsInPostWithPostId(req: Request, res: Response) {
    const { postId, userId } = req.query as {
      postId: string;
      userId: string;
    };
    const redisKey = RedisHelper.defineKey('getCommentsInPostWithPostId', postId);
    if (!postId || !userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    try {
      if (await RedisHelper.get(redisKey)) {
        return res.status(200).json({
          code: 200,
          message: '获取帖子评论列表成功',
          result: await RedisHelper.get(redisKey),
          dataFrom: 'redis',
        })
      }
      const commentsId = (await CommentService.getCommentByPostId(BigInt(postId))).map(comment => comment.id);
      const commentsContent = await CommentResposity.getCommentByCommentId(commentsId);
      RedisHelper.set(redisKey, commentsContent, 60 * 2); // 两分钟缓存 
      // @TODO: 这里如何应对更新？走了缓存了不能及时获取db了 resolved 待测试
      return res.status(200).json({
        code: 200,
        message: '获取帖子评论列表成功',
        comments: commentsContent,
        dataFrom: 'db',
      })
    } catch (error) {
      logError(error as Error, { postId, userId });
      return res.status(500).json({
        code: 500,
        message: '获取帖子评论列表失败',
      })
    }
  }

  /**
   * 获取当前用户评论列表
   */
  static async getUserComments(req: Request, res: Response) {
    const userId = req.params.userId as string;
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    const redisKey = RedisHelper.defineKey('getUserComments', userId);
    try {
      if (await RedisHelper.get(redisKey)) {
        return res.status(200).json({
          code: 200,
          message: '获取用户评论列表成功',
          result: await RedisHelper.get(redisKey),
          dataFrom: 'redis',
        })
      }
      const commentsId = (await CommentService.getCommentByUserId(userId)).map(comment => comment.id);
      const commentsContent = await CommentResposity.getCommentByCommentId(commentsId);
      RedisHelper.set(redisKey, commentsContent, 60 * 2); // 两分钟缓存 
      return res.status(200).json({
        code: 200,
        message: '获取用户评论列表成功',
        comments: commentsContent,
        dataFrom: 'db',
      })
    } catch (error) {
      logError(error as Error, { userId });
      return res.status(500).json({
        code: 500,
        message: '获取用户评论列表失败',
      })
    }
  }

  /**
   * 对某条评论点赞
   */
  static async likeComment(req: Request, res: Response) {
    const { commentId, userId } = req.body as {
      commentId: string;
      userId: string;
    };
    if (!commentId || !userId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      })
    }
    try {
      logUserAction('likeComment', userId, { commentId });
      const comment = await CommentService.getCommentByCommentId(BigInt(commentId));
      if (!comment) {
        return res.status(404).json({
          code: 404,
          message: '评论不存在',
        })
      }
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        })
      }
      const result = await CommentService.addCommentLikeCount(BigInt(commentId));
      return res.status(200).json({
        code: 200,
        message: '对评论点赞成功',
        result,
      })
    } catch (error) {
      logError(error as Error, { commentId, userId });
      return res.status(500).json({
        code: 500,
        message: '对评论点赞失败',
      })
    }
  }

  /**
   * 对评论进行评论/回复
   * 这里的评论还是寄生于帖子，所以需要postId，之后看怎么重新设计
   * 这里通过commentId来找到评论和user, 这样就保证了评论的唯一性
   */
  static async replyComment(req: Request, res: Response) {
    const { postId, commentId, userId, content } = req.body as {
      postId: string;
      commentId: string;
      userId: string;
      content: string;
    };
    if (!postId || !commentId || !userId || !content) {
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
      const post = await PostService.getPostById(BigInt(postId));
      if (!post) {
        return res.status(404).json({
          code: 404,
          message: '帖子不存在',
        })
      }
      const targetComment = await CommentService.getCommentByCommentId(BigInt(commentId));
      if (!targetComment) {
        return res.status(404).json({
          code: 404,
          message: '评论不存在',
        })
      }
      const targetPerson = await UserService.getUserById(targetComment.userId);
      if (!targetPerson) {
        return res.status(404).json({
          code: 404,
          message: '被回复用户不存在',
        })
      }
      // 先插入mysql
      logUserAction('replyComment_insert_mysql', userId, { postId, commentId });
      const newCommentInMysql = (await CommentService.createComment({
        postId: BigInt(postId),
        userId,
      }));
      const newCommentId = newCommentInMysql.id;
      // 再插入mongodb
      logUserAction('replyComment_insert_mongodb', userId, { postId, commentId });
      await CommentResposity.createComment({
        commentId: newCommentId,
        postId: BigInt(postId),
        content,
      });
      const result = {
        targetPerson: {
          ...targetPerson.toJSON(),
        },
        targetComment: {
          ...targetComment.toJSON(),
        },
        newComment: {
          ...newCommentInMysql.toJSON(),
          content,
        }
      }
      // 提交会话
      await mongooseSession.commitTransaction();
      // 提交mysql事务
      await transaction.commit();
      return res.status(200).json({
        code: 200,
        message: '对评论进行评论/回复成功',
        result,
      })
    } catch (error) {
      logError(error as Error, { postId, commentId, userId });
      return res.status(500).json({
        code: 500,
        message: '对评论进行评论/回复失败',
      })
    } finally {
      // 关闭会话
      mongooseSession.endSession();
    }
  }

  /**
   * 删除评论
   */
  static async deleteComment(req: Request, res: Response) {
    const { commentId, userId } = req.body as {
      commentId: string;
      userId: string;
    };
    if (!commentId || !userId) {
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
      const comment = await CommentService.getCommentByCommentId(BigInt(commentId));
      if (!comment) {
        return res.status(404).json({
          code: 404,
          message: '评论不存在',
        })
      }
      Promise.all([
        CommentService.deleteComment(BigInt(commentId)),
        CommentResposity.deleteComment(BigInt(commentId)),
        mongooseSession.commitTransaction(),
        transaction.commit(),
      ]);
      return res.status(200).json({
        code: 200,
        message: '删除评论成功',
      })
    } catch (error) {
      logError(error as Error, { commentId, userId });
      return res.status(500).json({
        code: 500,
        message: '删除评论失败',
      })
    } finally {
      // 关闭会话
      mongooseSession.endSession();
    }
  }

  /**
   * 取消点赞帖子
   */
  static async cancelLikePost(req: Request, res: Response) {
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
      const post = await PostService.getPostById(BigInt(postId));
      if (!post) {
        return res.status(404).json({
          code: 404,
          message: '帖子不存在',
        })
      }
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        })
      }
      Promise.all([
        PostService.deletePostLikeCount(BigInt(postId)),
        mongooseSession.commitTransaction(),
        transaction.commit(),
      ]);
      return res.status(200).json({
        code: 200,
        message: '取消点赞帖子成功',
      })
    } catch (error) {
      logError(error as Error, { postId, userId });
    } finally {
      // 关闭会话
      mongooseSession.endSession();
    }
  }

  /**
   * 取消点赞评论
   */
  static async cancelLikeComment(req: Request, res: Response) {
    const { commentId, userId, postId } = req.body as {
      commentId: string;
      userId: string;
      postId: string;
    };
    if (!commentId || !userId || !postId) {
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
      const post = await PostService.getPostById(BigInt(postId));
      if (!post) {
        return res.status(404).json({
          code: 404,
          message: '帖子不存在',
        })
      }
      const comment = await CommentService.getCommentByCommentId(BigInt(commentId));
      if (!comment) {
        return res.status(404).json({
          code: 404,
          message: '评论不存在',
        })
      }
      Promise.all([
        CommentService.deleteCommentLikeCount(BigInt(commentId)),
        mongooseSession.commitTransaction(),
        transaction.commit(),
      ]);
      return res.status(200).json({
        code: 200,
        message: '取消点赞评论成功',
      })
    } catch (error) {
      logError(error as Error, { commentId, userId, postId });
    } finally {
      // 关闭会话
      mongooseSession.endSession();
    }
  }

}
