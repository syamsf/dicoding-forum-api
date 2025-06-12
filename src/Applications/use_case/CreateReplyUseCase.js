const NewReply = require('../../Domains/replies/entities/NewReply');

class CreateReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePathParams, useCasePayload) {
    const { threadId, commentId } = useCasePathParams;
    await this._threadRepository.checkAvailability(threadId);
    await this._commentRepository.checkAvailability(threadId, commentId);

    const newReply = new NewReply(useCasePayload);
    return this._replyRepository.create(userId, commentId, newReply);
  }
}

module.exports = CreateReplyUseCase;
