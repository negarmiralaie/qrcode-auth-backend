const QRCode = require('qrcode');
const createError = require('http-errors');
const joi = require('joi');
const db = require('../../../models/person');
const AuthHandler = require('../../../components/auth')

const authController = {
    login: async (req, res) => {
        try {
            const schema = joi.object().keys({
                username: joi.string().alphanum(),
                password: joi.string(),
            });
            
            console.log('req.body', req.body);
            const { error, value } = schema.validate(req.body, { abortEarly: true });
            if (error) return res.status(400).json({message: 'Input is invalid', error});

            console.log('value: ', value);
            const person = await db.find({ username: value.username });
            console.log('person: ', person);
            if (person.length <= 0) return res.status(400).json({message: 'No user with this username...'});

            // Check password validation....
            console.log('value.password', value.password);
            console.log('person.password: ', person[0].password);
            const isOk = await AuthHandler.Compare(value.password, person[0].password);
            if (!isOk) return res.status(400).json({message: 'Password is invalid', isOk});


            const {accessToken, expirationDate} = await AuthHandler.TokenGen(person[0].username, type = person.role);
            console.log('accessToken: ', accessToken);

            return res.status(200).json({message: 'Person is successfully created', person, accessToken, expirationDate});
        } catch (err) {
            console.log(err);
            // return response.customError(res, res.t('Server.Internall'), 500, err);
            console.log('error: ', error);
            return res.status(200).json({message: 'An error occurred', err});
        }
    },
};

module.exports = authController;