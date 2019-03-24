const express = require('express');
const router = express.Router();
const authorize = require('../config/auth');
const enums = require('../utils/enums');
const Joi = require('joi');
const passport = require('passport');

const { Subject,  subjectValidator } = require('../models/subject');

const opinionHelper = require('../helpers/opinion');
const ideaHelper = require('../helpers/idea');
const subjectHelper = require('../helpers/subject');

const ADMIN = [enums.UserRoles[1]];

// retreive all subjects
router.get('/', (req, res, next) => {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
            {
                path: 'user',
                select: 'username -_id'
            },
            {
                path: 'domains',
                select: 'name -_id'
            }
        ],
        sort: {
            createdAt: -1
        }
    }
    Subject.paginate({
        status: 'opened'
    }, options).then(result => {
        res.status(200).json(result);
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
});

// retreive all subject ideas
router.get('/:subjectId/ideas', async (req, res, next) => {
    const subjectId = req.params.subjectId;
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    
    try {
        const result = await ideaHelper.findAllBySubject({
            page: parseInt(page),
            limit: parseInt(limit),
            subjectId: subjectId
        });
        if (result.docs) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json({
                error: 'Something went wrong, please try again later'
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: error
        });
    }
});

// create new suject
router.post('/', passport.authorize('jwt', { session: false }), authorize(enums.UserRoles), async (req, res, next) => {
    const body = req.body;
    const user = req.user;
    try {
        if (!body) {
            return res.status(400).json({
                error: 'Your request body must look likes { title, description, domains }'
            });
        }

        await Joi.validate(body, subjectValidator);

        const subject = new Subject({
            title: body.title,
            description: body.description,
            user: user._id,
            domains: body.domains
        });

        await subject.save();
        return res.status(201).json({
            message: "Your subject has been successfully created"
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

// create a new idea
router.put('/:subjectId/ideas', passport.authorize('jwt', { session: false }), authorize(enums.UserRoles), async (req, res, next) => {
    const user = req.user;
    const { title, description } = req.body;
    const subjectId = req.params.subjectId;
    try {

        const create = await ideaHelper.create({
            title: title,
            description: description,
            subjectId: subjectId,
            userId: user._id
        });

        if (create.message) {
            await subjectHelper.updateIdeasCount({
                subjectId: subjectId
            });
            return res.status(200).json(create);
        } else {
            return res.status(500).json(create);
        }
        
    } catch (error) {
        return res.status(500).json({
            error: error
        });
    }
});

// like a subject
router.patch('/:subjectId/like', passport.authorize('jwt', { session: false }), authorize(enums.UserRoles), async (req, res, next) => {
    const user = req.user;
    const subjectId = req.params.subjectId;
    try {
        const checked = await opinionHelper.check({
            category: enums.OpinionCategories[0],
            target: subjectId,
            userId: user._id
        });

        if (!checked) {
            return res.status(403).json({
                error: 'You have already like this subject'
            });
        }

        // update subject likes
        const subject = await Subject.findById(subjectId).lean().exec();
        if (!subject) {
            return res.status(404).json({
                error: 'Subject does not exits'
            });
        }
        let likes = subject.likes;
        likes++;

        await Subject.updateOne({
            _id: subjectId
        }, { $set: { likes: likes } }).exec();

        const create = await opinionHelper.create({
            category: enums.OpinionCategories[0],
            target: subjectId,
            type: 'like',
            userId: user._id
        });

        if (create.message) {
            return res.status(200).json(create);
        } else {
            return res.status(500).json(create);
        }
    } catch (error) {
        return res.status(500).json({
            error: error
        });
    }
}); 

// update subject status
router.patch('/:subjectId/status', passport.authorize('jwt', { session: false }), authorize(enums.UserRoles), async (req, res, next) => {
    const subjectId = req.params.subjectId;
    const { status } = req.body;
    
    const subject = await Subject.findById(subjectId).lean().exec();
    if (!subject) {
        return res.status(404).json({
            error: 'Subject does not exits'
        });
    }

    Subject.updateOne({
        _id: subjectId
    }, { $set: { status: status } }).then(result => {
        if (result.n === 1 && result.nModified === 1) {
            return res.status(200).json({
                message: 'Updated successfully'
            });
        } else {
            return res.status(400).json({
                message: `Please check your data ${status}`
            });
        }
    }).catch(error => {
        return res.status(500).json({
            error: error
        });
    });
});

// delete a subject
router.delete('/:subjectId', passport.authorize('jwt', { session: false }), authorize(ADMIN), async (req, res, next) => {
    const subjectId = req.params.subjectId;
    try {
        const subject = await Subject.findById(subjectId).lean().exec();
        if (!subject) {
            return res.status(404).json({
                error: 'Subject does not exits'
            });
        }

        await Subject.deleteOne({
            _id: subjectId
        }).exec();

        return res.status(200).json({
            message: 'Deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            error: error
        });
    }
});

module.exports = router;