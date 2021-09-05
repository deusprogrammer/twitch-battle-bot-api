const express = require('express');
var router = express.Router();
var SealedItems = require('../models/sealedItems');

import {authenticatedUserHasRole, authenticatedUserHasAccessToChannel} from '../utils/SecurityHelper';

router.route("/")
    .get((request, response) => {
        SealedItems.find(request.query, null, {sort: {name: 1}}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            // Remove the code for get all.
            if (!authenticatedUserHasRole(request, "TWITCH_BROADCASTER") && !authenticatedUserHasRole(request, "TWITCH_BOT")) {
                for (let result of results) {
                    result.code = null;
                }
            }

            return response.json(results);
        });
    })
    .post((request, response) => {
        if (!authenticatedUserHasAccessToChannel(request, request.body.owningChannel) && !authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
            response.status(403);
            return response.send("Authenticated user doesn't have access to this channel's assets.")
        }

        SealedItems.create(request.body, (error, results) => {
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

        SealedItems.findOne(search, (error, results) => {
            if (error) {
                return response.send(error);
            }

            // Null out the code if not the broadcaster or bot
            if (!authenticatedUserHasAccessToChannel(request, results.owningChannel) && !authenticatedUserHasRole(request, "TWITCH_BOT")) {
                results.code = null;
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        if (!authenticatedUserHasAccessToChannel(request, request.body.owningChannel) && !authenticatedUserHasRole(request, "TWITCH_ADMIN") && !authenticatedUserHasRole(request, "TWITCH_BOT")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        SealedItems.updateOne({id: request.params.id, owningChannel: request.body.owningChannel}, request.body, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .delete(async (request, response) => {
        let sealedItem = await SealedItems.findOne({id: request.params.id}).exec();

        if (!authenticatedUserHasAccessToChannel(request, sealedItem.owningChannel) && !authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
            response.status(403);
            return response.send("Authenticated user doesn't have access to this channel's assets.")
        }

        SealedItems.deleteOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })

module.exports = router;