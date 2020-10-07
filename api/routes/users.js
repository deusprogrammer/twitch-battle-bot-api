import express from 'express'; 
var router = express.Router();
import Users from '../models/users';

router.route("/")
    .get((request, response) => {
        if (!request.user.connected && !request.user.connected.twitch === !request.params.id && !request.user.roles.includes("TWITCH_BOT")) {
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
        if (!request.user.connected && !request.user.connected.twitch === !request.params.id && !request.user.roles.includes("TWITCH_BOT")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Users.findOne({name: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        if (!request.user.connected && !request.user.connected.twitch === !request.params.id && !request.user.roles.includes("TWITCH_BOT")) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Users.findOne({name: request.params.id}, (error, oldUser) => {
            if (error) {
                return response.send(error);
            }

            // if (!request.user.roles.includes("TWITCH_BOT") && !request.user.roles.includes("SUPER_USER")) {
                // Check equipment/inventory changes to make sure that equipment is in inventory first.
                let newUser = request.body;
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

                console.log("OLD: " + JSON.stringify(oldInventory, null, 5));
                console.log("NEW: " + JSON.stringify(newInventory, null, 5));

                newInventory.forEach((item) => {
                    if (!oldInventory.includes(item)) {
                        response.status(400);
                        response.send("You nasty cheater");
                        return;
                    }
                });
            // }
    
            Users.updateOne({name: request.params.id}, request.body, (error, results) => {
                if (error) {
                    return response.send(error);
                }
    
                return response.json(results);
            });            
        })
    })
    .delete((request, response) => {
        if (!request.user.connected && !request.user.connected.twitch === !request.params.id && !request.user.roles.includes("TWITCH_BOT")) {
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