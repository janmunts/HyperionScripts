function loadData() {
    chrome.storage.local.get(["settings"], function (result) {
        document.getElementById("webhook-url-input").value =
            result.settings.webhook.url;
    });
    getTotalCheckoutImport();
    getCheckoutsAmount();
}

function saveData() {
    chrome.storage.local.get(["settings"], function (result) {
        let oldSettings = result.settings;
        oldSettings.webhook.url =
            document.getElementById("webhook-url-input").value;
        chrome.storage.local.set({ settings: oldSettings });
    });
}

var testWebhookRequest = new XMLHttpRequest();
chrome.storage.local.get(["settings"], function (result) {
    testWebhookRequest.open("POST", result.settings.webhook.url);
    testWebhookRequest.setRequestHeader("Content-type", "application/json");
});

function sendTestWebhook() {
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
                    text: "HyperionScripts v0.2-beta",
                    icon_url:
                        "https://cdn.discordapp.com/attachments/833348728248467466/833364016965484554/No_backround.png",
                },
                color: parseInt("#ceb666".replace("#", ""), 16),
                timestamp: new Date(),
            },
        ],
    };

    testWebhookRequest.send(JSON.stringify(testParams));
}

function clearData() {
    var confirmation = confirm("ARE YOU SURE YOU WANT TO CLEAR YOUR DATA?");
    if (confirmation === true) {
        chrome.storage.local.clear();
        window.close();
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

function getTotalCheckoutImport() {
    chrome.storage.local.get(["checkout"], function (result) {
        const checkouts = result.checkout.history;
        let amount = 0;
        checkouts.forEach((checkout) => {
            if (checkout.price) {
                let formattedPrice = checkout.price;
                amount += parseInt(
                    formattedPrice
                        .replace(" ", "")
                        .replace("€", "")
                        .replace(",", "."),
                    10
                );
            }
        });
        document.getElementById(
            "checkout-total-value"
        ).innerText = `${amount} €`;
    });
}

function getCheckoutsAmount() {
    chrome.storage.local.get(["checkout"], function (result) {
        let amount = result.checkout.history.length;
        document.getElementById("checkout-amount").innerText = amount;
    });
}
