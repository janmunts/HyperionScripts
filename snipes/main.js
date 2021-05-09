// check user authentication, extension activity and website mode.
chrome.storage.local.get(
	["initialized", "active", "account", "websites"],
	function (result) {
		if (result.initialized === true) {
			if (result.account.discordAuth === true) {
				if (result.active === true) {
					console.log(
						"Extension active, checking selected mode."
					);
					console.log(`Hi ${result.account.discordUsername}.`);
					if (result.websites.snipes.mode === "SAFE") {
						safe.urlCheck();
						console.log("Injecting safe code...");
					} else if (
						result.websites.snipes.mode === "REQUESTS"
					) {
						requests.urlCheck();
						console.log("Injecting requests code...");
					}
				} else {
					console.log("Safe code not injected.");
				}
			} else {
				console.log(
					"Could not verify your account, go to settings to log in."
				);
			}
		} else {
			console.log(
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
	// execute callback function once DOM in loaded
	waitForDOM(callback, data) {
		// console.log("Waiting for DOM to load.");
		document.addEventListener("DOMContentLoaded", callback(data));
	},
};

var safe = {
	sizeAttrClassname: "",
	// check url and execute the corresponding function
	urlCheck() {
		url = location.toString();

		console.log("Checking url... (safe mode)");

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
			console.log("Currently in a product page.");
			global.waitForDOM(safe.product.check404);
		} else if (url.includes(paths.checkout.path)) {
			safe.checkout.checkRegion();
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
		safe.checkRegion();
		chrome.storage.local.get(["checkout"], function (result) {
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
				mode: "SAFE",
				webhookMessageSent: false,
			};
			console.log(currentProduct);
			checkoutFromStorage.lastCheckout = currentProduct;
			chrome.storage.local.set({ checkout: checkoutFromStorage });
		});
	},
	login() {
		console.log("Logging in...");
		chrome.storage.local.get(["websites"], function (result) {
			console.log("Getting login data...");
			console.log(result.websites);
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
				console.log("No error detected in this page.");
				safe.product.sizes.get();
			} else {
				console.log("Error 404 found in this product page.");
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
				const sizeQuerySelectorValues = document.querySelectorAll(
					"[data-attr-value]"
				);

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
				// console.log(safe.product.sizes.list);
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
					console.log("Size already selected.");
				} else {
					console.log("No size selected.");
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
				console
					.log
					// `Available numbers: ${safe.product.sizes.available.numbers}`
					();
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
				// console.log("Function called.");
				if (safe.product.sizes.available.list.length > 0) {
					console.log(
						"Available sizes detected, initializing select process."
					);
					if (!sizes.length > 0) {
						("No preferred sizes detected, trying to select a random one.");
						safe.product.sizes.available.list[0].click();
						safe.product.addToCart("safe");
						// console.log("Size clicked.");
					} else {
						console.log(
							"Preferred sizes found, attempting select."
						);
						let success = false;
						sizes.forEach((size) => {
							console.log(size);
							if (
								safe.product.sizes.available.numbers.includes(
									size.toString()
								) &&
								success === false
							) {
								console.log(
									"Specified size available!"
								);

								safe.product.sizes.available.list.forEach(
									(sizeElement) => {
										// console.log(sizeElement);
										// console.log(
										// 	sizeElement.getAttribute(
										// 		"data-attr-value"
										// 	)
										// );
										if (
											sizeElement.getAttribute(
												"data-attr-value"
											) === size.toString()
										) {
											sizeElement.click();
											safe.product.sizes.selectedNumber = size;
											success = true;
											return;
										}
									}
								);
							}
						});
						if (success === false) {
							console.log(
								"None of the specifies sizes were available, attempting random selext."
							);
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
					console.log(message.request);
					if (
						message.request.url.includes("snipes.") &&
						message.request.url.includes("Cart-AddProduct") &&
						message.request.statusCode < 400
					) {
						console.log("Successfully added to cart.");
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
			const deleteItemButtonElement = document.getElementsByClassName(
				"i-trash"
			)[0];
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
			console.log("Pre-cart item successfully deleted.");
		},
	},
	checkout: {
		redirect() {
			console.log("Product added to cart, redirecting to checkout.");
			chrome.storage.local.get(["settings"], function (result) {
				// console.log(result.settings.features.preCart.generated);
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
			console.log("Entering shipping info.");
			chrome.runtime.onMessage.addListener(
				(message, sender, sendResponse) => {
					if (
						message.request.url.includes("snipes.") &&
						message.request.url.includes("SubmitShipping") &&
						message.request.statusCode < 400
					) {
						console.log("Successfully submitted shipping.");
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
			// const waitForUrlChange = setInterval(function () {
			// 	console.log("Waiting for the shipping url to change.");
			// 	if (location.toString().includes(paths.checkout.payment)) {
			// 		safe.urlCheck();
			// 		clearInterval(waitForUrlChange);
			// 	}
			// }, 200);
		},
		payment() {
			console.log("Selecting payment method.");
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
						console.log("Successfully submitted payment.");
						clearInterval(retryPaymentButtonClick);
						safe.checkout.placeOrder();
					}
				}
			);
		},
		placeOrder() {
			console.log("Placing order...");
			const placeOrderButtonClick = setInterval(function () {
				document.querySelector("[value='place-order']").click();
			}, 300);

			chrome.runtime.onMessage.addListener(
				(message, sender, sendResponse) => {
					if (
						message.request.url.includes("snipes.") &&
						message.request.url.includes("PlaceOrder")
					) {
						console.log("Checkout request received.");
						if (message.request.statusCode === 429) {
							console.log(
								"Red text detected, trying to force captcha..."
							);
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

			/*
			console.log("Attempting to place order.");
			chrome.storage.local.get(["settings"], function (result) {
				if (result.settings.features.preCart.generating !== true) {
					setTimeout(function () {
						document
							.querySelector("[value='place-order']")
							.click();
					}, 2000);

					url = location.toString();

					document
						.querySelector("[value='place-order']")
						.addEventListener(
							"click",
							clearInterval(placeOrderButtonClick)
						);
					var placeOrderButtonClick = setInterval(function () {
						var warningElement = document.querySelectorAll(
							'[data-namespace="checkout.placeorder"]'
						)[0];

						if (
							warningElement.className.includes(
								"t-uniserv-notice t-uniserv-notice--error"
							)
						) {
							clearInterval(placeOrderButtonClick);
							window.open("https://www.solebox.com/cart");
						}

						document
							.querySelector("[value='place-order']")
							.click();
					}, 500);
				} else {
					location.replace("https://www.solebox.com/cart");
				}
			});*/
		},
	},
};

var requests = {
	regionData: {
		snipesRegion: "",
		snipesRegion2: "",
		dwRegion: "",
		delivery: "",
		sizeAttrClassname: "",
	},
	urlCheck() {
		url = location.toString();

		console.log("Checking url... (requests mode)");

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
			console.log("Currently in a product page.");
			global.waitForDOM(requests.product.check404);
		} else if (url.includes(paths.checkout.path)) {
			requests.checkRegion();
			global.waitForDOM(safe.saveItemInfo);
			// if (url.toString().includes(paths.checkout.shipping)) {
			global.waitForDOM(requests.checkout.shipping.process);
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
		console.log("Getting CSRF token...");
		fetch(
			`https://www.snipes${requests.regionData.snipesRegion}/on/demandware.store/${requests.regionData.dwRegion}/${requests.regionData.snipesRegion2}/CSRF-Generate?format=ajax`,
			{
				headers: {
					accept:
						"application/json, text/javascript, */*; q=0.01",
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
				// console.log(
				// 	`Successfully obtained CSRF token: ${data.csrf.token}`
				// );
				requests.checkout.CSRFtoken = data.csrf.token;
				callback();
			});
	},
	saveItemInfo() {
		chrome.storage.local.get(["checkout"], function (result) {
			let checkoutFromStorage = result.checkout;
			let currentProduct = {
				brand: document
					.getElementsByClassName("t-product-brand-name")[0]
					.innerHTML.trim(),
				size: document
					.getElementsByClassName(
						`b-item-attribute b-item-attribute--${safe.checkout.sizeAttrClassname}`
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
				mode: "REQUESTS",
				webhookMessageSent: false,
			};
			console.log(currentProduct);
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
					accept:
						"application/json, text/javascript, */*; q=0.01",
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
		).then(function (response) {
			// console.log(response);
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
				console.log("No error detected in this page.");
				requests.product.sizes.get();
			} else {
				console.log("Error 404 found in this product page.");
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
				const sizeQuerySelectorValues = document.querySelectorAll(
					"[data-attr-value]"
				);
				sizeQuerySelectorValues.forEach((size) => {
					if (size.className.includes("b-size-value")) {
						safe.product.sizes.list.push(size);
					}
				});
				// console.log(safe.product.sizes.list);
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
					console.log("Size already selected.");
				} else {
					console.log("No size selected.");
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
				// console.log(
				// 	`Available numbers: ${safe.product.sizes.available.numbers}`
				// );
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
				console.log("Function called.");
				if (safe.product.sizes.available.list.length > 0) {
					console.log(
						"Available sizes detected, initializing select process."
					);
					if (!sizes.length > 0) {
						("No preferred sizes detected, trying to select a random one.");
						safe.product.sizes.available.list[0].click();
						// console.log("Size clicked.");
					} else {
						console.log(
							"Preferred sizes found, attempting select."
						);
						let success = false;
						sizes.forEach((size) => {
							// console.log(size);
							if (
								safe.product.sizes.available.numbers.includes(
									size.toString()
								) &&
								success === false
							) {
								console.log(
									"Specified size available!"
								);

								safe.product.sizes.available.list.forEach(
									(sizeElement) => {
										// console.log(sizeElement);
										// console.log(
										// 	sizeElement.getAttribute(
										// 		"data-attr-value"
										// 	)
										// );
										if (
											sizeElement.getAttribute(
												"data-attr-value"
											) === size.toString()
										) {
											sizeElement.click();
											safe.product.sizes.selectedNumber = size;
											success = true;
											return;
										}
									}
								);
							}
						});
						if (success === false) {
							console.log(
								"None of the specifies sizes were available, attempting random selext."
							);
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
					accept:
						"application/json, text/javascript, */*; q=0.01",
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
					// console.log(data);
				})
				.then(() => {
					if (error != true) {
						console.log("Added to cart!");
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
						accept:
							"application/json, text/javascript, */*; q=0.01",
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
			console.log("Product added to cart, redirecting to checkout.");
			chrome.storage.local.get(["settings"], function (result) {
				// console.log(result.settings.features.preCart.generated);
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
			addressID: "",
			shipUUID: document.getElementsByClassName("b-shipping-header")[0]
				.dataset.shipmentUuid,
			process() {
				requests.generateCSRF(requests.checkout.shipping.select);
			},
			select() {
				fetch(
					"https://www.snipes.es/on/demandware.store/Sites-snse-SOUTH-Site/es_ES/CheckoutShippingServices-SelectShippingMethod?format=ajax",
					{
						headers: {
							accept:
								"application/json, text/javascript, */*; q=0.01",
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
						body: `methodID=${requests.regionData.delivery}&shipmentUUID=${this.shipUUID}`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				).then((response) => {
					console.log(response);
				});
			},
			validate() {
				chrome.storage.local.get(["websites"], function (result) {
					fetch(
						`https://www.snipes${requests.regionData.snipesRegion}/on/demandware.store/${requests.regionData.dwRegion}/${requests.regionData.snipesRegion2}/CheckoutAddressServices-Validate?format=ajax`,
						{
							headers: {
								accept:
									"application/json, text/javascript, */*; q=0.01",
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
							referrerPolicy:
								"strict-origin-when-cross-origin",
							body: `street=${
								result.websites.snipes.profile.street.replace(
									" ",
									"+"
								) +
								result.websites.snipes.profile.address2.replace(
									" ",
									"+"
								)
							}&houseNo=${
								result.websites.snipes.profile
									.streetNumber
							}&postalCode=${
								result.websites.snipes.profile.zipCode
							}&city=${result.websites.snipes.profile.city.replace(
								" ",
								"+"
							)}&country=${requests.regionData.snipesRegion
								.replace(".", "")
								.toUpperCase()}&csrf_token=${
								requests.checkout.CSRFtoken
							}`,
							method: "POST",
							mode: "cors",
							credentials: "include",
						}
					);
				});
			},
			getRates() {
				console.log("Getting shipping rates...");
				chrome.storage.local.get(["websites"], function (result) {
					console.log(
						"Selected profile loaded, recalculating shipping rates..."
					);
					let address2 = "";
					if (
						result.websites.snipes.profile.address2 != "" &&
						result.websites.snipes.profile.address2 !=
							undefined
					) {
						address2 = result.websites.snipes.profile.address2.replaceAll(
							" ",
							"+"
						);
					} else {
						address2 = "";
					}
					fetch(
						"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-ShippingRates?format=ajax",
						{
							headers: {
								accept:
									"application/json, text/javascript, */*; q=0.01",
								"accept-language":
									"en,ca;q=0.9,es;q=0.8",
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
								"https://www.solebox.com/en_ES/checkout?stage=shipping#shipping",
							referrerPolicy:
								"strict-origin-when-cross-origin",
							body: `selected=true&id=${
								requests.checkout.shipping.addressID
							}&addressType=${
								result.websites.snipes.profile
									.addressType
							}&snipesStore=&hermesId&postOfficeNumber=&packstationNumber=&postNumber=&postalCode=${
								result.websites.snipes.profile.zipCode
							}&countryCode=${
								result.websites.snipes.profile
									.countryCode
							}&carrierName=&suite=${
								result.websites.snipes.profile
									.streetNumber
							}&street=${result.websites.snipes.profile.street.replaceAll(
								" ",
								"+"
							)}&city=${result.websites.snipes.profile.city.replaceAll(
								" ",
								"+"
							)}&address2=${address2}}&lastName=${
								result.websites.snipes.profile.lastName
							}&firstName=${
								result.websites.snipes.profile.name
							}&title=${
								result.websites.snipes.profile.title
							}&csrf_token=${requests.checkout.CSRFtoken}`,
							method: "POST",
							mode: "cors",
							credentials: "include",
						}
					)
						.then((response) => response.json())
						.then((data) => {
							requests.checkout.shipping.shipUUID =
								data.order.shipping[0].UUID;
							// console.log(
							// 	`Shipping UUID: ${data.order.shipping[0].UUID}`
							// );
							requests.checkout.shipping.submit();
							success = data.success;
							fullResponse = data;
						});
				});
			},
			submit() {
				console.log("Submitting shipping...");
				chrome.storage.local.get(["websites"], function (result) {
					fetch(
						`https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-SubmitShipping?region=europe&country=undefined&addressId=${requests.checkout.shipping.addressID}&format=ajax`,
						{
							headers: {
								accept:
									"application/json, text/javascript, */*; q=0.01",
								"accept-language":
									"en,ca;q=0.9,es;q=0.8",
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
								"https://www.solebox.com/de_DE/checkout?stage=shipping",
							referrerPolicy:
								"strict-origin-when-cross-origin",
							body: `originalShipmentUUID=${requests.checkout.shipping.shipUUID}&shipmentUUID=${requests.checkout.shipping.shipUUID}&dwfrm_shipping_shippingAddress_shippingMethodID=home-delivery_europe&address-selector=${requests.checkout.shipping.addressID}&dwfrm_shipping_shippingAddress_addressFields_title=${result.websites.snipes.profile.title}&dwfrm_shipping_shippingAddress_addressFields_firstName=${result.websites.snipes.profile.name}&dwfrm_shipping_shippingAddress_addressFields_lastName=${result.websites.snipes.profile.lastName}&dwfrm_shipping_shippingAddress_addressFields_postalCode=${result.websites.snipes.profile.zipCode}&dwfrm_shipping_shippingAddress_addressFields_city=${result.websites.snipes.profile.city}&dwfrm_shipping_shippingAddress_addressFields_street=${result.websites.snipes.profile.street}&dwfrm_shipping_shippingAddress_addressFields_suite=${result.websites.snipes.profile.streetNumber}&dwfrm_shipping_shippingAddress_addressFields_address1=${result.websites.snipes.profile.street}&dwfrm_shipping_shippingAddress_addressFields_address2=${result.websites.snipes.profile.address2}&dwfrm_shipping_shippingAddress_addressFields_phone=${result.websites.snipes.profile.phone}&dwfrm_shipping_shippingAddress_addressFields_countryCode=${result.websites.snipes.profile.countryCode}&serviceShippingMethod=ups-standard&dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress=true&dwfrm_billing_billingAddress_addressFields_title=${result.websites.snipes.profile.title}&dwfrm_billing_billingAddress_addressFields_firstName=${result.websites.snipes.profile.name}&dwfrm_billing_billingAddress_addressFields_lastName=${result.websites.snipes.profile.lastName}&dwfrm_billing_billingAddress_addressFields_postalCode=${result.websites.snipes.profile.zipCode}&dwfrm_billing_billingAddress_addressFields_city=${result.websites.snipes.profile.city}&dwfrm_billing_billingAddress_addressFields_street=${result.websites.snipes.profile.street}&dwfrm_billing_billingAddress_addressFields_suite=${result.websites.snipes.profile.streetNumber}&dwfrm_billing_billingAddress_addressFields_address1=${result.websites.snipes.profile.streetNumber}&dwfrm_billing_billingAddress_addressFields_address2=${result.websites.snipes.profile.address2}&dwfrm_billing_billingAddress_addressFields_countryCode=${result.websites.snipes.profile.countryCode}&dwfrm_billing_billingAddress_addressFields_phone=${result.websites.snipes.profile.phone}&dwfrm_contact_email=${result.websites.snipes.profile.email}&dwfrm_contact_phone=${result.websites.snipes.profile.phone}&csrf_token=${requests.checkout.CSRFtoken}`,
							method: "POST",
							mode: "cors",
							credentials: "include",
						}
					).then(function (response) {
						// console.log(response);
						if (response.status === 200) {
							console.log(
								"Shipping submited successfully."
							);
							requests.checkout.shipping.submitted = true;
							requests.checkout.payment.submit();
						}
					});
				});
			},
		},
		payment: {
			submitted: false,
			submit() {
				console.log("Submitting payment method...");
				fetch(
					"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutServices-SubmitPayment?format=ajax",
					{
						headers: {
							accept:
								"application/json, text/javascript, */*; q=0.01",
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
							"https://www.solebox.com/de_DE/checkout?stage=payment",
						referrerPolicy: "strict-origin-when-cross-origin",
						body: `dwfrm_billing_paymentMethod=Paypal&csrf_token=${requests.checkout.CSRFtoken}`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				).then(function (response) {
					console.log(response);
					if (response.status === 200) {
						console.log("Payment submited successfully.");
						requests.checkout.payment.submitted = true;
						requests.checkout.placeOrder.submit();
					}
				});
			},
		},
		placeOrder: {
			submitted: false,
			submit() {
				fetch(
					"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutServices-PlaceOrder?format=ajax",
					{
						headers: {
							accept:
								"application/json, text/javascript, */*; q=0.01",
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
							"https://www.solebox.com/de_DE/checkout?stage=placeOrder",
						referrerPolicy: "strict-origin-when-cross-origin",
						body: null,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {
						// console.log(data);
						redText = data.error;
						if (redText != true) {
							window.open(data.continueUrl);
							console.log(
								"Successful checkout! Dont forget to pay your order"
							);
						} else {
							console.log(
								"Red Text Error - Please solve the captcha in the popup window"
							);
							window.open(
								`https://www.solebox.com/checkout?stage=placeOrder#placeOrder`
							);
						}
					});
			},
		},
	},
};
