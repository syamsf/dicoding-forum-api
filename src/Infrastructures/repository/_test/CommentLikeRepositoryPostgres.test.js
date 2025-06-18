const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgres = require('../CommentLikesRepositoryPostgres');
const Like = require('../../../Domains/commentLikes/entities/Like');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');

describe('CommentLikesRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const userId = 'user-1';

  const threadPayload = {
    id: 'thread-1',
    title: 'Thread title',
    body: 'Thread body',
    date: new Date().toISOString(),
  };

  const commentPayload = {
    id: 'comment-1',
    content: 'Comment',
    date: new Date().toISOString(),
    thread: threadPayload.id,
    isDelete: null,
  };

  const likePayload = {
    commentId: commentPayload.id,
    owner: userId,
  };

  describe('create', () => {
    it('should add a like to the database', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ ...threadPayload, owner: userId });
      await CommentsTableTestHelper.create({ ...commentPayload, owner: userId });

      const newLike = new Like({ owner: userId, commentId: commentPayload.id });

      const fakeIdGenerator = () => '12345';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await commentLikeRepositoryPostgres.create(newLike);

      const likes = await CommentLikesTableTestHelper.fetchByUserIdAndCommentId(
        userId,
        commentPayload.id,
      );
      expect(likes[0]).toStrictEqual({
        id: `like-${fakeIdGenerator()}`,
        comment_id: commentPayload.id,
        owner: userId,
      });
    });
  });

  describe('verifyOwnership', () => {
    it('should return true if a user has liked a comment', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ ...threadPayload, owner: userId });
      await CommentsTableTestHelper.create({ ...commentPayload, owner: userId });
      await CommentLikesTableTestHelper.create({ ...likePayload, id: 'like-1' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      const isCommentLiked = await commentLikeRepositoryPostgres.verifyOwnership(likePayload);

      expect(isCommentLiked).toBe(true);
    });

    it('should return false if a user has not liked a comment', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ ...threadPayload, owner: userId });
      await CommentsTableTestHelper.create({ ...commentPayload, owner: userId });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      const isCommentLiked = await commentLikeRepositoryPostgres.verifyOwnership(likePayload);

      expect(isCommentLiked).toBe(false);
    });
  });

  describe('fetchByThreadId', () => {
    it('should return the likes for a thread', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ ...threadPayload, owner: userId });
      await CommentsTableTestHelper.create({ ...commentPayload, owner: userId });
      await CommentsTableTestHelper.create({ ...commentPayload, id: 'comment-2', owner: userId });
      await CommentLikesTableTestHelper.create({
        id: 'like-1',
        commentId: commentPayload.id,
        owner: userId,
      });
      await CommentLikesTableTestHelper.create({
        id: 'like-2',
        commentId: 'comment-2',
        owner: userId,
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      const threadCommentLikes = await commentLikeRepositoryPostgres
        .fetchByThreadId(threadPayload.id);

      expect(threadCommentLikes).toHaveLength(2);
      expect(threadCommentLikes[0].id).toStrictEqual('like-1');
      expect(threadCommentLikes[0].comment_id).toStrictEqual(commentPayload.id);
      expect(threadCommentLikes[1].id).toStrictEqual('like-2');
      expect(threadCommentLikes[1].comment_id).toStrictEqual('comment-2');
    });
  });

  describe('delete', () => {
    it('should delete a like from the database', async () => {
      const like = new Like({
        commentId: commentPayload.id,
        owner: userId,
      });

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.create({ ...threadPayload, owner: userId });
      await CommentsTableTestHelper.create({ ...commentPayload, owner: userId });
      await CommentLikesTableTestHelper.create({ id: 'like-1', ...like });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      await commentLikeRepositoryPostgres.delete(like);

      const likes = await CommentLikesTableTestHelper.fetchById('nonexistent-like');
      expect(likes).toHaveLength(0);
    });
  });
});
