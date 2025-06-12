const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationTestHelper = require('../../../../tests/AuthenticationTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('threads comments endpoint', () => {
  let server = null;
  let authenticationTestHelper = null;

  const sampleThread = {
    id: 'thread-1',
    title: 'Thread title',
    body: 'Thread body',
    date: new Date().toISOString(),
  };

  const sampleComment = {
    id: 'comment-1',
    content: 'This is a comment',
  };

  beforeAll(async () => {
    server = await createServer(container);
    authenticationTestHelper = new AuthenticationTestHelper(server);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and added comment', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments`,
        payload: { content: sampleComment.content },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeTruthy();
      expect(responseJson.data.addedComment.content).toEqual(sampleComment.content);
    });

    it('should response 400 if payload not contain needed property', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 if payload wrong data type', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments`,
        payload: { content: 1 },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if thread is not exist', async () => {
      const { accessToken } = await authenticationTestHelper.login();

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-567/comments',
        payload: { content: sampleComment.content },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 401 if headers not contain access token', async () => {
      const { userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments`,
        payload: { content: sampleComment.content },
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({
        ...sampleComment,
        thread: sampleThread.id,
        date: new Date().toISOString(),
        owner: userId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 if comment is not exist', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/comment-nonexistent`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if comment is not valid or deleted', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({
        ...sampleComment,
        thread: sampleThread.id,
        date: new Date().toISOString(),
        owner: userId,
      });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if the comment is not exist in threads', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({
        ...sampleComment,
        thread: sampleThread.id,
        date: new Date().toISOString(),
        owner: userId,
      });

      await ThreadsTableTestHelper.create({ ...sampleThread, id: 'thread-2', owner: userId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-2/comments/${sampleComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if threads is not exist', async () => {
      const { accessToken } = await authenticationTestHelper.login();

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-2/comments/comment-nonexistent',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 403 if comment owner is not authorized', async () => {
      const { userId } = await authenticationTestHelper.login();
      const { accessToken: user2Token } = await authenticationTestHelper.login(
        {
          username: 'username2',
          password: 'secret',
          fullname: 'username2',
        },
      );

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({
        ...sampleComment,
        thread: sampleThread.id,
        date: new Date().toISOString(),
        owner: userId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}`,
        headers: { Authorization: `Bearer ${user2Token}` },
      });

      expect(response.statusCode).toEqual(403);
    });

    it('should response 401 if headers is not containing access token', async () => {
      const { userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({
        ...sampleComment,
        thread: sampleThread.id,
        date: new Date().toISOString(),
        owner: userId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}`,
      });

      expect(response.statusCode).toEqual(401);
    });
  });
});
