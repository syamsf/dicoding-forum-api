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
    const payload = {
      id: commentId,
      username: commentUsername,
      content: commentContent,
      replies: 'some replies',
      date: 1,
    };

    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
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
          date: '2021-08-08T07:19:09.775Z',
        },
      ],
      date: '2021-08-08T07:19:09.775Z',
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.date).toEqual(payload.date);
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
          date: '2021-08-08T07:19:09.775Z',
        },
      ],
      date: '2021-08-08T07:19:09.775Z',
      is_delete: true,
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.date).toEqual(payload.date);
  });
});
