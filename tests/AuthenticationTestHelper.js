/* istanbul ignore file */
class AuthenticationTestHelper {
  constructor(server) {
    this._server = server;
  }

  async login(payload = {
    username: 'username',
    password: 'secret',
    fullname: 'Username',
  }) {
    const newUsersResponse = await this._server.inject({
      method: 'POST',
      url: '/users',
      payload,
    });

    const loginResponse = await this._server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: payload.username,
        password: payload.password,
      },
    });

    return {
      userId: JSON.parse(newUsersResponse.payload).data.addedUser.id,
      accessToken: JSON.parse(loginResponse.payload).data.accessToken,
    };
  }
}

module.exports = AuthenticationTestHelper;
