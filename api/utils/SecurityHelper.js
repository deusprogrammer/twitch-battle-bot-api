export let getAuthenticatedTwitchUserName = (request) => {
    if (request.user && request.user.connected && request.user.connected.twitch) {
        return request.user.connected.twitch.name;
    }
    
    return null;
}

export let getAuthenticatedTwitchUserId = (request) => {
    if (request.user && request.user.connected && request.user.connected.twitch) {
        return request.user.connected.twitch.userId;
    }
    
    return null;
}

export let authenticatedUserHasRole = (request, role) => {
    if (request.user.roles) {
        return request.user.roles.includes(role);
    }
    
    return false;
}