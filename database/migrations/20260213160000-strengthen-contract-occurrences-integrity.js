'use strict';

module.exports = {
  async up(queryInterface) {
    // 1) Alinha enum do parcelado para suportar SKIPPED.
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_installment_occurrences_installment_status" ADD VALUE IF NOT EXISTS 'SKIPPED';`,
    );

    // 2) Normaliza estados legados para permitir aplicar checks sem quebrar dados existentes.
    await queryInterface.sequelize.query(`
      UPDATE installment_occurrences
      SET installment_status = 'POSTED'
      WHERE transaction_id IS NOT NULL
        AND installment_status <> 'POSTED';
    `);
    await queryInterface.sequelize.query(`
      UPDATE installment_occurrences
      SET installment_status = 'SCHEDULED'
      WHERE transaction_id IS NULL
        AND installment_status = 'POSTED';
    `);
    await queryInterface.sequelize.query(`
      UPDATE recurring_occurrences
      SET status = 'POSTED'
      WHERE transaction_id IS NOT NULL
        AND status <> 'POSTED';
    `);
    await queryInterface.sequelize.query(`
      UPDATE recurring_occurrences
      SET status = 'SCHEDULED'
      WHERE transaction_id IS NULL
        AND status = 'POSTED';
    `);

    // 3) Garante 1 ocorrência -> 1 transação (quando transaction_id existir).
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS installment_occurrences_transaction_id_unique
      ON installment_occurrences (transaction_id)
      WHERE transaction_id IS NOT NULL;
    `);
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS recurring_occurrences_transaction_id_unique
      ON recurring_occurrences (transaction_id)
      WHERE transaction_id IS NOT NULL;
    `);

    // 4) Consistência entre status e vínculo de transação.
    await queryInterface.sequelize.query(`
      ALTER TABLE installment_occurrences
      DROP CONSTRAINT IF EXISTS installment_occurrences_posted_transaction_consistency_chk;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE installment_occurrences
      ADD CONSTRAINT installment_occurrences_posted_transaction_consistency_chk
      CHECK (
        (installment_status = 'POSTED' AND transaction_id IS NOT NULL)
        OR (installment_status <> 'POSTED' AND transaction_id IS NULL)
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE recurring_occurrences
      DROP CONSTRAINT IF EXISTS recurring_occurrences_posted_transaction_consistency_chk;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE recurring_occurrences
      ADD CONSTRAINT recurring_occurrences_posted_transaction_consistency_chk
      CHECK (
        (status = 'POSTED' AND transaction_id IS NOT NULL)
        OR (status <> 'POSTED' AND transaction_id IS NULL)
      );
    `);

    // 5) A partir daqui, novos/alterados contratos precisam ter transaction_type.
    // NOT VALID preserva compatibilidade com linhas antigas.
    await queryInterface.sequelize.query(`
      ALTER TABLE installment_contracts
      DROP CONSTRAINT IF EXISTS installment_contracts_transaction_type_required_chk;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE installment_contracts
      ADD CONSTRAINT installment_contracts_transaction_type_required_chk
      CHECK (transaction_type IS NOT NULL) NOT VALID;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE recurring_contracts
      DROP CONSTRAINT IF EXISTS recurring_contracts_transaction_type_required_chk;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE recurring_contracts
      ADD CONSTRAINT recurring_contracts_transaction_type_required_chk
      CHECK (transaction_type IS NOT NULL) NOT VALID;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE installment_contracts
      DROP CONSTRAINT IF EXISTS installment_contracts_transaction_type_required_chk;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE recurring_contracts
      DROP CONSTRAINT IF EXISTS recurring_contracts_transaction_type_required_chk;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE installment_occurrences
      DROP CONSTRAINT IF EXISTS installment_occurrences_posted_transaction_consistency_chk;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE recurring_occurrences
      DROP CONSTRAINT IF EXISTS recurring_occurrences_posted_transaction_consistency_chk;
    `);

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS installment_occurrences_transaction_id_unique;
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS recurring_occurrences_transaction_id_unique;
    `);
  },
};
