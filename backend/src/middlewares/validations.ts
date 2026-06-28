import { Joi, celebrate } from 'celebrate'
import { Types } from 'mongoose'

// eslint-disable-next-line no-useless-escape
export const phoneRegExp = /^(\+\d+)?(?:\s|-?|\(?\d+\)?)+$/

export enum PaymentType {
    Card = 'card',
    Online = 'online',
}

// валидация id
export const validateOrderBody = celebrate({
    body: Joi.object()
        .keys({
            items: Joi.array()
                .items(
                    Joi.string().custom((value, helpers) => {
                        if (Types.ObjectId.isValid(value)) {
                            return value
                        }
                        return helpers.message({ custom: 'Невалидный id' })
                    })
                )
                .required()
                .min(1)
                .messages({
                    'array.base': 'Товары должны быть указаны в виде массива',
                    'array.min': 'Не указаны товары',
                    'any.required': 'Товары обязательны',
                }),
            payment: Joi.string()
                .valid(...Object.values(PaymentType))
                .required()
                .messages({
                    'string.valid':
                        'Указано не валидное значение для способа оплаты, возможные значения - "card", "online"',
                    'string.empty': 'Не указан способ оплаты',
                }),
            email: Joi.string().email().required().messages({
                'string.empty': 'Не указан email',
                'string.email': 'Поле "email" должно быть валидным email-адресом',
            }),
            phone: Joi.string().required().pattern(phoneRegExp).messages({
                'string.empty': 'Не указан телефон',
            }),
            address: Joi.string().required().messages({
                'string.empty': 'Не указан адрес',
            }),
            total: Joi.number().required().messages({
                'number.base': 'Сумма заказа должна быть числом',
                'any.required': 'Не указана сумма заказа',
            }),
            comment: Joi.string().optional().allow(''),
        })
        .unknown(false),
})

// валидация товара.
// name и link - обязательные поля, name - от 2 до 30 символов, link - валидный url
export const validateProductBody = celebrate({
    body: Joi.object()
        .keys({
            title: Joi.string().required().min(2).max(30).messages({
                'string.min': 'Минимальная длина поля "name" - 2',
                'string.max': 'Максимальная длина поля "name" - 30',
                'string.empty': 'Поле "title" должно быть заполнено',
            }),
            image: Joi.object().keys({
                fileName: Joi.string().required(),
                originalName: Joi.string().required(),
            }),
            category: Joi.string().required().messages({
                'string.empty': 'Поле "category" должно быть заполнено',
            }),
            description: Joi.string().required().messages({
                'string.empty': 'Поле "description" должно быть заполнено',
            }),
            price: Joi.number().allow(null),
        })
        .unknown(false),
})

export const validateProductUpdateBody = celebrate({
    body: Joi.object()
        .keys({
            title: Joi.string().min(2).max(30).messages({
                'string.min': 'Минимальная длина поля "name" - 2',
                'string.max': 'Максимальная длина поля "name" - 30',
            }),
            image: Joi.object().keys({
                fileName: Joi.string().required(),
                originalName: Joi.string().required(),
            }),
            category: Joi.string(),
            description: Joi.string(),
            price: Joi.number().allow(null),
        })
        .unknown(false),
})

const validateObjectIdString = (value: string, helpers: any) => {
    if (Types.ObjectId.isValid(value)) {
        return value
    }
    return helpers.message({ custom: 'Невалидный id' })
}

export const validateObjectId = (paramName: string) =>
    celebrate({
        params: Joi.object()
            .keys({
                [paramName]: Joi.string().required().custom(validateObjectIdString),
            })
            .required(),
    })

export const validateObjId = validateObjectId('productId')

export const validateUserBody = celebrate({
    body: Joi.object()
        .keys({
            name: Joi.string().min(2).max(30).required().messages({
                'string.min': 'Минимальная длина поля "name" - 2',
                'string.max': 'Максимальная длина поля "name" - 30',
                'string.empty': 'Поле "name" должно быть заполнено',
            }),
            password: Joi.string().min(6).required().messages({
                'string.empty': 'Поле "password" должно быть заполнено',
            }),
            email: Joi.string()
                .required()
                .email()
                .message('Поле "email" должно быть валидным email-адресом')
                .messages({
                    'string.empty': 'Поле "email" должно быть заполнено',
                }),
        })
        .unknown(false),
})

export const validateUserUpdateBody = celebrate({
    body: Joi.object()
        .keys({
            name: Joi.string().min(2).max(30).messages({
                'string.min': 'Минимальная длина поля "name" - 2',
                'string.max': 'Максимальная длина поля "name" - 30',
            }),
            password: Joi.string().min(6).messages({
                'string.min': 'Минимальная длина поля "password" - 6',
            }),
            email: Joi.string()
                .email()
                .message('Поле "email" должно быть валидным email-адресом'),
            phone: Joi.string().pattern(phoneRegExp).messages({
                'string.pattern.base': 'Поле "phone" должно быть валидным телефоном.',
            }),
        })
        .min(1)
        .messages({
            'object.min': 'Необходимо указать хотя бы одно поле для обновления',
        })
        .unknown(false),
})

export const validateAuthentication = celebrate({
    body: Joi.object().keys({
        email: Joi.string()
            .required()
            .email()
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.required': 'Поле "email" должно быть заполнено',
            }),
        password: Joi.string().required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
    }),
})
