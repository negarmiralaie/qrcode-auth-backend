const QRCode = require('qrcode');
const ObjectId = require('mongodb').ObjectID;
const createError = require('http-errors');
const joi = require('joi');
const moment = require('moment-jalaali');
const qrcodeDb = require('../../../models/qrcode');
const personDb = require('../../../models/person');

const qrcodeController = {
    historyOfAllPeople: async (req, res) => {
        try {
            // const { personId } = req.params;
            const { username, persianStartDate, persianEndDate, isEntrance } = req.query;

            //& convert the Persian dates to Gregorian dates.
            const startDate = persianStartDate ? moment(persianStartDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : undefined;
            const endDate = persianEndDate ? moment(persianEndDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : undefined;



            // const username = "3715187974"; // Replace with the desired username

            // Find the personId based on the username

            
            // console.log('personId: ', personId);

            // Create a filter object based on the provided parameters
            const filter = {};
            if (startDate) filter.entranceDate = { $gte: startDate };
            if (endDate) filter.entranceDate = { ...(filter.vacationDate || {}), $lte: endDate };
            if (isEntrance) filter.isEntrance = isEntrance;
            let person
            if(username) {
                person = await personDb.findOne({ username }); 
                const personId = person._id;
                console.log('personId', personId)
                if (personId) filter.person = personId;
            }
            console.log('filter: ', filter);

            const qrcodes = await qrcodeDb.find(filter).populate('person').exec();

            return res.status(200).json({
                message: 'History is fetched',
                qrcodes,
            });
        } catch (error) {
            throw createError(404, 'History could not be fetched', error);
        }
    },
    history: async (req, res) => {
        try {
            const { personId } = req.params;
            const { filterPersonId, persianStartDate, persianEndDate, isEntrance } = req.query;

            //& convert the Persian dates to Gregorian dates.
            const startDate = persianStartDate ? moment(persianStartDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : undefined;
            const endDate = persianEndDate ? moment(persianEndDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : undefined;

            // Create a filter object based on the provided parameters
            const filter = {};
            if (startDate) filter.entranceDate = { $gte: startDate };
            if (endDate) filter.entranceDate = { ...(filter.vacationDate || {}), $lte: endDate };
            if (isEntrance) filter.isEntrance = isEntrance;
            if (filterPersonId) filter.person = filterPersonId;
            console.log('filter: ', filter);

            const qrcodes = await qrcodeDb.find(filter).populate('person').exec();

            return res.status(200).json({
                message: 'History is fetched',
                qrcodes,
            });
        } catch (error) {
            throw createError(404, 'History could not be fetched', error);
        }
    },

    create: async (req, res) => {
        try {
            const { personId } = req.params;
            const { isEntrance } = req.body;
            // ^ Check if user has already created an Entrance qrcode....
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set the time to the start of the day
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const filter = {
                person: personId,
                entranceDate: {
                    $gte: today,
                    $lt: tomorrow
                }
            };
            console.log('filter: ', filter);

            const duplicateQrcode = await qrcodeDb.findOne(filter);
            console.log('duplicateQrcode', duplicateQrcode)

            if (isEntrance  ) {
                if (duplicateQrcode) {
                    console.log('entrance already exists')
                    return res.status(402).json({ message: 'Entrance qrcode for today is already created...' });
                }
            } else {
                if (duplicateQrcode.exitDate) {
                    console.log('exist already exists')
                    return res.status(402).json({ message: 'Exit qrcode for today is already created...' });
                }
            }


            console.log('isEntrance: ', isEntrance);
            const creationDate = new Date(); // current date and timw
            let expirationDate = new Date(creationDate.getTime()); // clone the creationDate
            expirationDate.setMinutes(creationDate.getMinutes() + 100); 

            const qrcodeData = {
                isEntrance,
                personId,
                creationDate,
                expirationDate,
            };

            console.log('qrcodeData: ', qrcodeData)

            // Convert qrcodeData to a string and generate the QR code
            const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrcodeData));

            console.log('qrCodeUrl', qrCodeUrl)

            return res.status(200).json({
                message: 'Qrcode is successfully created',
                qrCodeUrl,
            });
        } catch (error) {
            console.log('error: ', error);
            throw createError(500, 'Qrcode could not be created');
        }
    },
    verifyQrcode: async (req, res) => {
        try {
            console.log('req.body: ', req.body);
            const { qrCodeData } = req.body;
            const { creationDate, expirationDate, isEntrance, personId } = qrCodeData;
            console.log('creationDate in body: ', creationDate);
            console.log('personId: ', personId);

            // Verify the expiration date
            const currentDate = new Date();
            if (currentDate > new Date(expirationDate)) {
                return res.status(401).json({ message: 'QR code has expired' });
            }

            const person = await personDb.findById(personId)
            console.log('person: ', person);
// *************************************************************************
            let qrcode;
            if(isEntrance) {
                console.log('when isEntrance is true...')
                qrcode = await qrcodeDb.create({
                    isEntrance,
                    entranceDate: creationDate,
                    person: personId
                });
                console.log('qrcode: ', qrcode);
            } else if(!isEntrance) {
                console.log('when isEntrance is false...')
                function calculateWorkDuration(entranceDate, exitDate) {
                    const durationInMilliseconds = exitDate - entranceDate;
                    const durationInMinutes = Math.floor(durationInMilliseconds / 1000 / 60);
                    const hours = Math.floor(durationInMinutes / 60);
                    const minutes = durationInMinutes % 60;
                    return { hours, minutes };
                }
                console.log('isEntrance is false');
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set the time to the start of the day
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                    const filter = {
                        person: personId,
                        entranceDate: {
                            $gte: today,
                            $lt: tomorrow
                        }
                    };
                    console.log('filter: ', filter);

                    const storedQrcode = await qrcodeDb.findOne(filter);
                    // Calculate the work duration
                    const entranceDate = new Date(storedQrcode.entranceDate);
                    const exitDate = new Date(); // Replace this with the actual exitDate value



                    // const entranceDate = new Date("2023-10-15T20:02:43.619Z");
                    // const exitDate = new Date("2023-10-15T20:06:00.287Z");
                    
                    // Calculate the work duration in milliseconds
                    console.log('exitDate.getTime(): ', exitDate.getTime());
                    console.log('entranceDate.getTime(): ', entranceDate.getTime());

                    const workDurationMillis = exitDate.getTime() - entranceDate.getTime();
                    
                    // Convert the work duration to hours, minutes, and seconds
                    const workDurationHours = Math.floor(workDurationMillis / (1000 * 60 * 60));
                    const workDurationMinutes = Math.floor((workDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
                    const workDurationSeconds = Math.floor((workDurationMillis % (1000 * 60)) / 1000);
                    
                    // Format the work duration as HH:MM:SS
                    const formattedWorkDuration = `${workDurationHours.toString().padStart(2, '0')}:${workDurationMinutes.toString().padStart(2, '0')}:${workDurationSeconds.toString().padStart(2, '0')}`;
                    
                    // Calculate the latency
                    const eightAM = new Date();
                    eightAM.setHours(8, 0, 0, 0); // Set the time to 8:00 AM
                    const latency = entranceDate.getTime() - eightAM.getTime();
                    
                    const update = {
                        $set: {
                            workDuration: formattedWorkDuration,
                            entranceDate: entranceDate.toLocaleString(),
                            exitDate: exitDate.toLocaleString(),
                        },
                    };
                    

                    //& Convert dates to human readable time
                    // const workDurationTest = new Date("1970-01-01T00:03:16.668Z");
                    // const entranceDateTest = new Date("2023-10-15T20:02:43.619Z");
                    // const exitDateTest = new Date("2023-10-15T20:06:00.287Z");

                    // console.log("Work Duration:", workDurationTest.toLocaleTimeString());
                    // console.log("Entrance Time:", entranceDateTest.toLocaleTimeString());
                    // console.log("Exit Time:", exitDateTest.toLocaleTimeString());
                    //& End of convert dates to human readable time

                    const result = await qrcodeDb.updateOne(filter, update);        
                    // ^
                    // const result = await qrcodeDb.find(filter).populate('person').exec()

                    console.log('updated result: ', result);
            };

            console.log('finaal qrcode: ', qrcode);

            return res.status(200).json({
                message: 'Success',
                qrcode,
                person,
            });
        } catch (error) {
            console.log('error: ', error);
            throw createError(500, 'Qrcode could not be created');
        }
    },
};

module.exports = qrcodeController;