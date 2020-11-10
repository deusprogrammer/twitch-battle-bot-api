const express = require('express');
var router = express.Router();
var Monsters = require('../models/monsters');

import {authenticatedUserHasRole} from '../utils/SecurityHelper';

router.route("/")
    .get((request, response) => {
        let search = {};
        if (request.query.channelId) {
            search.owningChannel = request.query.channelId;
        }

        Monsters.find(search, null, {sort: {type: 1, rarity: 1, name: 1}}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .post((request, response) => {
        if (!authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        if (!authenticatedUserHasAccessToChannel(request.body.owningChannel)) {
            response.status(403);
            return response.send("Authenticated user doesn't have access to this channel's assets.")
        }

        Monsters.create(request.body, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })

router.route("/:id")
    .get((request, response) => {
        let search = {id: request.params.id};
        if (request.query.channelId) {
            search.owningChannel = request.query.channelId;
        }

        Monsters.findOne(search, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        if (!authenticatedUserHasRole(request, "SUPER_USER") && !authenticatedUserHasRole(request, "TWITCH_BOT")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Monsters.updateOne({id: request.params.id, owningChannel: results.owningChannel}, request.body, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .delete((request, response) => {
        if (!authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Monsters.deleteOne({id: request.params.id, owningChannel: results.owningChannel}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })

module.exports = router;