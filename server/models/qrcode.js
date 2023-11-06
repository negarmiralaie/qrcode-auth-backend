const mongoose = require('mongoose');

const QrcodeSchema = new mongoose.Schema({
    isEntrance: {
        type: Boolean,
    },
    entranceDate: {
        type: Date,
        trim: true,
    },
    exitDate: {
        type: Date,
        trim: true,
    },
    workDuration: {
        type: String,
        trim: true,
    },
    latency: {
        type: Date,
        trim: true,
    },
    person: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Person',
    },
});

const Qrcode = mongoose.model('Qrcode', QrcodeSchema);

module.exports = Qrcode;