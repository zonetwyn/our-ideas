const express = require('express');
const router = express.Router();
const authorize = require('../config/auth');
const enums = require('../utils/enums');
const Joi = require('joi');
const passport = require('passport');

const { Domain,  domainValidator } = require('../models/domain');

const ADMIN = [enums.UserRoles[1]];

// retreive all domains
router.get('/', (req, res, next) => {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: {
            createdAt: -1
        }
    }
    Domain.paginate({}, options).then(result => {
        res.status(200).json(result);
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
});

// create new domain
router.post('/', passport.authorize('jwt', { session: false }), authorize(ADMIN), async (req, res, next) => {
    const body = req.body;
    try {
        if (!body) {
            return res.status(400).json({
                error: 'Your request body must look likes { name, description }'
            });
        }

        await Joi.validate(body, domainValidator);

        const domain = new Domain({
            name: body.name,
            description: body.description
        });

        await domain.save();
        return res.status(201).json({
            message: "Your domain has been successfully created"
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

router.delete('/:domainId', authorize(ADMIN), async (req, res, next) => {
    const domainId = req.params.domainId;

    Domain.deleteOne({
        _id: domainId
    }).exec().then(() => {
        return res.status(200).json({
            message: "Deleted successfully"
        });
    }).catch(error => {
        return res.status(500).json({
            error: error
        });
    });
});

module.exports = router;