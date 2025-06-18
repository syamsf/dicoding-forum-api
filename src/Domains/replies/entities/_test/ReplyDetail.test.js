const ReplyDetail = require('../ReplyDetail');

describe('ReplyDetail entities', () => {
  const replyId = 'reply-1';
  const replyUsername = 'user-123';
  const replyContent = 'This is a reply';
  const replyDate = '2021-08-08T07:19:09.775Z';

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: replyId,
      username: replyUsername,
    };

    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    const defaultPayload = {
      id: replyId,
      username: replyUsername,
      content: replyContent,
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

    expect(() => new ReplyDetail(invalidCreatedAtPayload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new ReplyDetail(invalidUpdatedAtPayload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyDetail entities correctly', () => {
    const payload = {
      id: replyId,
      username: replyUsername,
      content: replyContent,
      created_at: replyDate,
      updated_at: replyDate,
    };

    const replyDetail = new ReplyDetail(payload);

    expect(replyDetail).toBeInstanceOf(ReplyDetail);
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.content).toEqual(payload.content);
    expect(replyDetail.created_at).toEqual(payload.created_at);
    expect(replyDetail.updated_at).toEqual(payload.updated_at);
  });

  it('should create deleted ReplyDetail entities correctly', () => {
    const payload = {
      id: replyId,
      username: replyUsername,
      content: replyContent,
      created_at: replyDate,
      updated_at: replyDate,
      is_delete: replyDate,
    };

    const replyDetail = new ReplyDetail(payload);
    const formattedReplyDetail = replyDetail.format();

    expect(replyDetail).toBeInstanceOf(ReplyDetail);
    expect(formattedReplyDetail.id).toEqual(payload.id);
    expect(formattedReplyDetail.username).toEqual(payload.username);
    expect(formattedReplyDetail.content).toEqual('**balasan telah dihapus**');
    expect(formattedReplyDetail.date).toEqual(payload.created_at);
  });

  it('should return correctly ReplyDetail entities with deleted properties correctly', () => {
    const payload = {
      id: replyId,
      username: replyUsername,
      content: replyContent,
      created_at: replyDate,
      updated_at: replyDate,
    };

    const payloadWithDeletedProperties = {
      ...payload,
      is_delete: replyDate,
    };

    const payloadWithNullDeletedProperties = {
      ...payload,
      is_delete: null,
    };

    const replyDetailWithDeleted = new ReplyDetail(payloadWithDeletedProperties);
    const formattedReplyDetailWithDeleted = replyDetailWithDeleted.format();

    const replyDetailWithNullDeleted = new ReplyDetail(payloadWithNullDeletedProperties);
    const formattedReplyDetailWithNullDeleted = replyDetailWithNullDeleted.format();

    expect(replyDetailWithDeleted).toBeInstanceOf(ReplyDetail);
    expect(formattedReplyDetailWithDeleted.id).toEqual(payload.id);
    expect(formattedReplyDetailWithDeleted.username).toEqual(payload.username);
    expect(formattedReplyDetailWithDeleted.content).toEqual('**balasan telah dihapus**');
    expect(formattedReplyDetailWithDeleted.date).toEqual(payload.created_at);

    expect(replyDetailWithNullDeleted).toBeInstanceOf(ReplyDetail);
    expect(formattedReplyDetailWithNullDeleted.id).toEqual(payload.id);
    expect(formattedReplyDetailWithNullDeleted.username).toEqual(payload.username);
    expect(formattedReplyDetailWithNullDeleted.content).toEqual(payload.content);
    expect(formattedReplyDetailWithNullDeleted.date).toEqual(payload.created_at);
  });
});
