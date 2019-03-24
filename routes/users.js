const express = require('express');
const router = express.Router();
const authorize = require('../config/auth');
const enums = require('../utils/enums');

const { User } = require('../models/user');

const subjectHelper = require('../helpers/subject');

const ADMIN = [enums.UserRoles[1]];

// retreive all users
router.get('/', authorize(ADMIN), (req, res, next) => {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        select: '-password',
        sort: {
            createdAt: -1
        }
    }
    User.paginate({}, options).then(result => {
        res.status(200).json(result);
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
});

// retreive all user subjects
router.get('/:userId/subjects', authorize(enums.UserRoles), async (req, res, next) => {
    const userId = req.params.userId;
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    
    try {
        const result = await subjectHelper.findAllByUser({
            page: parseInt(page),
            limit: parseInt(limit),
            userId: userId
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

router.get('/subjects', authorize(enums.UserRoles), async (req, res, next) => {
    const user = req.user;
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    
    try {
        const result = await subjectHelper.findAllByUser({
            page: parseInt(page),
            limit: parseInt(limit),
            userId: user._id
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

// update user status
router.patch('/:userId/status', authorize(ADMIN), async (req, res, next) => {
    const userId = req.params.userId;
    const { status } = req.body;
    
    const user = await User.findById(userId).lean().exec();
    if (!user) {
        return res.status(404).json({
            error: 'User does not exits'
        });
    }

    User.updateOne({
        _id: userId
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

module.exports = router;