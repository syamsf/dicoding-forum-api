const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: (request, h) => handler.createHandler(request, h),
    options: {
      auth: 'forum_jwt',
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: (request) => handler.fetchByIdHandler(request),
  },
]);

module.exports = routes;
