function passRequest(requestDetails) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { request: requestDetails });
    });
}

chrome.webRequest.onCompleted.addListener(passRequest, {
    urls: ["https://www.solebox.com/*", "https://www.snipes.es/*"],
});

/*
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.app.window.create("DISCORD LOGIN _ HyperionScripts GUI.html", {
        bounds: {
            width: window.width,
            height: window.height,
        },
    });

    chrome.tabs.create({
        url: "chrome://extensions/?options=" + chrome.runtime.id,
    });
}); */
