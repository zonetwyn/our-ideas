const express = require('express');
const router = express.Router();
const authorize = require('../config/auth');
const enums = require('../utils/enums');

const Joi = require('joi');

const { Message, messageValidator } = require('../models/message');

const ADMIN = [enums.UserRoles[1]];
const USER = [enums.UserRoles[0]];

router.get('/', authorize(ADMIN), (req, res, next) => {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: 'user',
        sort: {
            createdAt: -1
        }
    }
    Message.paginate({}, options).then(result => {
        res.status(200).json(result);
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
});

router.post('/', authorize(USER), async (req, res, next) => {
    const body = req.body;
    const user = req.user;
    try {
        if (!body) {
            return res.status(400).json({
                error: 'Your request body must look likes { title, description, user }'
            });
        }

        await Joi.validate(body, messageValidator);

        const message = new Message({
            title: body.title,
            description: body.description,
            user: user._id
        });

        await message.save();
        return res.status(201).json({
            message: "Your message has been successfully received. Thanks for your support."
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

module.exports = router;
