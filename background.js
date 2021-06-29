function passRequest(requestDetails) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { request: requestDetails });
	});
}

chrome.webRequest.onCompleted.addListener(passRequest, {
	urls: [
		"https://www.solebox.com/*",
		"https://www.snipes.com/*",
		"https://www.snipes.at/*",
		"https://www.snipes.nl/*",
		"https://www.snipes.fr/*",
		"https://www.snipes.it/*",
		"https://www.snipes.be/*",
		"https://www.snipes.es/*",
	],
});

chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(
		sender.tab
			? "from a content script:" + sender.tab.url
			: "from the extension"
	);
	if (request.action == "exportSettings") downloadConfig();
});

function downloadConfig() {
	chrome.storage.local.get(null, function (items) {
		var result = JSON.stringify(items);

		var url =
			"data:application/json;base64," +
			btoa(unescape(encodeURIComponent(result)));
		chrome.downloads.download({
			url: url,
			filename: "config.json",
		});
	});
}
