const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkAvailability(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread not found');
    }
  }

  async create(userId, newThread) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6) RETURNING id, title, owner',
      values: [id, title, body, userId, date, date],
    };

    const result = await this._pool.query(query);

    return new AddedThread(result.rows[0]);
  }

  async fetchById(id) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.created_at, threads.updated_at, users.username 
        FROM threads
        LEFT JOIN users ON users.id = threads.owner 
        WHERE threads.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread not found');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
