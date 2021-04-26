import * as rules from 'vee-validate/dist/rules';
import { extend } from 'vee-validate';
import forEach from 'lodash/forEach';
import userApi from '@/admin/api/user';

const alphanumerical = {
  validate: value => (/\d/.test(value) && /[a-zA-Z]/.test(value)),
  message: 'The {_field_} field must contain at least 1 letter and 1 numeric value'
};

const uniqueEmail = {
  params: ['userData'],
  validate: (email, { userData }) => {
    if (userData && email === userData.email) return true;
    return userApi.fetch({ filter: { email } }).then(({ total }) => !total);
  },
  message: 'The {_field_} is not unique'
};

const configuredRules = {
  ...rules,
  alphanumerical,
  unique_email: uniqueEmail,
  max_value: { ...rules.max_value, message: 'The {_field_} must be {max} or less' },
  min_value: { ...rules.min_value, message: 'The {_field_} must be {min} or more' }
};

forEach(configuredRules, (rule, name) => extend(name, { ...rule }));
