const NewThread = require('../NewThread');

describe('NewThread entities', () => {
  const threadTitle = 'Example thread';

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      title: threadTitle,
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    const payload = {
      title: threadTitle,
      body: 123456,
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread entities correctly', () => {
    const payload = {
      title: threadTitle,
      body: 'Thread body',
    };

    const newThread = new NewThread(payload);

    expect(newThread).toBeInstanceOf(NewThread);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
