var mongoose = require('mongoose')

var encounterSchema = new mongoose.Schema({
    id: {
        type: String,
        required: "Encounters must have an ID",
        unique: true
    },
    mobs: {
        type: Array,
        of: String
    },
    spawnTime: Date,
    owningChannel: {
        type: Number,
        required: "An owning channel is required",
        default: 88666502
    }
})

module.exports = mongoose.model("encounters", encounterSchema)