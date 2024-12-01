const express = require('express');
const router = express.Router();
const connectToDatabase = require("../models/db");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();

        const collection = db.collection("users");

        const existingEmail = await collection.findOne({ email: req.body.email });

        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        logger.info('User registered successfully');

        return res.status(200).json({ authtoken, email: req.body.email });
    } catch (e) {
         return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();

        const collection = db.collection("users");

        const user = await collection.findOne({ email: req.body.email });

        let result = await bcryptjs.compare(req.body.password, user.password);

        if(!result) {
            logger.error('Passwords do not match');
            return res.status(404).json({ error: 'Wrong pasword' });
        }

        const userName = user.firstName;
        const userEmail = user.email;

        let payload = {
            user: {
                id: user._id.toString(),
             },
         };

         const authtoken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        if (user) {
            logger.info('User logged in successfully');
            return res.status(200).json({ authtoken, userName, userEmail });
        } else {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
       
    } catch (e) {
         return res.status(500).send('Internal server error');

    }
});

const { body, validationResult } = require('express-validator');

router.put('/update', async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors in update request', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
    const email = req.headers.email;

    if (!email) {
        logger.error('Email not found in the request headers');
        return res.status(400).json({ error: "Email not found in the request headers" });
    }

    const db = await connectToDatabase();

    const collection = db.collection("users");

    const existingUser = await collection.findOne({ email });

    existingUser.firstName = req.body.name;
    existingUser.updatedAt = new Date();

    const updatedUser = await collection.findOneAndUpdate(
        { email },
        { $set: existingUser },
        { returnDocument: 'after' }
    );

    const payload = {
        user: {
           id: updatedUser._id.toString(),
        },
    };
    
    const authtoken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    logger.info('User updated successfully');

    return res.status(200).json({authtoken});
    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;
