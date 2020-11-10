const express = require('express');
var router = express.Router();
var Items = require('../models/items');

import {authenticatedUserHasRole, authenticatedUserHasAccessToChannel} from '../utils/SecurityHelper';

router.route("/")
    .get((request, response) => {
        let search = {};
        if (request.query.channelId) {
            search.owningChannel = parseInt(request.query.channelId);
        }

        if (request.query.type) {
            search.type = request.query.type;
        }

        Items.find(request.query, null, {sort: {type: 1, slot: 1, rarity: 1, name: 1}}, (error, results) => {
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

        if (!authenticatedUserHasAccessToChannel(request, request.body.owningChannel)) {
            response.status(403);
            return response.send("Authenticated user doesn't have access to this channel's assets.")
        }

        Items.create(request.body, (error, results) => {
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

        Items.findOne(search, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        if (!authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }
        
        Items.updateOne({id: request.params.id}, request.body, (error, results) => {
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

        Items.deleteOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    });

module.exports = router;