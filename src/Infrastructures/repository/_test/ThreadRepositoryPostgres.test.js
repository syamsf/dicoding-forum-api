const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  const threadId = 'thread-123';
  const userId = 'user-123';
  const threadBody = 'Thread body';
  const threadTitle = 'Thread title';

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('checkAvailability function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.checkAvailability('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.checkAvailability(threadId))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('create function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: userId });
    });

    it('should persist new thread', async () => {
      const newThread = new NewThread({
        title: threadTitle,
        body: threadBody,
      });

      const fakeIdGenerator = () => '123456';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.create(userId, newThread);

      const threads = await ThreadsTableTestHelper.fetchById(`thread-${fakeIdGenerator()}`);
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      const newThread = new NewThread({
        title: threadTitle,
        body: threadBody,
      });

      const fakeIdGenerator = () => '123456';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addedThread = await threadRepositoryPostgres.create(userId, newThread);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: `thread-${fakeIdGenerator()}`,
        title: threadTitle,
        owner: userId,
      }));
    });
  });

  describe('fetchById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.fetchById(threadId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: userId, username: 'username' });
      await ThreadsTableTestHelper.create({
        id: threadId,
        title: threadTitle,
        body: threadBody,
        date: new Date().toISOString(),
        owner: userId,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const thread = await threadRepositoryPostgres.fetchById(threadId);

      expect(thread.id).toStrictEqual(threadId);
      expect(thread.title).toStrictEqual(threadTitle);
      expect(thread.body).toStrictEqual(threadBody);
      expect(thread.created_at).toBeTruthy();
      expect(thread.username).toStrictEqual('username');
    });
  });
});
