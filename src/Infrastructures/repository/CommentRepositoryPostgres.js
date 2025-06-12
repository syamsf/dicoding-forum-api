const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkAvailability(threadId, commentId) {
    const query = {
      text: 'SELECT id, is_delete, thread_id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment not found');
    }

    if (result.rows[0].is_delete) {
      throw new NotFoundError('Comment is deleted');
    }

    if (result.rows[0].thread_id !== threadId) {
      throw new NotFoundError('Comment not found based on given thread');
    }
  }

  async verifyOwnership(id, ownerId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    const comment = result.rows[0];

    if (comment.owner !== ownerId) {
      throw new AuthorizationError();
    }
  }

  async create(userId, threadId, newComment) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, userId, threadId, null, date, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment(result.rows[0]);
  }

  async fetchByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.created_at, comments.content, comments.is_delete 
        FROM comments LEFT JOIN users ON users.id = comments.owner 
        WHERE comments.thread_id = $1 
        ORDER BY comments.created_at ASC
        `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = NOW() WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
