'use strict';

const buildTimestamps = (Sequelize) => ({
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('NOW'),
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('NOW'),
  },
  deleted_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

module.exports = {
  async up(queryInterface, Sequelize) {
    const timestamps = buildTimestamps(Sequelize);

    await queryInterface.createTable('transaction_ofx_details', {
      transaction_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'transactions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fit_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      account_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      account_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transaction_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      ...timestamps,
    });

    const transactionsTable = await queryInterface.describeTable('transactions');

    const hasLegacyColumns = [
      'fit_id',
      'account_id',
      'account_type',
      'bank_id',
      'bank_name',
      'currency',
      'transaction_date',
    ].some((col) => Object.prototype.hasOwnProperty.call(transactionsTable, col));

    if (hasLegacyColumns) {
      await queryInterface.sequelize.query(`
        INSERT INTO transaction_ofx_details (
          transaction_id,
          fit_id,
          account_id,
          account_type,
          bank_id,
          bank_name,
          currency,
          transaction_date,
          created_at,
          updated_at,
          deleted_at
        )
        SELECT
          id,
          fit_id,
          account_id,
          account_type,
          bank_id,
          bank_name,
          currency,
          transaction_date,
          created_at,
          updated_at,
          deleted_at
        FROM transactions
        WHERE
          fit_id IS NOT NULL OR
          account_id IS NOT NULL OR
          account_type IS NOT NULL OR
          bank_id IS NOT NULL OR
          bank_name IS NOT NULL OR
          currency IS NOT NULL OR
          transaction_date IS NOT NULL;
      `);

      await queryInterface.removeColumn('transactions', 'fit_id');
      await queryInterface.removeColumn('transactions', 'account_id');
      await queryInterface.removeColumn('transactions', 'account_type');
      await queryInterface.removeColumn('transactions', 'bank_id');
      await queryInterface.removeColumn('transactions', 'bank_name');
      await queryInterface.removeColumn('transactions', 'currency');
      await queryInterface.removeColumn('transactions', 'transaction_date');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'fit_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('transactions', 'account_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'account_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'bank_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'bank_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'currency', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'transaction_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE transactions t
      SET
        fit_id = o.fit_id,
        account_id = o.account_id,
        account_type = o.account_type,
        bank_id = o.bank_id,
        bank_name = o.bank_name,
        currency = o.currency,
        transaction_date = o.transaction_date
      FROM transaction_ofx_details o
      WHERE o.transaction_id = t.id;
    `);

    await queryInterface.dropTable('transaction_ofx_details');
  },
};
