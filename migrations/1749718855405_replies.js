/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'TEXT',
      notNull: false,
      references: '"users"("id")',
      onDelete: 'set null',
    },
    comment_id: {
      type: 'TEXT',
      notNull: false,
      references: '"comments"("id")',
      onDelete: 'set null',
    },
    is_delete: {
      type: 'TEXT',
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('replies');
};
