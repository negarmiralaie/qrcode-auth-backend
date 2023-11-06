const QRCode = require('qrcode');
const createError = require('http-errors');
const joi = require('joi');
const db = require('../../../models/person');
const AuthHandler = require('../../../components/auth');
const ExtraHandler = require('../../../components/extra');
const moment = require('moment-jalaali');
const qrcodeDb = require('../../../models/qrcode');
const vacationDb = require('../../../models/vacation');

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

            const body = req.body;
            console.log('body', body);
            
            const { error, value } = schema.validate(req.body, { abortEarly: true });
            if (error) {
                return res.status(400).json({body, message: 'Input is invalid', error});
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
            console.log('error: ', error);
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

    report: async (req, res) => {
        try {
            // const { personId } = req.params;
            const { username, persianStartDate, persianEndDate } = req.query;

            //& convert the Persian dates to Gregorian dates.
            const startDate = persianStartDate ? moment(persianStartDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : undefined;
            const endDate = persianEndDate ? moment(persianEndDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : undefined;

// **********************************************************************











const vacationFilter = {};
// if (startDate) vacationFilter.entranceDate = { $gte: startDate };
// if (endDate) vacationFilter.entranceDate = { ...(vacationFilter.vacationDate || {}), $lte: endDate };
if (username) {
  const person = await db.findOne({ username });
  const personId = person._id;
  console.log('personId: ', personId);
  if (personId) vacationFilter.person = personId;
}

console.log('vacationFilter: ', vacationFilter);
const vacations = await vacationDb.find(vacationFilter).populate('person').exec();

// Count the number of hourly vacations
vacationFilter.type = 'hourly';
vacationFilter.status = 'accepted';
const amountOfHourlyVacations = await vacationDb.countDocuments(vacationFilter);
console.log('amountOfHourlyVacations: ', amountOfHourlyVacations);

// Calculate the total duration of vacations
vacationFilter.type = 'hourly';
const sumOfVacationsDuration = await vacationDb.aggregate([
  { $match: vacationFilter },
  { $group: { _id: null, totalDuration: { $sum: { $toInt: "$duration" } } } }
]);

// Count the number of daily vacations
vacationFilter.type = 'daily';
const amountOfDailyVacations = await vacationDb.countDocuments(vacationFilter);
console.log('amountOfDailyVacations: ', amountOfDailyVacations);











            // Create a filter object based on the provided parameters
            // const vacationFilter = {};
            // // if (startDate) vacationFilter.entranceDate = { $gte: startDate };
            // // if (endDate) vacationFilter.entranceDate = { ...(vacationFilter.vacationDate || {}), $lte: endDate };
            // if(username){
            //     const person = await db.findOne({ username });
            //     const personId = person._id;
            //     console.log('personId: ', personId);
            //     if (personId) vacationFilter.person = personId;
            // }
            
            // console.log('vacationFilter: ', vacationFilter);
            // const vacations = await vacationDb.find(vacationFilter).populate('person').exec();


            // // & GET HOW MANY HOURLY VACATIONS EXIST..
            // // & تعداد دفعات مرخصی ساعتی
            // vacationFilter.type = 'hourly';
            // const amountOfHourlyVacations = await vacationDb.countDocuments(vacationFilter);
            // console.log('amountOfHourlyVacations: ', amountOfHourlyVacations);

            // // &
            // vacationFilter.type = 'hourly';

            // const sumOfVacationsDuration = await vacationDb.aggregate([
            //     { $match: vacationFilter },
            //     { $group: { _id: null, totalDuration: { $sum: { $toInt: "$duration" } } } }
            // ]);


            // // & GET HOW MANY HOURLY VACATIONS EXIST..
            // // & تعداد دفعات مرخصی روزانه
            // vacationFilter.type = 'daily';
            // const amountOfDailyVacations = await vacationDb.countDocuments(vacationFilter);
            // console.log('amountOfDailyVacations: ', amountOfDailyVacations);

            // // &

            console.log('sumOfVacationsDuration: ', sumOfVacationsDuration);
// **********************************************************************
            const qrcodeFilter = {};
            if (startDate) qrcodeFilter.entranceDate = { $gte: startDate };
            if (endDate) qrcodeFilter.entranceDate = { ...(qrcodeFilter.vacationDate || {}), $lte: endDate };
            if(username){
                const person = await db.findOne({ username });
                const personId = person._id;
                console.log('personId: ', personId);
                if (personId) qrcodeFilter.person = personId;
            }
            // if (personId) qrcodeFilter.person = personId;
            console.log('qrcodeFilter: ', qrcodeFilter);

            // const qrcodes = await qrcodeDb.find(qrcodeFilter).populate('person').exec();










            // const qrcodes = await qrcodeDb.aggregate([
            //     { $match: qrcodeFilter },
            //     {
            //         $group: {
            //             _id: null,
            //             totalWorkDuration: { $sum: "$workDurations" }
            //         }
            //     }
            // ]).exec();

            // const qrcodes = await qrcodeDb.aggregate([
            // { $match: qrcodeFilter },
            //     {
            //         $group: {
            //         _id: null,
            //         totalWorkDuration: { $sum: "$workDurations" },
            //         totalLatencyHours: { $sum: "$latencyHours" }
            //         }
            //     }
            // ]);

            const qrcodes = await qrcodeDb.aggregate([
                {
                  $group: {
                    _id: null,
                    totalWorkDuration: { $sum: "$workDurations" },
                    totalLatencyHours: { $sum: "$latencyHours" }
                  }
                }
            ])              

            console.log('qrcodes: ', qrcodes);

// **********************************************************************


            return res.status(200).json({
                message: 'Report is fetched',
                qrcodes,
                vacations,
                amountOfHourlyVacations,
                amountOfDailyVacations,
                sumOfVacationsDuration,

            });
        } catch (error) {
            throw createError(404, 'Report could not be fetched', error);
        }
    },
};

module.exports = personController;