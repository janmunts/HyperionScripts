chrome.storage.local.get(["initialized"], function (result) {
	if (result.initialized === true) {
		chrome.storage.local.get(["account"], function (result) {
			if (result.account) {
				if (result.account.discordAuth === true) {
					location.replace(
						"PROFILES _ HyperionScripts GUI.html"
					);
				} else {
					discordAuth();
				}
			} else {
				discordAuth();
			}
		});
	} else {
		chrome.storage.local.set({
			initialized: true,
			active: true,
			account: {
				discordAuth: false,
				discordUsername: "",
			},
			settings: {
				webhook: {
					url: "",
				},
				features: {
					preCart: {
						genareted: false,
						generating: false,
						profile: "",
						link: "",
					},
					theme: "light",
				},
			},
			profiles: {
				selected: undefined,
				list: [],
			},
			websites: {
				solebox: {
					profile: {},
					mode: "SAFE",
					sizes: [],
				},
				snipes: {
					profile: {},
					mode: "SAFE",
					sizes: [],
				},
			},
			checkout: {
				lastCheckout: {
					brand: "",
					size: "",
					model: "",
					website: "",
					price: "",
					user: "",
					imageURL: "",
					payPalURL: "",
					webhookMessageSent: false,
				},
				history: [],
				totalCheckouts: 10,
			},
		});
		// set initialized variable to true

		document
			.getElementById("discord-button")
			.addEventListener("click", function () {
				discordAuth();
			});
	}
});

function discordAuth() {
	document
		.getElementById("discord-button")
		.addEventListener("click", function () {
			const authURL =
				"https://discord.com/api/oauth2/authorize?client_id=833599294589894737&redirect_uri=https%3A%2F%2Fhyperionscripts.metalabs.gg%2Flogin&response_type=code&scope=guilds%20identify";
			window.open(authURL);
		});
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.authenticated == true) {
		chrome.storage.local.get(["account"], function (result) {
			alert(
				`Successful login! Welcome ${result.account.discordUsername}!`
			);
			location.replace("PROFILES _ HyperionScripts GUI.html");
		});
	} else {
		alert("LOGIN FAILED");
	}
});
