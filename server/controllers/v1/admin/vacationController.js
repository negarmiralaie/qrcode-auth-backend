const ObjectId = require('mongodb').ObjectID;
const createError = require('http-errors');
const joi = require('joi');
const vacationDb = require('../../../models/vacation');
const personDb = require('../../../models/person');
const moment = require('moment-jalaali');

const vacationController = {
    create: async (req, res) => {
        try {
            const { personId } = req.params;
            const { type, vacationDate, duration, status } = req.body;
            const requestDate = new Date();

            const person = await personDb.findById(personId)

            const vacation = await vacationDb.create({
                type,
                vacationDate,
                duration,
                status,
                requestDate,
                person: personId
            });

            console.log('vacation: ', vacation);

            return res.status(200).json({
                message: 'Vacation is successfully created',
                vacation,
            });
        } catch (error) {
            console.log('error: ', error);
            throw createError(500, 'Vacation could not be created');
        }
    },
    update: async (req, res) => {
        try {
            // const { personId } = req.params;
            const { vacationId } = req.query;
            const { status } = req.body;
            console.log('req.body: ', req.body);
            console.log('persvacationIdonId: ', vacationId);

            // const filter = {
            //     person: personId,
            //     entranceDate: {
            //         $gte: today,
            //         $lt: tomorrow
            //     }
            // };


            const update = {
                $set: {
                  status
                },
              };
              
              const vacation = await vacationDb.updateOne({ _id: vacationId }, update);
              

            console.log('vacation: ', vacation);

            return res.status(200).json({
                message: 'Vacation is successfully updated',
            });
        } catch (error) {
            console.log('error: ', error);
            throw createError(500, 'Vacation could not be updated');
        }
    },
    getVacationsById: async (req, res) => {
        try {
            const { personId } = req.params;
            // const vacations = await vacationDb.find({ person: personId });
            // const vacations = await vacationDb.find({ person: personId }).exec();
            const vacations = await vacationDb.find({ person: personId }).populate('person').exec();

            console.log('vacations: ', vacations);

            return res.status(200).json({
                message: 'Vacations are fetched',
                vacations,
            });
        } catch (error) {
            throw createError(404, 'Vacations could not be fetched', error);
        }
    },
    getVacationsOfAllPeople: async (req, res) => {
        try {
            // Get the filter parameters from the request query
            const { username, persianStartDate, persianEndDate, vacationDate, status, requestDate, type, duration, fname, lname } = req.query;

            //& convert the Persian dates to Gregorian dates.
            const startDate = persianStartDate ? moment(persianStartDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : undefined;
            const endDate = persianEndDate ? moment(persianEndDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : undefined;

            // Create a filter object based on the provided parameters
            const filter = {};
            if (startDate) filter.vacationDate = { $gte: startDate };
            if (endDate) filter.vacationDate = { ...(filter.vacationDate || {}), $lte: endDate };
            if (status) filter.status = status;
            if (type) filter.type = type;
            if (duration) filter.duration = duration;
            if(username) {
                const person = await personDb.findOne({ username });
                const personId = person._id;
                if (personId) filter.person = personId;
            }
            // if (fname) filter['person.fname'] = { $regex: new RegExp(fname, 'i') };
            if (fname) filter['person.fname'] = fname;
            // if (lname) filter['person.lname'] = { $regex: new RegExp(lname, 'i') };
            if (lname) filter['person.lname'] = lname;
            
            console.log('filter: ', filter);

            const vacations = await vacationDb.find(filter).populate('person').exec();

            console.log('vacations: ', vacations);

            return res.status(200).json({
                message: 'Vacations are fetched',
                vacations,
            });
        } catch (error) {
            throw createError(404, 'Vacations could not be fetched', error);
        }
    },
};

module.exports = vacationController;