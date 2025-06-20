const NewThread = require('../../Domains/threads/entities/NewThread');

class CreateThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.create(userId, newThread);
  }
}

module.exports = CreateThreadUseCase;
