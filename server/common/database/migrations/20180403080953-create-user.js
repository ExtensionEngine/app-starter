'use strict';

const TABLE_NAME = 'user';

exports.up = (qi, { DATE, ENUM, INTEGER, STRING }) => qi.createTable(TABLE_NAME, {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  email: {
    type: STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: STRING
  },
  role: {
    type: ENUM('ADMIN', 'USER'),
    allowNull: false
  },
  firstName: {
    type: STRING,
    field: 'first_name'
  },
  lastName: {
    type: STRING,
    field: 'last_name'
  },
  createdAt: {
    type: DATE,
    field: 'created_at',
    allowNull: false
  },
  updatedAt: {
    type: DATE,
    field: 'updated_at',
    allowNull: false
  },
  deletedAt: {
    type: DATE,
    field: 'deleted_at'
  }
});

exports.down = qi => qi.dropTable(TABLE_NAME);
