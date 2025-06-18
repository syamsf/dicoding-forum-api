const LikeOrUnlikeCommentUseCase = require('../LikeOrUnlikeCommentUseCase');
const CommentLikeRepository = require('../../../Domains/commentLikes/CommentLikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('LikeOrUnlikeCommentUseCase', () => {
  const likePayload = {
    owner: 'user-1',
    commentId: 'comment-1',
  };

  const threadId = 'thread-1';
  const commentId = 'comment-1';

  it('should orchestrating the like comment action correctly if comment is not liked', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockCommentLikeRepository.verifyOwnership = jest.fn(() => Promise.resolve(false));
    mockCommentLikeRepository.create = jest.fn(() => Promise.resolve());

    const likeOrUnlikeCommentUseCase = new LikeOrUnlikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await likeOrUnlikeCommentUseCase.execute(likePayload.owner, { threadId, commentId });

    expect(mockThreadRepository.checkAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.checkAvailability).toBeCalledWith(threadId, commentId);
    expect(mockCommentLikeRepository.verifyOwnership).toBeCalledWith(likePayload);
    expect(mockCommentLikeRepository.create).toBeCalledWith(likePayload);
  });

  it('should orchestrating the unlike comment action correctly if comment is liked', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockCommentLikeRepository.verifyOwnership = jest.fn(() => Promise.resolve(true));
    mockCommentLikeRepository.delete = jest.fn(() => Promise.resolve());

    const likeOrUnlikeCommentUseCase = new LikeOrUnlikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await likeOrUnlikeCommentUseCase.execute(likePayload.owner, { threadId, commentId });

    expect(mockThreadRepository.checkAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.checkAvailability).toBeCalledWith(threadId, commentId);
    expect(mockCommentLikeRepository.verifyOwnership).toBeCalledWith(likePayload);
    expect(mockCommentLikeRepository.delete).toBeCalledWith(likePayload);
  });
});
