'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_installment_occurrences_installment_status" ADD VALUE IF NOT EXISTS 'PAUSED';`,
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_recurring_occurrences_status" ADD VALUE IF NOT EXISTS 'PAUSED';`,
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_installment_contracts_status" ADD VALUE IF NOT EXISTS 'PAUSED';`,
    );
  },

  async down() {
    // no-op: removing enum values in PostgreSQL is unsafe and not directly supported
  },
};
