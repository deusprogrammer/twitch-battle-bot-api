var mongoose = require('mongoose')

var itemSchema = new mongoose.Schema({
    id: {
        type: String,
        required: "Items must have an ID",
        unique: true
    },
    type: String,
    slot: String,
    name: String,
    use: String,
    dmg: String,
    ac: Number,
    value: Number
})

module.exports = mongoose.model("items", itemSchema)

/**
 *  EXAMPLE
    {
        id: "LONG_SWORD",
        type: "weapon",
        slot: "hand",
        name: "Long Sword",
        dmg: "1d6",
        ac: 0,
        value: 100
    }
 */