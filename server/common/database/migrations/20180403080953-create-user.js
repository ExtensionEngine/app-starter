'use strict';

const TABLE_NAME = 'user';

exports.up = (queryInterface, Sequelize) => queryInterface.createTable(TABLE_NAME, {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING
  },
  role: {
    type: Sequelize.ENUM('ADMIN', 'USER'),
    allowNull: false
  },
  token: {
    type: Sequelize.STRING(500)
  },
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name'
  },
  lastName: {
    type: Sequelize.STRING,
    field: 'last_name'
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    allowNull: false
  },
  updatedAt: {
    type: Sequelize.DATE,
    field: 'updated_at',
    allowNull: false
  },
  deletedAt: {
    type: Sequelize.DATE,
    field: 'deleted_at'
  }
});

exports.down = queryInterface => queryInterface.dropTable(TABLE_NAME);
