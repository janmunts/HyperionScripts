function importSettings() {
	chrome.runtime.getURL("assets/extension-icon.png");

	fetch(chrome.runtime.getURL("config.json"))
		.then((response) => response.json())
		.then((data) => console.log(data))
		.catch((err) => console.log(error));
}

function exportSettings() {
	chrome.runtime.sendMessage({ action: "exportSettings" });
}
