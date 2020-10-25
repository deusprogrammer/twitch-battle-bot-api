import express from 'express';
import mongoose from 'mongoose';
import bodyparser from 'body-parser';
import cors from 'cors';
import passport from 'passport';

var usersRoutes = require('./api/routes/users');
var itemRoutes = require('./api/routes/items');
var jobRoutes = require('./api/routes/jobs');
var monsterRoutes = require('./api/routes/monsters');
var encounterRoutes = require('./api/routes/encounters');
var abilityRoutes = require('./api/routes/abilities');
import {jwtAuthStrategy} from './api/config/passportConfig';

let app = express();
let port = process.env.PORT || 8080;

// Mongoose instance connection url connection
const databaseUrl = process.env.DB_URL;
//const databaseUrl = "mongodb://10.0.0.244/battle-bot-db?retryWrites=true";
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

app.use(bodyparser.json());
app.use(cors());
app.use(passport.initialize());

/*
 * Routes 
 */
app.use('/users', passport.authenticate("jwt", { session: false }), usersRoutes);
app.use('/items', passport.authenticate("jwt", { session: false }), itemRoutes);
app.use('/jobs', passport.authenticate("jwt", { session: false }), jobRoutes);
app.use('/monsters', passport.authenticate("jwt", { session: false }), monsterRoutes);
app.use('/encounters', passport.authenticate("jwt", { session: false }), encounterRoutes);
app.use('/abilities', passport.authenticate("jwt", { session: false }), abilityRoutes);

app.listen(port);
console.log('budget RESTful API server started on: ' + port);