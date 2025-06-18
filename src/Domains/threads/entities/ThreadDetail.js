class ThreadDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, title, body, created_at, updated_at, username, comments,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.username = username;
    this.comments = comments;
  }

  _verifyPayload(payload) {
    const {
      id, title, body, created_at, updated_at, username, comments,
    } = payload;

    if (!id || !title || !body || !created_at || !updated_at || !username || !comments) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof title !== 'string'
      || typeof body !== 'string'
      || typeof created_at !== 'string'
      || typeof updated_at !== 'string'
      || typeof username !== 'string'
      || (!Array.isArray(comments) || !comments.every((comment) => typeof comment === 'object' && comment !== null))
    ) {
      throw new Error('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  format() {
    return {
      id: this.id,
      title: this.title,
      body: this.body,
      date: this.created_at,
      username: this.username,
      comments: this.comments,
    };
  }
}

module.exports = ThreadDetail;
