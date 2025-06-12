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
    const payload = {
      id: replyId,
      username: replyUsername,
      content: replyContent,
      date: 1,
    };

    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyDetail entities correctly', () => {
    const payload = {
      id: replyId,
      username: replyUsername,
      content: replyContent,
      date: replyDate,
    };

    const replyDetail = new ReplyDetail(payload);

    expect(replyDetail).toBeInstanceOf(ReplyDetail);
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.content).toEqual(payload.content);
    expect(replyDetail.date).toEqual(payload.date);
  });

  it('should create deleted ReplyDetail entities correctly', () => {
    const payload = {
      id: replyId,
      username: replyUsername,
      content: replyContent,
      date: replyDate,
      is_delete: true,
    };

    const replyDetail = new ReplyDetail(payload);

    expect(replyDetail).toBeInstanceOf(ReplyDetail);
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.content).toEqual('**balasan telah dihapus**');
    expect(replyDetail.date).toEqual(payload.date);
  });
});
