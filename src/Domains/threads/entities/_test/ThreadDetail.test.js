const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entities', () => {
  const threadId = 'thread-123';
  const threadTitle = 'Example thread';
  const threadBody = 'Thread body';
  const threadDate = '2021-08-08T07:19:09.775Z';
  const threadOwner = 'owner-123';

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: threadId,
      title: threadTitle,
      body: threadBody,
      comments: [],
    };

    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    const payload = {
      id: threadId,
      title: threadTitle,
      body: threadBody,
      created_at: threadDate,
      updated_at: threadDate,
      username: 123456,
      comments: 'String comment',
    };

    const payloadWithInvalidComments = {
      id: threadId,
      title: threadTitle,
      body: threadBody,
      created_at: threadDate,
      updated_at: threadDate,
      username: '123456',
      comments: [
        { id: 'comments-1', username: 'userA', content: 'Comment A' },
        'this is a string in the array',
        { id: 'comments-2', username: 'userB', content: 'Comment B' },
      ],
    };

    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new ThreadDetail(payloadWithInvalidComments)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetail entities correctly', () => {
    const payload = {
      id: threadId,
      title: threadTitle,
      body: threadBody,
      created_at: threadDate,
      updated_at: threadDate,
      username: threadOwner,
      comments: [],
    };

    const threadDetail = new ThreadDetail(payload);
    const threadDetailFormatted = threadDetail.format();

    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail).toStrictEqual(new ThreadDetail(payload));
    expect(threadDetailFormatted).toStrictEqual({
      id: threadId,
      title: threadTitle,
      body: threadBody,
      date: threadDate,
      username: threadOwner,
      comments: [],
    });
  });
});
