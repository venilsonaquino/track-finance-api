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

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      plan: {
        type: Sequelize.ENUM('free', 'basic', 'premium'),
        allowNull: false,
        defaultValue: 'free',
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      email_verification_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ...timestamps,
    });

    await queryInterface.createTable('budget_groups', {
      id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      kind: {
        type: Sequelize.ENUM('computed', 'editable'),
        allowNull: false,
        defaultValue: 'editable',
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#0084d1',
      },
      footer_label: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_system_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      user_id: {
        type: Sequelize.STRING(26),
        allowNull: true,
      },
      ...timestamps,
    });

    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#615fff',
      },
      user_id: {
        type: Sequelize.STRING(26),
        allowNull: true,
      },
      budget_group_id: {
        type: Sequelize.STRING(26),
        allowNull: true,
        references: {
          model: 'budget_groups',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ...timestamps,
    });

    await queryInterface.createTable('wallets', {
      id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      wallet_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      balance: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
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
      ...timestamps,
    });

    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
      },
      deposited_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      transaction_type: {
        type: Sequelize.ENUM('INCOME', 'EXPENSE', 'TRANSFER'),
        allowNull: false,
      },
      transaction_status: {
        type: Sequelize.ENUM('POSTED', 'REVERSED'),
        allowNull: false,
        defaultValue: 'POSTED',
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
      category_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      wallet_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      ...timestamps,
    });

    await queryInterface.createTable('files', {
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
      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      upload_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      extension: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ...timestamps,
    });

    await queryInterface.createTable('installment_contracts', {
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
      wallet_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      category_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      installment_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      installment_interval: {
        type: Sequelize.ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'),
        allowNull: false,
      },
      first_due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'CANCELLED', 'FINISHED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      ...timestamps,
    });

    await queryInterface.createTable('installment_occurrences', {
      id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
      },
      contract_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'installment_contracts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      installment_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      installment_status: {
        type: Sequelize.ENUM('SCHEDULED', 'POSTED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'SCHEDULED',
      },
      transaction_id: {
        type: Sequelize.STRING(26),
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ...timestamps,
    });

    await queryInterface.addIndex(
      'installment_occurrences',
      ['contract_id', 'installment_index'],
      {
        unique: true,
        name: 'installment_occurrences_contract_id_installment_index_unique',
      },
    );

    await queryInterface.createTable('recurring_contracts', {
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
      wallet_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      category_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      installment_interval: {
        type: Sequelize.ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'),
        allowNull: false,
      },
      first_due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      ends_at: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'PAUSED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      ...timestamps,
    });

    await queryInterface.createTable('recurring_occurrences', {
      id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
      },
      contract_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'recurring_contracts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('SCHEDULED', 'POSTED', 'SKIPPED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'SCHEDULED',
      },
      transaction_id: {
        type: Sequelize.STRING(26),
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'transactions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ...timestamps,
    });

    await queryInterface.addIndex(
      'recurring_occurrences',
      ['contract_id', 'due_date'],
      {
        unique: true,
        name: 'recurring_occurrences_contract_id_due_date_unique',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'recurring_occurrences',
      'recurring_occurrences_contract_id_due_date_unique',
    );
    await queryInterface.dropTable('recurring_occurrences');
    await queryInterface.dropTable('recurring_contracts');
    await queryInterface.removeIndex(
      'installment_occurrences',
      'installment_occurrences_contract_id_installment_index_unique',
    );
    await queryInterface.dropTable('installment_occurrences');
    await queryInterface.dropTable('installment_contracts');
    await queryInterface.dropTable('files');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('wallets');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('budget_groups');
    await queryInterface.dropTable('users');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_recurring_occurrences_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_recurring_contracts_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_recurring_contracts_installment_interval";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_installment_occurrences_installment_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_installment_contracts_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_installment_contracts_installment_interval";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_transactions_transaction_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_transactions_transaction_type";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_budget_groups_kind";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_plan";',
    );
  },
};
