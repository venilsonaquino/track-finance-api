'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE transactions
      SET transaction_type = 'EXPENSE'
      WHERE transaction_type = 'TRANSFER';
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_transactions_transaction_type'
            AND e.enumlabel = 'TRANSFER'
        ) THEN
          CREATE TYPE enum_transactions_transaction_type_new AS ENUM ('INCOME', 'EXPENSE');
          ALTER TABLE transactions
            ALTER COLUMN transaction_type TYPE enum_transactions_transaction_type_new
            USING transaction_type::text::enum_transactions_transaction_type_new;
          DROP TYPE enum_transactions_transaction_type;
          ALTER TYPE enum_transactions_transaction_type_new RENAME TO enum_transactions_transaction_type;
        END IF;
      END$$;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_transactions_transaction_type'
            AND e.enumlabel = 'EXPENSE'
        ) THEN
          CREATE TYPE enum_transactions_transaction_type_new AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
          ALTER TABLE transactions
            ALTER COLUMN transaction_type TYPE enum_transactions_transaction_type_new
            USING transaction_type::text::enum_transactions_transaction_type_new;
          DROP TYPE enum_transactions_transaction_type;
          ALTER TYPE enum_transactions_transaction_type_new RENAME TO enum_transactions_transaction_type;
        END IF;
      END$$;
    `);
  },
};
