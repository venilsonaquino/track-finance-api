'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE transactions
      SET amount = ABS(amount)
      WHERE amount < 0;
    `);
  },

  async down(queryInterface) {
    // No-op: cannot infer original sign reliably
    await queryInterface.sequelize.query('SELECT 1;');
  },
};
