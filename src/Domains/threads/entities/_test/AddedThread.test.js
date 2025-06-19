const AddedThread = require('../AddedThread');

describe('AddedThread entities', () => {
  const threadId = 'thread-123';
  const threadTitle = 'Example thread';
  const threadOwner = 'owner-123';

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: threadId,
      title: threadTitle,
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    const payload = {
      id: threadId,
      title: threadTitle,
      owner: '1',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedThread entities correctly', () => {
    const payload = {
      id: threadId,
      title: threadTitle,
      owner: threadOwner,
    };

    const addedThread = new AddedThread(payload);

    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
