import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().required().min(4).max(8).messages({
        'string.base': 'Username should be a type of text',
        'string.min': 'Invalid username',
        'string.max': 'Invalid username',
        'string.empty': 'Username is a required field'
    }),
    password: Joi.string().required().min(4).max(8).messages({
        'string.base': 'Password should be a type of string',
        'string.min': 'Invalid password',
        'string.max': 'Invalid password',
        'string.empty': 'Password is a required field'
    }),
    email: Joi.string().required().email().messages({
        'string.base': 'Email should be a type of string',
        'string.email': 'Invalid email',
        'string.empty': 'Email is a required field'
    }),
    avatarColor: Joi.string().required().messages({
       'any.required': 'Avatar color is a required field',
    }),
    avatarImage: Joi.string().required().messages({
        'any.required': 'Avatar image is a required '
    })
})

export { signupSchema};