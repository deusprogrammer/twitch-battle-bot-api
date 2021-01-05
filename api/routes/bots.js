const express = require('express');
var router = express.Router();
var Bots = require('../models/bots');

import axios from 'axios';

import {authenticatedUserHasRole, getAuthenticatedTwitchUserId} from '../utils/SecurityHelper';

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_EXT_CLIENT_ID = process.env.TWITCH_EXT_CLIENT_ID;
const TWITCH_BOT_CLIENT_ID = process.env.TWITCH_BOT_CLIENT_ID;
const TWITCH_BOT_USER = process.env.TWITCH_BOT_USER;
const TWITCH_BOT_PASS = process.env.TWITCH_BOT_PASS;
const TWITCH_BOT_ACCESS_TOKEN = process.env.TWITCH_BOT_ACCESS_TOKEN;
const redirectUrl = "https://deusprogrammer.com/util/twitch/registration/refresh";

const randomUuid = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const getAccessToken = async (code) => {
    try {
        let res = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUrl}`);
        return res.data;
    } catch (error) {
        console.error("Call to get access token failed! " + error.message);
        throw error;
    }
}

const getProfile = async (accessToken) => {
    try {
        let res = await axios.get(`https://api.twitch.tv/helix/users`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Client-Id": clientId
            }
        });

        return res.data;
    } catch (error) {
        console.error("Call to get profile failed! " + error.message);
        throw error;
    }
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
    try {
        let container = await getContainer(containerName);
        return container.State.Running;
    } catch (error) {
        if (error.response && error.response.status !== 404) {
            throw error;
        }
        return false; 
    }
}

const changeContainerState = async (containerName, state) => {
    try {
        let res = await axios.post(`http://10.0.0.243:2375/containers/${containerName}/${state}`);

        return res.data;
    } catch (error) {
        if (error.response && error.response.status !== 404) {
            throw error;
        }

        return {};
    }
}

const deleteBotContainer = async (containerName) => {
    try {
        let res = await axios.delete(`http://10.0.0.243:2375/containers/${containerName}?force=true`);

        return res.data;
    } catch (error) {
        if (error.response && error.response.status !== 404) {
            throw error;
        } 

        return {};
    }
}

const createBotContainer = async (userId, containerName) => {
    const url = `http://10.0.0.243:2375/containers/create?name=${containerName}`;
    let res = await axios.post(url, {
        Image: "mmain/cbd-bot:latest",
        Env: [
            `TWITCH_EXT_CHANNEL_ID=${userId}`,
            `TWITCH_EXT_CLIENT_ID=${TWITCH_EXT_CLIENT_ID}`,
            `TWITCH_BOT_ACCESS_TOKEN=${TWITCH_BOT_ACCESS_TOKEN}`,
            `TWITCH_BOT_USER=${TWITCH_BOT_USER}`,
            `TWITCH_BOT_PASS=${TWITCH_BOT_PASS}`,
            `TWITCH_BOT_CLIENT_ID=${TWITCH_BOT_CLIENT_ID}`,
            "PROFILE_API_URL=https://deusprogrammer.com/api/profile-svc",
            "BATTLE_API_URL=https://deusprogrammer.com/api/twitch"
        ]
    });

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

router.route("/:id/token")
    .put(async (request, response) => {
        try {
            // Get access token.
            let accessTokenRes = await getAccessToken(request.body.twitchAuthCode);

            // Get user profile.
            let userRes = await getProfile(accessTokenRes.access_token);

            // Get approved bots.
            let profile = userRes.data[0];
            let twitchUser = getAuthenticatedTwitchUserId(request);

            // Validate that the token being updated is owned by channel
            if (twitchUser !== request.params.id || profile.id !== request.params.id) {
                response.status(403);
                return response.send("Invalid user");
            }

            let bot = await Bots.findOne({twitchChannelId: request.params.id}).exec();
            bot.accessToken = accessTokenRes.access_token;
            bot.refreshToken = accessTokenRes.refresh_token;
            await Bots.findByIdAndUpdate(bot._id, bot);
            response.status(204);
            return response.send();
        } catch (error) {
            console.error(error);
            response.status(500);
            return response.send(error);
        }
    })
    .get(async (request, response) => {
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
            // let containerRunning = await isContainerRunning(`cbd-bot-${request.params.id}`);

            // if (containerRunning && request.body.newState === "start") {
            //     response.status(400);
            //     return response.send("Container already running");
            // }

            // Stop, delete, rebuild container, and then start it to guarantee that it's always the newest version.
            
            if (request.body.newState === "start" || request.body.newState === "restart") {
                await deleteBotContainer(`cbd-bot-${request.params.id}`);
                await createBotContainer(request.params.id, `cbd-bot-${request.params.id}`);
                await changeContainerState(`cbd-bot-${request.params.id}`, "start");
            } else if (request.body.newState === "stop") {
                await deleteBotContainer(`cbd-bot-${request.params.id}`);
            }

            return response.send();
        } catch (error) {
            if (error.response && error.response.state === 404) {
                response.status(404);
                return response.send(error);
            } else {
                response.status(500);
                console.log("Failed to start container: " + error);
                return response.send(error);
            }
        }
    })

module.exports = router;