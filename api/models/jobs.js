var mongoose = require('mongoose')

var jobSchema = new mongoose.Schema({
    id: String,
    hp: Number,
    mp: Number,
    str: Number,
    dex: Number,
    int: Number
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