import Comments from "@/db/models/Comments.model";

class CommentService {
  static async createComment(comment: {
    postId: bigint;
    userId: string;
  }) {
    const result = await Comments.create({
      postId: comment.postId,
      userId: comment.userId,
      likeCount: 0,
      commentCount: 0,
    });
    return result;
  }

  static async getCommentByPostId(postId: bigint) {
    return await Comments.findAll({ where: { postId } });
  }

  static async getCommentByUserId(userId: string) {
    return await Comments.findAll({ where: { userId } });
  }

  static async getCommentByCommentId(commentId: bigint) {
    return await Comments.findOne({ where: { id: commentId } });
  }

  static async getCommentByUserIdWithPostId(userId: string, postId: bigint) {
    return await Comments.findAll({ where: { userId, postId } });
  }

  static async addCommentLikeCount(commentId: bigint) {
    return await Comments.increment('likeCount', { where: { id: commentId } });
  }

  static async deleteComment(commentId: bigint) {
    return await Comments.destroy({ where: { id: commentId } });
  }

  static async deleteCommentLikeCount(commentId: bigint) {
    // const result = await Comments.decrement('likeCount', { where: { id: commentId } });
    // 先确保是>=0的
    const comment = await Comments.findOne({ where: { id: commentId } });
    if (comment && comment.likeCount > 0) {
      return await Comments.decrement('likeCount', { where: { id: commentId } });
    }
    return -1;
  }

  static async addCommentCount(postId: bigint) {
    return await Comments.increment('commentCount', { where: { postId } });
  }

  static async deleteCommentByPostId(postId: bigint) {
    return await Comments.destroy({ where: { postId } });
  }

  static async getCommentLikeCountWithUserId(commentId: bigint, userId: string) {
    return await Comments.findOne({ where: { id: commentId, userId } });
  }
}


export default CommentService;