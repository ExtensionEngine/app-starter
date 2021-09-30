'use strict';

import configure from '../framework/configure';
import humanize from 'humanize-string';
import isEmail from 'is-email';
import isEmpty from 'lodash/isEmpty';
import main from '../main';
import map from 'lodash/map';
import { prompt } from 'inquirer';
import provider from '../framework/provider';
import { RequestContext } from '@mikro-orm/core';
import roles from '../user/roles';
import User from '../user/model';

const questions = [{
  type: 'input',
  name: 'email',
  message: 'Enter email:',
  validate: isEmail
}, {
  type: 'password',
  mask: '*',
  name: 'password',
  message: 'Enter password:',
  validate: required('password')
}, {
  type: 'string',
  name: 'firstName',
  message: 'Enter first name:',
  validate: required('firstName')
}, {
  type: 'string',
  name: 'lastName',
  message: 'Enter last name:',
  validate: required('lastName')
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

function required(attribute) {
  return input => isEmpty(input) && `"${attribute}" is required`;
}
