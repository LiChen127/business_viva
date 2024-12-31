// 帖子集合 Mongodb服务

// import PostService from "@/service/db/post.service";
import PostContentModel from "@/db/collection/PostContent.schema";

class PostResposity {
  static async createPost(post: any) {
    return await PostContentModel.create(post);
  }

  static async getPostByPostId(postId: bigint[] | bigint) {
    return await PostContentModel.find({ where: { postId } });
  }

  /**
   * 更新帖子内容
   */
  static async updatePostContent(postId: string, updatedContent: any) {
    return await PostContentModel.findOneAndUpdate({ postId }, updatedContent, { new: true });
  }

  /**
   * 删除帖子内容
   */
  static async deletePostContent(postId: bigint) {
    return await PostContentModel.findOneAndDelete({ postId });
  }
}

export default PostResposity;