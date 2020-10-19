import express from 'express'; 
var router = express.Router();
import Users from '../models/users';
import {getAuthenticatedTwitchUserName, authenticatedUserHasRole} from '../utils/SecurityHelper';

router.route("/")
    .get((request, response) => {
        let twitchUser = getAuthenticatedTwitchUserName(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Users.find({}, null, {sort: {name: 1}}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .post((request, response) => {
        if (!request.user.roles.includes("TWITCH_BOT")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Users.create(request.body, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    });

router.route("/:id")
    .get((request, response) => {
        let userId = request.params.id;
        let twitchUser = getAuthenticatedTwitchUserName(request);

        if (userId === "~self") {
            userId = twitchUser;
        }

        
        if (twitchUser !== userId && !authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Users.findOne({name: userId}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        let twitchUser = getAuthenticatedTwitchUserName(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Users.findOne({name: request.params.id}, (error, oldUser) => {
            if (error) {
                return response.send(error);
            }

            let newUser = request.body;

            if (!authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
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
                        response.status(400);
                        response.send("You nasty cheater.");
                        return;
                    }
                });

                // Check that gold value is balanced.
                let oldInventoryValue = oldUser.inventory.reduce((prev, curr) => {
                    console.log("PREV:  " + prev);
                    console.log("VALUE: " + curr.value);
                    return prev + curr.value;
                }, 0) + oldUser.gold;
                let newInventoryValue = newUser.inventory.reduce((prev, curr) => {
                    console.log("PREV:  " + prev);
                    console.log("VALUE: " + curr.value);
                    return prev + curr.value;
                }, 0) + newUser.gold;

                console.log("OLD vs NEW: " + oldInventoryValue + "/" + newInventoryValue);

                if (oldInventoryValue !== newInventoryValue) {
                    console.error("FUCK A CAMEL DICK");
                    response.status(400);
                    response.send("You nasty cheater.");
                    return;
                }
            }
    
            Users.updateOne({name: request.params.id}, newUser, (error, results) => {
                if (error) {
                    return response.send(error);
                }
    
                return response.json(results);
            });            
        })
    })
    .delete((request, response) => {
        let twitchUser = getAuthenticatedTwitchUserName(request);
        if (twitchUser !== request.params.id && !authenticatedUserHasRole(request, "TWITCH_BOT") && !authenticatedUserHasRole(request, "SUPER_USER")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }
        
        Users.deleteOne({name: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    });

module.exports = router;