import CommentContentModel from "@/db/collection/CommentContent.schema";

class CommentResposity {
  static async createComment(comment: any) {
    return await CommentContentModel.create(comment);
  }

  static async getCommentByCommentId(commentId: bigint[]) {
    return await CommentContentModel.find({ where: { commentId } });
  }

  static async getCommentByPostId(postId: bigint) {
    return await CommentContentModel.find({ where: { postId } });
  }

  static async deleteComment(commentId: bigint) {
    return await CommentContentModel.deleteOne({ commentId });
  }
}

export default CommentResposity;
