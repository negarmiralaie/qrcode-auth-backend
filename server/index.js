const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
require('dotenv/config');
//*-------------------------------> END OF IMPORTS <-------------------------------
const PORT = process.env.APP_PORT || 3000;
const app = express();
// Streaming logs to file
// const logStream = fs.createWriteStream(
//     path.join(path.join(__dirname, 'logs'), 'requests.log'),
//     { flags: 'a' }
// );

// Middleware
app.use(cors({
    origin: '*'
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connectDB();


// Routes
app.use('/', require('./routes/index'));
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {},
    });
});

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log('Server started listening on : ', server.address());
    if (!process.env.SERVER_ADDR)
    process.env.SERVER_ADDR = server.address().address;
    if (!process.env.APP_PORT)
    process.env.APP_PORT = server.address().port.toString();
});
