var mongoose = require('mongoose')

var videoElementSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: true
    },
    url: String,
    name: String,
    chromaKey: {
        type: String,
        default: "green"
    },
    volume: {
        type: Number,
        default: 1.0
    },
    x: {
        type: String,
        default: "0px"
    },
    y: {
        type: String,
        default: "0px"
    },
    width: {
        type: String,
        default: "100vw"
    },
    height: {
        type: String,
        default: "100vh"
    }
});

var audioElementSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: true
    },
    url: String,
    name: String,
    volume: {
        type: Number,
        default: 1.0
    }
});

var alertConfigSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: false
    },
    type: String,
    name: String,
    messageTemplate: String,
    id: String
});

var commandSchema = new mongoose.Schema({
    coolDown: String,
    type: String,
    target: String
})

var botSchema = new mongoose.Schema({
    twitchChannel: {
        type: String,
        required: 'Channel name is required',
        unique: true
    },
    twitchChannelId: {
        type: Number,
        required: 'Channel id is required',
        unique: true
    },
    twitchOwnerUserId: {
        type: Number,
        required: 'Twitch owner id is required',
        unique: true
    },
    sharedSecretKey: {
        type: String,
        required: 'Shared secret key is required'
    },
    accessToken: {
        type: String
    },
    refreshToken: {
        type: String
    },
    priority: {
        type: Number,
        default: 0
    },
    config: {
        type: Map,
        default: {
            "cbd": true,
            "requests": false,
            "raid": false,
            "rewards": false
        }
    },
    commands: {
        type: Map,
        of: commandSchema
    },
    alertConfigs: {
        subAlert: alertConfigSchema,
        raidAlert: alertConfigSchema,
        cheerAlert: alertConfigSchema,
        followAlert: alertConfigSchema
    },
    videoPool: {
        type: [videoElementSchema],
        default: []
    },
    audioPool: {
        type: [audioElementSchema],
        default: []
    }
})

module.exports = mongoose.model("bots", botSchema)