// webhook\main_rewrite.js
var publicWebhookRequest = new XMLHttpRequest();
publicWebhookRequest.open(
	"POST",
	"https://discord.com/api/webhooks/837352239218950164/pXWqUCf_V_6_8eVhWQ-WWxhdA5ofcB8znewQnvsnmxdNnRdzacqqlyRE7lNBZJtN3nUg"
);
publicWebhookRequest.setRequestHeader("Content-type", "application/json");

var privateWebhookRequest = new XMLHttpRequest();
chrome.storage.local.get(["settings"], function (result) {
	privateWebhookRequest.open("POST", result.settings.webhook.url);
	privateWebhookRequest.setRequestHeader("Content-type", "application/json");
});

function hexToDecimal(hex) {
	return parseInt(hex.replace("#", ""), 16);
}

class requestsPublicWebhook {
	constructor(product) {
		(this.author = {
			name: "",
		}),
			(this.title = ":zap: OH LOOK, THAT'S A CHECKOUT! :zap:"),
			(this.url = product.itemPageURL),
			(this.description =
				"HyperionScripts user managed to checkout an item for one of our members!"),
			(this.fields = [
				{
					name: "Brand :ticket:",
					value: product.brand,
					inline: true,
				},
				{
					name: "Model :label:",
					value: product.model,
					inline: true,
				},
				{
					name: "Size :straight_ruler:",
					value: product.size,
					inline: true,
				},
				{
					name: "Website :globe_with_meridians:",
					value: product.website,
					inline: true,
				},
				{
					name: "Price :moneybag:",
					value: product.price,
					inline: true,
				},
				{
					name: "Mode :moneybag:",
					value: product.mode,
					inline: true,
				},
				{
					name: "ATC time :clock1:",
					value: `${product.ATCtime}ms`,
					inline: true,
				},
				{
					name: "Checkout time :clock1:",
					value: `${product.checkoutTime}ms`,
					inline: true,
				},
				{
					name: "User :bust_in_silhouette:",
					value: `||<@${product.discordID}>||`,
					inline: true,
				},
			]),
			(this.footer = {
				text: "HyperionScripts v0.3-beta",
				icon_url:
					"https://cdn.discordapp.com/attachments/833348728248467466/833364016965484554/No_backround.png",
			}),
			(this.color = hexToDecimal("#ceb666")),
			(this.timestamp = new Date());
		(this.thumbnail = {
			url: product.imageURL,
		}),
			(this.image = {});
	}
}

class safePublicWebhook {
	constructor(product) {
		(this.author = {
			name: "",
		}),
			(this.title = ":zap: OH LOOK, THAT'S A CHECKOUT! :zap:"),
			(this.url = product.itemPageURL),
			(this.description =
				"HyperionScripts user managed to checkout an item for one of our members!"),
			(this.fields = [
				{
					name: "Brand :ticket:",
					value: product.brand,
					inline: true,
				},
				{
					name: "Model :label:",
					value: product.model,
					inline: true,
				},
				{
					name: "Size :straight_ruler:",
					value: product.size,
					inline: true,
				},
				{
					name: "Website :globe_with_meridians:",
					value: product.website,
					inline: true,
				},
				{
					name: "Price :moneybag:",
					value: product.price,
					inline: true,
				},
				{
					name: "Mode :moneybag:",
					value: product.mode,
					inline: true,
				},
				{
					name: "User :bust_in_silhouette:",
					value: `||<@${product.discordID}>||`,
					inline: true,
				},
			]),
			(this.footer = {
				text: "HyperionScripts v0.3-beta",
				icon_url:
					"https://cdn.discordapp.com/attachments/833348728248467466/833364016965484554/No_backround.png",
			}),
			(this.color = hexToDecimal("#ceb666")),
			(this.timestamp = new Date());
		(this.thumbnail = {
			url: product.imageURL,
		}),
			(this.image = {});
	}
}

class requestsPrivateWebhook {
	constructor(product, payPalURL) {
		(this.author = {
			name: "",
		}),
			(this.title = ":zap: OH LOOK, THAT'S A CHECKOUT! :zap:"),
			(this.url = payPalURL),
			(this.description =
				"HyperionScripts managed to check out an item! Click the link above to pay."),
			(this.fields = [
				{
					name: "Brand :ticket:",
					value: product.brand,
					inline: true,
				},
				{
					name: "Model :label:",
					value: product.model,
					inline: true,
				},
				{
					name: "Size :straight_ruler:",
					value: product.size,
					inline: true,
				},
				{
					name: "Website :globe_with_meridians:",
					value: product.website,
					inline: true,
				},
				{
					name: "Price :moneybag:",
					value: product.price,
					inline: true,
				},
				{
					name: "Mode :moneybag:",
					value: product.mode,
					inline: true,
				},
				{
					name: "ATC time :clock1:",
					value: `${product.ATCtime}ms`,
					inline: true,
				},
				{
					name: "Checkout time :clock1:",
					value: `${product.checkoutTime}ms`,
					inline: true,
				},
				{
					name: "User :bust_in_silhouette:",
					value: `||${product.user}||`,
					inline: true,
				},
			]),
			(this.footer = {
				text: "HyperionScripts v0.3-beta",
				icon_url:
					"https://cdn.discordapp.com/attachments/833348728248467466/833364016965484554/No_backround.png",
			}),
			(this.color = hexToDecimal("#ceb666")),
			(this.timestamp = new Date());
		(this.thumbnail = {
			url: product.imageURL,
		}),
			(this.image = {});
	}
}

class safePrivateWebhook {
	constructor(product, payPalURL) {
		(this.author = {
			name: "",
		}),
			(this.title = ":zap: OH LOOK, THAT'S A CHECKOUT! :zap:"),
			(this.url = payPalURL),
			(this.description =
				"HyperionScripts managed to check out an item! Click the link above to pay."),
			(this.fields = [
				{
					name: "Brand :ticket:",
					value: product.brand,
					inline: true,
				},
				{
					name: "Model :label:",
					value: product.model,
					inline: true,
				},
				{
					name: "Size :straight_ruler:",
					value: product.size,
					inline: true,
				},
				{
					name: "Website :globe_with_meridians:",
					value: product.website,
					inline: true,
				},
				{
					name: "Price :moneybag:",
					value: product.price,
					inline: true,
				},
				{
					name: "Mode :moneybag:",
					value: product.mode,
					inline: true,
				},
				{
					name: "User :bust_in_silhouette:",
					value: `||${product.user}||`,
					inline: true,
				},
			]),
			(this.footer = {
				text: "HyperionScripts v0.3-beta",
				icon_url:
					"https://cdn.discordapp.com/attachments/833348728248467466/833364016965484554/No_backround.png",
			}),
			(this.color = hexToDecimal("#ceb666")),
			(this.timestamp = new Date());
		(this.thumbnail = {
			url: product.imageURL,
		}),
			(this.image = {});
	}
}

if (location.toString().includes("paypal.com")) {
	chrome.storage.local.get(["checkout"], function (result) {
		const checkout = result.checkout;
		if (result.checkout.lastCheckout.webhookMessageSent === false) {
			var publicParams = {
				username: "HyperionScripts notifier",
				avatar_url:
					"https://cdn.discordapp.com/attachments/833348728248467466/833348781969637437/HyperionScripts_logo.png",
			};

			if (result.checkout.lastCheckout.mode === "SAFE") {
				publicParams.embeds = [
					new safePublicWebhook(result.checkout.lastCheckout),
				];
			} else if (result.checkout.lastCheckout.mode === "REQUESTS") {
				publicParams.embeds = [
					new requestsPublicWebhook(
						result.checkout.lastCheckout
					),
				];
			}

			var privateParams = {
				username: "HyperionScripts notifier",
				avatar_url:
					"https://cdn.discordapp.com/attachments/833348728248467466/833348781969637437/HyperionScripts_logo.png",
			};

			if (result.checkout.lastCheckout.mode === "SAFE") {
				privateParams.embeds = [
					new safePrivateWebhook(
						result.checkout.lastCheckout,
						location.toString()
					),
				];
			} else if (result.checkout.lastCheckout.mode === "REQUESTS") {
				privateParams.embeds = [
					new requestsPrivateWebhook(
						result.checkout.lastCheckout,
						location.toString()
					),
				];
			}

			publicWebhookRequest.send(JSON.stringify(publicParams));
			privateWebhookRequest.send(JSON.stringify(privateParams));

			checkout.lastCheckout.webhookMessageSent = true;
			checkout.history.push(result.checkout.lastCheckout);
			chrome.storage.local.set({ checkout: checkout });
		}
	});
}
