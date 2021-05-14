import { alpha, email, is, max, mimes, min, required } from 'vee-validate/dist/rules';
import { extend } from 'vee-validate';
import forEach from 'lodash/forEach';
import { messages } from 'vee-validate/dist/locale/en.json';
import snakeCase from 'lodash/snakeCase';
import userApi from '@/admin/api/user';

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
  alpha,
  alphanumerical,
  email,
  is,
  max,
  min,
  mimes,
  required,
  uniqueEmail
};

forEach(rules, (rule, name) => extend(snakeCase(name), {
  message: messages[name],
  ...rule
}));
