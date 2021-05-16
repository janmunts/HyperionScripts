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
					if (result.websites.solebox.mode === "SAFE") {
						safe.urlCheck();
					} else if (
						result.websites.solebox.mode === "REQUESTS"
					) {
						requests.urlCheck();
					}
				} else {
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
	saveItemInfo() {
		chrome.storage.local.get(["checkout", "websites"], function (result) {
			let checkoutFromStorage = result.checkout;
			let currentProduct = {
				brand: document
					.getElementsByClassName("t-product-brand-name")[0]
					.innerHTML.trim(),
				size: document
					.getElementsByClassName(
						"b-item-attribute b-item-attribute--size Size-"
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
				profile: result.websites.solebox.profile.profileName,
				webhookMessageSent: false,
			};
			checkoutFromStorage.lastCheckout = currentProduct;
			chrome.storage.local.set({ checkout: checkoutFromStorage });
		});
	},
	login() {
		chrome.storage.local.get(["websites"], function (result) {
			if (result.websites.solebox.profile) {
				const emailElement = document.getElementById(
						"dwfrm_profile_customer_email"
					),
					passwordElement = document.getElementById(
						"dwfrm_profile_login_password"
					),
					loginButtonElement = document.getElementsByClassName(
						"f-button f-button--medium f-button--primary f-button--full-width js-submit"
					)[0];

				emailElement.value = result.websites.solebox.profile.email;
				passwordElement.value =
					result.websites.solebox.profile.password;
				loginButtonElement.click();
			}
		});
	},
	product: {
		check404() {
			if (
				!document.getElementsByClassName(
					"t-error-page-title-exp"
				)[0]
			) {
				safe.product.sizes.get();
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
					console.log("Adding to cart safe");
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
					console.log("Adding to cart safe");
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
						result.websites.solebox.sizes
					);
				});
			},
			select(sizes) {
				if (safe.product.sizes.available.list.length > 0) {
					if (!sizes.length > 0) {
						("No preferred sizes detected, trying to select a random one.");
						safe.product.sizes.available.list[0].click();
						safe.product.addToCart("safe");
						console.log("Adding to cart safe");
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
							safe.product.addToCart("safe");
							console.log("Adding to cart safe");
						} else {
							safe.product.addToCart("safe");
							console.log("Adding to cart safe");
						}
					}
				}
			},
		},
		addToCart(mode) {
			console.log("Adding to cart: " + mode);
			chrome.runtime.onMessage.addListener(
				(message, sender, sendResponse) => {
					if (
						message.request.url.includes("solebox.com") &&
						message.request.url.includes("add-product") &&
						message.request.statusCode < 400
					) {
						added = true;
						clearInterval(ATCButtonClick);

						if (mode === "safe") {
							console.log("Redirecting...");
							safe.checkout.redirect();
						} else if (mode === "requests") {
							console.log("Executing checkout process...");
							requests.checkout.redirect();
							// requests.checkout.shipping.process();
						}
					}
				}
			);
			const ATCButtonClick = setInterval(function () {
				document
					.getElementsByClassName(
						"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
					)[0]
					.click();
			}, 500);
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
						message.request.url.includes("solebox.com") &&
						message.request.url.includes("shipping") &&
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
					const selectedProfile =
						result.websites.solebox.profile;
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
						message.request.url.includes("solebox.com") &&
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
			}, 500);

			chrome.runtime.onMessage.addListener(
				(message, sender, sendResponse) => {
					if (
						message.request.url.includes("solebox.") &&
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
		} else if (url.includes(paths.product)) {
			global.waitForDOM(requests.product.check404);
		} else if (url.includes(paths.checkout.path)) {
			// global.waitForDOM(safe.saveItemInfo);
			global.waitForDOM(requests.checkout.shipping.process);
		}
	},
	generateCSRF(callback) {
		fetch(
			"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CSRF-Generate?format=ajax",
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
					"https://www.solebox.com/de_DE/checkout?registration=false",
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
	},
	product: {
		check404() {
			if (
				document.getElementsByClassName("t-error-page-title-exp")[0]
			) {
				requests.product.addToCart(404);
				console.log("404 detected.");
			} else {
				requests.product.addToCart();
				console.log("404 not detected.");
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
			select() {
				const sizeQuerySelectorValues =
					document.querySelectorAll("[data-attr-value]");
				sizeQuerySelectorValues.forEach((size) => {
					if (size.className.includes("b-size-value")) {
						safe.product.sizes.list.push(size);
					}
				});

				this.list.forEach((size) => {
					if (
						size.className.includes(
							"b-swatch-value--selected"
						)
					) {
						this.anySelected = true;
						return;
					}
				});
				if (this.anySelected === true) {
					safe.product.addToCart("requests");
				} else {
					safe.product.sizes.list.forEach((size) => {
						if (
							size.className.includes(
								"b-swatch-value--orderable"
							) &&
							!size.className.includes(
								"b-swatch-value--sold-out"
							)
						) {
							safe.product.sizes.available.list.push(size);
						} else {
							safe.product.sizes.soldOut.push(size);
						}
					});
					safe.product.sizes.available.list.forEach((size) => {
						safe.product.sizes.available.numbers.push(
							size.getAttribute("data-attr-value")
						);
					});
					chrome.storage.local.get(
						["websites"],
						function (result) {
							const sizes = result.websites.solebox.sizes;
							if (
								safe.product.sizes.available.list
									.length > 0
							) {
								if (!sizes.length > 0) {
									("No preferred sizes detected, trying to select a random one.");
									safe.product.sizes.available.list[0].click();
									safe.product.addToCart("requests");
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
														) ===
														size.toString()
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
						}
					);
				}
			},
		},
		addToCart(page) {
			let pid = location
				.toString()
				.slice(
					location.toString().lastIndexOf("-") + 1,
					location.toString().lastIndexOf(".")
				);

			if (pid.length > 8) {
				fetch(
					"https://www.solebox.com/de_DE/add-product?format=ajax",
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
						referrer: location.toString(),
						referrerPolicy: "strict-origin-when-cross-origin",
						body: `pid=${pid}&quantity=1`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {
						if (!data.error) {
							requests.checkout.fullProcess();
						}
					});
			} else if (page !== 404) {
				requests.product.sizes.select();
			}
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
		fullProcess() {},
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
			addressID: "",
			shipUUID: "",
			customerProfile: {},
			process() {
				requests.generateCSRF(
					requests.checkout.shipping.getaddressID
				);
			},
			getaddressID() {
				fetch(
					"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-SelectShippingMethod?format=ajax",
					{
						headers: {
							accept: "application/json, text/javascript, */*; q=0.01",
							"accept-language":
								"en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ja-FR;q=0.6,ja;q=0.5",
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
							"https://www.solebox.com/de_DE/checkout",
						referrerPolicy: "strict-origin-when-cross-origin",
						body: "methodID=home-delivery&shipmentUUID=",
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {
						console.log(data);
						requests.checkout.shipping.customerProfile = {
							...data.customer.preferredAddress,
							...data.customer.profile,
						};
						console.log(
							requests.checkout.shipping.customerProfile
						);
						if (data.customer) {
							requests.checkout.shipping.addressID =
								data.customer.addresses[0].addressId;
							requests.checkout.shipping.getRates();
						}
						requests.saveItemInfo(
							data.order.items.items[0].gtm,
							data.order.items.items[0].images[0].pdp.srcD,
							data.order.items.items[0].urls.pdp
						);
					});
			},
			getRates() {
				chrome.storage.local.get(["websites"], function (result) {
					let address2 = "";
					if (
						result.websites.solebox.profile.address2 != "" &&
						result.websites.solebox.profile.address2 !=
							undefined
					) {
						address2 =
							result.websites.solebox.profile.address2.replaceAll(
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
								accept: "application/json, text/javascript, */*; q=0.01",
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
							body: `selected=true&id=${requests.checkout.shipping.addressID}&dwfrm_shipping_shippingAddress_shippingMethodID=home-delivery_europe&address-selector=${requests.checkout.shipping.addressID}&dwfrm_shipping_shippingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_shipping_shippingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_shipping_shippingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_shipping_shippingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_shipping_shippingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_shipping_shippingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_shipping_shippingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_shipping_shippingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_shipping_shippingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_shipping_shippingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_shipping_shippingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&serviceShippingMethod=ups-standard&dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress=true&dwfrm_billing_billingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_billing_billingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_billing_billingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_billing_billingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_billing_billingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_billing_billingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_billing_billingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_billing_billingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_billing_billingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_billing_billingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&dwfrm_billing_billingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_contact_email=${requests.checkout.shipping.customerProfile.email}&dwfrm_contact_phone=${requests.checkout.shipping.customerProfile.phone}&csrf_token=${requests.checkout.CSRFtoken}`,
							method: "POST",
							mode: "cors",
							credentials: "include",
						}
					)
						.then((response) => response.json())
						.then((data) => {
							console.log(data);

							requests.checkout.shipping.shipUUID =
								data.order.shipping[0].UUID;
							requests.checkout.shipping.submit();
							success = data.success;
							fullResponse = data;
						});
				});
			},
			submit() {
				chrome.storage.local.get(["websites"], function (result) {
					fetch(
						`https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-SubmitShipping?region=europe&country=undefined&addressId=${requests.checkout.shipping.addressID}&format=ajax`,
						{
							headers: {
								accept: "application/json, text/javascript, */*; q=0.01",
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
							body: `originalShipmentUUID=${requests.checkout.shipping.shipUUID}&shipmentUUID=${requests.checkout.shipping.shipUUID}&dwfrm_shipping_shippingAddress_shippingMethodID=home-delivery_europe&address-selector=${requests.checkout.shipping.addressID}&dwfrm_shipping_shippingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_shipping_shippingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_shipping_shippingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_shipping_shippingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_shipping_shippingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_shipping_shippingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_shipping_shippingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_shipping_shippingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_shipping_shippingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_shipping_shippingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_shipping_shippingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&serviceShippingMethod=ups-standard&dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress=true&dwfrm_billing_billingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_billing_billingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_billing_billingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_billing_billingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_billing_billingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_billing_billingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_billing_billingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_billing_billingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_billing_billingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_billing_billingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&dwfrm_billing_billingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_contact_email=${requests.checkout.shipping.customerProfile.email}&dwfrm_contact_phone=${requests.checkout.shipping.customerProfile.phone}&csrf_token=${requests.checkout.CSRFtoken}`,
							method: "POST",
							mode: "cors",
							credentials: "include",
						}
					)
						.then((response) => response.json())
						.then((data) => {
							console.log(data);

							requests.checkout.shipping.submitted = true;
							requests.checkout.payment.submit();
						});
				});
			},
		},
		payment: {
			submitted: false,
			submit() {
				fetch(
					"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutServices-SubmitPayment?format=ajax",
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
							"https://www.solebox.com/de_DE/checkout?stage=payment",
						referrerPolicy: "strict-origin-when-cross-origin",
						body: `dwfrm_billing_paymentMethod=Paypal&csrf_token=${requests.checkout.CSRFtoken}`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				).then(function (response) {
					if (response.status === 200) {
						requests.checkout.payment.submitted = true;
						requests.checkout.placeOrder.submit();
					}
				});
			},
		},
		placeOrder: {
			submitted: false,
			submit() {
				console.log("Placing order...");
				fetch(
					"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutServices-PlaceOrder?format=ajax",
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
						console.log(data);
						redText = data.error;
						if (redText != true) {
							window.open(data.continueUrl);
						} else {
							console.log("Opening cart page...");
							window.open(`https://www.solebox.com/cart`);
						}
					});
			},
		},
	},
};
