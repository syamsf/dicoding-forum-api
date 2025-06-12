const CreateReplyUseCase = require('../CreateReplyUseCase');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePathParams = {
      threadId: 'thread-1',
      commentId: 'comment-1',
    };
    const useCasePayload = { content: 'reply' };

    const mockAddedReply = new AddedReply({
      id: 'reply-1',
      content: useCasePayload.content,
      owner: 'user-1',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.create = jest.fn(() => Promise.resolve(mockAddedReply));

    const createReplyUseCase = new CreateReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const addedReply = await createReplyUseCase.execute('user-1', useCasePathParams, useCasePayload);

    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-1',
      content: 'reply',
      owner: 'user-1',
    }));

    expect(mockThreadRepository.checkAvailability).toBeCalledWith(useCasePathParams.threadId);

    expect(mockCommentRepository.checkAvailability).toBeCalledWith(
      useCasePathParams.threadId,
      useCasePathParams.commentId,
    );

    expect(mockReplyRepository.create).toBeCalledWith(
      'user-1',
      useCasePathParams.commentId,
      new NewReply({ content: useCasePayload.content }),
    );
  });
});
