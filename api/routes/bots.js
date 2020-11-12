const express = require('express');
var router = express.Router();
var Bots = require('../models/bots');

import {authenticatedUserHasRole, getAuthenticatedTwitchUserId} from '../utils/SecurityHelper';

const randomUuid = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

router.route("/")
    .get(async (request, response) => {
        try {
            let bots = await Bots.find({}, null).exec();

            // Clear the shared secret key
            bots.forEach((bot) => {
                bot.sharedSecretKey = null;
            })

            return response.json(bots);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })
    .post(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserId(request);
        
        try {
            request.body.sharedSecretKey = randomUuid();
            request.body.twitchChannelId = twitchUser;
            request.body.twitchOwnerUserId = twitchUser;
            let bot = await Bots.create(request.body);
            return response.json(bot);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })

router.route("/:id")
    .get(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserId(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "SUPER_USER") && !authenticatedUserHasRole(request, "TWITCH_BOT")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        try {
            let bot = await Bots.findOne({twitchChannelId: request.params.id}).exec();
            return response.json(bot);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })
    .put(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserId(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        try {
            let bot = await Bots.updateOne({twitchChannelId: request.params.id}, request.body);
            return response.json(bot);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })
    .delete(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserId(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        try {
            let bot = await Bots.deleteOne({twitchChannelId: request.params.id}).exec();
            return response.json(bot);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })

module.exports = router;