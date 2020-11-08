var mongoose = require('mongoose')

var sealedItemSchema = new mongoose.Schema({
    id: {
        type: String,
        required: "Sealed items must have an ID",
        unique: true
    },
    name: String,
    description: String,
    code: String,
    claimed: {
        type: Boolean,
        default: false
    },
    claimedBy: String
})

module.exports = mongoose.model("sealedItems", sealedItemSchema)