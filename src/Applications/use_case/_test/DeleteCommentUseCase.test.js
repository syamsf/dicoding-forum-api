const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePathParams = {
      threadId: 'thread-1',
      commentId: 'comment-1',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyOwnership = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteById = jest.fn(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteCommentUseCase.execute('user-1', useCasePathParams);

    expect(mockThreadRepository.checkAvailability).toHaveBeenCalledWith(useCasePathParams.threadId);

    expect(mockCommentRepository.checkAvailability).toHaveBeenCalledWith(
      useCasePathParams.threadId,
      useCasePathParams.commentId,
    );

    expect(mockCommentRepository.verifyOwnership).toHaveBeenCalledWith(
      useCasePathParams.commentId,
      'user-1',
    );

    expect(mockCommentRepository.deleteById).toHaveBeenCalledWith(useCasePathParams.commentId);
  });
});
