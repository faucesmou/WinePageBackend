'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuario: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      correo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      total_de_compra: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      asunto: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      mensaje_de_compra: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rango_de_horario: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Usuarios');
  }
};