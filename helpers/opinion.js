const { Opinion } = require('../models/opinion');

const helper = {
    create: async (params) => {
        const { category, type, target, userId } = params;
        try {
            const opinion = new Opinion({
                category: category,
                type: type,
                target: target,
                user: userId
            });
            await opinion.save();           
            return {
                message: 'Ok'
            };
        } catch (error) {
            return {
                error: error
            };
        }
    },

    check: async (params) => {
        const { category, target, userId } = params;
        try {
            const opinion = await Opinion.findOne({
                category: category,
                target: target,
                user: userId
            }).exec();
            
            if (opinion) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }
};

module.exports = helper;