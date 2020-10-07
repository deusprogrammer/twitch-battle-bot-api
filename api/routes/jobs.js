const express = require('express');
const { response } = require('express');
var router = express.Router();
var Jobs = require('../models/jobs');

router.route("/")
    .get((request, response) => {
        Jobs.find({}, null, {sort: {type: 1, slot: 1, name: 1}}, (error, results) => {
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

        Jobs.create(request.body, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })

router.route("/:id")
    .get((request, response) => {
        Jobs.findOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .put((request, response) => {
        if (!request.user.roles.includes["SUPER_USER"]) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Jobs.updateOne({id: request.params.id}, request.body, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })
    .delete((request, response) => {
        if (!request.user.roles.includes["SUPER_USER"]) {
            response.status(403);
            return response.send("Insufficient privileges");
        }

        Jobs.deleteOne({id: request.params.id}, (error, results) => {
            if (error) {
                return response.send(error);
            }

            return response.json(results);
        });
    })

module.exports = router;