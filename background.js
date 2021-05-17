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
