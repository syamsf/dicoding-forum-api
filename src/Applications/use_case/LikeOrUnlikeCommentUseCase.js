const Like = require('../../Domains/commentLikes/entities/Like');

class LikeOrUnlikeCommentUseCase {
  constructor({
    commentRepository,
    threadRepository,
    commentLikeRepository,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(userId, useCasePathParams) {
    const { threadId, commentId } = useCasePathParams;
    await this._threadRepository.checkAvailability(threadId);
    await this._commentRepository.checkAvailability(threadId, commentId);

    const like = new Like({ commentId, owner: userId });

    const isLiked = await this._commentLikeRepository.verifyOwnership(like);

    if (isLiked) {
      await this._commentLikeRepository.delete(like);
      return;
    }

    await this._commentLikeRepository.create(like);
  }
}

module.exports = LikeOrUnlikeCommentUseCase;
