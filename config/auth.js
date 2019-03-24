const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const authorize = (roles = []) => {
    return async (req, res, next) => {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
            const payload = jwt.decode(token);
            const userId = payload._id;
            const user = await User.findById(userId).lean().exec();

            if (user && roles.includes(payload.role)) {
                req.user = user;
                next();
            } else {
                return res.status(401).json({
                    error: 'Your are not authorized to access this resource'
                });
            }
        } else {
            return res.status(401).json({
                error: 'Your are not authorized to access this resource'
            });
        }
    }
}

module.exports = authorize;