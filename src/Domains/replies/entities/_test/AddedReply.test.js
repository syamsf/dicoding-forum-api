const AddedReply = require('../AddedReply');

describe('AddedReply entities', () => {
  const replyId = 'reply-1';
  const replyUsername = 'user-123';
  const replyContent = 'This is a reply';

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      content: replyContent,
      owner: replyUsername,
    };

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    const payload = {
      id: replyId,
      content: replyContent,
      owner: 1,
    };

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply entities correctly', () => {
    const payload = {
      id: replyId,
      content: replyContent,
      owner: replyUsername,
    };

    const addedReply = new AddedReply(payload);

    expect(addedReply).toBeInstanceOf(AddedReply);
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
