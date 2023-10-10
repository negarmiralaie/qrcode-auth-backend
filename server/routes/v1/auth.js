const express = require('express');
const router = express.Router();
const { authController } = require('../../controllers/v1/admin/index');

/* GET Authentication Home page */
router.get('/', (req, res) => {
    res.send('Authentication routes');
});

router.post('/login', authController.login);

module.exports = router;