const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  const userId = 'user-1';
  const threadId = 'thread-1';
  const commentId = 'comment-1';
  const replyContent = 'Content';
  const replyId = 'reply-1';

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('checkAvailability function', () => {
    it('should throw NotFoundError when reply is not available', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkAvailability('', replyId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply is deleted', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.create({
        id: replyId,
        comment: commentId,
        owner: userId,
        isDelete: new Date().toISOString(),
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkAvailability(commentId, replyId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply is not found in comment', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.create({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkAvailability('', replyId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply available', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.create({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkAvailability(commentId, replyId))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('verifyOwnership function', () => {
    it('should throw AuthorizationError when reply owner is not authorized', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.create({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyOwnership(replyId, 'unregistered'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply owner is authorized', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.create({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyOwnership(replyId, userId))
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
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
    });

    it('should persist new reply', async () => {
      const newReply = new NewReply({ content: replyContent });

      const fakeIdGenerator = () => '123456';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.create(
        userId,
        commentId,
        newReply,
      );

      const replies = await RepliesTableTestHelper.fetchById(`reply-${fakeIdGenerator()}`);
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const newReply = new NewReply({ content: replyContent });

      const fakeIdGenerator = () => '123456';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await replyRepositoryPostgres.create(
        userId,
        commentId,
        { content: replyContent },
      );

      expect(addedReply).toStrictEqual(new AddedReply({
        id: `reply-${fakeIdGenerator()}`,
        content: replyContent,
        owner: userId,
      }));
    });
  });

  describe('fetchByCommentId function', () => {
    it('should return comment replies correctly', async () => {
      const otherUserId = 'user-2';
      await UsersTableTestHelper.addUser({ id: userId, username: 'username-1' });
      await UsersTableTestHelper.addUser({ id: otherUserId, username: 'username-2' });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });
      await CommentsTableTestHelper.create({
        id: commentId,
        content: 'Comment 1',
        date: '2025-01-01',
        thread: threadId,
        owner: userId,
      });

      await RepliesTableTestHelper.create({
        id: 'reply-1',
        content: 'new reply',
        date: '2025-01-01',
        comment: commentId,
        owner: userId,
      });
      await RepliesTableTestHelper.create({
        id: 'reply-2',
        content: 'new reply 2',
        date: '2025-01-02',
        comment: commentId,
        owner: otherUserId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const replies = await replyRepositoryPostgres.fetchByCommentId(commentId);

      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe('reply-1');
      expect(replies[0].username).toBe('username-1');
      expect(replies[0].content).toBe('new reply');
      expect(replies[0].created_at).toBeTruthy();
      expect(replies[0].updated_at).toBeTruthy();
      expect(replies[0].is_delete).toBeNull();

      expect(replies[1].id).toBe('reply-2');
      expect(replies[1].username).toBe('username-2');
      expect(replies[1].content).toBe('new reply 2');
      expect(replies[1].created_at).toBeTruthy();
      expect(replies[1].updated_at).toBeTruthy();
      expect(replies[1].is_delete).toBeNull();
    });
  });

  describe('fetchByThreadId function', () => {
    it('should return comment replies correctly', async () => {
      const otherUserId = 'user-2';
      await UsersTableTestHelper.addUser({ id: userId, username: 'username-1' });
      await UsersTableTestHelper.addUser({ id: otherUserId, username: 'username-2' });
      await ThreadsTableTestHelper.create({ id: threadId, owner: userId });

      await CommentsTableTestHelper.create({
        id: commentId,
        content: replyContent,
        date: '2025-01-01',
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.create({
        id: 'reply-1',
        content: 'reply-1',
        date: '2025-01-01',
        comment: commentId,
        owner: userId,
      });
      await RepliesTableTestHelper.create({
        id: 'reply-2',
        content: 'reply-2',
        date: '2025-01-02',
        comment: commentId,
        owner: otherUserId,
      });

      await CommentsTableTestHelper.create({
        id: 'comment-2',
        content: replyContent,
        date: '2025-01-01',
        thread: threadId,
        owner: userId,
        isDelete: new Date().toISOString(),
      });
      await RepliesTableTestHelper.create({
        id: 'reply-3',
        content: 'reply-3',
        date: '2025-01-03',
        comment: 'comment-2',
        owner: otherUserId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const replies = await replyRepositoryPostgres.fetchByThreadId(threadId);

      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe('reply-1');
      expect(replies[0].username).toBe('username-1');
      expect(replies[0].content).toBe('reply-1');
      expect(replies[0].created_at).toBeTruthy();
      expect(replies[0].updated_at).toBeTruthy();
      expect(replies[0].is_delete).toBeNull();
      expect(replies[0].comment_id).toEqual(commentId);
      expect(replies[0].owner).toEqual(userId);

      expect(replies[1].id).toBe('reply-2');
      expect(replies[1].username).toBe('username-2');
      expect(replies[1].content).toBe('reply-2');
      expect(replies[1].created_at).toBeTruthy();
      expect(replies[1].updated_at).toBeTruthy();
      expect(replies[1].is_delete).toBeNull();
      expect(replies[1].comment_id).toEqual(commentId);
      expect(replies[1].owner).toEqual(otherUserId);

      expect(replies[2]).toBeUndefined();
    });
  });

  describe('deleteById function', () => {
    it('should soft delete reply and update is_delete field', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.create({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.create({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      await replyRepositoryPostgres.deleteById(replyId);

      const replies = await RepliesTableTestHelper.fetchById(replyId);
      const deletedAt = new Date(replies[0].is_delete).toISOString().slice(0, 10);
      expect(replies).toHaveLength(1);
      expect(typeof replies[0].is_delete).toEqual('string');
      expect(new Date().toISOString().slice(0, 10)).toEqual(deletedAt);
    });
  });
});
