import {
  confirmed,
  email,
  is,
  max,
  mimes,
  min,
  required
} from 'vee-validate/dist/rules';
import { extend } from 'vee-validate';
import forEach from 'lodash/forEach';
import isURL from 'validator/lib/isURL';
import { messages } from 'vee-validate/dist/locale/en.json';
import snakeCase from 'lodash/snakeCase';
import userApi from '@/admin/api/user';

const nameFormat = {
  validate: value => {
    const hasValidUnicodeLetters = /^[\p{Letter}\s'-.]+$/u.test(value);
    const hasPunctuationStreak = /['-.]{2,}/.test(value);
    const hasValidBoundaries = !/^['-.].*|['.-]$/.test(value);
    return hasValidUnicodeLetters && hasValidBoundaries && !hasPunctuationStreak;
  },
  message: 'The {_field_} field is not valid'
};

const url = {
  params: ['protocols', 'require_valid_protocol', 'require_protocol'],
  validate: (val, opts) => isURL(val, opts),
  message: 'The {_field_} is not a valid URL'
};

const alphanumerical = {
  validate: value => (/\d/.test(value) && /[a-zA-Z]/.test(value)),
  message: 'The {_field_} field must contain at least 1 letter and 1 numeric value.'
};

const uniqueEmail = {
  params: ['userData'],
  validate: (email, { userData }) => {
    if (userData && email === userData.email) return true;
    return userApi.fetch({ params: { email } }).then(({ total }) => !total);
  },
  message: 'The {_field_} is not unique.'
};

const rules = {
  alphanumerical,
  confirmed,
  email,
  is,
  max,
  min,
  mimes,
  nameFormat,
  required,
  url,
  uniqueEmail
};

forEach(rules, (rule, name) => extend(snakeCase(name), {
  message: messages[name],
  ...rule
}));
