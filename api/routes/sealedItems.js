const express = require('express');
var router = express.Router();
var SealedItems = require('../models/sealedItems');

import {authenticatedUserHasRole} from '../utils/SecurityHelper';

router.route("/")
    .get((request, response) => {
        SealedItems.find({}, null, {sort: {name: 1}}, (error, results) => {
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
        if (!authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        SealedItems.create(request.body, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })

router.route("/:id")
    .get(async (request, response) => {
        SealedItems.findOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            // Null out the code if not the broadcaster or bot
            if (!authenticatedUserHasRole(request, "TWITCH_BROADCASTER") && !authenticatedUserHasRole(request, "TWITCH_BOT")) {
                results.code = null;
            }
            
            // If the bot retrieves this, mark it claimed
            if (authenticatedUserHasRole(request, "TWITCH_BOT")) {
                results.claimed = true;
                await SealedItems.update({id: results.id}, results);
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        if (!authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        SealedItems.updateOne({id: request.params.id}, request.body, (error, results) => {
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

        SealedItems.deleteOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })

module.exports = router;