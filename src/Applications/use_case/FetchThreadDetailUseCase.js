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

    threadDetail.comments = this._mapComments(threadComments, threadCommentReplies);

    return new ThreadDetail(threadDetail).format();
  }

  _mapComments(comments, replies) {
    return comments.map((comment) => new CommentDetail({
      ...comment,
      replies: comment.is_delete ? [] : this._mapReplies(replies, comment.id),
    }).format());
  }

  _mapReplies(replies, commentId) {
    return replies
      .filter((reply) => reply.comment_id === commentId)
      .map((reply) => new ReplyDetail(reply).format());
  }
}

module.exports = FetchThreadDetailUseCase;
