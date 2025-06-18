class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, content, replies, is_delete, created_at, updated_at,
    } = payload;

    this.id = id;
    this.username = username;
    this.content = content;
    this.replies = replies;
    this.is_delete = is_delete;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  _verifyPayload(payload) {
    const {
      id, username, content, replies, created_at, updated_at,
    } = payload;

    if (!id || !username || !content || !created_at || !updated_at) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || (typeof created_at !== 'string' && typeof created_at !== 'object')
      || (typeof updated_at !== 'string' && typeof updated_at !== 'object')
      || (!Array.isArray(replies) || !replies.every((reply) => typeof reply === 'object' && reply !== null))
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  format() {
    return {
      id: this.id,
      username: this.username,
      content: this.is_delete ? '**komentar telah dihapus**' : this.content,
      date: this.created_at,
      replies: this.replies,
    };
  }
}

module.exports = CommentDetail;
