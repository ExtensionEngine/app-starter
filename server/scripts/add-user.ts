'use strict';

import { anyTldEmailSchema } from '../utils/validation';
import configure from '../framework/configure';
import humanize from 'humanize-string';
import joi from 'joi';
import main from '../main';
import map from 'lodash/map';
import { prompt } from 'inquirer';
import provider from '../framework/provider';
import { RequestContext } from '@mikro-orm/core';
import roles from '../user/roles';
import User from '../user/model';

const userSchema = {
  email: anyTldEmailSchema.required(),
  role: joi.string().allow(...Object.values(roles)).required(),
  firstName: joi.required(),
  lastName: joi.required(),
  password: joi.required()
};

const questions = [{
  type: 'input',
  name: 'email',
  message: 'Enter email:',
  validate: validate('email')
}, {
  type: 'password',
  mask: '*',
  name: 'password',
  message: 'Enter password:',
  validate: validate('password')
}, {
  type: 'string',
  name: 'firstName',
  message: 'Enter first name:',
  validate: validate('firstName')
}, {
  type: 'string',
  name: 'lastName',
  message: 'Enter last name:',
  validate: validate('lastName')
}, {
  type: 'list',
  name: 'role',
  choices: map(roles, value => ({ name: humanize(value), value })),
  message: 'Select role:'
}];

prompt(questions)
  .then(async data => {
    configure(provider, main);
    const { db } = provider.container;
    await db.connect();
    await RequestContext.createAsync(db.provider.em, () => addUser(data));
  });

function addUser(data) {
  const { db, logger } = provider.container;
  const em = db.provider.em.fork(false);
  return em.nativeInsert(User, data)
    .then(userId => logger.info(`User with ID: ${userId} created.`))
    .catch(err => logger.error(err.message) || 1)
    .then((code = 0) => process.exit(code));
}

function validate(attribute) {
  return input => {
    const { error, value } = userSchema[attribute].validate(input);
    return error || Boolean(value);
  };
}
