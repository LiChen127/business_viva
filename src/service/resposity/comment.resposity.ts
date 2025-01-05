import CommentContentModel from "@/db/collection/CommentContent.schema";

class CommentResposity {
  static async createComment(comment: any) {
    return await CommentContentModel.create(comment);
  }

  static async getCommentByCommentId(commentId: Number[]) {
    return await CommentContentModel.find({ where: { commentId } });
  }

  static async getCommentByPostId(postId: String) {
    const comments = await CommentContentModel.find({ where: { postId } });
    console.log(comments, 'comments');
    return comments;
  }

  static async deleteComment(commentId: Number) {
    return await CommentContentModel.deleteOne({ commentId });
  }

  static async deleteCommentByPostId(postId: Number) {
    return await CommentContentModel.deleteMany({ postId });
  }
}

export default CommentResposity;
