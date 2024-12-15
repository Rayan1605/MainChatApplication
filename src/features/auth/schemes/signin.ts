import Joi, { ObjectSchema } from 'joi';
//The loginSchema ensures both fields are strings, required, and their lengths are restricted to a minimum of 4 and a maximum of 8
const loginSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Invalid username',
    'string.max': 'Invalid username',
    'string.empty': 'Username is a required field'
  }),
    password: Joi.string().required().min(4).max(8).messages({

      'string.base': 'Password must be of type string',
        'string.min': 'Invalid password',
        'string.max': 'Invalid password',
        'string.empty': 'Password is a required field'
    })
})
export { loginSchema};