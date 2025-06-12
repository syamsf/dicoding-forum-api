const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationTestHelper = require('../../../../tests/AuthenticationTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  let server = null;
  let authenticationTestHelper = null;
  const threadTitle = 'Thread title';
  const threadBody = 'Thread body';

  beforeAll(async () => {
    server = await createServer(container);
    authenticationTestHelper = new AuthenticationTestHelper(server);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and added thread', async () => {
      const requestPayload = {
        title: threadTitle,
        body: threadBody,
      };

      const { accessToken } = await authenticationTestHelper.login();

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 400 if thread payload does not contain needed property', async () => {
      const { accessToken } = await authenticationTestHelper.login();

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: threadTitle },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 400 if thread payload has wrong data type', async () => {
      const { accessToken } = await authenticationTestHelper.login();

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 1,
          body: threadBody,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 401 if headers does not contain access token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: threadTitle,
          body: threadBody,
        },
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and thread detail', async () => {
      const thread = {
        id: 'thread-1',
        title: threadTitle,
        body: threadTitle,
        date: new Date().toISOString(),
      };

      await UsersTableTestHelper.addUser({ id: 'user-1' });
      await ThreadsTableTestHelper.create({ ...thread, owner: 'user-1' });

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${thread.id}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeTruthy();
      expect(responseJson.data.thread.id).toStrictEqual(thread.id);
      expect(responseJson.data.thread.title).toStrictEqual(thread.title);
      expect(responseJson.data.thread.body).toStrictEqual(thread.body);
    });

    it('should response 404 if thread is not exist', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-nonexistent',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread not found');
    });
  });
});
