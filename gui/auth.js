const discord_api = {
    url: "https://discord.com/api",
    token: "https://discord.com/api/oauth2/token",
    user: "https://discordapp.com/api/users/@me",
    guilds: "https://discordapp.com/api/users/@me/guilds",
    guildMember:
        "https://discordapp.com/api/guilds/{guild.id}/members/{user.id}",
};

const client = {
    ID: "833599294589894737",
    secret: "ceZzzycqNN02OSDFw_p3usSBN0dfsjRl",
};

const account = {
    discordAuth: undefined,
    discordUsername: undefined,
    discordID: undefined,
    inServer: undefined,
    requiredRole: undefined,
};

const redirect_uri = "https://hyperionscripts.metalabs.gg/login";

console.log("code injected");

if (location.toString().includes("https://hyperionscripts.metalabs.gg/")) {
    console.log("Authorizing...");
    var urlParams = new URLSearchParams(window.location.search);
    var code = urlParams.get("code");
    const params = {
        client_id: client.ID,
        client_secret: client.secret,
        grant_type: "authorization_code",
        redirect_uri: redirect_uri,
        code: code,
        scope: "guilds identify",
    };

    fetch(discord_api.token, {
        method: "POST",
        body: new URLSearchParams(params),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    })
        .then((discordRes) => discordRes.json())
        .then((info) => {
            console.log(info);
            getGuilds(info.access_token);
            getUser(info.access_token);
        });
}

function getGuilds(token) {
    console.log("Getting user guilds...");
    console.log(`Token: ${token}`);
    fetch(discord_api.guilds, {
        headers: {
            authorization: "Bearer " + token,
        },
    })
        .then((response) => response.json())
        .then(function (loop) {
            var success = false;
            for (var i = 0; i < loop.length; i++) {
                if (loop[i].id == "832910829639696405") {
                    console.log(loop[i]);
                    success = true;
                    break;
                }
            }
            if (success == true) {
                account.inServer = true;
                account.discordAuth = true;
                saveUserInfo(true);
                console.log("successful login");
            }
            if (success == false) {
                account.inServer = false;
                account.discordAuth = false;
                saveUserInfo(false);
                console.log("failed login");
            }
        });
}

function getUser(token) {
    console.log("Getting user info...");
    console.log(`Token: ${token}`);
    fetch(discord_api.user, {
        headers: {
            authorization: "Bearer " + token,
        },
    })
        .then((response) => response.json())
        .then((user) => {
            console.log(user);
            account.discordUsername = `${user.username}#${user.discriminator}`;
            console.log(account.discordUsername);
            account.discordID = user.id;
            saveUserInfo(true);
        });
}

function saveUserInfo(status) {
    console.log("Saving user info...");
    const waitForData = setInterval(function () {
        console.log("Waiting for data to be loaded...");
        if (
            account.discordAuth != undefined &&
            account.discordUsername != undefined
        ) {
            chrome.storage.local.set({ account: account }, function () {
                console.log("account set to:");
                console.log(account);
            });
            sendSuccessMessage(status);
            clearInterval(waitForData);
        }
    }, 200);
}

function sendSuccessMessage(status) {
    chrome.runtime.sendMessage({ authenticated: status });
    window.close();
}
