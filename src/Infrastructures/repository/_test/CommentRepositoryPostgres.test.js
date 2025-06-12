const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  const userId = 'user-1';
  const threadId = 'thread-1';
  const commentId = 'comment-1';
  const commentContent = 'Content';

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('checkAvailability function', () => {
    it('should throw NotFoundError when comment is not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailability(commentId, threadId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment is deleted', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
        isDelete: new Date().toISOString(),
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailability(threadId, commentId))
        .rejects
        .toThrowError(new NotFoundError('Comment is deleted'));
    });

    it('should throw NotFoundError when comment is not found in thread', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailability('not-exist', commentId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment available', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailability(threadId, commentId))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('verifyOwnership function', () => {
    it('should throw AuthorizationError when comment owner not authorized', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyOwnership(commentId, 'not-exist'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment owner is authorized', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyOwnership(commentId, userId))
        .resolves
        .not
        .toThrowError(AuthorizationError);
    });
  });

  describe('create function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({
        id: threadId,
        owner: userId,
      });
    });

    it('should persist new comment', async () => {
      const newComment = new NewComment({ content: commentContent });
      const fakeIdGenerator = () => '123456';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.create(userId, threadId, newComment);

      const comments = await CommentsTableTestHelper.fetchById(`comment-${fakeIdGenerator()}`);
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const newComment = new NewComment({ content: commentContent });
      const fakeIdGenerator = () => '123456';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const addedComment = await commentRepositoryPostgres.create(userId, threadId, newComment);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: `comment-${fakeIdGenerator()}`,
        content: commentContent,
        owner: userId,
      }));
    });
  });

  describe('fetchByThreadId function', () => {
    it('should return thread comments correctly', async () => {
      await UsersTableTestHelper.addUser({ id: userId, username: 'username' });
      await UsersTableTestHelper.addUser({ id: 'userid-2', username: 'username2' });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });

      await CommentsTableTestHelper.create({
        id: 'new-comment',
        content: 'new comment',
        date: '2025-01-02',
        thread: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.create({
        id: 'old-comment',
        content: 'old comment',
        date: '2025-01-01',
        thread: threadId,
        owner: 'userid-2',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.fetchByThreadId(threadId);

      expect(comments).toHaveLength(2);

      expect(comments[0].id).toBe('old-comment');
      expect(comments[0].username).toBe('username2');
      expect(comments[0].content).toBe('old comment');
      expect(comments[0].created_at).toBeTruthy();

      expect(comments[1].id).toBe('new-comment');
      expect(comments[1].username).toBe('username');
      expect(comments[1].content).toBe('new comment');
      expect(comments[1].created_at).toBeTruthy();
    });
  });

  describe('deleteById function', () => {
    it('should soft delete comment and update is_delete field', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({
        id: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      await commentRepositoryPostgres.deleteById(commentId);

      const comments = await CommentsTableTestHelper.fetchById(commentId);
      expect(comments).toHaveLength(1);
      expect(typeof comments[0].is_delete).toEqual('string');
    });
  });
});
