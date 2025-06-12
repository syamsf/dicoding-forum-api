const NewComment = require('../../Domains/comments/entities/NewComment');

class CreateCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, useCasePayload) {
    await this._threadRepository.checkAvailability(threadId);

    const newComment = new NewComment(useCasePayload);
    return this._commentRepository.create(userId, threadId, newComment);
  }
}

module.exports = CreateCommentUseCase;
