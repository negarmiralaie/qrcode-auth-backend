const mongoose = require('mongoose');

const QrcodeSchema = new mongoose.Schema({
    qrcodeUrl: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true,
    },
    creationDate: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true,
    },
    expirationDate: {
        type: String,
        required: true,
        trim: true,
    },
    person: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'person',
    },
});

const Qrcode = mongoose.model('Qrcode', QrcodeSchema);

module.exports = Qrcode;