const Like = require('../Like');

describe('Like entity', () => {
  const commentId = 'comment-1';
  const owner = 'user-1';

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      commentId,
    };

    expect(() => new Like(payload)).toThrowError('LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    const payload = {
      owner: 12345,
      commentId,
    };

    expect(() => new Like(payload)).toThrowError('LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply entities correctly', () => {
    const payload = {
      commentId,
      owner,
    };

    const newLike = new Like(payload);

    expect(newLike.owner).toEqual(payload.owner);
    expect(newLike.commentId).toEqual(payload.commentId);
  });
});
