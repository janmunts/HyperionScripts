function loadProfileList() {
	chrome.storage.local.get(["profiles"], function (result) {
		if (result.profiles.list && result.profiles.list.length > 0) {
			result.profiles.list.forEach((element) => {
				var x = document.getElementById("profile-select");
				var option = document.createElement("option");
				option.text = element.profileName;
				x.add(option);
			});
			if (result.profiles.selected) {
				if (result.profiles.selected.profileName) {
					document.getElementById("profile-select").value =
						result.profiles.selected.profileName;
				}
			}
		}
	});
}

function clearProfileList() {
	document.addEventListener("DOMContentLoaded", function () {
		while (document.getElementById("profile-select").options.length > 0) {
			document.getElementById("profile-select").remove(0);
		}
		loadData();
	});
}

function loadData() {
	loadProfileList();
	chrome.storage.local.get(["profiles"], function (result) {
		if (result.profiles.selected) {
			loadProfileData(result.profiles.selected);
			const selectOptions =
				document.getElementById("profile-select").options;
			for (const property in selectOptions) {
				if (
					selectOptions[property].innerHTML ===
					result.profiles.selected.profileName
				) {

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
	if (profile.address) {
		document.getElementById("address").value = profile.address;
	}

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

function saveAsNewProfile() {
	if (
		document.getElementById("profile-name").value !== "" &&
		document.getElementById("profile-name").value !== undefined &&
		document.getElementById("profile-name").value !== null
	) {
		chrome.storage.local.get(["profiles"], function (result) {
			let profileNameAvailable = true;
			result.profiles.list.forEach((profile) => {
				if (
					document.getElementById("profile-name").value ===
					profile.profileName
				) {
					alert("That profile name already exists!");
					profileNameAvailable = false;
				}
			});
			if (profileNameAvailable) {
				let newProfile = {
					profileName:
						document.getElementById("profile-name").value,
					name: document.getElementById("first-name").value,
					lastName: document.getElementById("last-name").value,
					email: document.getElementById("email").value,
					password: document.getElementById("password").value,
					phone: document.getElementById("phone").value,
					address: document.getElementById("address").value,
					zipCode: formatAddress().zipCode,
					countryCode: formatAddress().countryCode,
					streetNumber: formatAddress().streetNumber,
					street: formatAddress().street,
					city: formatAddress().city,
					adress2: formatAddress().address2,

					// cc data
					cc: {
						name: document.getElementById("cc-name").value,
						number: document.getElementById("cc-number")
							.value,
						expDate: document.getElementById("cc-exp-date")
							.value,
						ccv: document.getElementById("ccv").value,
					},
				};

				chrome.storage.local.get(["profiles"], function (result) {
					let newProfiles = result.profiles;
					if (newProfiles.list) {
						newProfiles.list.push(newProfile);
					} else {
						newProfiles.list = [];
						newProfiles.list.push(newProfile);
					}
					newProfiles.selected = newProfile;
					chrome.storage.local.set(
						{ profiles: newProfiles },
						function () {
							location.reload();
						}
					);
				});
			}
		});
	} else {
		alert("Profile name must not be empty!");
	}
}

function updateProfile() {
	if (
		document.getElementById("profile-name").value !== "" &&
		document.getElementById("profile-name").value !== undefined &&
		document.getElementById("profile-name").value !== null
	) {
		chrome.storage.local.get(["profiles"], function (result) {
			let profileNameAvailable = true;
			result.profiles.list.forEach((profile) => {
				if (
					document.getElementById("profile-name").value ===
						profile.profileName &&
					document.getElementById("profile-name").value !==
						result.profiles.selected.profileName
				) {
					alert("That profile name already exists!");
					profileNameAvailable = false;
				}
			});
			if (profileNameAvailable) {
				let updatedProfile = {
					profileName:
						document.getElementById("profile-name").value,
					name: document.getElementById("first-name").value,
					lastName: document.getElementById("last-name").value,
					email: document.getElementById("email").value,
					password: document.getElementById("password").value,
					phone: document.getElementById("phone").value,
					address: document.getElementById("address").value,
					// zipCode: formatAddress().zipCode,
					// countryCode: formatAddress().countryCode,
					// streetNumber: formatAddress().streetNumber,
					// street: formatAddress().street,
					// city: formatAddress().city,
					// adress2: formatAddress().address2,

					// cc data
					cc: {
						name: document.getElementById("cc-name").value,
						number: document.getElementById("cc-number")
							.value,
						expDate: document.getElementById("cc-exp-date")
							.value,
						ccv: document.getElementById("ccv").value,
					},
				};

				chrome.storage.local.get(["profiles"], function (result) {
					let newProfiles = result.profiles;
					newProfiles.list.indexOf(result.profiles.selected);
					newProfiles.list.forEach(function (profile) {
						if (
							profile.profileName ===
							result.profiles.selected.profileName
						) {

							newProfiles.list.splice(
								newProfiles.list.indexOf(profile),
								1,
								updatedProfile
							);
							newProfiles.selected = updatedProfile;
							chrome.storage.local.set(
								{ profiles: newProfiles },
								function () {
									location.reload();
								}
							);
						}
					});
				});
			}
		});
	} else {
		alert("Profile name must not be empty!");
	}
}

function deleteProfile() {
	const profileName = document.getElementById("profile-name").value;
	chrome.storage.local.get(["profiles"], function (result) {
		let newProfiles = result.profiles;
		if (result.profiles.list) {
			result.profiles.list.forEach((element) => {
				if (element.profileName === profileName) {
					var elementIndex =
						result.profiles.list.indexOf(element);
					newProfiles.list.splice(elementIndex, 1);
					newProfiles.selected = newProfiles.list[0];
					chrome.storage.local.set(
						{ profiles: newProfiles },
						location.reload()
					);
				}
			});
		}
	});
}

function formatAddress() {
	const inputAddress = document.getElementById("address").value;
	var indices = [];
	for (var i = 0; i < inputAddress.length; i++) {
		if (inputAddress[i] === ",") indices.push(i);
	}

	i = indices.length - 4;

	let addressInfo = {
		street: inputAddress
			.slice(0, indices[0])
			.replace(",", "")
			.replace(" ", ""),
		streetNumber: inputAddress
			.slice(indices[0], indices[1])
			.replace(",", "")
			.replace(" ", ""),
		address2: "",
		zipCode: inputAddress
			.slice(indices[1 + i], indices[2 + i])
			.replace(",", "")
			.replace(" ", ""),
		city: inputAddress
			.slice(indices[2 + i], indices[3 + i])
			.replace(",", "")
			.replace(" ", ""),
		countryCode: inputAddress
			.slice(indices[3 + i])
			.replace(",", "")
			.replace(" ", ""),
	};

	if (i > 0) {
		addressInfo.address2 = inputAddress
			.slice(indices[1], indices[2])
			.replace(",", "")
			.replace(" ", "");
	}
	return addressInfo;
}

function loadAddress(profile) {
	if (profile.address2 || profile.address2 != "") {
		return `${profile.street}, ${profile.streetNumber}, ${profile.address2}, ${profile.zipCode}, ${profile.city}, ${profile.countryCode}`;
	} else {
		return `${profile.street}, ${profile.streetNumber}, ${profile.zipCode}, ${profile.city}, ${profile.countryCode}`;
	}
}

document.getElementById("address").addEventListener("change", formatAddress);

// button listeners
document.getElementById("save-button").addEventListener("click", function () {
	saveAsNewProfile();
});

document.getElementById("update-button").addEventListener("click", function () {
	updateProfile();
	clearProfileList();
});

document.getElementById("delete-button").addEventListener("click", function () {
	deleteProfile();
	// clearProfileList();
});

document
	.getElementById("profile-select")
	.addEventListener("change", function () {
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

// Maria Aurelia Capmany, 31, 1o 2a, 08250, Sant Joan de Vilatorrada, Spain

loadData();
