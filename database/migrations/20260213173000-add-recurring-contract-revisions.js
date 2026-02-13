'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recurring_contract_revisions', {
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
        onDelete: 'CASCADE',
      },
      effective_from: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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
      'recurring_contract_revisions',
      ['contract_id', 'effective_from'],
      {
        unique: true,
        name: 'recurring_contract_revisions_contract_id_effective_from_unique',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'recurring_contract_revisions',
      'recurring_contract_revisions_contract_id_effective_from_unique',
    );
    await queryInterface.dropTable('recurring_contract_revisions');
  },
};
