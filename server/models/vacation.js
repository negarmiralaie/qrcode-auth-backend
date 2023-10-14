const mongoose = require('mongoose');

const VacationSchema = new mongoose.Schema({
    type: {
        type: String,
        trim: true,
    },
    vacationDate: {
        type: String,
        trim: true,
    },
    duration: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        trim: true,
    },
    requestDate: {
        type: String,
        trim: true,
    },
    person: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Person',
    },
});

const Vacation = mongoose.model('Vacation', VacationSchema);

module.exports = Vacation;