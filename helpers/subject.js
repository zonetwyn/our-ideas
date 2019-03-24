const { Subject } = require('../models/subject');

const helper = {
    findAllByUser: async (params) => {
        const { page, limit, userId } = params;

        try {
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                select: '-user',
                populate: [
                    {
                        path: 'domains',
                        select: 'name -_id'
                    }
                ],
                sort: {
                    createdAt: -1
                }
            }
            const result = await Subject.paginate({
                user: userId
            }, options);

            return result;
        } catch (error) {
            console.log(error);
        }
    },

    updateIdeasCount: async (params) => {
        const { subjectId } = params;

        try {
            const subject = await Subject.findById(subjectId).lean().exec();
            if (!subject) {
                return false;
            }
            let ideasCount = subject.ideasCount;
            ideasCount++;

            const updated = await Subject.updateOne({
                _id: subjectId
            }, { $set: { ideasCount: ideasCount } }).exec();

            if (updated.n === 1 && updated.nModified === 1) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

module.exports = helper;