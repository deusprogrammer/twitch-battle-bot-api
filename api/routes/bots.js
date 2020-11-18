const express = require('express');
var router = express.Router();
var Bots = require('../models/bots');

import axios from 'axios';

import {authenticatedUserHasRole, getAuthenticatedTwitchUserId} from '../utils/SecurityHelper';

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

const randomUuid = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const validateAccessToken = async (accessToken) => {
    let res = await axios.get(`https://id.twitch.tv/oauth2/validate`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    return res.data;
}

const refreshAccessToken = async (refreshToken) => {
    let res = await axios.post(`https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}&client_id=${clientId}&client_secret=${clientSecret}`);

    return res.data;
}

const getContainer = async (containerName) => {
    let res = await axios.get(`http://10.0.0.243:2375/containers/${containerName}/json`);

    return res.data;
}

const isContainerRunning = async (containerName) => {
    let container = await getContainer(containerName);
    return container.State.Running
}

const changeContainerState = async (containerName, state) => {
    let res = await axios.post(`http://10.0.0.243:2375/containers/${containerName}/${state}`);

    return res.data;
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
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_ADMIN") && !authenticatedUserHasRole(request, "TWITCH_BOT")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        try {
            let bot = await Bots.findOne({twitchChannelId: request.params.id}).exec();

            // Check auth token
            try {
                await validateAccessToken(bot.accessToken);
            } catch (error) {
                // Refresh token on failure to validate
                let refresh = await refreshAccessToken(bot.refreshToken);
                bot.accessToken = refresh.access_token;
                await Bots.findByIdAndUpdate(bot._id, bot);
            }
            
            return response.json(bot);
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })
    .put(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserId(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
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
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
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

router.route("/:id/state")
    .get(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserId(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        try {
            let containerRunning = await isContainerRunning(`cbd-bot-${request.params.id}`);

            return response.json(
                {
                    created: true,
                    running: containerRunning
                }
            )
        } catch (error) {
            if (error.response && error.response.state === 404) {
                return response.json(
                    {
                        created: false,
                        running: false
                    }
                );
            } else {
                response.status(500);
                return response.send(error);
            }
        }
    })
    .put(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserId(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_ADMIN")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }
        
        try {
            let containerRunning = await isContainerRunning(`cbd-bot-${request.params.id}`);

            if (containerRunning && request.body.newState === "start") {
                response.status(400);
                return response.send("Container already running");
            }

            await changeContainerState(`cbd-bot-${request.params.id}`);
            return response.send();
        } catch (error) {
            if (error.response && error.response.state === 404) {
                response.status(404);
                return response.send(error);
            } else {
                response.status(500);
                return response.send(error);
            }
        }
    })

module.exports = router;