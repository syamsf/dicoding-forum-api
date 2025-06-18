const LikeOrUnlikeCommentUseCase = require('../../../../Applications/use_case/LikeOrUnlikeCommentUseCase');

class CommentLikesHandler {
  constructor(container) {
    this._container = container;
  }

  async updateCommentLikesHandler(request, h) {
    const { id: userId } = request.auth.credentials;

    const likeOrUnlikeCommentUseCase = this._container.getInstance(
      LikeOrUnlikeCommentUseCase.name,
    );

    await likeOrUnlikeCommentUseCase.execute(userId, request.params);

    const response = h.response({
      status: 'success',
    });

    response.code(200);
    return response;
  }
}

module.exports = CommentLikesHandler;
