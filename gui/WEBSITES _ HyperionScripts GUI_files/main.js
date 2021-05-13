function loadProfileList() {
    chrome.storage.local.get(["profiles", "websites"], function (result) {
        if (result.profiles.list) {
            const profileElements = [
                document.getElementById("sbx-profile-select"),
                document.getElementById("snipes-profile-select"),
            ];

            console.log(profileElements);

            result.profiles.list.forEach((profile) => {
                console.log(profile.profileName);
                profileElements.forEach(function (element) {
                    console.log(element);
                    var option = document.createElement("option");
                    option.text = profile.profileName;
                    element.add(option);

                    // if (
                    // 	profile.profileName ===
                    // 	result.websites.solebox.profile.profileName
                    // ) {
                    // 	document.getElementById(
                    // 		"sbx-profile-select"
                    // 	).value = profile.profileName;
                    // 	option.selected = true;
                    // 	console.log("asjdfhkasjdfh 1");
                    // }
                    // if (
                    // 	profile.profileName ===
                    // 	result.websites.snipes.profile.profileName
                    // ) {
                    // 	document.getElementById(
                    // 		"snipes-profile-select"
                    // 	).value = profile.profileName;
                    // 	option.selected = true;
                    // 	console.log("asjdfhkasjdfh 2");
                    // }
                });
                if (result.websites.solebox.profile.profileName) {
                    document.getElementById("sbx-profile-select").value =
                        result.websites.solebox.profile.profileName;
                }
                if (result.websites.snipes.profile.profileName) {
                    document.getElementById("snipes-profile-select").value =
                        result.websites.snipes.profile.profileName;
                }
            });
        }

        console.log(result.profiles);
        // if (result.websites.solebox.profile) {
        // 	document.getElementById(elementID).value =
        // 		result.websites.solebox.profile.profileName;
        // }
    });
}

function loadData() {
    loadProfileList();
    selectProfiles();
    chrome.storage.local.get(["websites"], function (result) {
        console.log(result.websites);
        document.getElementById("sbx-profile-select").value =
            result.websites.solebox.profile;
        document.getElementById("snipes-profile-select").value =
            result.websites.snipes.profile;

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
        snipesProfileName = document.getElementById("snipes-profile-select")
            .value;

    var sbxProfile = {},
        snipesProfile = {};
    chrome.storage.local.get(["profiles"], function (result) {
        if (result.profiles.list) {
            result.profiles.list.forEach((element) => {
                if (element.profileName === sbxProfileName) {
                    console.log(element);
                    sbxProfile = element;
                }
                if (element.profileName === snipesProfileName) {
                    console.log(element);
                    snipesProfile = element;
                }
            });
        }

        chrome.storage.local.set(
            {
                websites: {
                    solebox: {
                        profile: sbxProfile,
                        mode: document.getElementById("sbx-mode-select").value,
                        sizes: formatSizes("sbx-size-select"),
                    },
                    snipes: {
                        profile: snipesProfile,
                        mode: document.getElementById("snipes-mode-select")
                            .value,
                        sizes: formatSizes("snipes-size-select"),
                    },
                },
            },
            function () {
                console.log({
                    solebox: {
                        profile: sbxProfile,
                        mode: document.getElementById("sbx-mode-select").value,
                        sizes: formatSizes("sbx-size-select"),
                    },
                    snipes: {
                        profile: snipesProfile,
                        mode: document.getElementById("snipes-mode-select")
                            .value,
                        sizes: formatSizes("snipes-size-select"),
                    },
                });
                console.log("DATA SAVED!");
            }
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
    console.log(`Loading sizes: ${sizes}`);
    let sizesString = "";
    sizes.forEach(function (size) {
        sizesString = sizesString + size + ", ";
    });
    console.log(sizesString.slice(0, -1));
    return sizesString.slice(0, -2);
}

loadData();
