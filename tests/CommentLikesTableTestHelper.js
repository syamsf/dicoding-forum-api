/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async create({
    id = 'like-1',
    commentId = 'comment-1',
    owner = 'user-1',
  }) {
    const query = {
      text: 'INSERT INTO comments_likes (id, owner, comment_id) VALUES ($1, $2, $3)',
      values: [id, owner, commentId],
    };

    await pool.query(query);
  },

  async fetchById(likeId) {
    const query = {
      text: 'SELECT * FROM comments_likes WHERE id = $1',
      values: [likeId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async fetchByUserIdAndCommentId(owner, commentId) {
    const query = {
      text: 'SELECT * FROM comments_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
