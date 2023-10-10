const QRCode = require('qrcode');
const createError = require('http-errors');
const joi = require('joi');
const db = require('../../../models/qrcode');

const qrcodeController = {
    history: async (req, res) => {
        try {
            const { personId } = req.params;
            const qrcodes = await db.find({ person: personId });

            return res.status(200).json({
                message: 'History is fetched created',
                qrcodes,
            });
        } catch (error) {
            throw createError(404, 'History could not be fetched', error);
        }
    },

    create: async (req, res) => {
        try {
            const { personId } = req.params;
            const creationDate = new Date(); // current date and timw
            let expirationDate = new Date(creationDate.getTime()); // clone the creationDate
            expirationDate.setMinutes(creationDate.getMinutes() + 10); 

            const qrcodeData = {
                personId,
                creationDate,
                expirationDate,
            };

            // Convert qrcodeData to a string and generate the QR code
            const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrcodeData));

            console.log('qrCode', qrCode)
            
            const qrcode = await db.create({
                qrCodeUrl,
                creationDate,
                expirationDate,
                person: personId
            });

            return res.status(200).json({
                message: 'Qrcode is successfully created',
                qrcode,
            });
        } catch (error) {
            throw createError(500, 'Qrcode could not be created');
        }
    },
};

module.exports = qrcodeController;