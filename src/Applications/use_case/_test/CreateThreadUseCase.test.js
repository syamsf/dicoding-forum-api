const CreateThreadUseCase = require('../CreateThreadUseCase');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('CreateThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'Thread title',
      body: 'Thread body',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-1',
      title: 'Thread title',
      owner: 'user-1',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.create = jest.fn(() => Promise.resolve(mockAddedThread));

    const createThreadUseCase = new CreateThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await createThreadUseCase.execute('user-1', useCasePayload);

    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-1',
      title: 'Thread title',
      owner: 'user-1',
    }));

    expect(mockThreadRepository.create).toBeCalledWith('user-1', new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    }));
  });
});
