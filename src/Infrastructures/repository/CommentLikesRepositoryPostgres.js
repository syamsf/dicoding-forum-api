const CommentLikeRepository = require('../../Domains/commentLikes/CommentLikeRepository');

class CommentLikesRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async create(like) {
    const id = `like-${this._idGenerator()}`;
    const { owner, commentId } = like;

    const query = {
      text: 'INSERT INTO comments_likes (id, owner, comment_id) VALUES ($1, $2, $3)',
      values: [id, owner, commentId],
    };

    await this._pool.query(query);
  }

  async fetchByThreadId(threadId) {
    const query = {
      text: `SELECT comments_likes.* FROM comments_likes 
        LEFT JOIN comments ON comments.id = comments_likes.comment_id
        WHERE comments.thread_id = $1
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async delete(like) {
    const { owner, commentId } = like;

    const query = {
      text: 'DELETE FROM comments_likes WHERE owner = $1 AND comment_id = $2',
      values: [owner, commentId],
    };

    await this._pool.query(query);
  }

  async verifyOwnership(like) {
    const { owner, commentId } = like;

    const query = {
      text: 'SELECT 1 FROM comments_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    return !!result.rowCount;
  }
}

module.exports = CommentLikesRepositoryPostgres;
