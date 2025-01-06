"use strict";

/**
 * 帖子Controller
 */

import PostResposity from "@/service/resposity/post.resposity";
import PostService from "@/service/db/post.service";
import RedisHelper from "@/utils/redisHelper";
import { logUserAction, logError } from "@/utils/logger";
import { Request, Response } from "express";
import UserService from "@/service/db/user.service";
import { sequelize } from "@/config/sequelize.config";
import CommentService from "@/service/db/comment.service";
import CommentResposity from "@/service/resposity/comment.resposity";
import { responseFormatHandler } from "@/utils/responseFormatHandler";

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
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    let mongoSession: any;
    let transaction: any;

    try {
      // 开启 MySQL 事务
      transaction = await sequelize.transaction();

      // 检查用户是否存在
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }

      // 检查帖子标题是否重复
      const currentPost = await PostService.getPostByTitle(title);
      if (currentPost) {
        return responseFormatHandler(res, 400, '重名的帖子');
      }

      // 1. 先存入 MySQL 获取 postId
      const postToMysql = {
        userId,
        title,
        tags,
      };
      const postInMysql = await PostService.createPost(postToMysql);
      const postId = postInMysql.id;

      // 2. 再存入 MongoDB
      const postToMongodb = {
        postId: Number(postId),
        content,
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mongoResult = await PostResposity.createPost(postToMongodb);

      await transaction.commit();

      return responseFormatHandler(res, 200, '发布帖子成功', {
        postId,
        mongoId: mongoResult._id
      });
    } catch (error) {
      console.error('Error in createPost:', error);
      logError(error as Error, { userId, title });
      // 回滚事务
      if (mongoSession) await mongoSession.abortTransaction();
      if (transaction) await transaction.rollback();

      return responseFormatHandler(res, 500, '发布帖子失败');
    } finally {
      if (mongoSession) await mongoSession.endSession();
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
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    const redisKey = RedisHelper.defineKey(postId, 'getCurrentPostDetail');
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      if (await RedisHelper.get(redisKey)) {
        return responseFormatHandler(res, 200, '获取帖子内容成功', {
          data: await RedisHelper.get(redisKey),
          dataFrom: 'redis',
        });
      }
      const postInMysql = await PostService.getPostById(BigInt(postId));
      if (!postInMysql) {
        return responseFormatHandler(res, 404, '帖子不存在');
      }
      const content = await PostResposity.getPostByPostId(Number(postId));
      if (!content) {
        return responseFormatHandler(res, 404, '帖子内容不存在');
      }
      const data = {
        ...postInMysql.toJSON(),
        content: content[0].content,
      }
      RedisHelper.set(redisKey, data, 60 * 5);
      return responseFormatHandler(res, 200, '获取帖子内容成功', {
        data,
        dataFrom: 'db',
      });
    } catch (error) {
      logError(error as Error, { postId, userId });
      return responseFormatHandler(res, 500, '获取帖子内容失败');
    }
  }
  /**
   * 查看帖子列表
   */
  static async getPostsList(req: Request, res: Response) {
    const userId = req.params.userId;
    const redisKey = RedisHelper.defineKey(userId, 'getPostsList');
    if (!userId) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    const { page, pageSize, search, tags } = req.query as {
      page?: string;
      pageSize?: string;
      search?: string;
      tags?: string[];
    };
    try {
      let data: any = null;
      if (!page || !pageSize || !search || !tags) {
        // 帖子元数据 mysql
        if (await RedisHelper.get(redisKey)) {
          data = await RedisHelper.get(redisKey) as {
            postId: string;
            title: string;
            tags: string[];
            content: string;
          }[];
          return responseFormatHandler(res, 200, '获取全部帖子列表成功', {
            data,
            dataFrom: 'redis',
          });
        } else {
          const postsMeta = await PostService.getAllPostsMeta();
          const postIds = postsMeta.map(post => Number(post.id));
          const postsContent = await PostResposity.getPostByPostId(postIds);
          data = postsMeta.map((post, index) => ({
            ...post.toJSON(),
            content: postsContent[index] ? postsContent[index].content : '',
          }));
          RedisHelper.set(redisKey, data, 60 * 5);
          return responseFormatHandler(res, 200, '获取全部帖子列表成功', {
            data,
            dataFrom: 'db',
          });
        }
      } else {
        const posts = await PostService.getPostListWithCondition(page, pageSize, search, tags);
        data = {
          posts: posts.rows,
          total: posts.count,
        }
        return responseFormatHandler(res, 200, '获取帖子列表成功', {
          data,
          dataFrom: 'db',
        });
      }
    } catch (error) {
      logError(error as Error, { userId, page, pageSize, search });
      return responseFormatHandler(res, 500, '获取帖子列表失败');
    }
  }

  /**
   * 查看当前用户帖子
   */
  static async getUserPosts(req: Request, res: Response) {
    const userId = req.params.userId as string;
    if (!userId) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      const postsInMysql = await PostService.getPostByUserId(userId);
      const postsInMongodb = await PostResposity.getPostByPostId(postsInMysql.map(post => Number(post.id)));
      const data = postsInMysql.map((post, index) => ({
        ...post.toJSON(),
        content: postsInMongodb[index] ? postsInMongodb[index].content : '',
        tags: postsInMongodb[index] ? postsInMongodb[index].tags : '',
      }));
      return responseFormatHandler(res, 200, '获取用户帖子成功', {
        posts: data,
      });
    } catch (error) {
      logError(error as Error, { userId });
      return responseFormatHandler(res, 500, '获取用户帖子失败');
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
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    const transaction = await sequelize.transaction();
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      const post = await PostService.getPostById(BigInt(postId));
      if (!post) {
        return responseFormatHandler(res, 404, '帖子不存在');
      }
      await PostService.deletePost(BigInt(postId));
      await PostResposity.deletePostContent(Number(postId));
      await CommentService.deleteCommentByPostId(BigInt(postId));
      await CommentResposity.deleteCommentByPostId(String(postId));
      await transaction.commit();
      return responseFormatHandler(res, 200, '删除帖子成功');
    } catch (error) {
      logError(error as Error, { postId, userId });
      return responseFormatHandler(res, 500, '删除帖子失败');
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
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      const post = await PostService.getPostById(BigInt(postId));
      if (!post) {
        return responseFormatHandler(res, 404, '帖子不存在');
      }
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      const like = await PostService.getPostLikeCountWithUserId(BigInt(postId), userId);
      if (like && like.likeCount == 1) {
        await PostService.deletePostLikeCount(BigInt(postId));
        return responseFormatHandler(res, 200, '取消对帖子点赞成功');
      }
      logUserAction('likePost', userId, { postId });
      await PostService.addPostLikeCount(BigInt(postId));
      return responseFormatHandler(res, 200, '给帖子点赞成功');
    } catch (error) {
      logError(error as Error, { postId, userId });
      return responseFormatHandler(res, 500, '给帖子点赞失败');
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
    const redisKeyForPostGet = RedisHelper.defineKey(postId, 'getCommentsInPostWithPostId');
    if (!postId || !userId || !content) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    const transaction = await sequelize.transaction();
    try {
      logUserAction('makeCommentToPost_start_mongooseSession', userId, { postId });
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      const post = await PostService.getPostById(BigInt(postId));
      if (!post) {
        return responseFormatHandler(res, 404, '帖子不存在');
      }
      logUserAction('makeCommentToPost_clear_redis', userId, { postId });
      await RedisHelper.delete(redisKeyForPostGet);
      logUserAction('makeCommentToPost_insert_mysql', userId, { postId });
      const comment = await CommentService.createComment({
        postId: String(postId),
        userId,
      });
      await PostService.addPostCommentCount(BigInt(postId));
      const commentId = comment.id;
      logUserAction('makeCommentToPost_insert_mongodb', userId, { postId });
      const data = await CommentResposity.createComment({
        commentId,
        postId: Number(postId),
        content,
      });
      await transaction.commit();
      return responseFormatHandler(res, 200, '给帖子评论成功', { data });
    } catch (error) {
      logError(error as Error, { postId, userId });
      return responseFormatHandler(res, 500, '给帖子评论失败');
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
    const redisKey = RedisHelper.defineKey(postId, 'getCommentsInPostWithPostId');

    if (!postId || !userId) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      if (await RedisHelper.get(redisKey)) {
        return responseFormatHandler(res, 200, '获取帖子评论列表成功', {
          data: await RedisHelper.get(redisKey),
          dataFrom: 'redis',
        });
      }
      const commentsContent = await CommentResposity.getCommentByPostId(String(postId));
      if (commentsContent.length > 0) {
        RedisHelper.set(redisKey, commentsContent, 60 * 2); // 两分钟缓存 
      }
      return responseFormatHandler(res, 200, '获取帖子评论列表成功', {
        data: commentsContent,
        dataFrom: 'db',
      });
    } catch (error) {
      logError(error as Error, { postId, userId });
      return responseFormatHandler(res, 500, '获取帖子评论列表失败');
    }
  }

  /**
   * 获取当前用户评论列表
   */
  static async getUserComments(req: Request, res: Response) {
    const userId = req.params.userId as string;
    if (!userId) {
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    const redisKey = RedisHelper.defineKey(userId, 'getUserComments');
    try {
      if (await RedisHelper.get(redisKey)) {
        return responseFormatHandler(res, 200, '获取用户评论列表成功', {
          data: await RedisHelper.get(redisKey),
          dataFrom: 'redis',
        });
      }
      const commentsId = (await CommentService.getCommentByUserId(userId)).map(comment => String(comment.id));
      const commentsContent = await CommentResposity.getCommentByCommentId(commentsId);
      RedisHelper.set(redisKey, commentsContent, 60 * 2); // 两分钟缓存 
      return responseFormatHandler(res, 200, '获取用户评论列表成功', {
        comments: commentsContent,
        dataFrom: 'db',
      });
    } catch (error) {
      logError(error as Error, { userId });
      return responseFormatHandler(res, 500, '获取用户评论列表失败');
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
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    try {
      logUserAction('likeComment', userId, { commentId });
      const comment = await CommentService.getCommentByCommentId(String(commentId));
      if (!comment) {
        return responseFormatHandler(res, 404, '评论不存在');
      }
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      const hasLiked = await CommentService.getCommentLikeCountWithUserId(comment.id, userId);
      if (hasLiked && hasLiked.likeCount == 1) {
        await CommentService.deleteCommentLikeCount(comment.id);
        return responseFormatHandler(res, 200, '取消对评论点赞成功');
      }
      const data = await CommentService.addCommentLikeCount(BigInt(commentId));
      return responseFormatHandler(res, 200, '对评论点赞成功', { data });
    } catch (error) {
      logError(error as Error, { commentId, userId });
      return responseFormatHandler(res, 500, '对评论点赞失败');
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
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    const transaction = await sequelize.transaction();
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      const post = await PostService.getPostById(BigInt(postId));
      if (!post) {
        return responseFormatHandler(res, 404, '帖子不存在');
      }
      const targetComment = await CommentService.getCommentByCommentId(String(commentId));
      if (!targetComment) {
        return responseFormatHandler(res, 404, '评论不存在');
      }
      const targetPerson = await UserService.getUserById(targetComment.userId);
      if (!targetPerson) {
        return responseFormatHandler(res, 404, '被回复用户不存在');
      }
      logUserAction('replyComment_insert_mysql', userId, { postId, commentId });
      const newCommentInMysql = (await CommentService.createComment({
        postId: String(postId),
        userId,
      }));
      const newCommentId = newCommentInMysql.id;
      logUserAction('replyComment_insert_mongodb', userId, { postId, commentId });
      await CommentResposity.createComment({
        commentId: String(newCommentId),
        postId: String(postId),
        content,
      });
      await CommentService.addCommentCount(BigInt(commentId));
      const data = {
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
      await transaction.commit();
      return responseFormatHandler(res, 200, '对评论进行评论/回复成功', { data });
    } catch (error) {
      logError(error as Error, { postId, commentId, userId });
      return responseFormatHandler(res, 500, '对评论进行评论/回复失败');
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
      return responseFormatHandler(res, 400, '缺少必要参数');
    }
    const transaction = await sequelize.transaction();
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return responseFormatHandler(res, 404, '用户不存在');
      }
      const comment = await CommentService.getCommentByCommentId(String(commentId));
      if (!comment) {
        return responseFormatHandler(res, 404, '评论不存在');
      }
      // Promise.all([
      //   CommentService.deleteComment(BigInt(commentId)),
      //   CommentResposity.deleteComment(String(commentId)),
      //   transaction.commit(),
      // ]);
      await CommentService.deleteComment(BigInt(commentId));
      await CommentResposity.deleteComment(String(commentId));
      await transaction.commit();
      return responseFormatHandler(res, 200, '删除评论成功');
    } catch (error) {
      logError(error as Error, { commentId, userId });
      // 回滚
      await transaction.rollback();
      return responseFormatHandler(res, 500, '删除评论失败');
    }
  }
}
