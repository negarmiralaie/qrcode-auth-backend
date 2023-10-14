const express = require('express');
const router = express.Router();
const { qrcodeController, personController, vacationController } = require('../../controllers/v1/admin/index');
// -------------------------------> END OF IMPORTS <-------------------------------

//* /api/v1/admin
router.get('/', (req, res) => {
    res.send('Admin routes');
});

//* /api/v1/admin/createQRcode/:personId
router.post('/createQRcode/:personId', qrcodeController.create); //?

//* /api/v1/admin/verifyQRcode
router.post('/verifyQRcode', qrcodeController.verifyQrcode); //?

//* /api/v1/admin/history/:personId
router.get('/history/:personId', qrcodeController.history); //?

//* /api/v1/admin/history
router.get('/history', qrcodeController.historyOfAllPeople); //?

// * /api/v1/admin/people
router.get('/people', personController.listPeople); //?

// * /api/v1/admin/person/create
router.post('/person/create', personController.createPerson); //?

//* /api/v1/admin/person/:username
router.get('/person/:username', personController.getPersonById); //?

//* /api/v1/admin/vacation/:personId
router.post('/vacation/:personId', vacationController.create); //?

//* /api/v1/admin/vacation/:personId
router.put('/vacation/:personId', vacationController.update); //?

//* /api/v1/admin/vacations/:personId
router.get('/vacations/:personId', vacationController.getVacationsById); //?

//* /api/v1/admin/vacations
router.get('/vacations', vacationController.getVacationsOfAllPeople); //?

/** Cases */
// router.get('/cases/myCases', auth(), casesController.myCases); //! NOT CHECKED YET..
// router.get('/cases/byFactoryName', auth(), casesController.getByFactoryName); //?
// router.post('/cases', casesController.create);
// router.delete('/cases/:id', auth(), casesController.delete);

module.exports = router;