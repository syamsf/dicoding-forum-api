class Like {
  constructor(payload) {
    this._verifyPayload(payload);

    const { owner, commentId } = payload;

    this.owner = owner;
    this.commentId = commentId;
  }

  _verifyPayload({ owner, commentId }) {
    if (!owner || !commentId) {
      throw new Error('LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string' || typeof commentId !== 'string') {
      throw new Error('LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Like;
