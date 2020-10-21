var mongoose = require('mongoose')

var abilitySchema = new mongoose.Schema({
    id: {
        type: String,
        required: "Abilities must have an ID",
        unique: true
    },
    name: String,
    ap: {
        type: Number,
        default: 1
    },
    dmg: String,
    target: String,
    area: String,
    element: String,
    mods: {
        hp: {
            type: Number,
            default: 0
        },
        hit: {
            type: Number,
            default: 0
        },
        str: {
            type: Number,
            default: 0
        },
        dex: {
            type: Number,
            default: 0
        },
        int: {
            type: Number,
            default: 0
        },
        ac: {
            type: Number,
            default: 0
        }
    }
})

module.exports = mongoose.model("abilities", abilitySchema)