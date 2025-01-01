import CommentsModel, { Comments } from "@/db/models/Comments.model";

class CommentService {
  static async createComment(comment: Partial<Comments>) {
    return await CommentsModel.create(comment);
  }

  static async getCommentByPostId(postId: bigint) {
    return await CommentsModel.findAll({ where: { postId } });
  }

  static async getCommentByUserId(userId: string) {
    return await CommentsModel.findAll({ where: { userId } });
  }

  static async getCommentByCommentId(commentId: bigint) {
    return await CommentsModel.findOne({ where: { id: commentId } });
  }

  static async getCommentByUserIdWithPostId(userId: string, postId: bigint) {
    return await CommentsModel.findAll({ where: { userId, postId } });
  }

  static async addCommentLikeCount(commentId: bigint) {
    return await CommentsModel.increment('likeCount', { where: { id: commentId } });
  }

  static async deleteComment(commentId: bigint) {
    return await CommentsModel.destroy({ where: { id: commentId } });
  }

  static async deleteCommentLikeCount(commentId: bigint) {
    return await CommentsModel.decrement('likeCount', { where: { id: commentId } });
  }
}


export default CommentService;