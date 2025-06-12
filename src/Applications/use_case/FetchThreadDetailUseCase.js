const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class FetchThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const threadDetail = await this._threadRepository.fetchById(threadId);
    const threadComments = await this._commentRepository.fetchByThreadId(threadId);
    const threadCommentReplies = await this._replyRepository.fetchByThreadId(threadId);

    threadDetail.date = threadDetail.created_at;
    delete threadDetail.created_at;

    threadDetail.comments = this._mapComments(threadComments, threadCommentReplies);

    return new ThreadDetail(threadDetail);
  }

  _mapComments(comments, replies) {
    return comments.map((comment) => new CommentDetail({
      ...comment,
      date: comment.created_at,
      replies: comment.is_delete ? [] : this._mapReplies(replies, comment.id),
    }));
  }

  _mapReplies(replies, commentId) {
    return replies
      .filter((reply) => reply.comment_id === commentId)
      .map((reply) => new ReplyDetail({ ...reply, date: reply.created_at }));
  }
}

module.exports = FetchThreadDetailUseCase;
