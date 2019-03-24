const { Idea } = require('../models/idea');

const helper = {
    create: async (params) => {
        const { title, description, subjectId, userId } = params;
        try {
            const idea = new Idea({
                title: title,
                description: description,
                subject: subjectId,
                user: userId
            });

            await idea.save();
            return {
                message: 'Your idea has been successfully saved'
            };
        } catch (error) {
            return {
                error: error
            };
        }
    },

    findAllBySubject: async (params) => {
        const { page, limit, subjectId } = params;

        try {
            const options = {
                page: page,
                limit: limit,
                populate: {
                    path: 'user',
                    select: 'username -_id'
                },
                sort: {
                    createdAt: -1
                }
            }
            const result = await Idea.paginate({
                status: 'authorized',
                subject: subjectId
            }, options);

            return result;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = helper;