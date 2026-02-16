'use strict';

module.exports = {
  async up(queryInterface) {
    const installment = await queryInterface.describeTable('installment_contracts');
    if (installment.transaction_status) {
      await queryInterface.removeColumn('installment_contracts', 'transaction_status');
    }
    if (installment.transaction_type) {
      await queryInterface.removeColumn('installment_contracts', 'transaction_type');
    }

    const recurring = await queryInterface.describeTable('recurring_contracts');
    if (recurring.transaction_status) {
      await queryInterface.removeColumn('recurring_contracts', 'transaction_status');
    }
    if (recurring.transaction_type) {
      await queryInterface.removeColumn('recurring_contracts', 'transaction_type');
    }

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_installment_contracts_transaction_type";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_installment_contracts_transaction_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_recurring_contracts_transaction_type";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_recurring_contracts_transaction_status";',
    );
  },

  async down(queryInterface, Sequelize) {
    const recurring = await queryInterface.describeTable('recurring_contracts');
    if (!recurring.transaction_type) {
      await queryInterface.addColumn('recurring_contracts', 'transaction_type', {
        type: Sequelize.ENUM('INCOME', 'EXPENSE'),
        allowNull: true,
      });
    }
    if (!recurring.transaction_status) {
      await queryInterface.addColumn('recurring_contracts', 'transaction_status', {
        type: Sequelize.ENUM('POSTED', 'REVERSED'),
        allowNull: true,
        defaultValue: 'POSTED',
      });
    }

    const installment = await queryInterface.describeTable('installment_contracts');
    if (!installment.transaction_type) {
      await queryInterface.addColumn('installment_contracts', 'transaction_type', {
        type: Sequelize.ENUM('INCOME', 'EXPENSE'),
        allowNull: true,
      });
    }
    if (!installment.transaction_status) {
      await queryInterface.addColumn('installment_contracts', 'transaction_status', {
        type: Sequelize.ENUM('POSTED', 'REVERSED'),
        allowNull: true,
        defaultValue: 'POSTED',
      });
    }
  },
};
