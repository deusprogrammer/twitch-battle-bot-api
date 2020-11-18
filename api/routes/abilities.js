const express = require('express');
var router = express.Router();
var Abilities = require('../models/abilities');

import {authenticatedUserHasAccessToChannel, authenticatedUserHasRole} from '../utils/SecurityHelper';

router.route("/")
    .get((request, response) => {
        Abilities.find(request.query, null, {sort: {element: 1, target: 1, area: 1, ap: 1, name: 1}}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .post((request, response) => {
        if (!authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        if (!authenticatedUserHasAccessToChannel(request, request.body.owningChannel)) {
            response.status(403);
            return response.send("Authenticated user doesn't have access to this channel's assets.")
        }

        Abilities.create(request.body, (error, results) => {
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

        Abilities.findOne(search, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        if (!authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Abilities.updateOne({id: request.params.id}, request.body, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .delete((request, response) => {
        if (!authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Abilities.deleteOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })

module.exports = router;