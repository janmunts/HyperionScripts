chrome.storage.local.get(
	["initialized", "active", "account", "websites"],
	function (result) {
		if (result.initialized === true) {
			if (result.account.discordAuth === true) {
				if (result.active === true) {
					console.log(
						`%cHyperionScripts injected! Hi %c${result.account.discordUsername}!`,
						"color: rgb(206, 182, 102); font-size: 20px",
						"color: rgb(206, 182, 102); font-size: 20px; font-weight: bold"
					);
					if (result.websites.snipes.mode === "SAFE") {
						safe.urlCheck();
					} else if (
						result.websites.snipes.mode === "REQUESTS"
					) {
						requests.urlCheck();
					}
				}
			} else {
				console.error(
					"Could not verify your account, go to settings to log in."
				);
			}
		} else {
			console.error(
				"Could not verify your account, go to settings to log in."
			);
		}
	}
);

// define url paths of the different pages
const paths = {
	login: "/login",
	product: "/p/",
	catalog: "/c/",
	cart: "/cart",
	ATC: "add-product?format=ajax",
	checkout: {
		path: "/checkout",
		login: "Checkout-Login",
		shipping: "/checkout?stage=shipping#shipping",
		payment: "/checkout?stage=payment#payment",
		placeOrder: "/checkout?stage=placeOrder#placeOrder",
	},
};

const global = {
	waitForDOM(callback, data) {
		document.addEventListener("DOMContentLoaded", callback(data));
	},
};

const safe = {
	sizeAttrClassname: "",
	urlCheck() {
		url = location.toString();
		if (url.includes(paths.login) || url.includes(paths.checkout.login)) {
			global.waitForDOM(safe.login);
		} else if (url.includes(paths.cart)) {
			chrome.storage.local.get(["settings"], function (result) {
				if (result.settings.features.preCart.generating === true) {
					global.waitForDOM(safe.cart.deleteItem);
				}
			});
		} else if (url.includes(paths.ATC)) {
			global.waitForDOM();
		} else if (url.includes(paths.product)) {
			global.waitForDOM(safe.product.check404);
		} else if (url.includes(paths.checkout.path)) {
			safe.checkRegion();
			global.waitForDOM(safe.saveItemInfo);
			if (url.toString().includes(paths.checkout.shipping)) {
				global.waitForDOM(safe.checkout.shipping);
			} else if (url.toString().includes(paths.checkout.payment)) {
				global.waitForDOM(safe.checkout.payment);
			} else if (url.toString().includes(paths.checkout.placeOrder)) {
				global.waitForDOM(safe.checkout.placeOrder);
			}
		}
	},
	checkRegion() {
		if (url.includes(".es")) {
			safe.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".com")) {
			safe.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".at")) {
			safe.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".nl")) {
			safe.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".fr")) {
			safe.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".it")) {
			safe.sizeAttrClassname = "taglia Taglia-";
		} else if (url.includes(".be")) {
			safe.sizeAttrClassname = "talla Talla-";
		}
	},
	saveItemInfo() {
		let websiteMode = "";
		chrome.storage.local.get(["websites"], function (result) {
			websiteMode = result.websites.snipes.mode;
		});
		safe.checkRegion();
		chrome.storage.local.get(["checkout", "websites"], function (result) {
			let checkoutFromStorage = result.checkout;
			let currentProduct = {
				brand: document
					.getElementsByClassName("t-product-brand-name")[0]
					.innerHTML.trim(),
				size: document
					.getElementsByClassName(
						`b-item-attribute b-item-attribute--${safe.sizeAttrClassname}`
					)[0]
					.getElementsByClassName("t-checkout-attr-value")[0]
					.innerHTML,
				model: document
					.getElementsByClassName("t-product-main-name")[0]
					.innerHTML.trim(),
				website: location.hostname.replace("www.", ""),
				price: document
					.getElementsByClassName("b-product-tile-price-item")[0]
					.innerHTML.trim(),
				user: document.getElementById("dwfrm_contact_email").value,
				imageURL: document
					.getElementsByClassName("b-dynamic_image_content")[0]
					.getAttribute("data-src")
					.trim(),
				payPalURL: "",
				mode: websiteMode,
				profile: result.websites.snipes.profile.profileName,
				webhookMessageSent: false,
			};
			checkoutFromStorage.lastCheckout = currentProduct;
			chrome.storage.local.set({ checkout: checkoutFromStorage });
		});
	},
	login() {
		chrome.storage.local.get(["websites"], function (result) {
			if (result.websites.snipes.profile) {
				const emailElement = document.getElementById(
						"dwfrm_profile_customer_email"
					),
					passwordElement = document.getElementById(
						"dwfrm_profile_login_password"
					),
					loginButtonElement = document.getElementsByClassName(
						"f-button f-button--medium f-button--primary f-button--full-width js-submit"
					)[0];

				emailElement.value = result.websites.snipes.profile.email;
				passwordElement.value =
					result.websites.snipes.profile.password;
				loginButtonElement.click();
			}
		});
	},
	product: {
		// checks if the product page gives 404 error
		check404() {
			if (
				!document.getElementsByClassName(
					"t-error-page-title-exp"
				)[0]
			) {
				safe.product.sizes.get();
			} else {
				// message requests.js file to ATC by request
			}
		},
		sizes: {
			anySelected: false,
			selectedNumber: undefined,
			list: [],
			available: {
				list: [],
				numbers: [],
			},
			soldOut: [],
			classValues: {
				orderable: "b-swatch-value--orderable",
				soldOut: "b-swatch-value--sold-out",
				selected: "b-swatch-value--selected",
			},
			attribute: "data-attr-value",
			get() {
				const sizeQuerySelectorValues =
					document.querySelectorAll("[data-attr-value]");

				if (
					sizeQuerySelectorValues.length === 1 &&
					document.getElementsByClassName(
						"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
					)[0].disabled === false
				) {
					safe.product.addToCart("safe");
				}

				sizeQuerySelectorValues.forEach((size) => {
					if (size.className.includes("b-size-value")) {
						safe.product.sizes.list.push(size);
					}
				});
				this.checkSelected();
			},
			checkSelected() {
				this.list.forEach((size) => {
					if (
						size.className.includes(this.classValues.selected)
					) {
						this.anySelected = true;
						return;
					}
				});
				if (this.anySelected === true) {
					safe.product.addToCart("safe");
				} else {
					this.checkAvailability();
				}
			},
			checkAvailability() {
				safe.product.sizes.list.forEach((size) => {
					if (
						size.className.includes(
							safe.product.sizes.classValues.orderable
						) &&
						!size.className.includes(
							safe.product.sizes.classValues.soldOut
						)
					) {
						safe.product.sizes.available.list.push(size);
					} else {
						safe.product.sizes.soldOut.push(size);
					}
				});
				this.getNumber();
			},
			getNumber() {
				safe.product.sizes.available.list.forEach((size) => {
					safe.product.sizes.available.numbers.push(
						size.getAttribute(safe.product.sizes.attribute)
					);
				});
				this.loadSaved();
			},
			loadSaved() {
				chrome.storage.local.get(["websites"], function (result) {
					safe.product.sizes.select(
						result.websites.snipes.sizes
					);
				});
			},
			select(sizes) {
				if (safe.product.sizes.available.list.length > 0) {
					if (!sizes.length > 0) {
						("No preferred sizes detected, trying to select a random one.");
						safe.product.sizes.available.list[0].click();
						safe.product.addToCart("safe");
					} else {
						let success = false;
						sizes.forEach((size) => {
							if (
								safe.product.sizes.available.numbers.includes(
									size.toString()
								) &&
								success === false
							) {
								safe.product.sizes.available.list.forEach(
									(sizeElement) => {
										if (
											sizeElement.getAttribute(
												"data-attr-value"
											) === size.toString()
										) {
											sizeElement.click();
											safe.product.sizes.selectedNumber =
												size;
											success = true;
											return;
										}
									}
								);
							}
						});
						if (success === false) {
							safe.product.sizes.available.list[0].click();
						}
						safe.product.addToCart("safe");
					}
				}
			},
		},
		addToCart(mode) {
			let added = false;

			chrome.runtime.onMessage.addListener(
				(message, sender, sendResponse) => {
					if (
						message.request.url.includes("snipes.") &&
						message.request.url.includes("Cart-AddProduct") &&
						message.request.statusCode < 400
					) {
						added = true;
					}
				}
			);

			ATCButtonClick = setInterval(function () {
				const ATCButtonElement = document.getElementsByClassName(
					"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
				)[0];
				if (!ATCButtonElement.disabled && added != true) {
					ATCButtonElement.click();
				} else if (added == true) {
					if (mode === "safe") {
						safe.checkout.redirect();
					} else if (mode === "requests") {
						requests.checkout.shipping();
					}
					clearInterval(ATCButtonClick);
				}
			}, 300);
		},
	},
	cart: {
		deleteItem() {
			const deleteItemButtonElement =
				document.getElementsByClassName("i-trash")[0];
			const deleteConfirmationButton = document.getElementsByClassName(
				"f-cart-remove-btn js-remove-confirmation-action f-button f-button--primary"
			)[0];
			deleteItemButtonElement.click();
			deleteConfirmationButton.click();
			chrome.storage.local.get(["settings"], function (result) {
				var oldSettings = result.settings;
				oldSettings.features.preCart.generated = true;
				chrome.storage.local.set({ settings: oldSettings });
			});
		},
	},
	checkout: {
		redirect() {
			chrome.storage.local.get(["settings"], function (result) {
				if (result.settings.features.preCart.generated !== true) {
					location.replace(
						location
							.toString()
							.slice(
								0,
								location.toString().indexOf("/p/")
							) + paths.checkout.path
					);
				} else {
					location.replace(
						location
							.toString()
							.slice(
								0,
								location.toString().indexOf("/p/")
							) + paths.checkout.placeOrder
					);
				}
			});
		},
		shipping() {
			chrome.runtime.onMessage.addListener(
				(message, sender, sendResponse) => {
					if (
						message.request.url.includes("snipes.") &&
						message.request.url.includes("SubmitShipping") &&
						message.request.statusCode < 400
					) {
						safe.checkout.payment();
						safe.checkout.placeOrder();
					}
				}
			);
			if (
				document.getElementsByClassName(
					"b-shipment-selector js-home-delivery-tab"
				).length > 0
			) {
				if (
					document.getElementById(
						"dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress"
					).value !== true
				) {
					document
						.getElementById(
							"dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress"
						)
						.click();
				}
				document
					.getElementsByClassName(
						"f-button f-button--primary f-button--medium a-checkout-step-submit f-button--full-width js-checkout-step-submit"
					)[0]
					.click();
			} else {
				chrome.torage.local.get(["profiles"], function (result) {
					const selectedProfile = result.websites.snipes.profile;
					document
						.querySelectorAll('[data-value="Herr"]')[0]
						.click();
					document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_firstName"
					).value = selectedProfile.name;
					document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_lastName"
					).value = selectedProfile.lastName;
					document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_postalCode"
					).value = selectedProfile.zipCode;
					document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_city"
					).value = selectedProfile.city;
					document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_street"
					).value = selectedProfile.street;
					document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_suite"
					).value = selectedProfile.streetNumber;
					getElementById("dwfrm_contact_email").value =
						selectedProfile.email;
					document.getElementById("dwfrm_contact_phone").value =
						selectedProfile.phone;
				});
			}

		},
		payment() {
			document.getElementById("paymentMethod_Paypal").click();
			document.getElementById("paymentMethod_Paypal").checked = true;

			var retryPaymentButtonClick = setInterval(function () {
				if (location.toString().includes(paths.checkout.payment)) {
					document
						.querySelector("[value='submit-payment']")
						.click();
				}
			}, 300);

			chrome.runtime.onMessage.addListener(
				(message, sender, sendResponse) => {
					if (
						message.request.url.includes("snipes.") &&
						message.request.url.includes("SubmitPayment") &&
						message.request.statusCode < 400
					) {
						clearInterval(retryPaymentButtonClick);
						safe.checkout.placeOrder();
					}
				}
			);
		},
		placeOrder() {
			const placeOrderButtonClick = setInterval(function () {
				document.querySelector("[value='place-order']").click();
			}, 300);

			chrome.runtime.onMessage.addListener(
				(message, sender, sendResponse) => {
					if (
						message.request.url.includes("snipes.") &&
						message.request.url.includes("PlaceOrder")
					) {
						if (message.request.statusCode === 429) {
							clearInterval(placeOrderButtonClick);
							window.open(
								location
									.toString()
									.slice(
										0,
										location
											.toString()
											.indexOf("/checkout")
									) + paths.cart
							);
						}
					}
				}
			);
		},
	},
};

const requests = {
	regionData: {
		snipesRegion: "",
		snipesRegion2: "",
		dwRegion: "",
		delivery: "",
		sizeAttrClassname: "",
	},
	urlCheck() {
		url = location.toString();
		if (url.includes(paths.login) || url.includes(paths.checkout.login)) {
			global.waitForDOM(safe.login);
		} else if (url.includes(paths.cart)) {
			chrome.storage.local.get(["settings"], function (result) {
				if (result.settings.features.preCart.generating === true) {
					global.waitForDOM(requests.cart.deleteItem);
				}
			});
		} // else if (url.includes(paths.ATC)) {
		// 	global.waitForDOM();
		//}
		else if (url.includes(paths.product)) {
			global.waitForDOM(requests.product.check404);
		} else if (url.includes(paths.checkout.path)) {
			requests.checkRegion();
			// global.waitForDOM(safe.saveItemInfo);
			// if (url.toString().includes(paths.checkout.shipping)) {
			requests.checkout.shipping.process();
			// 	} else if (url.toString().includes(paths.checkout.payment)) {
			// 		global.waitForDOM(checkout.payment);
		}
	},
	checkRegion() {
		if (url.includes(".es")) {
			requests.regionData.snipesRegion = ".es";
			requests.regionData.snipesRegion2 = "es_ES";
			requests.regionData.dwRegion = "Sites-snse-SOUTH-Site";
			requests.regionData.delivery = "home_delivery_es";
			requests.regionData.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".com")) {
			requests.regionData.snipesRegion = ".com";
			requests.regionData.snipesRegion2 = "de_DE";
			requests.regionData.dwRegion = "Sites-snse-DE-AT-Site";
			requests.regionData.delivery = "home_delivery";
			requests.regionData.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".at")) {
			requests.regionData.snipesRegion = ".at";
			requests.regionData.snipesRegion2 = "de_AT";
			requests.regionData.dwRegion = "Sites-snse-DE-AT-Site";
			requests.regionData.delivery = "home_delivery_at";
			requests.regionData.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".nl")) {
			requests.regionData.snipesRegion = ".nl";
			requests.regionData.snipesRegion2 = "nl_NL";
			requests.regionData.dwRegion = "Sites-snse-NL-BE-Site";
			requests.regionData.delivery = "home_delivery_nl";
			requests.regionData.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".fr")) {
			requests.regionData.snipesRegion = ".fr";
			requests.regionData.snipesRegion = "fr_FR";
			requests.regionData.dwRegion = "Sites-snse-FR-Site";
			requests.regionData.delivery = "home_delivery_fr";
			requests.regionData.sizeAttrClassname = "talla Talla-";
		} else if (url.includes(".it")) {
			requests.regionData.snipesRegion = ".it";
			requests.regionData.snipesRegion2 = "it_IT";
			requests.regionData.dwRegion = "Sites-snse-SOUTH-Site";
			requests.regionData.delivery = "home_delivery_it";
			requests.regionData.sizeAttrClassname = "taglia Taglia-";
		} else if (url.includes(".be")) {
			requests.regionData.snipesRegion = ".be";
			requests.regionData.snipesRegion2 = "nl_BE";
			requests.regionData.dwRegion = "Sites-snse-NL-BE-Site";
			requests.regionData.delivery = "home_delivery_be";
			requests.regionData.sizeAttrClassname = "talla Talla-";
		}
	},
	generateCSRF(callback) {
		this.checkRegion();
		fetch(
			`https://www.snipes${requests.regionData.snipesRegion}/on/demandware.store/${requests.regionData.dwRegion}/${requests.regionData.snipesRegion2}/CSRF-Generate?format=ajax`,
			{
				headers: {
					accept: "application/json, text/javascript, */*; q=0.01",
					"accept-language": "en,ca;q=0.9,es;q=0.8",
					"content-type":
						"application/x-www-form-urlencoded; charset=UTF-8",
					"sec-ch-ua":
						'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
					"sec-ch-ua-mobile": "?0",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-requested-with": "XMLHttpRequest",
				},
				referrer:
					"https://www.snipes.es/checkout?registration=false",
				referrerPolicy: "strict-origin-when-cross-origin",
				body: null,
				method: "POST",
				mode: "cors",
				credentials: "include",
			}
		)
			.then((response) => response.json())
			.then((data) => {

				requests.checkout.CSRFtoken = data.csrf.token;
				callback();
			});
	},
	saveItemInfo(itemInfo, itemImage, itemURL) {

		let user = "";
		chrome.storage.local.get(["websites"], function (result) {
			user = result.websites.solebox.profile.email;
		});
		chrome.storage.local.get(["checkout", "websites"], function (result) {
			let checkoutFromStorage = result.checkout;
			let currentProduct = {
				brand: itemInfo.brand,
				size: itemInfo.variant,
				model: itemInfo.name,
				website: location.hostname.replace("www.", ""),
				price: itemInfo.price.replace(".", ",").concat(" €"),
				user: user,
				imageURL: itemImage,
				itemPageURL: itemURL,
				payPalURL: "",
				mode: "REQUESTS",
				profile: result.websites.solebox.profile.profileName,
				webhookMessageSent: false,
			};
			checkoutFromStorage.lastCheckout = currentProduct;
			chrome.storage.local.set({ checkout: checkoutFromStorage });
		});
	},
	login() {
		const CSRFtoken = document.querySelector("[name='csrf_token']").value;
		fetch(
			"https://www.solebox.com/de_DE/authentication?rurl=1&format=ajax",
			{
				headers: {
					accept: "application/json, text/javascript, */*; q=0.01",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"content-type":
						"application/x-www-form-urlencoded; charset=UTF-8",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-requested-with": "XMLHttpRequest",
				},
				referrer: "https://www.solebox.com/de_DE/login",
				referrerPolicy: "strict-origin-when-cross-origin",
				body: `dbcfb2dbe33eb14ecce6771cf1e21ceb=4af91e1b5234aa5c7231ba0b08e0e084&dwfrm_profile_customer_email=janmuntsiglesias%40gmail.com&dwfrm_profile_login_password=Xirimoia95&csrf_token=${CSRFtoken}`,
				method: "POST",
				mode: "cors",
				credentials: "include",
			}
		)
	},
	product: {

		check404() {
			if (
				!document.getElementsByClassName(
					"t-error-page-title-exp"
				)[0]
			) {
				requests.product.sizes.get();
			} else {

			}
		},
		sizes: {
			anySelected: false,
			selectedNumber: undefined,
			list: [],
			available: {
				list: [],
				numbers: [],
			},
			soldOut: [],
			classValues: {
				orderable: "b-swatch-value--orderable",
				soldOut: "b-swatch-value--sold-out",
				selected: "b-swatch-value--selected",
			},
			attribute: "data-attr-value",
			get() {
				const sizeQuerySelectorValues =
					document.querySelectorAll("[data-attr-value]");
				sizeQuerySelectorValues.forEach((size) => {
					if (size.className.includes("b-size-value")) {
						safe.product.sizes.list.push(size);
					}
				});
				this.checkSelected();
			},
			checkSelected() {
				this.list.forEach((size) => {
					if (
						size.className.includes(this.classValues.selected)
					) {
						this.anySelected = true;
						return;
					}
				});
				if (this.anySelected === true) {
					safe.product.addToCart("requests");
				} else {
					this.checkAvailability();
				}
			},
			checkAvailability() {
				safe.product.sizes.list.forEach((size) => {
					if (
						size.className.includes(
							safe.product.sizes.classValues.orderable
						) &&
						!size.className.includes(
							safe.product.sizes.classValues.soldOut
						)
					) {
						safe.product.sizes.available.list.push(size);
					} else {
						safe.product.sizes.soldOut.push(size);
					}
				});
				this.getNumber();
			},
			getNumber() {
				safe.product.sizes.available.list.forEach((size) => {
					safe.product.sizes.available.numbers.push(
						size.getAttribute(safe.product.sizes.attribute)
					);
				});

				this.loadSaved();
			},
			loadSaved() {
				chrome.storage.local.get(["websites"], function (result) {
					safe.product.sizes.select(
						result.websites.snipes.sizes
					);
				});
			},
			select(sizes) {
				if (safe.product.sizes.available.list.length > 0) {

					if (!sizes.length > 0) {
						("No preferred sizes detected, trying to select a random one.");
						safe.product.sizes.available.list[0].click();
					} else {

						let success = false;
						sizes.forEach((size) => {
							if (
								safe.product.sizes.available.numbers.includes(
									size.toString()
								) &&
								success === false
							) {

								safe.product.sizes.available.list.forEach(
									(sizeElement) => {

										if (
											sizeElement.getAttribute(
												"data-attr-value"
											) === size.toString()
										) {
											sizeElement.click();
											safe.product.sizes.selectedNumber =
												size;
											success = true;
											return;
										}
									}
								);
							}
						});
						if (success === false) {

							safe.product.sizes.available.list[0].click();
						}
						safe.product.addToCart("requests");
					}
				}
			},
		},
		addToCart(pid) {
			fetch("https://www.solebox.com/de_DE/add-product?format=ajax", {
				headers: {
					accept: "application/json, text/javascript, */*; q=0.01",
					"accept-language": "en,ca;q=0.9,es;q=0.8",
					"content-type":
						"application/x-www-form-urlencoded; charset=UTF-8",
					"sec-ch-ua":
						'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
					"sec-ch-ua-mobile": "?0",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-requested-with": "XMLHttpRequest",
				},
				referrer: location.toString(),
				referrerPolicy: "strict-origin-when-cross-origin",
				body: `${pid}&quantity=1`,
				method: "POST",
				mode: "cors",
				credentials: "include",
			})
				.then(function (response) {
					return response.json();
				})
				.then(function (data) {
				})
				.then(() => {
					if (error != true) {
						snipes.startCheckout();
					} else {
						console.log(
							"Error while adding to cart: " + errorMessage
						);
					}
				});
		},
	},
	cart: {
		deleteItem(pid) {
			fetch(
				`https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/Cart-RemoveProductLineItem?format=ajax&pid=0190033300000010&uuid=${uuid}`,
				{
					headers: {
						accept: "application/json, text/javascript, */*; q=0.01",
						"accept-language": "en,ca;q=0.9,es;q=0.8",
						"content-type": "application/json",
						"sec-ch-ua":
							'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
						"sec-ch-ua-mobile": "?0",
						"sec-fetch-dest": "empty",
						"sec-fetch-mode": "cors",
						"sec-fetch-site": "same-origin",
						"x-requested-with": "XMLHttpRequest",
					},
					referrer: "https://www.solebox.com/de_DE/cart",
					referrerPolicy: "strict-origin-when-cross-origin",
					body: null,
					method: "GET",
					mode: "cors",
					credentials: "include",
				}
			);
		},
	},
	checkout: {
		CSRFtoken: "",
		redirect() {
			chrome.storage.local.get(["settings"], function (result) {
				if (result.settings.features.preCart.generated !== true) {
					location.replace(
						location
							.toString()
							.slice(
								0,
								location.toString().indexOf("/p/")
							) + paths.checkout.path
					);
				} else {
					location.replace(
						location
							.toString()
							.slice(
								0,
								location.toString().indexOf("/p/")
							) + paths.checkout.placeOrder
					);
				}
			});
		},
		shipping: {
			submitted: false,
			address: { shippingAddress: {}, ID: "" },
			shipUUID: "",
			process() {
				requests.generateCSRF(
					requests.checkout.shipping.getAddressID
				);
			},
			getAddressID() {
				requests.checkRegion();
				fetch(
					`https://www.snipes${requests.regionData.snipesRegion}/on/demandware.store/${requests.regionData.dwRegion}/${requests.regionData.snipesRegion2}/CheckoutShippingServices-SelectShippingMethod?format=ajax`,
					{
						headers: {
							accept: "application/json, text/javascript, */*; q=0.01",
							"accept-language":
								"en-GB,en-US;q=0.9,en;q=0.8",
							"content-type":
								"application/x-www-form-urlencoded; charset=UTF-8",
							"sec-fetch-dest": "empty",
							"sec-fetch-mode": "cors",
							"sec-fetch-site": "same-origin",
							"x-requested-with": "XMLHttpRequest",
						},
						referrer:
							"https://www.snipes.es/checkout?stage=shipping",
						referrerPolicy: "strict-origin-when-cross-origin",
						body: `methodID=${requests.regionData.delivery}&shipmentUUID`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {

						requests.checkout.shipping.shipUUID =
							data.order.shipping.UUID;
						requests.checkout.shipping.address.shippingAddress =
							data.order.shipping.shippingAddress;
						requests.generateCSRF(
							requests.checkout.shipping.submit
						);
						requests.saveItemInfo(
							data.order.items.items[0].gtm,
							data.order.items.items[0].images[0].pdp.srcD,
							data.order.items.items[0].urls.pdp
						);
					});
			},
			submit() {
				fetch(
					`https://www.snipes${requests.regionData.snipesRegion}/on/demandware.store/${requests.regionData.dwRegion}/${requests.regionData.snipesRegion2}/CheckoutShippingServices-SubmitShipping?format=ajax`,
					{
						headers: {
							accept: "application/json, text/javascript, */*; q=0.01",
							"accept-language": "en,ca;q=0.9,es;q=0.8",
							"content-type":
								"application/x-www-form-urlencoded; charset=UTF-8",
							"sec-ch-ua":
								'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
							"sec-ch-ua-mobile": "?0",
							"sec-fetch-dest": "empty",
							"sec-fetch-mode": "cors",
							"sec-fetch-site": "same-origin",
							"x-requested-with": "XMLHttpRequest",
						},
						referrer:
							"https://www.snipes.es/checkout?stage=shipping",
						referrerPolicy: "strict-origin-when-cross-origin",
						body: `originalShipmentUUID=${requests.checkout.shipping.shipUUID}&shipmentUUID=${requests.checkout.shipping.shipUUID}&csrf_token=${requests.checkout.CSRFtoken}`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {

						requests.checkout.payment.submit();
					});
			},
		},
		payment: {
			submitted: false,
			submit() {
				fetch(
					`https://www.snipes${requests.regionData.snipesRegion}/on/demandware.store/${requests.regionData.dwRegion}/${requests.regionData.snipesRegion2}/CheckoutServices-SubmitPayment?format=ajax`,
					{
						headers: {
							accept: "application/json, text/javascript, */*; q=0.01",
							"accept-language": "en,ca;q=0.9,es;q=0.8",
							"content-type":
								"application/x-www-form-urlencoded; charset=UTF-8",
							"sec-ch-ua":
								'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
							"sec-ch-ua-mobile": "?0",
							"sec-fetch-dest": "empty",
							"sec-fetch-mode": "cors",
							"sec-fetch-site": "same-origin",
							"x-requested-with": "XMLHttpRequest",
						},
						referrer:
							"https://www.snipes.es/checkout?stage=payment",
						referrerPolicy: "strict-origin-when-cross-origin",
						body: `dwfrm_billing_paymentMethod=Paypal&dwfrm_giftCard_cardNumber=&dwfrm_giftCard_pin=&csrf_token=${requests.checkout.CSRFtoken}`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then(function (data) {
						if (data.status > 400) {
							requests.checkout.payment.submit();
						}
						requests.checkout.payment.submitted = true;
						requests.checkout.placeOrder.submit();
					});
			},
		},
		placeOrder: {
			submitted: false,
			submit() {
				fetch(
					`https://www.snipes${requests.regionData.snipesRegion}/on/demandware.store/${requests.regionData.dwRegion}/${requests.regionData.snipesRegion2}/CheckoutServices-PlaceOrder?format=ajax`,
					{
						headers: {
							accept: "application/json, text/javascript, */*; q=0.01",
							"accept-language": "en,ca;q=0.9,es;q=0.8",
							"content-type":
								"application/x-www-form-urlencoded; charset=UTF-8",
							"sec-ch-ua":
								'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
							"sec-ch-ua-mobile": "?0",
							"sec-fetch-dest": "empty",
							"sec-fetch-mode": "cors",
							"sec-fetch-site": "same-origin",
							"x-requested-with": "XMLHttpRequest",
						},
						referrer:
							"https://www.snipes.es/checkout?stage=placeOrder",
						referrerPolicy: "strict-origin-when-cross-origin",
						body: null,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {
						if (data.continueUrl) {
							window.open(data.continueUrl);
						}
					});
			},
		},
	},
};
