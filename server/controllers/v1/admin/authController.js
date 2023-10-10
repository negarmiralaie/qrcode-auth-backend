const QRCode = require('qrcode');
const createError = require('http-errors');
const joi = require('joi');
const db = require('../../../models/person');
const AuthHandler = require('../../../components/auth')

const authController = {
    login: async (req, res) => {
        try {
            const schema = joi.object().keys({
                username: joi.string().alphanum().required(),
                password: joi.string().required(),
            });

            const { error, value } = schema.validate(req.body, { abortEarly: true });
            if (error) return res.status(400).json({message: 'Input is invalid', error});

            console.log('value: ', value);
            const person = await db.find({ username: value.username });
            console.log('person: ', person);
            if (person.length <= 0) return res.status(400).json({message: 'No user with this username...'});

            // Check password validation....
            const isOk = await AuthHandler.Compare(value.password, person.password);
            if (!isOk) return res.status(400).json({message: 'Password is invalid', isOk});


            const { accessToken } = await AuthHandler.TokenGen(person, type = person.role);

            //FIXME i have no idea
            res.setHeader('Authentication', accessToken);
            // return response.success(res, { person, accessToken });
            return res.status(200).json({message: 'Answer is successfully attached', person, accessToken});
        } catch (err) {
            console.log(err);
            // return response.customError(res, res.t('Server.Internall'), 500, err);
            return res.status(200).json({message: 'An error occurred', err});
        }
    },
    // create: async (req, res) => {
    //     try {
    //         const { personId } = req.params;
    //         const creationDate = new Date(); // current date and timw
    //         let expirationDate = new Date(creationDate.getTime()); // clone the creationDate
    //         expirationDate.setMinutes(creationDate.getMinutes() + 10); 

    //         const qrcodeData = {
    //             personId,
    //             creationDate,
    //             expirationDate,
    //         };

    //         // Convert qrcodeData to a string and generate the QR code
    //         const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrcodeData));

    //         console.log('qrCode', qrCode)
            
    //         const qrcode = await db.create({
    //             qrCodeUrl,
    //             creationDate,
    //             expirationDate,
    //             person: personId
    //         });

    //         return res.status(200).json({
    //             message: 'Qrcode is successfully created',
    //             qrcode,
    //         });
    //     } catch (error) {
    //         throw createError(500, 'Qrcode could not be created');
    //     }
    // },
};

module.exports = authController;