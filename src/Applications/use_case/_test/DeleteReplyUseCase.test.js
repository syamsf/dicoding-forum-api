const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePathParams = {
      threadId: 'thread-1',
      commentId: 'comment-1',
      replyId: 'reply-1',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyOwnership = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteById = jest.fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteReplyUseCase.execute('user-1', useCasePathParams);

    expect(mockThreadRepository.checkAvailability).toHaveBeenCalledWith(useCasePathParams.threadId);

    expect(mockCommentRepository.checkAvailability).toHaveBeenCalledWith(
      useCasePathParams.threadId,
      useCasePathParams.commentId,
    );

    expect(mockReplyRepository.checkAvailability).toHaveBeenCalledWith(
      useCasePathParams.commentId,
      useCasePathParams.replyId,
    );

    expect(mockReplyRepository.verifyOwnership).toHaveBeenCalledWith(
      useCasePathParams.replyId,
      'user-1',
    );

    expect(mockReplyRepository.deleteById).toHaveBeenCalledWith(useCasePathParams.replyId);
  });
});
