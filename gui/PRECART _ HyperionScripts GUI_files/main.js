console.log("precart script injected");

const preCartColors = [
	"rgb(45,201,55)",
	"rgb(153,193,64)",
	"rgb(231,180,22)",
	"rgb(219,123,43)",
	"rgb(204,50,50)",
];

function loadData() {
	chrome.storage.local.get(["settings"], function () {
		if (result.settings.features.preCart.lastGenerated === 0) {
			document.getElementById("").style.background = "blue";
		} else if (
			result.settings.features.preCart.lastGenerated.getTime() -
				new Date().getTime() >
			600000
		) {
		}
	});
}

function saveData() {}

function startPrecart() {
	chrome.storage.local.get(["settings"], function (result) {
		const oldSettings = result.settings;
		console.log(oldSettings);
		oldSettings.features.preCart.generating = true;
		chrome.storage.local.set({ settings: oldSettings }, function () {
			window.open(document.getElementById("precart-url-input").value);
		});
	});
}

document
	.getElementById("generate-precart")
	.addEventListener("click", startPrecart);
