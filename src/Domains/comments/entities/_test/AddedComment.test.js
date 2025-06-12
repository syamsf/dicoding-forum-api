const AddedComment = require('../AddedComment');

describe('AddedComment entities', () => {
  const commentContent = 'Comment';
  const commentOwner = 'user-12345';
  const commentId = 'comment-1';

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      content: commentContent,
      owner: commentOwner,
    };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    const payload = {
      id: commentId,
      content: commentContent,
      owner: 1,
    };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment entities correctly', () => {
    const payload = {
      id: commentId,
      content: commentContent,
      owner: commentOwner,
    };

    const addedComment = new AddedComment(payload);

    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
