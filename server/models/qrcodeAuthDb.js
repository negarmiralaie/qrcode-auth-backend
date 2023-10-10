const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const createError = require('http-errors');

const QrcodeAuthDbSchema = new mongoose.Schema({
    // fname: {
    //     type: String,
    //     required: true,
    //     maxlength: 32,
    //     trim: true,
    // },
    // lname: {
    //     type: String,
    //     required: true,
    //     maxlength: 32,
    //     trim: true,
    // },
    // username: {
    //     type: String,
    //     required: true,
    //     trim: true,
    // },
    // password: {
    //     type: String,
    //     required: true,
    //     minlength: 8,
    // },
    // date: {
    //     type: Date,
    //     default: Date.now(),
    // },
    // qrcodes: [{
    //     type: mongoose.Types.ObjectId,
    //     ref: 'qrcode',
    // }],
    // role: {
    //     type: String,
    //     enum: ['person', 'admin', 'scanner'],
    // },
});

QrcodeAuthDbSchema.pre('save', async function hashPassword(next) {
    try {
        if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
        }
        next();
    } catch (error) {
        next(error);
    }
});

QrcodeAuthDbSchema.methods.isValidPassword = async function isValidPassword(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        return createError.BadRequest();
    }
};

const QrcodeAuthDb = mongoose.model('QrcodeAuthDb', QrcodeAuthDbSchema);

module.exports = QrcodeAuthDb;