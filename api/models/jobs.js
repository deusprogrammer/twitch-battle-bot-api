var mongoose = require('mongoose')

var jobSchema = new mongoose.Schema({
    id: {
        type: String,
        required: "Jobs must have an ID",
        unique: true
    },
    hp: Number,
    str: Number,
    dex: Number,
    int: Number,
    hit: Number,
    owningChannel: {
        type: Number,
        required: "An owning channel is required",
        default: 88666502
    }
})

module.exports = mongoose.model("jobs", jobSchema)

/**
 * EXAMPLE
    {
        id: "SQUIRE",
        hp: 100,
        mp: 10,
        str: 12,
        dex: 11,
        int: 8
    }
 */