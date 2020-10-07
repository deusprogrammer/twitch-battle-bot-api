const express = require('express');
var router = express.Router();
var Items = require('../models/items');

router.route("/")
    .get((request, response) => {
        Items.find({}, null, {sort: {type: 1, slot: 1, name: 1}}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .post((request, response) => {
        if (!request.user.roles.includes["SUPER_USER"]) {
            response.status(403);
            return response.send("Insufficient privileges");
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
        Items.findOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        if (!request.user.roles.includes("TWITCH_BOT") && !request.user.roles.includes["SUPER_USER"]) {
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
        Items.deleteOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    });

module.exports = router;