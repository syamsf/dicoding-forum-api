class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePathParams) {
    const { threadId, commentId, replyId } = useCasePathParams;

    await this._threadRepository.checkAvailability(threadId);
    await this._commentRepository.checkAvailability(threadId, commentId);
    await this._replyRepository.checkAvailability(commentId, replyId);
    await this._replyRepository.verifyOwnership(replyId, userId);

    await this._replyRepository.deleteById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
