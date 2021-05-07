// webhook\main.js

//-------------------------------------------------- INITIALIZATION  --------------------------------------------------------------------//
var request = new XMLHttpRequest();
request.open(
	"POST",
	"https://discord.com/api/webhooks/833354879778160703/azoj85WOsNsFpA_DG17IQxKxNubvCB4oujeSG2ehdrHgXIxUcJG_HU_Q6-I7Ia-98Imx"
);
request.setRequestHeader("Content-type", "application/json");

//---------------------------------------------------------------------------------------------------------------------------------------//
var website = 0;

if (location.toString().includes("solebox")) {
	website = "Solebox";
} else if (location.toString().includes("snipes")) {
	website = "Snipes";
} else {
	website = "unknown";
}

// function that converts a color HEX to a valid Discord color
function hexToDecimal(hex) {
	return parseInt(hex.replace("#", ""), 16);
}

class Message {
	constructor(messageData) {
		(this.author = {
			name: messageData.author,
		}),
			(this.title = messageData.title),
			(this.description = messageData.description),
			(this.footer = {
				text: messageData.footer,
			}),
			(this.color = messageData.color),
			(this.timestamp = new Date());
	}
}

class CheckoutMessage extends Message {
	constructor(product, messageData, PayPalUrl) {
		super(messageData);
		(super.author = {
			name: "",
		}),
			(super.title = ":zap: OH LOOK, THAT'S A CHECKOUT! :zap:"),
			(this.url = PayPalUrl),
			(super.description =
				"HyperionScripts managed to check out an item! Click the link above to pay."),
			(this.fields = [
				{
					name: "Brand :ticket:",
					value: product.brand,
					inline: true,
				},
				{
					name: "Size :straight_ruler:",
					value: product.size,
					inline: true,
				},
				{
					name: "Model :label:",
					value: product.model,
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
					name: "User :bust_in_silhouette:",
					value: `||${product.user}||`,
					inline: true,
				},
			]),
			(super.footer = {
				text: "HypersionScripts v0.0.1",
				icon_url:
					"https://cdn.discordapp.com/attachments/833348728248467466/833364016965484554/No_backround.png",
			}),
			(super.color = hexToDecimal("#ceb666")),
			(super.timestamp = new Date());
		(this.thumbnail = {
			url: product.imageUrl,
		}),
			(this.image = {});
	}
}

var sizeClassname = 0;
if (location.toString().includes("solebox")) {
	sizeClassname = "b-item-attribute b-item-attribute--size Size-";
} else if (location.toString().includes("snipes")) {
	sizeClassname = "b-item-attribute b-item-attribute--talla Talla-";
}

if (location.toString().includes("/checkout")) {
	class Product {
		constructor() {
			(this.brand = document
				.getElementsByClassName("t-product-brand-name")[0]
				.innerHTML.trim()),
				(this.size = document
					.getElementsByClassName(sizeClassname)[0]
					.getElementsByClassName(
						"t-checkout-attr-value"
					)[0].innerHTML),
				(this.model = document
					.getElementsByClassName("t-product-main-name")[0]
					.innerHTML.trim()),
				(this.website = location.hostname.replace("www.", "")),
				(this.price = document
					.getElementsByClassName("b-product-tile-price-item")[0]
					.innerHTML.trim()),
				(this.user = document.getElementById(
					"dwfrm_contact_email"
				).value),
				(this.imageUrl = document
					.getElementsByClassName("b-dynamic_image_content")[0]
					.getAttribute("data-src")
					.trim());
			this.messageSent = false;
		}
	}
	var currentProduct = new Product();

	chrome.storage.local.set(
		{ mostRecentProduct: currentProduct },
		function () {
			console.log(currentProduct);
			console.log("Value is set to " + currentProduct);
		}
	);
} else if (location.toString().includes("www.paypal.com")) {
	chrome.storage.local.get(["mostRecentProduct"], function (result) {
		console.log(result.mostRecentProduct);
		console.log(result.mostRecentProduct.messageSent);
		if (result.mostRecentProduct.messageSent == false) {
			var currentCheckoutMessage = new CheckoutMessage(
				result.mostRecentProduct,
				{ color: hexToDecimal("#ceb666") },
				location.toString()
			);
			console.log(currentCheckoutMessage);
			var params = {
				username: "HyperionScripts notifier",
				avatar_url:
					"https://cdn.discordapp.com/attachments/833348728248467466/833348781969637437/HyperionScripts_logo.png",
				embeds: [currentCheckoutMessage],
			};
			request.send(JSON.stringify(params));
			result.mostRecentProduct.messageSent = true;
			chrome.storage.local.set({
				mostRecentProduct: result.mostRecentProduct,
			});
		}
	});
}

const texts = {
	success: [
		"IT WAS KINDA EZ, WASN'T IT?",
		"OH LOOK, IS THAT A CHECKOUT?",
		"OH YES, HYPERIONSCRIPTS DID IT AGAIN!",
		"RING RING, ",
	],
};
