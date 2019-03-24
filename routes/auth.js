const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport =  require('passport');

const Joi = require('joi');

const { User, userValidator } = require('../models/user');


router.post('/signup', async (req, res, next) => {
    const body = req.body;  
    try {

        if (!body || !body.username) {
            return res.status(400).json({
                error: 'Your request body must be likes { user }'
            });
        }

        await Joi.validate(body, userValidator);

        const userUsername = await User.findOne({ 
            username: body.username 
        }).exec();
        if (userUsername) {
            return res.status(400).json({
                error: 'This username is already taken'
            })
        }

        const hash = await bcrypt.hash(body.password, 10);
        const user = new User({
            role: body.role,
            username: body.username,
            password: hash,
        });
    
        await user.save();

        return res.status(201).json({
            message: 'Your account has been successfully created'
        });
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json(error.details);
        } else {
            console.log(error);
            return res.status(400).json({
                error: 'Invalids arguments'
            });
        }
    }
});

router.post('/signin', (req, res, next) => {
    passport.authenticate('signin', { session: false }, (error, user, info) => {
        if (error || !user) {
            return res.status(400).json({ 
                error: info.message ? info.message : 'Please, try again'
            });
        }

        req.login(user, { session: false }, (error) => {
            if (error) {
                res.status(400).json({ error });
            }
            const payload = { 
                _id: user._id,
                role: user.role 
            };
            const token = jwt.sign(payload, process.env.JWT_KEY);
            return res.status(200).json({
                token: token,
                message: info.message ? info.message : ''
            });
        })
    })(req, res, next);
});

module.exports = router;