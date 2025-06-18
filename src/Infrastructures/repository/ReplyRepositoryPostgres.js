const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkAvailability(commentId, replyId) {
    const query = {
      text: 'SELECT id, content, comment_id, is_delete FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Reply not found');
    }

    if (result.rows[0].is_delete) {
      throw new NotFoundError('Reply is deleted');
    }

    if (result.rows[0].comment_id !== commentId) {
      throw new NotFoundError('Reply not found based on the given comment');
    }
  }

  async verifyOwnership(id, ownerId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    const reply = result.rows[0];

    if (reply.owner !== ownerId) {
      throw new AuthorizationError();
    }
  }

  async create(userId, commentId, newReply) {
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const { content } = newReply;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, userId, commentId, null, date, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async fetchByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, users.username, replies.created_at, replies.updated_at, replies.content, replies.is_delete 
        FROM replies LEFT JOIN users ON users.id = replies.owner
        WHERE replies.comment_id = $1 
        ORDER BY replies.created_at ASC
        `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async fetchByThreadId(threadId) {
    const query = {
      text: `SELECT replies.*, users.username 
        FROM replies
        LEFT JOIN users ON users.id = replies.owner
        LEFT JOIN comments ON comments.id = replies.comment_id
        WHERE comments.thread_id = $1 AND comments.is_delete IS NULL
        ORDER BY replies.created_at ASC
        `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteById(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = NOW() WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
