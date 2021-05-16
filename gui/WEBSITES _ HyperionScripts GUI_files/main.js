function loadProfileList() {
	chrome.storage.local.get(["profiles", "websites"], function (result) {
		if (result.profiles.list) {
			const profileElements = [
				document.getElementById("sbx-profile-select"),
				document.getElementById("snipes-profile-select"),
			];
			result.profiles.list.forEach((profile) => {
				profileElements.forEach(function (element) {
					var option = document.createElement("option");
					option.text = profile.profileName;
					element.add(option);
				});
				if (result.websites.solebox.profile.profileName) {
					document.getElementById("sbx-profile-select").value =
						result.websites.solebox.profile.profileName;
				}
				if (result.websites.snipes.profile.profileName) {
					document.getElementById(
						"snipes-profile-select"
					).value = result.websites.snipes.profile.profileName;
				}
			});
		}
	});
}

function loadData() {
	loadProfileList();
	chrome.storage.local.get(["websites"], function (result) {
		document.getElementById("sbx-profile-select").value =
			result.websites.solebox.profile.profileName;
		document.getElementById("snipes-profile-select").value =
			result.websites.snipes.profile.profileName;

		document.getElementById("sbx-mode-select").value =
			result.websites.solebox.mode;
		document.getElementById("snipes-mode-select").value =
			result.websites.snipes.mode;

		document.getElementById("sbx-size-select").value = loadSizes(
			result.websites.solebox.sizes
		);
		document.getElementById("snipes-size-select").value = loadSizes(
			result.websites.snipes.sizes
		);
	});
}

function saveData() {
	var sbxProfileName = document.getElementById("sbx-profile-select").value,
		snipesProfileName = document.getElementById(
			"snipes-profile-select"
		).value;

	var sbxProfile = {},
		snipesProfile = {};
	chrome.storage.local.get(["profiles"], function (result) {
		if (result.profiles.list) {
			result.profiles.list.forEach((element) => {
				if (element.profileName === sbxProfileName) {
					sbxProfile = element;
				}
				if (element.profileName === snipesProfileName) {
					snipesProfile = element;
				}
			});
		}

		chrome.storage.local.set(
			{
				websites: {
					solebox: {
						profile: sbxProfile,
						mode: document.getElementById("sbx-mode-select")
							.value,
						sizes: formatSizes("sbx-size-select"),
					},
					snipes: {
						profile: snipesProfile,
						mode: document.getElementById(
							"snipes-mode-select"
						).value,
						sizes: formatSizes("snipes-size-select"),
					},
				},
			},
			function () {}
		);
	});
}

function formatSizes(elementID) {
	let sizes = document.getElementById(elementID).value.replaceAll(" ", ""),
		sizesArray = [];

	let lastComma = 0;

	for (var i = 0; i < sizes.length; i++) {
		if (sizes.charAt(i) == ",") {
			sizesArray.push(sizes.slice(lastComma, i).replace(",", ""));
			lastComma = i;
		} else if (i == sizes.length - 1) {
			sizesArray.push(sizes.slice(lastComma, i + 1).replace(",", ""));
		}
	}

	return sizesArray;
}

document
	.getElementById("sbx-profile-select")
	.addEventListener("change", saveData);
document
	.getElementById("snipes-profile-select")
	.addEventListener("change", saveData);

document.getElementById("sbx-mode-select").addEventListener("change", saveData);
document
	.getElementById("snipes-mode-select")
	.addEventListener("change", saveData);

document.getElementById("sbx-size-select").addEventListener("change", saveData);
document
	.getElementById("snipes-size-select")
	.addEventListener("change", saveData);

function loadSizes(sizes) {
	let sizesString = "";
	sizes.forEach(function (size) {
		sizesString = sizesString + size + ", ";
	});
	return sizesString.slice(0, -2);
}

loadData();
