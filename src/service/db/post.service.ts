/**
 * 帖子服务
 */

import PostsModel, { Posts } from "@/db/models/Posts.model";
import { Op } from "sequelize";

class PostService {
  static async createPost(post: Partial<Posts>) {
    return await PostsModel.create(post);
  }

  static async getPostById(postId: bigint) {
    return await PostsModel.findOne({ where: { id: postId } });
  }

  static async getPostByUserId(userId: string) {
    return await PostsModel.findAll({ where: { userId } });
  }

  static async getPostListWithCondition(page?: string, pageSize?: string, search?: string, tags?: string[]) {
    const offset = page ? (Number(page) - 1) * Number(pageSize) : 0;
    const limit = pageSize ? Number(pageSize) : undefined;
    const where = search ? { title: { [Op.like]: `%${search}%` } } : {};
    const whereTags = tags ? { tags: { [Op.contains]: tags } } : {};
    return await PostsModel.findAndCountAll({ where: { ...where, ...whereTags }, offset, limit });
  }

  static async updatePost(postId: bigint, post: Partial<Posts>) {
    return await PostsModel.update(post, { where: { id: postId } });
  }

  static async getPostByTitle(title: string) {
    return await PostsModel.findOne({ where: { title } });
  }

  static async getAllPostsMeta() {
    return await PostsModel.findAll();
  }

  static async deletePost(postId: bigint) {
    return await PostsModel.destroy({ where: { id: postId } });
  }
}

export default PostService;