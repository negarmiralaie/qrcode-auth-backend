const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Person = require('../models/person');

class ExtraHandler {
    static generateRandomNumber() {
        const min = 1000000000; // minimum 10-digit number
        const max = 9999999999; // maximum 10-digit number
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } 
    
    static async generateUniqueUsername() {
        let username = generateRandomNumber().toString();

        // Check if the username already exists in the database
        const existingPerson = await Person.findOne({ username });

        // If the username already exists, generate a new one recursively
        if (existingPerson) {
            return generateUniqueUsername();
        }

        return username;
    }
}

module.exports = ExtraHandler;