class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, content, created_at, updated_at, is_delete,
    } = payload;

    this.id = id;
    this.username = username;
    this.is_delete = is_delete;
    this.content = content;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  _verifyPayload(payload) {
    const {
      id, username, content, created_at, updated_at,
    } = payload;

    if (!id || !username || !content || !created_at || !updated_at) {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || (typeof created_at !== 'string' && typeof created_at !== 'object')
      || (typeof updated_at !== 'string' && typeof updated_at !== 'object')
    ) {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  format() {
    return {
      id: this.id,
      username: this.username,
      content: this.is_delete ? '**balasan telah dihapus**' : this.content,
      date: this.created_at,
    };
  }
}

module.exports = ReplyDetail;
