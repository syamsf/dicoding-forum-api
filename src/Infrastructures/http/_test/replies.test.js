const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthenticationTestHelper = require('../../../../tests/AuthenticationTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('replies endpoint', () => {
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
    content: 'Comment',
    date: new Date().toISOString(),
    thread: sampleThread.id,
    isDelete: null,
  };

  const sampleReply = {
    id: 'reply-1',
    content: 'Reply',
    date: new Date().toISOString(),
  };

  beforeAll(async () => {
    server = await createServer(container);
    authenticationTestHelper = new AuthenticationTestHelper(server);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and added reply', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies`,
        payload: { content: sampleReply.content },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeTruthy();
      expect(responseJson.data.addedReply.content).toEqual(sampleReply.content);
    });

    it('should response 400 if payload not containing needed property', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 400 if payload has wrong data type', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies`,
        payload: { content: 1 },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if replied comment is not exist in thread', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await ThreadsTableTestHelper.create({ ...sampleThread, id: 'thread-2', owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/other-thread/comments/${sampleComment.id}/replies`,
        payload: { content: sampleReply.content },
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
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments/comment-789/replies`,
        payload: { content: sampleReply.content },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if comment is not valid or deleted', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies`,
        payload: { content: sampleReply.content },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if threads is not exist', async () => {
      const { accessToken } = await authenticationTestHelper.login();

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-nonexistent/comments/thread-nonexistent/replies',
        payload: { content: sampleReply.content },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 401 if headers not contain access token', async () => {
      const { userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies`,
        payload: { content: sampleReply.content },
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await RepliesTableTestHelper.create({
        ...sampleReply,
        comment: sampleComment.id,
        owner: userId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies/${sampleReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 if reply is not exist', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies/reply-432`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if reply is not valid or deleted', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await RepliesTableTestHelper.create({
        ...sampleReply,
        comment: sampleComment.id,
        owner: userId,
      });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies/${sampleReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies/${sampleReply.id}`,
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
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/comment-678/replies/reply-321`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if comment is not valid or deleted', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await RepliesTableTestHelper.create({
        ...sampleReply,
        comment: sampleComment.id,
        owner: userId,
      });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies/${sampleReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if thread is not exist', async () => {
      const { accessToken } = await authenticationTestHelper.login();

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-nonexistent/comments/comment-123/replies/reply-nonexisten',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if replied comment is not exist in thread', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await RepliesTableTestHelper.create({
        ...sampleReply,
        comment: sampleComment.id,
        owner: userId,
      });

      await ThreadsTableTestHelper.create({ ...sampleThread, id: 'thread-2', owner: userId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-2/comments/${sampleComment.id}/replies/${sampleReply.id}`, // wrong thread
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 if reply is not exist in comment', async () => {
      const { accessToken, userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await RepliesTableTestHelper.create({
        ...sampleReply,
        comment: sampleComment.id,
        owner: userId,
      });

      await CommentsTableTestHelper.create({ ...sampleComment, id: 'other-comment', owner: userId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/other-comment/replies/${sampleReply.id}`, // wrong comment
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 403 if reply owner is not authorized', async () => {
      const { userId } = await authenticationTestHelper.login();
      const { accessToken: otherAccessToken } = await authenticationTestHelper.login(
        {
          username: 'username2',
          password: 'secret',
          fullname: 'username2',
        },
      );

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await RepliesTableTestHelper.create({
        ...sampleReply,
        comment: sampleComment.id,
        owner: userId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies/${sampleReply.id}`,
        headers: { Authorization: `Bearer ${otherAccessToken}` },
      });

      expect(response.statusCode).toEqual(403);
    });

    it('should response 401 if headers not contain access token', async () => {
      const { userId } = await authenticationTestHelper.login();

      await ThreadsTableTestHelper.create({ ...sampleThread, owner: userId });
      await CommentsTableTestHelper.create({ ...sampleComment, owner: userId });
      await RepliesTableTestHelper.create({
        ...sampleReply,
        comment: sampleComment.id,
        owner: userId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/replies/${sampleReply.id}`,
      });

      expect(response.statusCode).toEqual(401);
    });
  });
});
