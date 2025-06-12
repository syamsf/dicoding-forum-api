class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePathParams) {
    const { threadId, commentId } = useCasePathParams;
    await this._threadRepository.checkAvailability(threadId);
    await this._commentRepository.checkAvailability(threadId, commentId);
    await this._commentRepository.verifyOwnership(commentId, userId);

    return this._commentRepository.deleteById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
