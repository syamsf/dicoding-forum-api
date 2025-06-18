const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class FetchThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    const threadDetail = await this._threadRepository.fetchById(threadId);
    const threadComments = await this._commentRepository.fetchByThreadId(threadId);
    const threadCommentReplies = await this._replyRepository.fetchByThreadId(threadId);
    const threadCommentsLikes = await this._commentLikeRepository.fetchByThreadId(threadId);

    threadDetail.comments = this._mapComments(
      threadComments,
      threadCommentReplies,
      threadCommentsLikes,
    );

    return new ThreadDetail(threadDetail).format();
  }

  _mapComments(comments, replies, commentLikes) {
    return comments.map((comment) => new CommentDetail({
      ...comment,
      replies: comment.is_delete ? [] : this._mapReplies(replies, comment.id),
      like_count: commentLikes.filter((like) => like.comment_id === comment.id).length,
    }).format());
  }

  _mapReplies(replies, commentId) {
    return replies
      .filter((reply) => reply.comment_id === commentId)
      .map((reply) => new ReplyDetail(reply).format());
  }
}

module.exports = FetchThreadDetailUseCase;
