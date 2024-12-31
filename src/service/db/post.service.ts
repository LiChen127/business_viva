/**
 * 帖子服务
 */

import PostsModel, { Posts } from "@/db/models/Posts.model";


class PostService {
  static async createPost(post: Partial<Posts>) {
    return await PostsModel.create(post);
  }

  static async getPostById(postId: bigint) {
    return await PostsModel.findOne({ where: { id: postId } });
  }

  static async getPostList(userId: string, page?: number, pageSize?: number, search?: string) {
    const offset = page ? (Number(page) - 1) * Number(pageSize) : 0;
    const limit = pageSize ? Number(pageSize) : undefined;
    return await PostsModel.findAll({ where: { userId }, offset, limit });
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
}

export default PostService;