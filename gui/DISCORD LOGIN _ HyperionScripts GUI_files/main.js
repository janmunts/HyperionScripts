console.log("DISCORD LOGIN SCRIPT INJECTED");
chrome.storage.local.get(["initialized"], function (result) {
    console.log(`initialized: ${result.initialized}`);
    if (result.initialized === true) {
        chrome.storage.local.get(["account"], function (result) {
            console.log(result);
            if (result.account) {
                console.log("checking discord login status");
                if (result.account.discordAuth === true) {
                    console.log(
                        "Discord authenticated, redirecting to settings..."
                    );
                    location.replace("PROFILES _ HyperionScripts GUI.html");
                } else {
                    console.log("Initializing Discord authentication");
                    discordAuth();
                }
            } else {
                console.log("Initializing Discord authentication");
                discordAuth();
            }
        });
    } else {
        chrome.storage.local.set(
            {
                initialized: true,
                active: true,
                account: {
                    discordAuth: false,
                    discordUsername: "",
                },
                settings: {
                    webhook: {
                        url: "",
                    },
                    features: {
                        preCart: {
                            genareted: false,
                            generating: false,
                            profile: "",
                            link: "",
                        },
                        theme: "light",
                    },
                },
                profiles: {
                    selected: undefined,
                    list: [],
                },
                websites: {
                    solebox: {
                        profile: {},
                        mode: "SAFE",
                        sizes: [],
                    },
                    snipes: {
                        profile: {},
                        mode: "SAFE",
                        sizes: [],
                    },
                },
                checkout: {
                    lastCheckout: {
                        brand: "",
                        size: "",
                        model: "",
                        website: "",
                        price: "",
                        user: "",
                        imageURL: "",
                        payPalURL: "",
                        webhookMessageSent: false,
                    },
                    history: [],
                    totalCheckouts: 10,
                },
            },
            console.log("SUCCESSFULLY INITIALIZED")
        );
        // set initialized variable to true

        document
            .getElementById("discord-button")
            .addEventListener("click", function () {
                console.log("AUTHENTICATING...");
                discordAuth();
            });
        console.log("Waiting for discord authentication trigger...");
    }
});

function discordAuth() {
    document
        .getElementById("discord-button")
        .addEventListener("click", function () {
            console.log("launching auth window");
            const authURL =
                "https://discord.com/api/oauth2/authorize?client_id=833599294589894737&redirect_uri=https%3A%2F%2Fhyperionscripts.metalabs.gg%2Flogin&response_type=code&scope=guilds%20identify";
            window.open(authURL);
        });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(
        sender.tab
            ? "from a content script:" + sender.tab.url
            : "from the extension"
    );
    if (request.authenticated == true) {
        chrome.storage.local.get(["account"], function (result) {
            alert(
                `SUCCESSFUL LOGIN, WELCOME ${result.account.discordUsername}!`
            );
            location.replace("PROFILES _ HyperionScripts GUI.html");
        });
    } else {
        alert("FAILED LOGIN");
    }
});
