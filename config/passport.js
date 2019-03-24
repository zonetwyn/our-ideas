const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');

const { User } = require('../models/user');

passport.use('signin', 
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, done) => {
        try {
            const user = await User.findOne({
                username: username
            }).exec();
            if (!user) {
                return done(null, false, {
                    message : 'Invalid username'
                });
            }

            if (user.status === 'locked') {
                return done(null, false, {
                    message : 'Your account has been locked'
                });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return done(null, false, { 
                    message : 'Invalid password'
                });
            }

            return done(null, user, 
                { message : 'You have been successfully logged in'
            });
        } catch (error) {
            console.log(error)
            done(error);
        }
    })
);

passport.use(
    new JWTStrategy({
        secretOrKey : process.env.JWT_KEY,
        jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken()
    }, (payload, done) => {
        User.findById(payload._id).select('-password -__v').then(user => {
            if (user) {
                if (user.status === 'locked') {
                    done(null, false, {
                        message : 'Your account has been locked'
                    });
                } else {
                    return done(null, user);
                }
            } else {
                return done(null, false);
            }
        }).catch(error => {
            return done(error, false);
        });
    })
);

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});