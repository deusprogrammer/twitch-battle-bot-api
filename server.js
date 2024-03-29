import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';

const usersRoutes = require('./api/routes/users');
const itemRoutes = require('./api/routes/items');
const jobRoutes = require('./api/routes/jobs');
const monsterRoutes = require('./api/routes/monsters');
const encounterRoutes = require('./api/routes/encounters');
const abilityRoutes = require('./api/routes/abilities');
const statusRoutes = require('./api/routes/statuses');
const sealedItemRoutes = require('./api/routes/sealedItems');

import {jwtAuthStrategy} from './api/config/passportConfig';

let app = express();
let port = process.env.PORT || 8080;

// Mongoose instance connection url connection
const databaseUrl = process.env.DB_URL;
mongoose.Promise = global.Promise;

/*
 * Connect to database
*/

var connectWithRetry = function() {
    return mongoose.connect(databaseUrl, function(err) {
        if (err) {
            console.warn('Failed to connect to mongo on startup - retrying in 5 sec');
            setTimeout(connectWithRetry, 5000);
        }
    });
};
connectWithRetry();

passport.use(jwtAuthStrategy);

app.use(express.json({limit: "50Mb"}))
app.use(cors());
app.use(passport.initialize());

app.set('etag', false);
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

/*
 * Routes 
 */
app.use('/users', passport.authenticate("jwt", { session: false }), usersRoutes);
app.use('/items', passport.authenticate("jwt", { session: false }), itemRoutes);
app.use('/sealed-items', passport.authenticate("jwt", { session: false }), sealedItemRoutes);
app.use('/jobs', passport.authenticate("jwt", { session: false }), jobRoutes);
app.use('/monsters', passport.authenticate("jwt", { session: false }), monsterRoutes);
app.use('/encounters', passport.authenticate("jwt", { session: false }), encounterRoutes);
app.use('/abilities', passport.authenticate("jwt", { session: false }), abilityRoutes);
app.use('/statuses', passport.authenticate("jwt", { session: false }), statusRoutes);

app.listen(port);
console.log('CBD RESTful API server started on: ' + port);