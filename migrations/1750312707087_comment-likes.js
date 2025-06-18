/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comments_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
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
  });

  pgm.addConstraint(
    'comments_likes',
    'unique_owner_and_comment',
    'UNIQUE(owner, comment_id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('comments_likes');
};
