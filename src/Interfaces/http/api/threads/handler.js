const FetchThreadDetailUseCase = require('../../../../Applications/use_case/FetchThreadDetailUseCase');
const CreateThreadUseCase = require('../../../../Applications/use_case/CreateThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
  }

  async createHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance(CreateThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(userId, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async fetchByIdHandler(request) {
    const { threadId } = request.params;
    const fetchThreadDetailUseCase = this._container.getInstance(FetchThreadDetailUseCase.name);
    const threads = await fetchThreadDetailUseCase.execute(threadId);

    return {
      status: 'success',
      data: {
        thread: threads,
      },
    };
  }
}

module.exports = ThreadsHandler;
