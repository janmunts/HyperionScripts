function loadProfileList() {
	chrome.storage.local.get(["profiles"], function (result) {
		if (result.profiles.list) {
			result.profiles.list.forEach((element) => {
				var x = document.getElementById("profile-select");
				var option = document.createElement("option");
				option.text = element.profileName;
				x.add(option);
			});
			console.log(result.profiles);
			if (result.profiles.selected.profileName) {
				document.getElementById("profile-select").value =
					result.profiles.selected.profileName;
			}
		}
	});
}

document.addEventListener("DOMContentLoaded", function () {
	loadData();
});

function loadData() {
	loadProfileList();
	chrome.storage.local.get(["profiles"], function (result) {
		if (result.profiles.selected) {
			console.log(result.profiles.selected.profileName);
			loadProfileData(result.profiles.selected);
			const selectOptions = document.getElementById("profile-select")
				.options;
			for (const property in selectOptions) {
				if (
					selectOptions[property].innerHTML ===
					result.profiles.selected.profileName
				) {
					console.log(
						"clicking correspoding item: " +
							result.profiles.selected.profileName
					);
					const selectOptions = (document.getElementById(
						"profile-select"
					).selectedIndex = property);
				}
			}
		}
	});
}

function loadProfileData(profile) {
	// profile data
	document.getElementById("profile-name").value = profile.profileName;
	document.getElementById("first-name").value = profile.name;
	document.getElementById("last-name").value = profile.lastName;
	document.getElementById("email").value = profile.email;
	document.getElementById("password").value = profile.password;
	document.getElementById("phone").value = profile.phone;
	document.getElementById("address").value = profile.address;
	// document.getElementById(
	//     "address"
	// ).value = `${profile.street}, ${profile.streetNumber} ${profile.address2}, ${profile.zipCode} ${profile.city}`;

	// cc data
	if (profile.cc) {
		document.getElementById("cc-name").value = profile.cc.name;
		document.getElementById("cc-number").value = profile.cc.number;
		document.getElementById("cc-exp-date").value = profile.cc.expDate;
		document.getElementById("ccv").value = profile.cc.ccv;
	} else {
		document.getElementById("cc-name").value = "NO CC CONFIGURED";
		document.getElementById("cc-number").value = "XXXX-XXXX-XXXX-XXXX";
		document.getElementById("cc-exp-date").value = "00/00";
		document.getElementById("ccv").value = "000";
	}
}

// button listeners
document.getElementById("save-button").addEventListener("click", function () {
	console.log("SAVE BUTTON CLICKED");
	saveAsNewProfile();
	loadProfileList();
});

document.getElementById("update-button").addEventListener("click", function () {
	console.log("UPDATE BUTTON CLICKED");
	updateProfile();
	loadProfileList();
});

document.getElementById("delete-button").addEventListener("click", function () {
	console.log("DELETE BUTTON CLICKED");
	deleteProfile();
	loadProfileList();
});

document
	.getElementById("profile-select")
	.addEventListener("change", function () {
		console.log("Change detected!");
		chrome.storage.local.get(["profiles"], function (result) {
			let oldProfiles = result.profiles;
			oldProfiles.selected =
				result.profiles.list[
					document.getElementById("profile-select")
						.selectedIndex - 1
				];

			loadProfileData(
				result.profiles.list[
					document.getElementById("profile-select")
						.selectedIndex - 1
				]
			);

			chrome.storage.local.set({ profiles: oldProfiles });
		});
	});

function saveAsNewProfile() {
	let newProfile = {
		profileName: document.getElementById("profile-name").value,
		name: document.getElementById("first-name").value,
		lastName: document.getElementById("last-name").value,
		email: document.getElementById("email").value,
		password: document.getElementById("password").value,
		phone: document.getElementById("phone").value,
		address: document.getElementById("address").value,

		// cc data
		cc: {
			name: document.getElementById("cc-name").value,
			number: document.getElementById("cc-number").value,
			expDate: document.getElementById("cc-exp-date").value,
			ccv: document.getElementById("ccv").value,
		},
	};
	chrome.storage.local.get(["profiles"], function (result) {
		let newProfiles = result.profiles;
		console.log(newProfiles);
		if (newProfiles.list) {
			newProfiles.list.push(newProfile);
		} else {
			newProfiles.list = [];
			newProfiles.list.push(newProfile);
		}

		console.log(newProfiles);
		chrome.storage.local.set({ profiles: newProfiles }, function () {
			console.log("successfully saved as new profile");
			console.log(newProfile);
		});
	});
}

function deleteProfile() {
	const profileName = document.getElementById("delete-button").value;
	chrome.storage.local.get(["profiles"], function (result) {
		let oldProfiles = result.profiles;
		if (result.profiles.list) {
			result.profiles.list.forEach((element) => {
				if (element.profileName === profileName) {
					var elementIndex = result.profiles.list.indexOf(
						element
					);
					if (elementIndex > 1) {
						oldProfiles.list.splice(elementIndex, 1);
						chrome.storage.local.set({
							profiles: oldProfiles,
						});
					} else {
						console.log("profile could not be deleted");
					}
				}
			});
		}
	});
}
