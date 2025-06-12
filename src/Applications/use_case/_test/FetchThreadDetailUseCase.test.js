const FetchThreadDetailUseCase = require('../FetchThreadDetailUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');

describe('FetchThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    const mockThreadDetail = {
      id: 'thread-1',
      title: 'Thread title',
      body: 'Thread body',
      created_at: '2025-01-07T00:00:00.000Z',
      date: '2025-01-07T00:00:00.000Z',
      username: 'user-1',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'user-2',
        date: '2025-01-07T00:00:00.000Z',
        created_at: '2025-01-07T00:00:00.000Z',
        content: 'comment',
        is_delete: null,
      },
      {
        id: 'comment-2',
        username: 'user-1',
        date: '2025-01-08T00:00:00.000Z',
        created_at: '2025-01-08T00:00:00.000Z',
        content: 'deleted',
        is_delete: '2025-01-09T00:00:00.000Z',
      },
    ];

    const mockReplies = [
      {
        id: 'reply-1',
        username: 'user-2',
        date: '2025-01-08T00:00:00.000Z',
        created_at: '2025-01-08T00:00:00.000Z',
        content: 'reply',
        comment_id: 'comment-1',
        is_delete: null,
      },
      {
        id: 'reply-2',
        username: 'user-1',
        date: '2025-01-09T00:00:00.000Z',
        created_at: '2025-01-09T00:00:00.000Z',
        content: 'deleted',
        comment_id: 'comment-1',
        is_delete: '2025-01-09T00:00:00.000Z',
      },
      {
        id: 'reply-3',
        username: 'user-1',
        date: '2025-01-09T00:00:00.000Z',
        created_at: '2025-01-09T00:00:00.000Z',
        content: 'reply',
        comment_id: 'comment-2',
        is_delete: null,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.fetchById = jest.fn(() => Promise.resolve(mockThreadDetail));
    mockCommentRepository.fetchByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.fetchByThreadId = jest.fn(() => Promise.resolve(mockReplies));

    const fetchThreadDetailUseCase = new FetchThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadDetail = await fetchThreadDetailUseCase.execute('thread-1');

    expect(threadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-1',
      title: 'Thread title',
      body: 'Thread body',
      date: '2025-01-07T00:00:00.000Z',
      username: 'user-1',
      comments: [
        new CommentDetail({
          id: 'comment-1',
          username: 'user-2',
          date: '2025-01-07T00:00:00.000Z',
          content: 'comment',
          replies: [
            new ReplyDetail({
              id: 'reply-1',
              username: 'user-2',
              content: 'reply',
              date: '2025-01-08T00:00:00.000Z',
            }),
            new ReplyDetail({
              id: 'reply-2',
              username: 'user-1',
              date: '2025-01-09T00:00:00.000Z',
              content: '**balasan telah dihapus**',
            }),
          ],
        }),
        new CommentDetail({
          id: 'comment-2',
          username: 'user-1',
          date: '2025-01-08T00:00:00.000Z',
          content: '**komentar telah dihapus**',
          replies: [],
        }),
      ],
    }));

    expect(mockThreadRepository.fetchById).toBeCalledWith('thread-1');
    expect(mockCommentRepository.fetchByThreadId).toBeCalledWith('thread-1');
    expect(mockReplyRepository.fetchByThreadId).toBeCalledTimes(1);
    expect(mockReplyRepository.fetchByThreadId).toBeCalledWith('thread-1');
  });
});
