const CreateCommentUseCase = require('../CreateCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('CreateCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = { content: 'Comment' };

    const mockAddedComment = new AddedComment({
      id: 'comment-1',
      content: 'Comment',
      owner: 'user-1',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.create = jest.fn(() => Promise.resolve(mockAddedComment));

    const createCommentUseCase = new CreateCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const addedComment = await createCommentUseCase.execute('user-1', 'thread-1', useCasePayload);

    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-1',
      content: 'Comment',
      owner: 'user-1',
    }));

    expect(mockThreadRepository.checkAvailability).toBeCalledWith('thread-1');
    expect(mockCommentRepository.create).toBeCalledWith(
      'user-1',
      'thread-1',
      new NewComment({ content: useCasePayload.content }),
    );
  });
});
