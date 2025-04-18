// solebox\main.js

console.clear();

chrome.storage.local.get(
	["initialized", "active", "account", "websites"],
	function (result) {
		// if (result.initialized === true) {
		if (true) {
			// if (result.account.discordAuth === true) {
			if (true) {
				if (result.active === true) {
					console.log(
						`%cHyperionScripts injected! Hi %c${result.account.discordUsername}!`,
						"color: rgb(206, 182, 102); font-size: 15px",
						"color: rgb(206, 182, 102); font-size: 15px; font-weight: bold"
					);
					if (result.websites.solebox.mode !== "OFF") {
						if (result.websites.solebox.mode === "SAFE") {
							safe.urlCheck();
						} else if (
							result.websites.solebox.mode === "REQUESTS"
						) {
							global.notifications.inject();
							requests.urlCheck();
						}
					}
				}
			} else {
				console.error(
					`%cHyperionScripts - Could not verify your account, go to settings to log in.`,
					"color: rgb(206, 182, 102); font-size: 15px"
				);
				global.notifications.send("error", {
					title: "User not authenticated.",
					content: "Go to the settings to tog in.",
				});
			}
		} else {
			console.error(
				`%cHyperionScripts - Could not verify your account, go to settings to log in.`,
				"color: rgb(206, 182, 102); font-size: 15px"
			);
			global.notifications.send("error", {
				title: "User not authenticated.",
				content: "Go to the settings to tog in.",
			});
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
		document.addEventListener("DOMContentLoaded", function () {
			callback(data);
		});
	},
	notifications: {
		loaded: false,
		sendOnLoad: [],
		inject() {
			var head = document.getElementsByTagName("head")[0];

			var jqueryTag = document.createElement("script");
			jqueryTag.type = "text/javascript";
			jqueryTag.src =
				"https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";
			jqueryTag.onload = function () {
				var toastrTag = document.createElement("script");
				toastrTag.type = "text/javascript";
				toastrTag.src =
					"//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js";
				toastrTag.onload = function () {
					global.notifications.loaded = true;
					global.notifications.sendOnLoad.forEach(function (
						notification
					) {
						global.notifications.send(
							notification[0],
							notification[1]
						);
					});
					var body = document.getElementsByTagName("body")[0];

					var script = document.createElement("script");
					script.type = "text/javascript";
					var scriptCode = document.createTextNode(
						`toastr.options.closeButton = true; toastr.options.progressBar = true; toastr.options.timeOut = 3000; toastr.options.extendedTimeOut = 5000;`
					);
					script.appendChild(scriptCode);

					body.appendChild(script);
				};
				head.appendChild(toastrTag);
			};

			var cssTag = document.createElement("link");
			cssTag.rel = "stylesheet";
			cssTag.href =
				"//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css";

			head.appendChild(jqueryTag);

			head.appendChild(cssTag);
		},
		send(type, data) {
			if (global.notifications.loaded) {
				var script = document.createElement("script");
				script.type = "text/javascript";

				var scriptCode = "";

				switch (type) {
					case "success":
						if (data.content) {
							scriptCode = document.createTextNode(
								`toastr.success("${data.content}", "${data.title}");`
							);
						} else {
							scriptCode = document.createTextNode(
								`toastr.success("${data.title}");`
							);
						}

						break;
					case "error":
						if (data.content) {
							scriptCode = document.createTextNode(
								`toastr.error("${data.content}", "${data.title}", {timeOut: 5000});`
							);
						} else {
							scriptCode = document.createTextNode(
								`toastr.error("${data.title}", "", {timeOut: 5000});`
							);
						}

						break;
					case "warning":
						if (data.content) {
							scriptCode = document.createTextNode(
								`toastr.warning("${data.content}", "${data.title}");`
							);
						} else {
							scriptCode = document.createTextNode(
								`toastr.warning("${data.title}");`
							);
						}

						break;
					case "info":
						if (data.content) {
							scriptCode = document.createTextNode(
								`toastr.info("${data.title}", "", {onclick: function() { window.open("${data.content}")}, timeOut: 10000});`
							);
						} else {
							break;
						}
						break;
					case "clear":
						// code block
						break;
					default:
					// code block
				}

				script.appendChild(scriptCode);

				document.body.appendChild(script);
			} else {
				global.notifications.sendOnLoad.push([type, data]);
			}
		},
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
		chrome.storage.local.get(
			["checkout", "websites", "account"],
			function (result) {
				let checkoutFromStorage = result.checkout;
				let currentProduct = {
					brand: document
						.getElementsByClassName("t-product-brand-name")[0]
						.innerHTML.trim(),
					size: document
						.getElementsByClassName(
							"b-item-attribute b-item-attribute--size Size-"
						)[0]
						.getElementsByClassName(
							"t-checkout-attr-value"
						)[0].innerHTML,
					model: document
						.getElementsByClassName("t-product-main-name")[0]
						.innerHTML.trim(),
					website: location.hostname.replace("www.", ""),
					price: document
						.getElementsByClassName(
							"b-product-tile-price-item"
						)[0]
						.innerHTML.trim(),
					user: document.getElementById("dwfrm_contact_email")
						.value,
					discordUsername: result.account.discordUsername,
					discordID: result.account.discordID,
					imageURL: document
						.getElementsByClassName(
							"b-dynamic_image_content"
						)[0]
						.getAttribute("data-src")
						.trim(),
					payPalURL: "",
					mode: "SAFE",
					webhookMessageSent: false,
				};
				checkoutFromStorage.lastCheckout = currentProduct;
				chrome.storage.local.set({ checkout: checkoutFromStorage });
			}
		);
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
				safe.product.sizes.select();
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
					safe.product.addToCart("safe");
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
								if (typeof sizes === "string") {
									if (
										sizes.toLowerCase() ===
										"random"
									) {
										const randomIndex =
											Math.round(
												Math.random() *
													(safe.product
														.sizes
														.available
														.list
														.length -
														1)
											);
										safe.product.sizes.available.list[
											randomIndex
										].click();
									}
									safe.product.addToCart("safe");
								} else if (!sizes.length > 0) {
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
									safe.product.addToCart("safe");
								}
							}
						}
					);
				}
			},
		},
		addToCart(mode) {
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
							safe.checkout.redirect();
						} else if (mode === "requests") {
							requests.checkout.shipping.process();
						}
					}
				}
			);
			const ATCButtonClick = setInterval(function () {
				if (
					!document.getElementsByClassName(
						"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
					)[0].disabled
				) {
					document
						.getElementsByClassName(
							"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
						)[0]
						.click();
				}
			}, 1000);
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
			const waitForPlaceOrder = setInterval(function () {
				if (location.toString().includes(paths.placeOrder)) {
					safe.checkout.placeOrder();
					clearInterval(waitForPlaceOrder);
				}
			}, 300);

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
				chrome.storage.local.get(
					["profiles", "websites"],
					function (result) {
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
						document.getElementById(
							"dwfrm_contact_phone"
						).value = selectedProfile.phone;
					}
				);
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
			global.waitForDOM(requests.login.getData);
		} else if (url.includes(paths.cart)) {
			chrome.storage.local.get(["settings"], function (result) {
				if (result.settings.features.preCart.generating === true) {
					global.waitForDOM(requests.cart.deleteItem);
				}
			});
		} else if (url.includes(paths.product)) {
			global.waitForDOM(requests.product.checkPID);
		} else if (url.includes(paths.checkout.path)) {
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
				referrer: location.toString(),
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
		chrome.storage.local.get(
			["checkout", "websites", "account"],
			function (result) {
				let checkoutFromStorage = result.checkout;
				let currentProduct = {
					brand: itemInfo.brand,
					size: itemInfo.variant,
					model: itemInfo.name,
					website: location.hostname.replace("www.", ""),
					price: itemInfo.price.replace(".", ",").concat(" €"),
					user: user,
					discordUsername: result.account.discordUsername,
					discordID: result.account.discordID,
					imageURL: itemImage,
					itemPageURL: itemURL,
					payPalURL: "",
					mode: "REQUESTS",
					webhookMessageSent: false,
				};
				checkoutFromStorage.lastCheckout = currentProduct;
				chrome.storage.local.set({ checkout: checkoutFromStorage });
			}
		);
	},
	login: {
		data: { CSRF: "", ID: "", value: "" },
		getData() {
			console.log(
				`%cHyperionScripts - Logging in...`,
				"color: rgb(206, 182, 102); font-size: 12px"
			);

			if (location.toString().includes(paths.login)) {
				requests.login.data.CSRF = document.querySelector(
					"[name='csrf_token']"
				).value;
				requests.login.data.ID =
					document.querySelectorAll(
						"[data-value]"
					)[0].dataset.id;
				requests.login.data.value =
					document.querySelectorAll(
						"[data-value]"
					)[0].dataset.value;
				requests.login.submit();
			} else {
				fetch("https://www.solebox.com/login")
					.then((response) => response.text())
					.then((data) => {
						const loginValues = data.slice(
							data.lastIndexOf(
								"<",
								data.indexOf("data-value")
							),
							data.indexOf(">", data.indexOf("data-value"))
						);
						var indices = [];
						for (var i = 0; i < loginValues.length; i++) {
							if (loginValues[i] === '"') indices.push(i);
						}
						requests.login.data.ID = loginValues.slice(
							indices[0] + 1,
							indices[1]
						);
						requests.login.data.value = loginValues.slice(
							indices[2] + 1,
							indices[3]
						);

						const CSRFdata = data.slice(
							data.lastIndexOf(
								"<",
								data.indexOf("csrf_token")
							),
							data.indexOf(">", data.indexOf("csrf_token"))
						);

						indices = [];
						for (var i = 0; i < CSRFdata.length; i++) {
							if (CSRFdata[i] === '"') indices.push(i);
						}
						requests.login.data.CSRF = CSRFdata.slice(
							indices[4] + 1,
							indices[5]
						);

						requests.login.submit();
					});
			}
		},
		submit() {
			chrome.storage.local.get(
				["websites", "settings"],
				function (result) {
					fetch(
						`https://www.solebox.com/de_DE/authentication?rurl=1&format=ajax`,
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
							referrer: location.toString(),
							referrerPolicy:
								"strict-origin-when-cross-origin",
							body: `${requests.login.data.ID}=${requests.login.data.value}&dwfrm_profile_customer_email=${result.websites.solebox.profile.email}&dwfrm_profile_login_password=${result.websites.solebox.profile.password}&csrf_token=${requests.login.data.CSRF}`,
							method: "POST",
							mode: "cors",
							credentials: "include",
						}
					)
						.then((response) => response.json())
						.then((data) => {
							if (data.success === true) {
								console.log(
									`%cHyperionScripts - %cSuccessfully logged in!`,
									"color: rgb(206, 182, 102); font-size: 12px",
									"color: rgb(100, 200, 0); font-size: 12px"
								);
								global.notifications.send("success", {
									title: "Successfully logged in!",
								});
								// requests.logout();
							} else {
								console.error(
									`%cHyperionScripts - %cCould not log in!`,
									"color: rgb(206, 182, 102); font-size: 12px",
									"color: rgb(206, 182, 102); font-size: 12px"
								);
								global.notifications.send("error", {
									title: "Could not log in!",
								});
							}
						});
				}
			);
		},
	},
	product: {
		time: { start: 0, finish: 0, total: 0 },
		checkPID() {
			requests.product.time.start = new Date();
			if (
				location
					.toString()
					.slice(
						location.toString().lastIndexOf("-") + 1,
						location.toString().lastIndexOf(".")
					).length > 9
			) {
				requests.product.addToCart(
					location
						.toString()
						.slice(
							location.toString().lastIndexOf("-") + 1,
							location.toString().lastIndexOf(".")
						)
				);
				window.stop();
			} else {
				// document.addEventListener("DOMContentLoaded", function () {
				requests.product.sizes.select();
				// });
			}
		},
		sizes: {
			anySelected: false,
			list: [],
			available: {
				list: [],
				numbers: [],
			},
			soldOut: [],
			select() {
				console.log(
					`%cHyperionScripts - Selecting sizes...`,
					"color: rgb(206, 182, 102); font-size: 12px"
				);
				this.list = document.querySelectorAll(
					"[data-attr-id='size']"
				);

				// window.stop();

				this.list.forEach((size) => {
					if (
						size.children[0].className.includes(
							"b-swatch-value--selected"
						)
					) {
						this.anySelected = true;
						requests.product.addToCart(
							size.getAttribute("data-variant-id")
						);
						return;
					}
				});

				this.list.forEach((size) => {
					if (
						size.children[0].className.includes(
							"b-swatch-value--orderable"
						) &&
						!size.children[0].className.includes(
							"b-swatch-value--sold-out"
						)
					) {
						this.available.list.push(size);
					} else {
						this.soldOut.push(size);
					}
				});

				this.available.list.forEach((size) => {
					this.available.numbers.push(size.dataset.value);
				});
				chrome.storage.local.get(["websites"], function (result) {
					const sizes = result.websites.solebox.sizes;
					if (requests.product.sizes.available.list.length > 0) {
						if (typeof sizes === "string") {
							if (sizes.toLowerCase() === "random") {
								const randomIndex = Math.round(
									Math.random() *
										(requests.product.sizes
											.available.list.length -
											1)
								);
								requests.product.addToCart(
									requests.product.sizes.available.list[
										randomIndex
									].getAttribute("data-variant-id")
								);
							}
						} else if (!sizes.length > 0) {
							requests.product.addToCart(
								requests.product.sizes.available.list[0].getAttribute(
									"data-variant-id"
								)
							);
						} else {
							let success = false;
							sizes.forEach((size) => {
								if (
									requests.product.sizes.available.numbers.includes(
										size.toString()
									) &&
									success === false
								) {
									requests.product.sizes.available.list.forEach(
										(sizeElement) => {
											if (
												sizeElement.dataset
													.value ===
												size.toString()
											) {
												requests.product.addToCart(
													sizeElement.getAttribute(
														"data-variant-id"
													)
												);
												success = true;
												return;
											}
										}
									);
								}
							});
							if (success === false) {
								requests.product.addToCart(
									requests.product.sizes.available.list[0].getAttribute(
										"data-variant-id"
									)
								);
							}
							console.log(
								`%cHyperionScripts - %cSuccessfully selected size!`,
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(100, 200, 0); font-size: 12px"
							);
						}
					}
				});
			},
		},
		addToCart(PID) {
			console.log(
				`%cHyperionScripts - Adding to cart...`,
				"color: rgb(206, 182, 102); font-size: 12px"
			);
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
				body: `pid=${PID}&quantity=1`,
				method: "POST",
				mode: "cors",
				credentials: "include",
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.error === false) {
						console.log(
							`%cHyperionScripts - %cSuccessfully added to cart!`,
							"color: rgb(206, 182, 102); font-size: 12px",
							"color: rgb(100, 200, 0); font-size: 12px"
						);
						global.notifications.send("success", {
							title: "Successfully added to cart!",
							content: `Product ID: ${PID}`,
						});
						requests.product.time.finish = new Date();
						requests.product.time.total =
							requests.product.time.finish -
							requests.product.time.start;
						requests.checkout.shipping.process();
					} else {
						console.error(
							`%cHyperionScripts - %cCould not add to cart: "${data.message}"`,
							"color: rgb(206, 182, 102); font-size: 12px",
							"color: rgb(206, 182, 102); font-size: 12px"
						);
						global.notifications.send("error", {
							title: "Could not add to cart.",
							content: `Error: '${data.message}'`,
						});
						requests.product.sizes.select();
					}
				});
		},
	},
	cart: {},
	checkout: {
		CSRFtoken: "",
		retryAttempts: 2,
		time: { start: 0, finish: 0, total: 0 },
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
			attempts: 0,
			process() {
				requests.generateCSRF(
					requests.checkout.shipping.getAddressID
				);
				requests.checkout.time.start = new Date();
			},
			getAddressID() {
				console.log(
					`%cHyperionScripts - Getting user addresses...`,
					"color: rgb(206, 182, 102); font-size: 12px"
				);
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
						referrer: location.toString(),
						referrerPolicy: "strict-origin-when-cross-origin",
						body: "methodID=home-delivery&shipmentUUID=",
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {
						requests.checkout.shipping.customerProfile = {
							...data.customer.preferredAddress,
							...data.customer.profile,
						};
						if (data.customer.registeredUser) {
							console.log(
								`%cHyperionScripts - %cSuccessfully got user adresses!`,
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(100, 200, 0); font-size: 12px"
							);
							requests.checkout.shipping.addressID =
								data.customer.addresses[0].addressId;
							requests.checkout.shipping.shipUUID =
								data.order.shipping[0].UUID;
							requests.checkout.shipping.getRates();
							requests.checkout.shipping.attempts = 0;
						} else {
							if (
								requests.checkout.shipping.attempts <
								requests.checkout.retryAttempts
							) {
								requests.checkout.shipping.attempts++;
								if (
									requests.checkout.shipping
										.attempts === 1
								) {
									requests.login.getData();
								}
								chrome.runtime.onMessage.addListener(
									(
										message,
										sender,
										sendResponse
									) => {
										if (
											message.request.url.includes(
												"solebox."
											) &&
											message.request.url.includes(
												"authentication"
											) &&
											message.request
												.statusCode < 400
										) {
											requests.checkout.shipping.process();
										}
									}
								);
								console.error(
									`%cHyperionScripts - User not logged in! Trying to log-in... Try ${requests.checkout.shipping.attempts} of ${requests.checkout.retryAttempts}.`,
									"color: rgb(206, 182, 102); font-size: 12px"
								);
								global.notifications.send("error", {
									title: "User not logged in! Trying to log-in...",
									content: `Try ${requests.checkout.shipping.attempts} of ${requests.checkout.retryAttempts}.`,
								});
							} else {
								console.error(
									`%cHyperionScripts - Could not get user addresses. Reload the page to try again.`,
									"color: rgb(206, 182, 102); font-size: 12px"
								);
							}
						}

						requests.saveItemInfo(
							data.order.items.items[0].gtm,
							data.order.items.items[0].images[0].pdp.srcD,
							data.order.items.items[0].urls.pdp
						);
					});
			},
			getRates() {
				console.log(
					`%cHyperionScripts - Getting shipping rates...`,
					"color: rgb(206, 182, 102); font-size: 12px"
				);
				chrome.storage.local.get(["websites"], function (result) {
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
							referrer: location.toString(),
							referrerPolicy:
								"strict-origin-when-cross-origin",
							body: `selected=true&id=${
								requests.checkout.shipping.addressID
							}&addressType=home-delivery&snipesStore=&postOfficeNumber=&packstationNumber=&postNumber=&postalCode=${
								requests.checkout.shipping
									.customerProfile.postalCode
							}&countryCode=${
								requests.checkout.shipping
									.customerProfile.countryCode.value
							}&suite=${
								requests.checkout.shipping
									.customerProfile.suite
							}&street=${requests.checkout.shipping.customerProfile.street.replaceAll(
								" ",
								"+"
							)}&city=${requests.checkout.shipping.customerProfile.city.replaceAll(
								" ",
								"+"
							)}&address2=${requests.checkout.shipping.customerProfile.address2.replaceAll(
								" ",
								"+"
							)}&lastName=${requests.checkout.shipping.customerProfile.lastName.replaceAll(
								" ",
								"+"
							)}&firstName=${requests.checkout.shipping.customerProfile.firstName.replaceAll(
								" ",
								"+"
							)}&title=${
								requests.checkout.shipping
									.customerProfile.title
							}&csrf_token=${requests.checkout.CSRFtoken}`,
							method: "POST",
							mode: "cors",
							credentials: "include",
						}
					)
						.then((response) => response.json())
						.then((data) => {
							console.log(
								`%cHyperionScripts - %cSuccessfully got shipping rates!`,
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(100, 200, 0); font-size: 12px"
							);
							requests.checkout.shipping.shipUUID =
								data.order.shipping[0].UUID;
							requests.checkout.shipping.submit();
							success = data.success;
							fullResponse = data;
						});
				});
			},
			submit() {
				console.log(
					`%cHyperionScripts - Submitting shipping...`,
					"color: rgb(206, 182, 102); font-size: 12px"
				);
				fetch(
					`https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-SubmitShipping?region=europe&country=undefined&addressId=${requests.checkout.shipping.addressID}&format=ajax`,
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
						body: `originalShipmentUUID=${requests.checkout.shipping.shipUUID}&shipmentUUID=${requests.checkout.shipping.shipUUID}&dwfrm_shipping_shippingAddress_shippingMethodID=home-delivery_europe&address-selector=${requests.checkout.shipping.addressID}&dwfrm_shipping_shippingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_shipping_shippingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_shipping_shippingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_shipping_shippingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_shipping_shippingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_shipping_shippingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_shipping_shippingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_shipping_shippingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_shipping_shippingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_shipping_shippingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_shipping_shippingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&serviceShippingMethod=ups-standard&dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress=true&dwfrm_billing_billingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_billing_billingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_billing_billingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_billing_billingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_billing_billingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_billing_billingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_billing_billingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_billing_billingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_billing_billingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_billing_billingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&dwfrm_billing_billingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_contact_email=${requests.checkout.shipping.customerProfile.email}&dwfrm_contact_phone=${requests.checkout.shipping.customerProfile.phone}&csrf_token=${requests.checkout.CSRFtoken}`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {
						if (data.error === true || data.errorMessage) {
							if (
								requests.checkout.shipping.attempts <
									requests.checkout.retryAttempts &&
								data.errorMessage !==
									"Too many requests"
							) {
								requests.checkout.shipping.attempts++;
								console.error(
									`%cHyperionScripts - Could not submit shipping. Retrying in 3 seconds... Try ${requests.checkout.shipping.attempts} of ${requests.checkout.retryAttempts}.`,
									"color: rgb(206, 182, 102); font-size: 12px"
								);
								global.notifications.send("error", {
									title: "Could not submit shipping. Retrying in 3 seconds...",
									content: `Try ${requests.checkout.shipping.attempts} of ${requests.checkout.retryAttempts}.`,
								});
								setTimeout(function () {
									requests.checkout.shipping.submit();
								}, 3000);
							} else {
								console.error(
									`%cHyperionScripts - Could not submit shipping. Reload the page to try again.`,
									"color: rgb(206, 182, 102); font-size: 12px"
								);
								global.notifications.send("error", {
									title: "Could not submit shipping.",
									content: "Reload the page to try again.",
								});
							}
						} else {
							console.log(
								`%cHyperionScripts - %cSuccessfully submitted shipping!`,
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(100, 200, 0); font-size: 12px"
							);
							global.notifications.send("success", {
								title: "Successfully submitted shipping!",
							});
							requests.checkout.shipping.submitted = true;
							requests.checkout.payment.submit();
						}
					});
			},
		},
		payment: {
			attempts: 0,
			submitted: false,
			submit() {
				console.log(
					`%cHyperionScripts - Submitting payment...`,
					"color: rgb(206, 182, 102); font-size: 12px"
				);
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
						referrer: location.toString(),
						referrerPolicy: "strict-origin-when-cross-origin",
						body: `dwfrm_billing_paymentMethod=Paypal&csrf_token=${requests.checkout.CSRFtoken}`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {
						if (!data.error) {
							console.log(
								`%cHyperionScripts - %cSuccessfully submitted payment!`,
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(100, 200, 0); font-size: 12px"
							);
							global.notifications.send("success", {
								title: "Successfully submitted payment!",
							});
							requests.checkout.payment.submitted = true;
							requests.checkout.placeOrder.submit();
						} else {
							if (
								requests.checkout.payment.attempts <
								requests.checkout.retryAttempts
							) {
								requests.checkout.payment.attempts++;
								console.error(
									`%cHyperionScripts - Could not submit payment. Retrying in 3 seconds... Try ${requests.checkout.payment.attempts} of ${requests.checkout.retryAttempts}.`,
									"color: rgb(206, 182, 102); font-size: 12px"
								);
								global.notifications.send("error", {
									title: "Could not submit payment. Retrying in 3 seconds...",
									content: `Try ${requests.checkout.payment.attempts} of ${requests.checkout.retryAttempts}.`,
								});
								setTimeout(function () {
									requests.checkout.payment.submit();
								}, 3000);
							} else {
								console.error(
									`%cHyperionScripts - Could not submit payment. Reload the page to try again.`,
									"color: rgb(206, 182, 102); font-size: 12px"
								);
								global.notifications.send("error", {
									title: "Could not submit payment.",
									content: "Reload the page to try again.",
								});
							}
						}
					});
			},
		},
		placeOrder: {
			submitted: false,
			cartOpened: false,
			attempts: 0,
			submit() {
				console.log(
					`%cHyperionScripts - Placing order...`,
					"color: rgb(206, 182, 102); font-size: 12px"
				);
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
						referrer: location.toString(),
						referrerPolicy: "strict-origin-when-cross-origin",
						body: null,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {
						if (!data.error && data.continueUrl) {
							requests.checkout.time.finish = new Date();
							requests.checkout.time.total =
								requests.checkout.time.finish -
								requests.checkout.time.start;
							console.log(
								`%cHyperionScripts - %cSuccessfully placed order!`,
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(100, 200, 0); font-size: 12px"
							);
							global.notifications.send("success", {
								title: "Successfully placed order!",
							});
							console.log(
								`%cHyperionScripts - %cPayPal link:\n${data.continueUrl}`,
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(0, 156, 218); font-size: 12px"
							);
							global.notifications.send("info", {
								title: `Click here to open the PayPal link.`,
								content: data.continueUrl,
							});
							console.log(
								`%cHyperionScripts - CHECKOUT DATA:\n-  ATC TIME: %c${
									requests.product.time.total
								}ms\n%c-  CHECKOUT TIME: %c${
									requests.checkout.time.total
								}ms\n%c-  TOTAL TIME: %c${
									requests.product.time.total +
									requests.checkout.time.total
								}ms`,
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(190, 41, 236); font-size: 12px",
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(190, 41, 236); font-size: 12px",
								"color: rgb(206, 182, 102); font-size: 12px",
								"color: rgb(190, 41, 236); font-size: 12px"
							);
							chrome.storage.local.get(
								["checkout", "websites"],
								function (result) {
									let checkoutFromStorage =
										result.checkout;
									checkoutFromStorage.lastCheckout.ATCtime =
										requests.product.time.total;
									checkoutFromStorage.lastCheckout.checkoutTime =
										requests.checkout.time.total;

									chrome.storage.local.set(
										{
											checkout:
												checkoutFromStorage,
										},
										function () {
											window.open(
												data.continueUrl
											);
										}
									);
								}
							);
						} else {
							if (
								requests.checkout.placeOrder.attempts <
								requests.checkout.retryAttempts
							) {
								requests.checkout.placeOrder.attempts++;
								console.error(
									`%cHyperionScripts - Could not place order. Retrying in 3 seconds... Try ${requests.checkout.placeOrder.attempts} of ${requests.checkout.retryAttempts}.`,
									"color: rgb(206, 182, 102); font-size: 12px"
								);
								setTimeout(function () {
									requests.checkout.placeOrder.submit();
								}, 3000);
							} else {
								console.error(
									`%cHyperionScripts - Could not place order. Reload the page to try again.`,
									"color: rgb(206, 182, 102); font-size: 12px"
								);
							}
							if (
								!requests.checkout.placeOrder.cartOpened
							) {
								window.open(
									location
										.toString()
										.slice(
											0,
											location
												.toString()
												.indexOf(
													"/",
													location
														.toString()
														.indexOf(
															"solebox."
														)
												)
										) + paths.checkout.path
								);
								requests.checkout.placeOrder.cartOpened = true;
							}
						}
					});
			},
		},
	},
};
