const QRCode = require('qrcode');
const createError = require('http-errors');
const joi = require('joi');
const db = require('../../../models/person');
const AuthHandler = require('../../../components/auth');
const ExtraHandler = require('../../../components/extra');

const personController = {
    listPeople: async (req, res) => {
        try {
            const Schema = joi.object().keys({
                page: joi.number(),
                limit: joi.number(),
                filter: joi
                    .object()
                    .keys({
                    where: joi
                    .object()
                    .keys({
                        fname: joi.string(),
                        lname: joi.string(),
                        personalNo: joi.string(),
                        username: joi.string(),
                        role: joi.number(),
                    })
                    .default({}),
                    order: joi
                        .object()
                        .keys({
                        by: joi.string().default('createdAt'),
                        sort: joi.string().only().allow('asc', 'desc').default('desc'),
                        })
                        .default({ by: 'createdAt', sort: 'desc' }),
                    })
                    .default({ order: { by: 'createdAt', sort: 'desc' } }),
            });
        
            const { error, value } = Schema.validate(req.query, { abortEarly: true });
            if (error) return response.validation(res, error);
    
            let where = {};
            if (value.filter.where) {
                where = {
                    ...value.filter.where,
                };
        
                if (where.fname) where.fname = where.fname;
                if (where.lname) where.lname = where.lname;
                if (where.username) where.username = where.username;
                if (where.username) where.username = where.username;
                if (where.role) where.role = where.role;
            };

            const people = await db.find();

            return res.status(200).json({message: 'People list is successfully fetched', people});
        } catch (error) {
            return res.status(500).json({message: 'An error occurred', error});
        }
    },

    createPerson: async (req, res) => {
        try {
            const schema = joi.object().keys({ 
                fname: joi.string().required(),
                lname: joi.string().required(),
                password: joi.string().required(),
                role: joi.string().required(),
            });

            
            const { error, value } = schema.validate(req.body, { abortEarly: true });
            if (error) {
                return res.status(400).json({message: 'Input is invalid', error});
            }
            
            console.log('value', value)
            // Check for duplicate personnel using given personalNo
            // const duplicate = await db.findAll({ where: { username: value.username }});
            // const duplicate = await db.find({ username: value.username });

            // console.log('duplicate', duplicate)

            // If duplicate existed....
            // if (duplicate.length > 0) return res.status(400).json({ message: 'A person with given username already exists...' });

            value.username = await ExtraHandler.generateUniqueUsername();
            console.log('value.username: ', value.username);

            const person = await db.create(value);
            return res.status(200).json({message: 'Person is successfully created', person});
        } catch (error) {
            return res.status(500).json({message: 'An error occurred', error});
        }
    },

    getPersonById: async (req, res) => {
    try {
        const { username } = req.params;

        const person = await db.find({ username });

        if (!person) {
            return res.status(404).json({message: 'Person is not found', person});
        }

        return res.status(200).json({message: 'Person is successfully found', person});
        } catch (error) {
            return response.catchError(res, error);
        }
    },
};

module.exports = personController;