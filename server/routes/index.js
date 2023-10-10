const express = require('express');
const router = express.Router();

/* GET home page. */
router.use('/api/v1', require('./v1/index'));

router.get('/', (req, res) => {
    res.send('Home Page!');
});

module.exports = router;