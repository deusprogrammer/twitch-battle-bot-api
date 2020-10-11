var mongoose = require('mongoose')

var abilitySchema = new mongoose.Schema({
    id: {
        type: String,
        required: "Abilities must have an ID",
        unique: true
    },
    name: String,
    dmg: String,
    target: String,
    area: String,
    element: String
})

module.exports = mongoose.model("abilities", abilitySchema)