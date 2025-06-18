const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const AuthenticationTestHelper = require('../../../../tests/AuthenticationTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('comment likes endpoint', () => {
  let server = null;
  let authenticationTestHelper = null;

  beforeAll(async () => {
    server = await createServer(container);
    authenticationTestHelper = new AuthenticationTestHelper(server);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  const sampleThread = {
    id: 'thread-1',
    title: 'Thread title',
    body: 'Thread body',
    date: new Date().toISOString(),
  };

  const sampleComment = {
    id: 'comment-1',
    content: 'Comment',
    date: new Date().toISOString(),
    thread: sampleThread.id,
    isDelete: null,
  };

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and like comment if comment has not been liked', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await CommentLikesTableTestHelper.fetchByUserIdAndCommentId(
        userId,
        sampleComment.id,
      );
      expect(likes).toHaveLength(1);
    });

    it('should response 200 and unlike comment if comment has been liked', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await CommentLikesTableTestHelper.create({ commentId: sampleComment.id, owner: userId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await CommentLikesTableTestHelper.fetchByUserIdAndCommentId(
        userId,
        sampleComment.id,
      );
      expect(likes).toHaveLength(0);
    });

    it('should response 404 if liked comment is not exist in the thread', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await ThreadsTableTestHelper.create({ ...sampleThread, id: 'thread-2', owner: userId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread-2/comments/${sampleComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if comment is not exist', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/comment-1000/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment not found');
    });

    it('should response 404 if comment is deleted or invalid', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment is deleted');
    });

    it('should response 404 if thread is not exist', async () => {
      const { accessToken } = await authenticationTestHelper.login();

      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-1000/comments/comment-1000/likes',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread not found');
    });

    it('should response 401 if headers not contain access token', async () => {
      const { userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/likes`,
      });

      expect(response.statusCode).toEqual(401);
    });
  });
});
