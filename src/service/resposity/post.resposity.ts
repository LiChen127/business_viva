// 帖子集合 Mongodb服务

// import PostService from "@/service/db/post.service";
import PostContentModel from "@/db/collection/PostContent.schema";
import { client } from '@/config/mongoodb.config';
import { logError } from "@/utils/logger";

class PostResposity {
  static async createPost(post: any, session?: any) {
    try {
      console.log('Creating post with data:', post);

      const postDoc = new PostContentModel(post);
      const validationError = postDoc.validateSync();
      if (validationError) {
        console.error('Validation error:', validationError);
        throw validationError;
      }

      if (session) {
        const result = await PostContentModel.create([post], { session });
        console.log('Post created with session:', result);
        return result[0];
      }

      const result = await PostContentModel.create(post);
      console.log('Post created:', result);
      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      logError(error as Error, { post });
      throw error;
    }
  }

  static async getPostByPostId(postId: number[] | number) {
    try {
      const result = await PostContentModel.find({ postId });
      console.log('Found posts:', result);
      return result;
    } catch (error) {
      console.error('Error finding post:', error);
      throw error;
    }
  }

  /**
   * 更新帖子内容
   */
  static async updatePostContent(postId: string, updatedContent: any) {
    return await PostContentModel.findOneAndUpdate(
      { postId },
      updatedContent,
      { new: true }
    );
  }

  /**
   * 删除帖子内容
   */
  static async deletePostContent(postId: number) {
    return await PostContentModel.findOneAndDelete({ postId });
  }
}

export default PostResposity;