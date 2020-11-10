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
    claimedBy: String,
    owningChannel: {
        type: Number,
        required: "An owning channel is required",
        default: 88666502
    }
})

module.exports = mongoose.model("sealedItems", sealedItemSchema)