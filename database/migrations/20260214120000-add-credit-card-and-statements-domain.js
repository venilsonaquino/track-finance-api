'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_installment_occurrences_installment_status" ADD VALUE IF NOT EXISTS 'CLOSED';`,
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_recurring_occurrences_status" ADD VALUE IF NOT EXISTS 'CLOSED';`,
    );

    await queryInterface.addColumn('wallets', 'financial_type', {
      type: Sequelize.ENUM('ACCOUNT', 'CREDIT_CARD'),
      allowNull: false,
      defaultValue: 'ACCOUNT',
    });
    await queryInterface.addColumn('wallets', 'due_day', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('wallets', 'closing_day', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('wallets', 'payment_account_wallet_id', {
      type: Sequelize.STRING(26),
      allowNull: true,
      references: {
        model: 'wallets',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('transactions', 'card_wallet_id', {
      type: Sequelize.STRING(26),
      allowNull: true,
      references: {
        model: 'wallets',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.createTable('card_statements', {
      id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      card_wallet_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      reference_month: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      period_start: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      period_end: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: '0.00',
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'PAID', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'OPEN',
      },
      payment_wallet_id: {
        type: Sequelize.STRING(26),
        allowNull: true,
        references: {
          model: 'wallets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      payment_transaction_id: {
        type: Sequelize.STRING(26),
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      paid_at: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
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

    await queryInterface.addIndex(
      'card_statements',
      ['card_wallet_id', 'reference_month'],
      {
        unique: true,
        name: 'card_statements_card_wallet_id_reference_month_unique',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'card_statements',
      'card_statements_card_wallet_id_reference_month_unique',
    );
    await queryInterface.dropTable('card_statements');

    await queryInterface.removeColumn('transactions', 'card_wallet_id');
    await queryInterface.removeColumn('wallets', 'payment_account_wallet_id');
    await queryInterface.removeColumn('wallets', 'closing_day');
    await queryInterface.removeColumn('wallets', 'due_day');
    await queryInterface.removeColumn('wallets', 'financial_type');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_wallets_financial_type";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_card_statements_status";',
    );
  },
};
