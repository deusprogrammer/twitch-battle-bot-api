const express = require('express');
var router = express.Router();
var Monsters = require('../models/monsters');

import {authenticatedUserHasRole, authenticatedUserHasAccessToChannel} from '../utils/SecurityHelper';

router.route("/")
    .get((request, response) => {
        Monsters.find(request.query, null, {sort: {dungeon: 1, type: 1, rarity: 1, name: 1}}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .post((request, response) => {
        if (!authenticatedUserHasAccessToChannel(request, request.body.owningChannel) && !authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
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
        if (request.query.owningChannel) {
            search.owningChannel = request.query.owningChannel;
        }

        Monsters.findOne(search, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        if (!authenticatedUserHasAccessToChannel(request, request.body.owningChannel) && !authenticatedUserHasRole(request, "TWITCH_ADMIN") && !authenticatedUserHasRole(request, "TWITCH_BOT")) {
            response.status(403);
            return response.send("Authenticated user doesn't have access to this channel's assets.")
        }

        Monsters.updateOne({id: request.params.id, owningChannel: request.body.owningChannel}, request.body, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .delete(async (request, response) => {
        let monster = await Monsters.findOne({id: request.params.id}).exec();

        if (!authenticatedUserHasAccessToChannel(request, monster.owningChannel) && !authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
            response.status(403);
            return response.send("Authenticated user doesn't have access to this channel's assets.")
        }

        Monsters.deleteOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })

module.exports = router;