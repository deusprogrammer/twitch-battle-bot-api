var mongoose = require('mongoose')

var monsterSchema = new mongoose.Schema({
    id: {
        type: String,
        required: "Monsters must have an ID",
        unique: true
    },
    name: String,
    hp: Number,
    mp: Number,
    str: Number,
    dex: Number,
    int: Number,
    ac: Number,
    actions: {
        type: List,
        of: {
            abilityId: String,
            chance: Number,
            condition: String
        }
    },
    drops: {
        type: List,
        of: {
            itemId: String,
            chance: Number,
            onlyOne: Boolean
        }
    }
});

module.exports = mongoose.model("monsters", monsterSchema);