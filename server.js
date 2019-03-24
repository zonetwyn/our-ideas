const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

// import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const domainRoutes = require('./routes/domains');
const subjectRoutes = require('./routes/subjects');
const ideaRoutes = require('./routes/ideas');
const messageRoutes = require('./routes/messages');

// initialize env
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// configure passport
require('./config/passport');

// initialize app
const app = express();

// configure app
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then(() => {
    console.log('[message] Successfully connected to MongoDB');
}).catch(error => {
    console.log('[message] We could not connect to MongoDB : ', error);
});

// define routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', passport.authorize('jwt', { session: false }), userRoutes);
app.use('/api/v1/domains', domainRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/ideas', passport.authorize('jwt', { session: false }), ideaRoutes);
app.use('/api/v1/messages', passport.authorize('jwt', { session: false }), messageRoutes);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[message] Server started on port ${PORT}`);
});