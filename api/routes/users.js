import express from 'express'; 
var router = express.Router();
import Users from '../models/users';
import Items from '../models/items';
import {getAuthenticatedTwitchUserName, authenticatedUserHasRole} from '../utils/SecurityHelper';

router.route("/")
    .get(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserName(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        try {
            let results = await Users.find({}, null, {sort: {name: 1}}).exec();
            return response.json(results);
        } catch (e) {
            console.error("ERROR IN GET ALL: " + e.stack);
            response.status(500);
            return response.send(e);
        }
    })
    .post(async (request, response) => {
        if (!request.user.roles.includes("TWITCH_BOT")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        try {
            let results = await Users.create(request.body).exec();
            return response.json(results);
        } catch (e) {
            console.error("ERROR IN CREATE: " + e.stack);
            response.status(500);
            return response.send(e);
        }
    });

router.route("/:id")
    .get(async (request, response) => {
        let userId = request.params.id;
        let twitchUser = getAuthenticatedTwitchUserName(request);

        if (userId === "~self") {
            userId = twitchUser;
        }

        
        if (twitchUser !== userId && !authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        try {
            let results = await Users.findOne({name: userId}).exec();
            return response.json(results);
        } catch (e) {
            console.error("ERROR IN GET ONE: " + e);
            response.status(500);
            return response.send(e);
        }
    })
    .put(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserName(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        let newUser = request.body;

        try {
            if (!authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
                let oldUser = await Users.findOne({name: request.params.id}).exec();

                // Revert most fields to whatever is in the database.
                newUser.id   = oldUser.id;
                newUser.name = oldUser.name;
                newUser.ap   = oldUser.ap;
                newUser.hp   = oldUser.hp;

                // Check equipment/inventory changes to make sure that equipment is in inventory first.
                let oldInventory = Object.keys(oldUser.equipment)
                .filter((slot) => {
                    return oldUser.equipment[slot] && oldUser.equipment[slot].id;
                })
                .map((slot) => {
                    return oldUser.equipment[slot].id;
                });
                oldInventory = [...oldInventory, ...oldUser.inventory];

                let newInventory = Object.keys(newUser.equipment)
                .filter((slot) => {
                    return newUser.equipment[slot] && newUser.equipment[slot].id;
                })
                .map((slot) => {
                    return newUser.equipment[slot].id;
                });
                newInventory = [...newInventory, ...newUser.inventory];

                newInventory.forEach((item) => {
                    if (!oldInventory.includes(item)) {
                        console.error("User has item they shouldn't have.");
                        console.log("OLD: " + JSON.stringify(oldInventory, null, 5));
                        console.log("NEW: " + JSON.stringify(newInventory, null, 5));
                        response.status(400);
                        return response.send("You nasty cheater.");
                    }
                });

                // Need item table for next check
                let items = await Items.find({}, null, {sort: {type: 1, slot: 1, name: 1}}).exec();

                var itemTable = {};
                items.forEach((item) => {
                    itemTable[item.id] = item;
                })

                // Check that gold value is balanced.
                let oldInventoryValue = oldInventory.reduce((prev, curr) => {
                    return prev + itemTable[curr].value;
                }, 0) + oldUser.gold;
                let newInventoryValue = newInventory.reduce((prev, curr) => {
                    return prev + itemTable[curr].value;
                }, 0) + newUser.gold;

                if (oldInventoryValue !== newInventoryValue) {
                    console.error("User is trying to update gold incorrectly.");
                    console.log("OLD: " + oldInventoryValue);
                    console.log("NEW: " + newInventoryValue);
                    response.status(400);
                    return response.send("You nasty cheater.");
                }
            }

            let results = await Users.updateOne({name: request.params.id}, newUser).exec();

            return response.json(results);
        } catch (e) {
            console.error("ERROR IN UPDATE: " + e.stack);
            response.status(500);
            return response.send(e);
        }
    })
    .delete(async (request, response) => {
        let twitchUser = getAuthenticatedTwitchUserName(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }
        
        try {
            let results = await Users.deleteOne({name: request.params.id}).exec();
            return response.json(results);
        } catch (e) {
            console.error("ERROR IN DELETE: " + e);
            response.status(500);
            return response.send(e.stack);
        }
    });

module.exports = router;