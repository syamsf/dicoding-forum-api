const CommentDetail = require('../CommentDetail');

describe('CommentDetail entities', () => {
  const commentId = 'comment-1';
  const commentUsername = 'username';
  const commentContent = 'This is comment';

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: commentId,
      username: commentUsername,
    };

    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    const defaultPayload = {
      id: commentId,
      username: commentUsername,
      content: commentContent,
      replies: 'some replies',
    };

    const invalidCreatedAtPayload = {
      ...defaultPayload,
      created_at: 1,
      updated_at: new Date().toISOString(),
    };

    const invalidUpdatedAtPayload = {
      ...defaultPayload,
      created_at: new Date().toISOString(),
      updated_at: 1,
    };

    const payloadWithInvalidReplies = {
      id: commentId,
      username: commentUsername,
      content: commentContent,
      replies: [
        { id: 'reply-1', username: 'userA', content: 'Reply A' },
        'this is a string in the array',
        { id: 'reply-2', username: 'userB', content: 'Reply B' },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(() => new CommentDetail(invalidCreatedAtPayload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CommentDetail(invalidUpdatedAtPayload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CommentDetail(payloadWithInvalidReplies)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetail entities correctly', () => {
    const payload = {
      id: commentId,
      username: commentUsername,
      content: commentContent,
      replies: [
        {
          id: 'replies-1',
          username: commentUsername,
          content: 'Comment replies',
          created_at: '2021-08-08T07:19:09.775Z',
          updated_at: '2021-08-08T07:19:09.775Z',
        },
      ],
      created_at: '2021-08-08T07:19:09.775Z',
      updated_at: '2021-08-08T07:19:09.775Z',
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.created_at).toEqual(payload.created_at);
    expect(commentDetail.updated_at).toEqual(payload.updated_at);
  });

  it('should create deleted CommentDetail entities correctly', () => {
    const payload = {
      id: commentId,
      username: commentUsername,
      content: commentContent,
      replies: [
        {
          id: 'replies-1',
          username: commentUsername,
          content: 'Comment replies',
          created_at: '2021-08-08T07:19:09.775Z',
          updated_at: '2021-08-08T07:19:09.775Z',
        },
      ],
      created_at: '2021-08-08T07:19:09.775Z',
      updated_at: '2021-08-08T07:19:09.775Z',
      is_delete: '2021-08-08T07:19:09.775Z',
    };

    const commentDetail = new CommentDetail(payload);
    const formattedCommentDetail = commentDetail.format();

    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(formattedCommentDetail.id).toEqual(payload.id);
    expect(formattedCommentDetail.content).toEqual('**komentar telah dihapus**');
    expect(formattedCommentDetail.date).toEqual(payload.created_at);
    expect(formattedCommentDetail.username).toEqual(payload.username);
    expect(formattedCommentDetail.replies).toEqual(payload.replies);
  });
});
