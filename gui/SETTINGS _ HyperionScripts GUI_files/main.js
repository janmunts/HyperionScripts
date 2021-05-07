console.log("settings script loaded");

function loadData() {
    console.log("loading data...");
    chrome.storage.local.get(["settings"], function (result) {
        document.getElementById("webhook-url-input").value =
            result.settings.webhook.url;
    });
}

function saveData() {
    chrome.storage.local.get(["settings"], function (result) {
        let oldSettings = result.settings;
        oldSettings.webhook.url = document.getElementById(
            "webhook-url-input"
        ).value;
        chrome.storage.local.set({ settings: oldSettings }, function (result) {
            console.log("Data saved:");
            console.log(oldSettings);
        });
    });
}

var testWebhookRequest = new XMLHttpRequest();
chrome.storage.local.get(["settings"], function (result) {
    console.log(`Webhook URL: ${result.settings.webhook.url}`);
    testWebhookRequest.open("POST", result.settings.webhook.url);
    testWebhookRequest.setRequestHeader("Content-type", "application/json");
});

function sendTestWebhook() {
    // testWebhookRequest = new XMLHttpRequest();
    // chrome.storage.local.get(["settings"], function (result) {
    //     console.log(`Webhook URL: ${result.settings.webhook.url}`);
    //     testWebhookRequest.open("POST", result.settings.webhook.url);
    //     testWebhookRequest.setRequestHeader("Content-type", "application/json");
    // });

    console.log("sending webhook...");

    var testParams = {
        username: "HyperionScripts notifier",
        avatar_url:
            "https://cdn.discordapp.com/attachments/833348728248467466/833348781969637437/HyperionScripts_logo.png",
        embeds: [
            {
                author: {
                    name: "",
                },
                title: ":wrench: TEST WEBHOOK :wrench:",
                description:
                    "HyperionScripts sent a test message to check the provided webhook URL.",
                footer: {
                    text: "HyperionScripts v0.0.1",
                    icon_url:
                        "https://cdn.discordapp.com/attachments/833348728248467466/833364016965484554/No_backround.png",
                },
                color: parseInt("#ceb666".replace("#", ""), 16),
                // timestamp: new Date(),
            },
        ],
    };

    testWebhookRequest.send(JSON.stringify(testParams));
}

function clearData() {
    var confirmation = confirm("ARE YOU SURE YOU WANT TO CLEAR YOUR DATA?");
    if (confirmation === true) {
        chrome.storage.local.clear();
        console.log("DATA CLEARED");
        window.close();
    } else {
        console.log("CANCELLED");
    }
}

function logOut() {
    chrome.storage.local.set({
        account: {
            discordAuth: false,
            discordUsername: "",
        },
    });
    window.close();
}

loadData();

document
    .getElementById("send-test-webhook")
    .addEventListener("click", sendTestWebhook);
document
    .getElementById("webhook-url-input")
    .addEventListener("change", saveData);
document
    .getElementById("clear-data-button")
    .addEventListener("click", clearData);
document.getElementById("log-out-button").addEventListener("click", logOut);
