import CommentContentModel from "@/db/collection/CommentContent.schema";

class CommentResposity {
  static async createComment(comment: any) {
    return await CommentContentModel.create(comment);
  }

  static async getCommentByCommentId(commentId: string[]) {
    return await CommentContentModel.find({ commentId: commentId });
  }

  static async getCommentByPostId(postId: string) {
    const comments = await CommentContentModel.find({ postId: postId });
    console.log(comments, '??');
    return comments;
  }

  static async deleteComment(commentId: string) {
    return await CommentContentModel.deleteOne({ commentId });
  }

  static async deleteCommentByPostId(postId: string) {
    return await CommentContentModel.deleteMany({ postId });
  }
}

export default CommentResposity;
