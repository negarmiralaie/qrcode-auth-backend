const express = require('express');
const router = express.Router();
const { qrcodeController, personController } = require('../../controllers/v1/admin/index');
// -------------------------------> END OF IMPORTS <-------------------------------

//* /api/v1/admin
router.get('/', (req, res) => {
    res.send('Admin routes');
});

//* /api/v1/admin/createQRcode/:personId
router.post('/createQRcode/:personId', qrcodeController.create); //?

//* /api/v1/admin/history/:personId
router.get('/history/:personId', qrcodeController.history); //?

// * /api/v1/admin/people
router.get('/people', personController.listPeople); //?

// * /api/v1/admin/person/create
router.post('/person/create', personController.createPerson); //?

//* /api/v1/person/:username
router.post('/person/:username', personController.getPersonById); //?


/** Cases */
// router.get('/cases/myCases', auth(), casesController.myCases); //! NOT CHECKED YET..
// router.get('/cases/byFactoryName', auth(), casesController.getByFactoryName); //?
// router.post('/cases', casesController.create);
// router.delete('/cases/:id', auth(), casesController.delete);

module.exports = router;