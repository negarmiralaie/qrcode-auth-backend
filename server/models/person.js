const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const createError = require('http-errors');

const PersonSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true,
    },
    lname: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    qrcodes: [{
        type: mongoose.Types.ObjectId,
        ref: 'qrcode',
    }],
    vacations: [{
        type: mongoose.Types.ObjectId,
        ref: 'vacation',
    }],
    role: {
        type: String,
        enum: ['person', 'admin', 'scanner'],
    },
});

PersonSchema.pre('save', async function hashPassword(next) {
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

PersonSchema.methods.isValidPassword = async function isValidPassword(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        return createError.BadRequest();
    }
};

const Person = mongoose.model('Person', PersonSchema);

module.exports = Person;