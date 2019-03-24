const express = require('express');
const router = express.Router();
const authorize = require('../config/auth');
const enums = require('../utils/enums');

const { Idea } = require('../models/idea');

const opinionHelper = require('../helpers/opinion');

// like a idea
router.patch('/:ideaId/like', authorize(enums.UserRoles), async (req, res, next) => {
    const user = req.user;
    const ideaId = req.params.ideaId;
    try {
        const checked = await opinionHelper.check({
            category: enums.OpinionCategories[1],
            target: ideaId,
            userId: user._id
        });

        if (!checked) {
            return res.status(403).json({
                error: 'You have already like this idea'
            });
        }

        // update idea likes
        const idea = await Idea.findById(ideaId).lean().exec();
        if (!idea) {
            return res.status(404).json({
                error: 'Idea does not exits'
            });
        }
        let likes = idea.likes;
        likes++;

        await Idea.updateOne({
            _id: ideaId
        }, { $set: { likes: likes } }).exec();

        const create = await opinionHelper.create({
            category: enums.OpinionCategories[1],
            target: ideaId,
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

// update idea status
router.patch('/:ideaId/status', authorize(enums.UserRoles), async (req, res, next) => {
    const ideaId = req.params.ideaId;
    const { status } = req.body;
    
    const idea = await Idea.findById(ideaId).lean().exec();
    if (!idea) {
        return res.status(404).json({
            error: 'Idea does not exits'
        });
    }

    Idea.updateOne({
        _id: ideaId
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