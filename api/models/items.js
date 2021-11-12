var mongoose = require('mongoose')

var itemSchema = new mongoose.Schema({
    id: {
        type: String,
        required: "Items must have an ID",
        unique: true
    },
    type: {
        type: String,
        required: "Items must have a type"
    },
    slot: {
        type: String,
        required: "Items must have a slot"
    },
    name: {
        type: String,
        required: "Items must have a name"
    },
    description: String,
    dungeon: {
        type: String,
        default: "GENERIC"
    },
    use: String,
    dmg: String,
    dmgStat: {
        type: String,
        default: "HP"
    },
    toHitStat: {
        type: String,
        default: "HIT"
    },
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
    },
    resistances: {
        fire: {
            type: Number,
            default: 0
        },
        ice: {
            type: Number,
            default: 0
        },
        lightning: {
            type: Number, 
            default: 0
        },
        water: {
            type: Number,
            default: 0
        },
        earth: {
            type: Number,
            default: 0
        },
        dark: {
            type: Number,
            default: 0
        },
        light: {
            type: Number,
            default: 0
        }
    },
    abilities: {
        type: Array,
        of: String,
        default: []
    },
    unlocks: {
        type: Array,
        of: String,
        default: []
    },
    triggers: {
        type: Array,
        of: {
            abilityName: String,
            chance: Number
        },
        default: []
    },
    skills: {
        type: Array,
        of: {
            name: {type: String},
            level: {type: Number}
        },
        default: []
    },
    ac: Number,
    value: Number,
    sealedItemId: String,
    rarity: {
        type: Number,
        default: 1
    },
    owningChannel: {
        type: Number,
        required: "An owning channel is required",
        index: true
    }
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