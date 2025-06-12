/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async create({
    id = 'reply-1',
    content = 'Reply content',
    date = new Date().toISOString(),
    comment = 'comment-1',
    owner = 'user-1',
    isDelete = null,
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, content, owner, comment, isDelete, date, date],
    };

    await pool.query(query);
  },

  async fetchById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
