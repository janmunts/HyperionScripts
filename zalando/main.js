chrome.storage.local.get(
	["initialized", "active", "account", "websites"],
	function (result) {
		if (result.initialized === true) {
			if (result.account.discordAuth === true) {
				if (result.active === true) {
					console.log(
						`%cHyperionScripts injected! Hi %c${result.account.discordUsername}!`,
						"color: rgb(206, 182, 102); font-size: 15px",
						"color: rgb(206, 182, 102); font-size: 15px; font-weight: bold"
					);
					if (result.websites.zalando.mode !== "OFF") {
						if (result.websites.zalando.mode === "SAFE") {
							safe.urlCheck();
						} else if (
							result.websites.zalando.mode === "REQUESTS"
						) {
							// global.notifications.inject();
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
				"color: rgb(206, 182, 102); font-size: 15px",
				"color: rgb(206, 182, 102); font-size: 15px; font-weight: bold"
			);
			global.notifications.send("error", {
				title: "User not authenticated.",
				content: "Go to the settings to tog in.",
			});
		}
	}
);

const paths = {
	mainPage: "home/",
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
	notifications: {
		loaded: false,
		sendOnLoad: [],
		inject() {
			var toastrTag = document.createElement("script");
			toastrTag.type = "text/javascript";
			toastrTag.src =
				"//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js";
			toastrTag.onload = function () {
				console.log("toastr injected");
				global.notifications.loaded = true;
				global.notifications.sendOnLoad.forEach(function (
					notification
				) {
					global.notifications.send(
						notification[0],
						notification[1]
					);
				});

				var script = document.createElement("script");
				script.type = "text/javascript";
				var scriptCode = document.createTextNode(
					`toastr.options.closeButton = true; toastr.options.progressBar = true; toastr.options.timeOut = 3000; toastr.options.extendedTimeOut = 5000;`
				);
				script.appendChild(scriptCode);

				document.documentElement.appendChild(script);
			};

			var jqueryTag = document.createElement("script");
			jqueryTag.type = "text/javascript";
			jqueryTag.src =
				"https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";
			jqueryTag.onload = function () {
				console.log("jquery injected");
				document.documentElement.appendChild(toastrTag);
			};
			document.documentElement.appendChild(jqueryTag);

			var cssTag = document.createElement("link");
			cssTag.rel = "stylesheet";
			cssTag.href =
				"//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css";
			document.documentElement.appendChild(cssTag);
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

				// document.body.appendChild(script);
			} else {
				global.notifications.sendOnLoad.push([type, data]);
			}
		},
	},
	overlay: {
		inject() {
			var overlay = document.createElement("div");
			overlay.id = "HS overlay";
			overlay.style =
				"position:fixed;top:0px;z-index: 99999;pointer-events: none;";
			// overlay.style.border = "5px solid rgba(206, 182, 102, 0.5)";
			overlay.style.boxShadow =
				"inset 0 0 6px 3px rgba(206, 182, 102, 1)"; // box-shadow:
			overlay.style.width = window.innerWidth - 15 + "px";
			overlay.style.height = window.innerHeight + "px";

			document
				.getElementsByTagName("html")[0]
				.insertBefore(
					overlay,
					document.getElementsByTagName("body")[0]
				);

			window.addEventListener(
				"resize",
				function (event) {
					document.getElementById("HS overlay").style.width =
						window.innerWidth - 15 + "px";
					document.getElementById("HS overlay").style.height =
						window.innerHeight + "px";
				},
				true
			);
		},
	},
};

const safe = {
	urlCheck() {
		url = location.toString();
		if (url.includes(".html")) {
			console.log("product page detected");
		}
		// if (url.includes(paths.mainPage)) {
		//     document
		//         .querySelector('[href="/myaccount/"]')
		//         .addEventListener("click", function () {
		//             safe.login();
		//         });
		// } else if (
		//     url.includes(paths.login) ||
		//     document.getElementsByClassName("reef-zds_modalContent")[0]
		// ) {
		//     global.waitForDOM(safe.login);
		// } else if (url.includes(paths.cart)) {
		//     chrome.storage.local.get(["settings"], function (result) {
		//         if (result.settings.features.preCart.generating === true) {
		//             global.waitForDOM(safe.cart.deleteItem);
		//         }
		//     });
		// } else if (url.includes(paths.ATC)) {
		//     global.waitForDOM();
		// } else if (url.includes(paths.product)) {
		//     global.waitForDOM(safe.product.check404);
		// } else if (url.includes(paths.checkout.path)) {
		//     global.waitForDOM(safe.saveItemInfo);
		//     if (url.toString().includes(paths.checkout.shipping)) {
		//         global.waitForDOM(safe.checkout.shipping);
		//     } else if (url.toString().includes(paths.checkout.payment)) {
		//         global.waitForDOM(safe.checkout.payment);
		//     } else if (url.toString().includes(paths.checkout.placeOrder)) {
		//         global.waitForDOM(safe.checkout.placeOrder);
		//     }
		// }
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
				webhookMessageSent: false,
			};
			checkoutFromStorage.lastCheckout = currentProduct;
			chrome.storage.local.set({ checkout: checkoutFromStorage });
		});
	},
	login() {
		const waitForLoginPopup = setInterval(function () {
			if (
				document.getElementsByClassName("reef-zds_modalContent")[0]
			) {
				console.log("login popup detected");
				chrome.storage.local.get(["websites"], function (result) {
					if (result.websites.zalando.profile) {
						console.log(result.websites.zalando.profile);
						const emailElement =
								document.getElementById("login.email"),
							passwordElement =
								document.getElementById(
									"login.password"
								),
							loginButtonElement = document.querySelector(
								'[data-testid="login_button"]'
							);
						emailElement.value =
							result.websites.zalando.profile.email;
						passwordElement.value =
							result.websites.zalando.profile.password;
						setTimeout(function () {
							loginButtonElement.click();
						}, 200);
					}
				});
			} else if (location.toString().includes(paths.login)) {
				chrome.storage.local.get(["websites"], function (result) {
					if (result.websites.zalando.profile) {
						console.log(result.websites.zalando.profile);
						const emailElement =
								document.getElementById("login.email"),
							passwordElement =
								document.getElementById(
									"login.password"
								),
							loginButtonElement = document.querySelector(
								'[data-testid="login_button"]'
							);
						emailElement.value =
							result.websites.zalando.profile.email;
						passwordElement.value =
							result.websites.zalando.profile.password;
						setTimeout(function () {
							loginButtonElement.click();
						}, 200);
					}
				});
			}
		}, 200);
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
							const sizes = result.websites.zalando.sizes;
							if (
								safe.product.sizes.available.list
									.length > 0
							) {
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
						message.request.url.includes("zalando.com") &&
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
						message.request.url.includes("zalando.com") &&
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
						result.websites.zalando.profile;
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
		requests.login();
		// requests.product.addToCart(
		// 	location
		// 		.toString()
		// 		.slice(
		// 			location
		// 				.toString()
		// 				.lastIndexOf(
		// 					"-",
		// 					location.toString().lastIndexOf("-") - 1
		// 				) + 1,
		// 			location.toString().lastIndexOf(".")
		// 		)
		// );
		// requests.product.sizes.getID();
		if (url.includes(".html")) {
			requests.product.sizes.select();
		}
		// if (url.includes(paths.login) || url.includes(paths.checkout.login)) {
		// 	global.waitForDOM(requests.login);
		// } else if (url.includes(paths.cart)) {
		// 	chrome.storage.local.get(["settings"], function (result) {
		// 		if (result.settings.features.preCart.generating === true) {
		// 			global.waitForDOM(requests.cart.deleteItem);
		// 		}
		// 	});
		// } else if (url.includes(paths.product)) {
		// 	global.waitForDOM(requests.product.addToCart);
		// } else if (url.includes(paths.checkout.path)) {
		// 	global.waitForDOM(requests.checkout.shipping.process);
		// }
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
				webhookMessageSent: false,
			};
			checkoutFromStorage.lastCheckout = currentProduct;
			chrome.storage.local.set({ checkout: checkoutFromStorage });
		});
	},
	login() {
		var token = "";

		var name = "frsx" + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(";");
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == " ") {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				token = c.substring(name.length, c.length);
			}
		}

		console.log(
			`%cHyperionScripts - Logging in...`,
			"color: rgb(206, 182, 102); font-size: 12px"
		);
		chrome.storage.local.get(["websites", "settings"], function (result) {
			fetch("https://www.zalando.es/api/reef/login", {
				headers: {
					accept: "application/json",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"content-type": "application/json",
					dpr: "2",
					"sec-ch-ua":
						'" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
					"sec-ch-ua-mobile": "?0",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"viewport-width": "757",
					"x-flow-id": "Sh0d7svnECv50Xd0",
					"x-xsrf-token": token,
					"x-zalando-client-id":
						"0ecf16e6-55d9-4242-bd96-52e4b1ba6c58",
					"x-zalando-render-page-uri": "/mujer-home/",
					"x-zalando-request-uri": "/mujer-home/",
					"x-zalando-toggle-label": "THE_LABEL_IS_ENABLED",
				},
				referrer: location.toString(),
				referrerPolicy: "strict-origin-when-cross-origin",
				body: `{"username":"${result.websites.zalando.profile.email}","password":"${result.websites.zalando.profile.password}","wnaMode":"modal"}`,
				method: "POST",
				mode: "cors",
				credentials: "include",
			})
				.then((response) => response.json())
				.then((data) => {
					console.log(data);
					if (!data.status) {
						console.log(
							`%cHyperionScripts - %cSuccessfully logged in!`,
							"color: rgb(206, 182, 102); font-size: 12px",
							"color: rgb(100, 200, 0); font-size: 12px"
						);
					} else {
						console.error(
							`%cHyperionScripts - Could not log in, check your login credentials and try again.`,
							"color: rgb(206, 182, 102); font-size: 12px"
						);
					}
				});
		});
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
					).length > 15
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
				document.addEventListener("DOMContentLoaded", function () {
					requests.product.sizes.select();
				});
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

				fetch(location.toString())
					.then((response) => response.text())
					.then((data) => {
						this.list = JSON.parse(
							data
								.slice(
									data.indexOf(
										'"simples":[{',
										data.indexOf('"simples":[{') +
											1
									),
									data.indexOf(
										"}}}]",
										data.indexOf(
											'"simples":[{',
											data.indexOf(
												'"simples":[{'
											) + 1
										)
									) + 4
								)
								.replace('"simples":', "")
						);
						console.log(this.list);
						this.list.forEach((size) => {
							if (
								size.offer.stock.quantity !==
								"OUT_OF_STOCK"
							) {
								this.available.list.push(size);
							} else {
								this.soldOut.push(size);
							}
						});

						this.available.list.forEach((size) => {
							this.available.numbers.push(size.size);
						});

						console.log(this.available);

						chrome.storage.local.get(
							["websites"],
							function (result) {
								const sizes =
									result.websites.zalando.sizes;
								if (
									requests.product.sizes.available
										.list.length > 0
								) {
									if (typeof sizes === "string") {
										if (
											sizes.toLowerCase() ===
											"random"
										) {
											const randomIndex =
												Math.round(
													Math.random() *
														(requests
															.product
															.sizes
															.available
															.list
															.length -
															1)
												);
											requests.product.addToCart(
												requests.product
													.sizes
													.available
													.list[
													randomIndex
												].sku
											);
										}
									} else if (!sizes.length > 0) {
										requests.product.addToCart(
											requests.product.sizes
												.available.list[0]
												.sku
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
													(
														sizeElement
													) => {
														if (
															sizeElement
																.dataset
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
							}
						);
					});

				// window.stop();
			},
		},
		addToCart(PID) {
			console.log(
				`%cHyperionScripts - Adding to cart...`,
				"color: rgb(206, 182, 102); font-size: 12px"
			);
			fetch("https://www.zalando.es/api/graphql/add-to-cart/", {
				headers: {
					accept: "*/*",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"content-type": "application/json",
					dpr: "1.14",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"viewport-width": "1542",
					"x-page-impression-id": "",
					"x-xsrf-token": "",
					"x-zalando-experiments": "",
					"x-zalando-feature": "pdp",
					"x-zalando-intent-context": "",
					"x-zalando-request-uri": location
						.toString()
						.slice(
							location
								.toString()
								.indexOf(
									"/",
									location.toString().indexOf(".")
								)
						),
				},
				referrer: location.toString(),
				referrerPolicy: "strict-origin-when-cross-origin",
				body: `[{"id":"e7f9dfd05f6b992d05ec8d79803ce6a6bcfb0a10972d4d9731c6b94f6ec75033","variables":{"addToCartInput":{"productId":"${PID}","clientMutationId":"addToCartMutation"}}}]`,
				method: "POST",
				mode: "cors",
				credentials: "include",
			})
				.then((response) => response.json())
				.then((data) => {
					console.log(data);
					if (!data[0].errors) {
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
						requests.checkout.process();
					} else {
						console.error(
							`%cHyperionScripts - %cCould not add to cart: "${data[0].errors[0].message}"`,
							"color: rgb(206, 182, 102); font-size: 12px",
							"color: rgb(206, 182, 102); font-size: 12px"
						);
						global.notifications.send("error", {
							title: "Could not add to cart.",
							content: `Error: '${data[0].errors[0].message}'`,
						});
						requests.product.sizes.select();
					}
				});
		},
	},
	cart: {},
	checkout: {
		checkoutId: "",
		eTag: "",
		process() {
			this.confirm();
		},
		confirm() {
			fetch("https://www.zalando.es/checkout/confirm", {
				headers: {
					accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "same-origin",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1",
				},
				referrer: "https://www.zalando.es/cart",
				referrerPolicy: "strict-origin-when-cross-origin",
				body: null,
				method: "GET",
				mode: "cors",
				credentials: "include",
			})
				.then((response) => response.text())
				.then((data) => {
					const checkoutData = decodeURI(encodeURI(data));

					console.log(checkoutData);

					this.checkoutId = checkoutData.slice(
						checkoutData.indexOf("checkoutId&quot;:&quot;") +
							"checkoutId&quot;:&quot;".length,
						checkoutData.indexOf("checkoutId&quot;:&quot;") +
							"checkoutId&quot;:&quot;".length +
							43
					);
					this.eTag = checkoutData.slice(
						checkoutData.indexOf(
							"eTag&quot;:&quot;\\&quot;"
						) + "eTag&quot;:&quot;\\&quot;".length,
						checkoutData.indexOf(
							"eTag&quot;:&quot;\\&quot;"
						) +
							"eTag&quot;:&quot;\\&quot;".length +
							36
					);

					if (
						!(
							this.checkoutId.includes("<head>") ||
							this.eTag.includes("<head>")
						)
					) {
						console.log(this.checkoutId);
						console.log(this.eTag);

						requests.checkout.buyNow();
					} else {
						console.error("could not confirm checkout");
					}
				});
		},
		address() {
			fetch("https://www.zalando.es/checkout/address", {
				headers: {
					accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "same-origin",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1",
				},
				referrer: "https://www.zalando.es/cart",
				referrerPolicy: "strict-origin-when-cross-origin",
				body: null,
				method: "GET",
				mode: "cors",
				credentials: "include",
			});
		},
		select() {
			fetch("https://checkout.payment.zalando.com/selection", {
				headers: {
					accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "cross-site",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1",
				},
				referrer: "https://www.zalando.es/",
				referrerPolicy: "strict-origin-when-cross-origin",
				body: null,
				method: "GET",
				mode: "cors",
				credentials: "include",
			});
		},
		paymentComplete() {
			fetch("https://www.zalando.es/checkout/payment-complete", {
				headers: {
					accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "same-origin",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1",
				},
				referrer: "https://www.zalando.es/",
				referrerPolicy: "strict-origin-when-cross-origin",
				body: null,
				method: "GET",
				mode: "cors",
				credentials: "include",
			});
		},
		buyNow() {
			var token = "";

			var name = "frsx" + "=";
			var decodedCookie = decodeURIComponent(document.cookie);
			var ca = decodedCookie.split(";");
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == " ") {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					token = c.substring(name.length, c.length);
				}
			}
			fetch("https://www.zalando.es/api/checkout/buy-now", {
				headers: {
					accept: "application/json",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"content-type": "application/json",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-xsrf-token": token,
					"x-zalando-checkout-app": "web",
					"x-zalando-footer-mode": "desktop",
					"x-zalando-header-mode": "desktop",
				},
				referrer: "https://www.zalando.es/checkout/confirm",
				referrerPolicy: "strict-origin-when-cross-origin",
				body: `{"checkoutId":"${requests.checkout.checkoutId}","eTag":"\\"${requests.checkout.eTag}\\""}`,
				// body: null,
				method: "POST",
				mode: "cors",
				credentials: "include",
			})
				.then((response) => response.json())
				.then((data) => {
					console.log(data);
					// cookie: Zalando-Client-Id=6f23fdce-28d3-4862-9181-fe79e68f64d8; ncx=m; bm_sz=4E9FEB4AD4EA5B99E0AB3CE4F57202B0~YAAQ9vpxaGdvy1h6AQAAaZpfawwrsRThKltajm0ymdMo/5LQCjp470BPjiSDRqfaZPO481YtOb13Dv+xmsa7BFA4R+iyYcAl2mgKBGtLKeWFajfJlmg9lU0udxtsLjK4jd9zWVQWtkXO8xG33TQ75Up3LViVGMFbsXpsUYi+0Cx56oMd/rR3Ox5tvvGN0l8a4dIGyvBE75LHQO4ILbiwJOs6x1sioLXYeliNFoNFjxBdTIoz11m/x14fXBAIRCBy99ZqQrhKTF7MwaubCs9u15BTAXgN9yXwLQ9+sA==; mpulseinject=false; bm_mi=C7B818A31634B821B88E6ABA14FD41B0~lnYRNhwx8Srulw/njtIigrxSR5Fk+GKcVCmzMBpWkAX0oUbg8lYg2jz67pl+rK1YwEvTbEvcJqnbn8FgVK6B/dV6cgYw3T8tY7jsHSIhtC6fyik2EvCwOIQwAB+Jirqzh5y3WZNANCj668DHrp9FRYTGE2WUMLUWWHIAaMVnCni8gcIuHJcavT6fFW7yxtzXUKthOyxqZnXl6A80hibJdBJdM/da1BfJfEl7ywVgT17Ogz21BNu+7qU5qIDk5zL/ugRs61/5Oj4OiyAolQ2Y+p5jTKlj7GnvqbrNPRdQfOHjYe/5vOO9OJYTqJ3+ITdb3Frv6jj8mUWCTvqemXbohBwyhoo1V1dBrD4gCpkbjmw=; ak_bmsc=689C3B305CD916098CCD8C9BAC95231D~000000000000000000000000000000~YAAQV38WAvzn2mB6AQAAt5obbAx0wagMZSv5rEojxJTRejLlwKaQQF0imqc1QK3OmTnYtBtwsLI8q3S5MZsvT4m5EceuOxKa3sEHCfziH80mXJm2tyNs33tZisPy5Ulx4bgs5F0WtTN2ymF2GfpcvJeeVtxCNI3cIMTwI6Re+0hXHMAcUlM/qfQkQLqjFU7coC8cG6ULRPXHJDDKX4pAtJjgiOecH2i51buuZV8eoH0ar1EFv0DZkQ0LPeJvGp6J4ez+bnABKDHcjq1SwPRNx+BJX+MSXj50arwNjKzfkAZadHHqlSAD1V5/JF4xaJjd0QEmlYHDOJ7yhuk0SKuaKrlbL6+ghA6erEF3BiubKHfeFhJMJC+ddJvHsM/hLtZZWdy34oRwM0O6LrYAp9lorvL+ZS8PWKCW6C3P1ON/STo6O4pZWY6lgFpRGBdsG1vrjkfbJbJuGTbD0d4Z3KuTQ/MupgL4UPWVPu8/nYVUx+ZjTpVTqzM=; frsx=AAAAAFT608sk-PTqH_mPiGvYtDnsqt76VMngSo5KRkmcgMZixsj87-jyA7-dUfc6t3HdsLvqhN2uijdmpvihlWThNVgvc1zHAFfU_iqgluFu_1gTRItO1YM31U7rBb0a4XZrbOEOisqm2oAxDuyJ75g=; 0c6dad9b-8edd-448b-8ffb-55bd8a6e71a2=without_review_characteristics; zac=AAAAAAGNXifKyVj_0Hq4GTItL2ZKkLznJiU4lsL4Goch0uOrVvbUDAWfEbZUNdaV8Ui3tn-G-K0ZcBC1Q18VghsDpGebCtEDmNiqx46owOd3vJ_oWg4K39G5eNxO7vi3-1XTeW-P_LF-899c3C3UrD-7ma4myOFdzlQSgIWWgOA1s0GoG66SnIf_PW8H5w0t7AojXAKo9fA_vH-CFVSDE_5MtfH5514zkAgi9iQ5ChhWZWrIPKy7cpyM9ptan7Z9SkjZun_fSwkpDF3w-e1HtHYDWRxzkd1M4Xb10v4C806tL7H4OZ2XlWNG7w92HPGTAAtBJGz9kMYQr_tJY5xHXHw7DbTOC7riCYi1Box2ExXQQsMrIRwWTdVzVEF41asqKoQWpzZSJw1-attSbNhjpIQm6prTK7vZgFNPQUw10aY5ZDI-AXfTFjXArsea94vO8JFVwynm64TkhYqZYRrhPKTq6SDOreSder_SQUybgXvUW7ihuQZdEY_yVW_3-vELFQqPNeor5qo1JBVQxT_aH8ZDaJP8Ib4FsbarIUQr9SD1uw5-ueHyXoVxYsXINXAkjb1pxwf8_h5Hss83gf9H2liJ_B4Fy8BalzmroDjqDQ2X3tSRuXNKPrpNjkvL2zHi5ausEV0ytnU5EK4KD76qlKQhWg8deFoBKFqgm7X3hrPg8bfx9sxuQwxaO3QYA_wPO8mjBkHCOqxBwkv3jd9WsZHd3TQDvWWX-pfk4cr6yl7_KUYEuHAYlT1rC8seJb1vn9HZEFh7gLATfr0BUsZvTbL7g_etOkUwgTD6I3RXxsulqD78kacS8p5vYZPuVCvQMY_T5TBphY-y4_3QZbinHppTpssbUmsA9Yh60508tm1VNKNzDXeoeAPNkbPZJaR-bySxWCm1vg0gZiSz3nrA9Zm9ufIlUfJLR64VVM3BjjjYrbkYx1E7BUZ-5_I8j3sZQeQWPPxWrPiiWuF2UjLW1XNB4wWvfHdtW65h7Ks0VXfJr0midxYx6uehKzFa2Xo87TSwd1YopRYdEi50EasseZZAk79x2Bd6VCYCyWvcKDgFDLtMOMA7SPEYyFyKt2o16ttSNdlVjjidGnbMQt4UjwawPZQm5Ox-ls7xvCjhNtx6KIkiyn6dmaY3aIwROYccM-GCIdkEnCehnm3F53jxDCXJiyVZNB9shDg=; _abck=34B42C47F4CE9A29BABCC689EC1E54F5~-1~YAAQx/pxaA0t5mF6AQAAICsibAbE3z4zeLL3AsAAyR/GLauQu/puQEH1Kfy+3re8ItCmFMB5Puvwzlg8SdyAxaX57Se2773wQ8fbPe8/PCx+Lbp/GYKzx2X4eJ9bZbgBm0zmhVmkCobsbvKCtN41AT4/Rs9WYlX1BXRfPiLimKnw9ZXH6Pv+NQ//z9CU8BkvuRZ65P7cqR/NCXgVTi+HEAIIB5XoatIDsDr4d/x5aBOVY3x6a9gjnGB1CJWvOaGWRF8mbMy6ViONQaAPWXCz/0rzw/wKL8o9cb6xe3ZinRXD5462oh9CEwVLkI33U88qpEZ1n9mVp9hmLxsChsw9d53l6OGaS+CiKebETgAzEE9NPdgToh/ebyKMGYs/VKGfuo4VdQDnOA6IIqfMDAxbOdHMKFDF5bsd0l/k0VdEkHWYlmFsqIU+xSKd+TB0NEUA1whauEoEWNtYZp5U3p8FNugPIE5jurJ/kA==~-1~-1~-1; bm_sv=298D344BA8E24E1C0074085C0BCFF378~O7grib9bJvnaZYiJBKqpTnyzBVWZwktriznOoQtvivpA0A1MBQceCezFL7fEBjtakX4L2wZJwHVUnSw3xuxIW6H8xiCAu1ykPZllskTCseDljvGe0+Jk6JDogRYiAYrREmDHBWkl0hchW5hcbfiYYFZS9euTnhd0yzIyC+kv3k8=
					// { "gtm": {
					// 	"shopBrandshopPage":"false",
					// 	"shopCurrency":"EUR",
					// 	"shopDomain":"www.zalando.es",
					// 	"shopTimestamp":"1625313559061",
					// 	"shopId":"30",
					// 	"shopChannel":"d",
					// 	"shopRebuild":1,
					// 	"visitorFirstImpression":"false",
					// 	"visitorID":"b21b0db3dde1ff61954b4c989b2e02e7",
					// 	"visitorClientId":"6f23fdce-28d3-4862-9181-fe79e68f64d8",
					// 	"visitorCity": "Sant Joan de Vilatorrada",
					// 	"visitorBehavioralGender":"m",
					// 	"visitorInitialGender":"unknown",
					// 	"visitorContextGender":"male",
					// 	"visitorCookiesAccepted":0,
					// 	"visitorExistingCustomer":"1",
					// 	"visitorLogin":"1",
					// 	"visitorFashionCategory":"no preference",
					// 	"visitorEHash":"9N5rN_cAAGokIb7PROkV2nemtnu2nd2-KimGLjK8LRI",
					// 	"visitorSegment":"N",
					// 	"visitorNewsletter":"0",
					// 	"visitorZetMembership":"not signed up",
					// 	"visitorZetEligibility":"(not set)",
					// 	"visitorWardrobeCounts": "Liked:0|Zalando Purchased:0|Uploaded:0",
					// 	"gtm.start": "Date.now()",
					// 	"event": "gtm.js",
					// 	"shopPageFlowId": "VlxPqRCwWtLJnKA5",
					// 	"deliveryPromise": "fulfillment_planner_prediction;070721;090721",
					// 	"orderProducts":["JOC12N001-A210105000"],
					// 	"orderProductsConfigs":["JOC12N001-A21"],
					// 	"orderProductsName":["AIR JORDAN 1 MID - Zapatillas altas - white\\/gym red\\/black"],
					// 	"orderProductsBrand":["Jordan"],
					// 	"orderProductsBrandCode":["JOC"],
					// 	"orderProductsColor":["blanco"],
					// 	"orderProductsQuantity":[1],
					// 	"orderProductsSize":["44.5"],
					// 	"orderProductsPrice":["99.13"],
					// 	"orderProductsPriceGross":["119.95"],
					// 	"orderProductsTax":["20.82"],
					// 	"orderProductsSale":[0],
					// 	"orderProductsCount":"1",
					// 	"orderProductsVentureID":["1"],
					// 	"orderProductsCondition":["new"],
					// 	"orderTotal":"99.13",
					// 	"orderTotalGross":"119.95",
					// 	"orderTotalTax":"20.82",
					// 	"orderProductsPartnerId":["0"],
					// 	"orderProductsSupplierId":["0"],
					// 	"orderProductsFlag":["(not set)"],
					// 	"orderProductBenefits":"JOC12N001-A210105000:(not set)",
					// 	"orderDiscounts":"0.0",
					// 	"orderDeliveryOptionsAvailable":"standard",
					// 		"shippingCostsReasons": ["NONE"],
					// 	"shippingCostsPrice": "0.00",
					// 	"shippingCostsCurrency": "EUR",

					// 	"orderVoucherCreditUsed":"0",
					// 	"orderGiftWrappingAvailable": "no",
					// 	"orderPaymentMethod":"CASH_ON_DELIVERY",
					// 	"shopOnsiteElementDisp":"Checkbox_Uebersicht,edelivery_00",
					// 	"shopPageType":"CHECKOUT_CONFIRM"
					// }}
					// <link rel="stylesheet" href="https://mosaic02.ztat.net/cst/fjord-k8s/440b69381ff18e7fdfbb/client.css"><script data-pipe>TailorPipe.start(20, "https://mosaic01.ztat.net/base-assets/sentry-4.0.6.min.js", {"timingGroups":["mosaic-interactive"],"id":"confirm","primary":true,"range":[20,21]})</script><script data-pipe>TailorPipe.start(21, "https://mosaic02.ztat.net/cst/fjord-k8s/440b69381ff18e7fdfbb/client.js", {"timingGroups":["mosaic-interactive"],"id":"confirm","primary":true,"range":[20,21]})</script><div data-props='{&quot;name&quot;:&quot;confirmation&quot;,&quot;model&quot;:{&quot;countryCode&quot;:&quot;ES&quot;,&quot;pupSpecificMessageKey&quot;:&quot;zalando.checkout.confirmation.shipment.express.unavailable.pickuppoint&quot;,&quot;groups&quot;:[{&quot;id&quot;:&quot;5523c59a-f5db-4f77-85d8-84c99f308261&quot;,&quot;isGiftCardGroup&quot;:false,&quot;articles&quot;:[{&quot;articleId&quot;:&quot;f80771c0-dbf5-11eb-88fb-25d4c2a51a4c&quot;,&quot;articleIds&quot;:[&quot;f80771c0-dbf5-11eb-88fb-25d4c2a51a4c&quot;],&quot;simpleSku&quot;:&quot;JOC12N001-A210105000&quot;,&quot;configSku&quot;:&quot;JOC12N001-A21&quot;,&quot;name&quot;:&quot;AIR JORDAN 1 MID - Zapatillas altas - white/gym red/black&quot;,&quot;brandName&quot;:&quot;Jordan&quot;,&quot;color&quot;:&quot;white/gym red/black&quot;,&quot;shopUrl&quot;:&quot;/jordan-air-jordan-1-mid-zapatillas-altas-whitegym-redblack-joc12n001-a21.html&quot;,&quot;canBeAddedToWishList&quot;:false,&quot;disableQuantityChange&quot;:true,&quot;quantity&quot;:1,&quot;discount&quot;:&quot;0&quot;,&quot;tags&quot;:[],&quot;metadata&quot;:{&quot;high_fulfillment_quality&quot;:&quot;false&quot;},&quot;campaigns&quot;:[],&quot;presentationFlags&quot;:[],&quot;size&quot;:&quot;44.5&quot;,&quot;imageUrl&quot;:&quot;https://img01.ztat.net/article/spp-media-p1/f8487fbf9ed047698b7282b9550679bf/8b4a5552ed014d0995280d974ad42810.jpg?imwidth=303&amp;filter=packshot&quot;,&quot;available&quot;:1,&quot;price&quot;:{&quot;value&quot;:11995,&quot;currency&quot;:&quot;EUR&quot;,&quot;formatted&quot;:&quot;119,95 €&quot;},&quot;tax&quot;:{&quot;value&quot;:2082,&quot;currency&quot;:&quot;EUR&quot;,&quot;formatted&quot;:&quot;20,82 €&quot;},&quot;taxRate&quot;:0.21,&quot;originalPrice&quot;:{&quot;value&quot;:11995,&quot;currency&quot;:&quot;EUR&quot;,&quot;formatted&quot;:&quot;119,95 €&quot;},&quot;errors&quot;:[],&quot;isInWishList&quot;:false,&quot;soldBy&quot;:{&quot;supplierId&quot;:&quot;&quot;,&quot;supplierName&quot;:&quot;Zalando&quot;}}],&quot;shipment&quot;:{&quot;estimate&quot;:&quot;Mi, 07.07. - Vi, 09.07.&quot;,&quot;fulfillmentService&quot;:&quot;STANDARD&quot;},&quot;shippingFee&quot;:{&quot;value&quot;:{&quot;value&quot;:0,&quot;currency&quot;:&quot;EUR&quot;,&quot;formatted&quot;:&quot;0,00 €&quot;},&quot;charges&quot;:[]},&quot;shippedBy&quot;:{&quot;fulfillmentNetwork&quot;:&quot;ZALANDO&quot;,&quot;fulfillmentName&quot;:&quot;Zalando&quot;}}],&quot;unavailableArticles&quot;:[],&quot;outOfStockArticles&quot;:[],&quot;selectedDeliveryService&quot;:&quot;STANDARD&quot;,&quot;delivery&quot;:{&quot;type&quot;:&quot;STANDARD&quot;,&quot;price&quot;:&quot;gratis&quot;,&quot;shipmentCostMoney&quot;:{&quot;value&quot;:0,&quot;currency&quot;:&quot;EUR&quot;,&quot;formatted&quot;:&quot;0,00 €&quot;}},&quot;totalPriceMoney&quot;:{&quot;value&quot;:11995,&quot;currency&quot;:&quot;EUR&quot;,&quot;formatted&quot;:&quot;119,95 €&quot;},&quot;totalTaxMoney&quot;:{&quot;value&quot;:2082,&quot;currency&quot;:&quot;EUR&quot;,&quot;formatted&quot;:&quot;20,82 €&quot;},&quot;totalPrice&quot;:&quot;119,95 €&quot;,&quot;subTotalPriceMoney&quot;:{&quot;value&quot;:11995,&quot;currency&quot;:&quot;EUR&quot;,&quot;formatted&quot;:&quot;119,95 €&quot;},&quot;subTotalPrice&quot;:&quot;119,95 €&quot;,&quot;splitShipmentAvailable&quot;:false,&quot;splitShipmentSelected&quot;:false,&quot;errors&quot;:[],&quot;warnings&quot;:[],&quot;coupons&quot;:[],&quot;availableFees&quot;:[{&quot;type&quot;:&quot;CO2&quot;,&quot;prices&quot;:[{&quot;paymentMethod&quot;:&quot;all&quot;,&quot;price&quot;:&quot;0,25 €&quot;}]}],&quot;checkoutId&quot;:&quot;M3Uw7LoA9-fG98MS3pR9EAJDnApJVgC4kvPmEtmOG70&quot;,&quot;customerData&quot;:{&quot;email&quot;:&quot;janmuntsiglesias@gmail.com&quot;,&quot;phoneNumber&quot;:&quot;689708580&quot;,&quot;firstname&quot;:&quot;Jan&quot;,&quot;lastname&quot;:&quot;Munts&quot;},&quot;customerValidationSchema&quot;:{&quot;country_code&quot;:&quot;es&quot;,&quot;field_family&quot;:&quot;customer&quot;,&quot;version&quot;:&quot;374810112&quot;,&quot;rules&quot;:{&quot;$schema&quot;:&quot;http://json-schema.org/draft-04/schema#&quot;,&quot;title&quot;:&quot;Customer&quot;,&quot;type&quot;:&quot;object&quot;,&quot;properties&quot;:{&quot;phone_number&quot;:{&quot;type&quot;:&quot;string&quot;,&quot;pattern&quot;:&quot;(^[6-7][0-9]{8}$)&quot;}}}},&quot;defaultBillingAddress&quot;:{&quot;id&quot;:&quot;26169617&quot;,&quot;salutation&quot;:&quot;Ms&quot;,&quot;first_name&quot;:&quot;Jan&quot;,&quot;last_name&quot;:&quot;Munts&quot;,&quot;street&quot;:&quot;Carrer de Maria Aurèlia Capmany 31&quot;,&quot;additional&quot;:&quot;1o 2a&quot;,&quot;zip&quot;:&quot;08250&quot;,&quot;city&quot;:&quot;Sant Joan de Vilatorrada&quot;,&quot;country_code&quot;:&quot;ES&quot;},&quot;delayNotifications&quot;:{&quot;backlog&quot;:false,&quot;strike&quot;:false,&quot;holiday&quot;:false},&quot;deliveryOptions&quot;:[{&quot;deliveryService&quot;:&quot;STANDARD&quot;,&quot;disabled&quot;:false,&quot;isZet&quot;:false,&quot;products&quot;:[{&quot;deliveryDate&quot;:&quot;Mi, 07.07. - Vi, 09.07.&quot;,&quot;earliestDelivery&quot;:&quot;2021-07-07T11:00:00+02:00&quot;,&quot;latestDelivery&quot;:&quot;2021-07-09T19:00:00+02:00&quot;}],&quot;cost&quot;:{&quot;value&quot;:0,&quot;formatted&quot;:&quot;0,00 €&quot;},&quot;includedCharges&quot;:[]}],&quot;deliveryProduct&quot;:{&quot;id&quot;:&quot;134&quot;,&quot;carrier&quot;:&quot;CEL&quot;,&quot;destination&quot;:&quot;HOME&quot;,&quot;deliveryService&quot;:&quot;STANDARD&quot;},&quot;eTag&quot;:&quot;\&quot;008e4b44-5677-4998-ac55-3ca296c82dc1\&quot;&quot;,&quot;expressAvailable&quot;:false,&quot;flowId&quot;:&quot;VlxPqRCwWtLJnKA5&quot;,&quot;headerLogoConfig&quot;:{&quot;has_custom&quot;:false,&quot;file_name&quot;:&quot;&quot;},&quot;isCustomerPhoneNumberRequired&quot;:false,&quot;isExpressNotificationDisabled&quot;:false,&quot;isGiftWrappingEnabled&quot;:false,&quot;isPromotionOfMembershipDeliveryOptionsEnabled&quot;:false,&quot;membershipStatus&quot;:&quot;NOT_ELIGIBLE&quot;,&quot;membershipInfo&quot;:{&quot;isActiveMember&quot;:false,&quot;isEligibleCustomer&quot;:false},&quot;selectedDelivery&quot;:{&quot;deliveryDestination&quot;:&quot;HOME&quot;,&quot;address&quot;:{&quot;id&quot;:&quot;26169617&quot;,&quot;salutation&quot;:&quot;Ms&quot;,&quot;first_name&quot;:&quot;Jan&quot;,&quot;last_name&quot;:&quot;Munts&quot;,&quot;street&quot;:&quot;Carrer de Maria Aurèlia Capmany 31&quot;,&quot;additional&quot;:&quot;1o 2a&quot;,&quot;zip&quot;:&quot;08250&quot;,&quot;city&quot;:&quot;Sant Joan de Vilatorrada&quot;,&quot;country_code&quot;:&quot;ES&quot;}},&quot;selectedGiftWrapping&quot;:false,&quot;uiVariants&quot;:{},&quot;useShippingAddressAsBillingAddress&quot;:true,&quot;zetBannerData&quot;:{},&quot;isVatMessageEnabled&quot;:false,&quot;useLabelStyle&quot;:false,&quot;useAppIOS14Style&quot;:true,&quot;paymentInfo&quot;:{&quot;payTokenDetails&quot;:{&quot;paymentMethod&quot;:&quot;CASH_ON_DELIVERY&quot;},&quot;paymentRedirectUrl&quot;:{&quot;url&quot;:&quot;https://checkout.payment.zalando.com/payment-method-selection-session/bbffe418-87b0-40c7-91a0-7c1402e8c111/selection?show=true&quot;,&quot;skippable&quot;:true,&quot;originalUrl&quot;:&quot;https://checkout.payment.zalando.com/payment-method-selection-session/bbffe418-87b0-40c7-91a0-7c1402e8c111/selection&quot;}},&quot;hiddenZipCodes&quot;:[]}}' data-translations='{&quot;Country.GERMANY&quot;:&quot;Alemania&quot;,&quot;Country.NETHERLANDS&quot;:&quot;Países Bajos&quot;,&quot;Country.FRANCE&quot;:&quot;Francia&quot;,&quot;Country.ITALY&quot;:&quot;Italia&quot;,&quot;Country.UNITED_KINGDOM&quot;:&quot;Reino Unido&quot;,&quot;Country.AUSTRIA&quot;:&quot;Austria&quot;,&quot;Country.SWITZERLAND&quot;:&quot;Suiza&quot;,&quot;Country.POLAND&quot;:&quot;Polonia&quot;,&quot;Country.BELGIUM&quot;:&quot;Bélgica&quot;,&quot;Country.LUXEMBOURG&quot;:&quot;Luxemburgo&quot;,&quot;Country.SWEDEN&quot;:&quot;Suecia&quot;,&quot;Country.FINLAND&quot;:&quot;Finlandia&quot;,&quot;Country.DENMARK&quot;:&quot;Dinamarca&quot;,&quot;Country.SPAIN&quot;:&quot;España&quot;,&quot;Country.NORWAY&quot;:&quot;Noruega&quot;,&quot;Country.CZECH_REPUBLIC&quot;:&quot;República Checa&quot;,&quot;Country.IRELAND&quot;:&quot;Irlanda&quot;,&quot;Country.CROATIA&quot;:&quot;Croacia&quot;,&quot;Country.ESTONIA&quot;:&quot;Estonia&quot;,&quot;Country.LATVIA&quot;:&quot;Letonia&quot;,&quot;Country.LITHUANIA&quot;:&quot;Lituania&quot;,&quot;Country.SLOVENIA&quot;:&quot;Eslovenia&quot;,&quot;Country.SLOVAKIA&quot;:&quot;Eslovaquia&quot;,&quot;Country.PORTUGAL&quot;:&quot;Portugal&quot;,&quot;Country.GREECE&quot;:&quot;Grecia&quot;,&quot;Country.HUNGARY&quot;:&quot;Hungría&quot;,&quot;Country.RUMANIA&quot;:&quot;Rumanía&quot;,&quot;Country.MALTA&quot;:&quot;Malta&quot;,&quot;Country.CYPRUS&quot;:&quot;Chipre&quot;,&quot;Country.BULGARIA&quot;:&quot;Bulgaria&quot;,&quot;zalando.checkout.success.title&quot;:&quot;Listo. Recibirás un e-mail de confirmación en breve.&quot;,&quot;customer.order.shippingAddress&quot;:&quot;Dirección de envío&quot;,&quot;zalando.checkout.confirm.deliverytime.PREPAYMENT&quot;:&quot;Después de recibir tu pago: de 4 a 7 días laborables&quot;,&quot;customer.order.orderedItems&quot;:&quot;Artículos&quot;,&quot;zalando.checkout.progress.step.confirmation&quot;:&quot;Confirmación&quot;,&quot;zalando.checkout.confirmation.confirm.INVOICE&quot;:&quot;Finalizar pedido&quot;,&quot;zalando.checkout.confirmation.confirm.PREPAYMENT&quot;:&quot;Pagar de forma segura&quot;,&quot;checkout.confirmation.confirm.CHEQUE&quot;:&quot;&quot;,&quot;zalando.checkout.confirmation.confirm.CASH_ON_DELIVERY&quot;:&quot;Finalizar y validar el pago&quot;,&quot;zalando.checkout.confirmation.confirm.CREDITCARD&quot;:&quot;Pagar de forma segura&quot;,&quot;zalando.checkout.confirmation.confirm.PAYPAL&quot;:&quot;Pagar de forma segura&quot;,&quot;zalando.checkout.confirmation.confirm.IDEAL&quot;:&quot;&quot;,&quot;zalando.checkout.confirmation.confirm.EPS&quot;:&quot;Finalizar el pedido e ir a Pago&quot;,&quot;zalando.checkout.confirmation.confirm.POSTFINANCE&quot;:&quot;Confirmar e ir a PostFinance&quot;,&quot;zalando.checkout.confirmation.confirm.P24&quot;:&quot;Finalizar pedido&quot;,&quot;zalando.checkout.confirmation.confirm.MAK&quot;:&quot;Bestellung absenden und weiter zur Zahlung&quot;,&quot;zalando.checkout.confirmation.confirm.DIRECTDEBIT&quot;:&quot;Finalizar pedido&quot;,&quot;zalando.checkout.confirmation.confirm.TRUSTLY&quot;:&quot;&quot;,&quot;zalando.checkout.confirmation.confirm&quot;:&quot;Pagar de forma segura&quot;,&quot;zalando.checkout.confirmation.standardDelivery.label&quot;:&quot;Envío estándar&quot;,&quot;zalando.checkout.confirmation.expressDelivery.label&quot;:&quot;Envío exprés&quot;,&quot;zalando.checkout.confirmation.samedayDelivery.label&quot;:&quot;Premium-Lieferung am Abend&quot;,&quot;zalando.checkout.confirmation.fastDelivery.label&quot;:&quot;Premium-Lieferung&quot;,&quot;zalando.checkout.confirmation.expressDelivery.notAvailable.paymentServiceErrorDetail&quot;:&quot;&lt;strong&gt;Actualmente el servicio de envío exprés:&lt;/strong&gt;&lt;ul&gt;&lt;li&gt;Solo está disponible con determinados artículos y pedidos.&lt;/li&gt;&lt;li&gt;Debe realizarse a direcciones dentro de España, sin embargo, algunos códigos postales pueden quedar excluidos.&lt;/li&gt;&lt;/ul&gt;&quot;,&quot;zalando.checkout.confirmation.expressDelivery.notAvailable.orderServiceErrorDetail&quot;:&quot;&lt;strong&gt;Actualmente el servicio de envío exprés:&lt;/strong&gt;&lt;ul&gt;&lt;li&gt;Solo está disponible con determinados artículos y pedidos.&lt;/li&gt;&lt;li&gt;Debe realizarse a direcciones dentro de España, sin embargo, algunos códigos postales pueden quedar excluidos.&lt;/li&gt;&lt;/ul&gt;&quot;,&quot;zalando.checkout.confirmation.expressDelivery.notAvailable.orderAndPaymentServicesErrorDetail&quot;:&quot;Lamentablemente no podemos ofrecer el servicio de envío exprés para este código postal. El método de pago que has seleccionado no está disponible. Por favor selecciona uno de los siguientes métodos de pago: Tarjeta de crédito, PayPal o saldo Zalando.&quot;,&quot;cart.error.articleOutOfStock&quot;:&quot;El artículo ya no está disponible en tu talla&quot;,&quot;zalando.checkout.address.billingSameAsShipping&quot;:&quot;Coincide con la dirección de envío&quot;,&quot;customer.order.billingAddress&quot;:&quot;Dirección de facturación&quot;,&quot;a11y.zalando.checkout.editbillingaddress.icon&quot;:&quot;Modifica tu dirección de facturación&quot;,&quot;a11y.zalando.checkout.editdeliveryaddress.icon&quot;:&quot;Modifica tu dirección de envío&quot;,&quot;checkout.confirm.communication.strikes&quot;:&quot;Debido a la huelga, el plazo de entrega habitual puede retrasarse de 1 a 2 días laborables.&quot;,&quot;checkout.confirm.communication.holiday&quot;:&quot;**NO_NOTIFICATION**&quot;,&quot;checkout.confirm.communication.backlog&quot;:&quot;Posible retraso de 2 o 3 días laborables por problemas de la compañia distribuidora&quot;,&quot;checkout.giftkit.headline&quot;:&quot;¿Lo quieres para regalo?&quot;,&quot;zalando.checkout.confirmation.header&quot;:&quot;Comprobar y finalizar pedido&quot;,&quot;zalando.checkout.confirmation.termsAgree&quot;:&quot;La realización de un pedido en &lt;a href=\&quot;/\&quot;&gt;Zalando.es&lt;/a&gt; implica la aceptación de nuestros &lt;a class=\&quot;zalando-cgc\&quot; href=\&quot;{1}\&quot;&gt;Términos y condiciones&lt;/a&gt;, la &lt;a class=\&quot;proteccion-de-datos\&quot; href=\&quot;{0}\&quot;&gt;Política de privacidad&lt;/a&gt; y la &lt;a class=\&quot;cgc/#revocable\&quot; href=\&quot;{2}\&quot;&gt; Política de revocación&lt;/a&gt;. También confirmas que esta compra es para uso personal.&quot;,&quot;link.privacyPolicy&quot;:&quot;/zalando-proteccion-de-datos/&quot;,&quot;link.termsAndConditions&quot;:&quot;/zalando-cgc/&quot;,&quot;link.returnPolicy&quot;:&quot;/zalando-cgc/&quot;,&quot;membership.banner.text&quot;:&quot;nur 15,00 € im Jahr&quot;,&quot;membership.banner.link&quot;:&quot;Mehr erfahren&quot;,&quot;membership.banner.logo.alttext&quot;:&quot;Zalando Plus&quot;,&quot;membership.banner.title&quot;:&quot;Premium-Lieferung, exklusive Rabatte und viele weitere Extras&quot;,&quot;zalando.checkout.confirmation.shippingOptions&quot;:&quot;Modo de envío&quot;,&quot;zalando.checkout.confirmation.shipment.unavailable.first&quot;:&quot;El modo de envío seleccionado no está disponible para&quot;,&quot;zalando.checkout.confirmation.shipment.unavailable.second&quot;:&quot;un artículo del pedido&quot;,&quot;zalando.checkout.confirmation.expressDelivery.availabilityCondition&quot;:&quot;Lo sentimos, el servicio de envío exprés no está disponible a tu dirección de facturación&quot;,&quot;zalando.checkout.confirmation.promotion.eligible.express&quot;:&quot;&lt;strong&gt;Spare 7,90 €&lt;/strong&gt; mit&quot;,&quot;zalando.checkout.confirmation.promotion.member.express&quot;:&quot;Du sparst pro Bestellung 7,90 € mit&quot;,&quot;zalando.checkout.confirmation.promotion.eligible.sameday&quot;:&quot;&lt;strong&gt;Spare 6,90 €&lt;/strong&gt; mit&quot;,&quot;zalando.checkout.confirmation.promotion.member.sameday&quot;:&quot;Du sparst pro Bestellung 6,90 € mit&quot;,&quot;zalando.checkout.confirmation.promotion.eligible.fast&quot;:&quot;&lt;strong&gt;Spare 4,90 €&lt;/strong&gt; mit&quot;,&quot;zalando.checkout.confirmation.promotion.member.fast&quot;:&quot;Du sparst pro Bestellung 4,90 € mit&quot;,&quot;checkout.confirm.delivery.option.ldd.fee.label&quot;:&quot;Tarifa por larga distancia incluida&quot;,&quot;checkout.confirm.shipment.ldd.fee.label&quot;:&quot;Envío de larga distancia&quot;,&quot;zalando.checkout.success.digital.printIt.confirmationMessage&quot;:&quot;¡Bien! Hemos enviado la tarjeta regalo a {0}, llegará en los próximos 15 minutos lista para su impresión. Puedes ver una copia en los detalles del pedido.&quot;,&quot;zalando.checkout.success.digital.printIt.infoMessage&quot;:&quot;Hemos enviado la tarjeta regalo y la confirmación del pedido por separado.&quot;,&quot;zalando.checkout.success.digital.sendViaEmail.confirmationMessage&quot;:&quot;¡Bien! el destinatario recibirá la tarjeta de regalo en los próximos 15 minutos. Puedes ver una copia en los detalles del pedido.&quot;,&quot;zalando.checkout.success.digital.sendViaEmail.infoMessage&quot;:&quot;Te hemos enviado la confirmación del pedido en un correo distinto.&quot;,&quot;zalando.checkout.success.digital.header&quot;:&quot;Gracias por tu pedido. ¡Buena elección!&quot;,&quot;zalando.checkout.address.digital.sendViaEmail.deliveryMessage&quot;:&quot;Enviaremos la tarjeta regalo a la dirección de correo: {0}&quot;,&quot;zalando.checkout.address.digital.printIt.deliveryMessage&quot;:&quot;Enviaremos la tarjeta regalo en formato PDF a: {0}&quot;,&quot;zalando.checkout.digital.mail.CC&quot;:&quot;¿Quieres ver cómo queda? Te enviamos una copia.&quot;,&quot;validation.required&quot;:&quot;Campo obligatorio&quot;,&quot;customer.address.packstation.number.invalid&quot;:&quot;Introduce un número válido de Packstaion.&quot;,&quot;customer.address.packstation.postNumber.invalid&quot;:&quot;Introduce un Postnummer válido.&quot;,&quot;validation.streetChar&quot;:&quot;Introduce tu calle y número de casa.&quot;,&quot;address.lastname.valueDoesNotMatch&quot;:&quot;Caracteres no válidos&quot;,&quot;validation.letters&quot;:&quot;Utiliza sólo los caracteres (a-z o A-Z) en este campo.&quot;,&quot;validation.minlength&quot;:&quot;Demasiado corto.&quot;,&quot;validation.maxlength&quot;:&quot;Demasiado largo&quot;,&quot;address.zip.shippingForbidden&quot;:&quot;No se realizan envíos a este código postal.&quot;,&quot;validation.invalid&quot;:&quot;Entrada invalida&quot;,&quot;zalando.checkout.progress.step.address&quot;:&quot;Dirección&quot;,&quot;zalando.checkout.address.saveAndProceed&quot;:&quot;Siguiente&quot;,&quot;checkout.gotit&quot;:&quot;¡Entendido!&quot;,&quot;checkout.shipping.freeDeliveryTo&quot;:&quot;Envío gratuito a&quot;,&quot;checkout.shipping.hint&quot;:&quot;¿No sabes cuándo estarás en casa? Ahora puedes recibir tu paquete en tu punto de recogida más cercano.&quot;,&quot;checkout.shipping.additional.text&quot;:&quot;Te mandaremos un SMS cuando tu pedido esté listo para su recogida.&quot;,&quot;shipping.modal.phone&quot;:&quot;&lt;p&gt;Your mobile number and email address will only be shared with Hermes to provide the following services:&lt;/p&gt;             &lt;ul class=\&quot;dList\&quot;&gt;                 &lt;li&gt;delivery status updates&lt;/li&gt;                 &lt;li&gt;notification when your parcel is ready for collection&lt;/li&gt;             &lt;/ul&gt;&quot;,&quot;form.label.email&quot;:&quot;Correo electrónico&quot;,&quot;checkout.shipping.additional.headline&quot;:&quot;Datos de contacto&quot;,&quot;shipping.partner.no.shippingCountry.support&quot;:&quot;Malheureusement, nous ne pouvons pas expédier, une partie des articles que vous avez sélectionnée, au Luxembourg. Veuillez saisir une autre adresse ou supprimer l’article faisant partie du Programme Partenaire Zalando de votre panier.&quot;,&quot;zalando.checkout.address.digital.billingAddressInfo&quot;:&quot;Por favor, indica la dirección de facturación que irá asociada al método de pago.&quot;,&quot;zalando.checkout.success.confirmationMessage&quot;:&quot;En breve recibirás und e-mail de confirmación a {0}&quot;,&quot;zalando.checkout.success.confirmationMessage.servicesdown&quot;:&quot;Te hemos enviado la confirmación del pedido a {0}&quot;,&quot;zalando.checkout.success.header&quot;:&quot;Tu compra se ha completado correctamente. ¡Buena elección!&quot;,&quot;checkout.success.communication.strikes&quot;:&quot;Debido a la huelga, el plazo de entrega habitual puede retrasarse de 1 a 2 días laborables. No desesperes, estamos en ello.&quot;,&quot;checkout.success.communication.holiday&quot;:&quot;Debido a las festividades, el plazo de entrega habitual puede retrasarse de 1 a 2 días laborables. No desesperes, estamos en ello.&quot;,&quot;checkout.success.communication.backlog&quot;:&quot;Posible retraso de 2 o 3 días laborables por problemas de la compañia distribuidora&quot;,&quot;zalando.checkout.success.viewOrderInCustomerAccount&quot;:&quot;Sigue tu pedido en todo momento en {0}.&quot;,&quot;customer.account.credit.account.overview&quot;:&quot;Tu saldo y tus tarjetas regalo&quot;,&quot;customer.order.title&quot;:&quot;Tus pedidos&quot;,&quot;checkout.success.replayorder.headline&quot;:&quot;Bestellübersicht&quot;,&quot;order.number&quot;:&quot;Número de pedido&quot;,&quot;zalando.cart.minusCreditAccount&quot;:&quot;Tu saldo de Zalando&quot;,&quot;order.totalPrice&quot;:&quot;Total&quot;,&quot;wishlist.incTax&quot;:&quot;IVA incluido&quot;,&quot;zalando.checkout.confirmation.shipping.dynamical.headerMulti&quot;:&quot;Entrega prevista&quot;,&quot;zalando.checkout.confirmation.shipping.dynamical.headerSingle&quot;:&quot;Fecha de entrega prevista&quot;,&quot;checkout.shipping.giftcards.label&quot;:&quot;Tarjeta regalo&quot;,&quot;cart.error.tooManyCartItems&quot;:&quot;Se ha superado el límite de productos en la cesta. Finaliza tu pedido o reduce el número de artículos.&quot;,&quot;cart.error.quantityChangeFailed&quot;:&quot;En este momento no es posible cambiar la cantidad del artículo deseado. Inténtalo de nuevo más tarde.&quot;,&quot;cart.error.quantityChanged&quot;:&quot;El inventario de nuestros productos se ha modificado. Comprueba tu cesta. &quot;,&quot;cart.error.priceChanged&quot;:&quot;El precio de algunos artículos ha sido actualizado. Compruébalo en tu cesta.&quot;,&quot;checkout.error.general&quot;:&quot;Se ha producido un error, pero ya estamos trabajando para solucionarlo. Inténtalo de nuevo más tarde.&quot;,&quot;validation.zip&quot;:&quot;El código postal debe constar de 5 cifras.&quot;,&quot;validation.number&quot;:&quot;Introduce sólo cifras.&quot;,&quot;checkout.error.salesrule&quot;:&quot;Se ha producido un error en la tramitación de tu vale. Inténtalo otra vez.&quot;,&quot;validation.couponCode&quot;:&quot;Indica un código de vale&quot;,&quot;validation.phoneNumber&quot;:&quot;El número que has introducido no tiene un formato correcto. Debe constar de 9 números comenzando por los números 6 o 7. No introduzcas letras o símbolos, sólo se admiten números.&quot;,&quot;zalando.checkout.confirmation.message.reduced&quot;:&quot;La cantidad del artículo se ha reducido.&quot;,&quot;customer.address.selectSuggested.desc&quot;:&quot;¿Te has equivocado al escribir la dirección? Nuestro sistema ha sugerido una propuesta de corrección.&quot;,&quot;zalando.checkout.confirmation.bm.error&quot;:&quot;Tu pedido no ha sido completado debido a problemas técnicos. Inténtalo de nuevo más tarde.&quot;,&quot;zalando.checkout.confirmation.cc.error&quot;:&quot;No se ha podido tramitar la transferencia con tarjeta de crédito. Por favor, elige otra forma de pago.&quot;,&quot;zalando.checkout.confirmation.quantity.error&quot;:&quot;Uno de los artículos ya no está disponible por lo que no hemos podido procesar tu pedido, pero no te preocupes, puedes encontrar otros muy similares.&quot;,&quot;checkout.error.partnerNotAvailable&quot;:&quot;Aus technischen Gründen können zur Zeit keine Informationen zum Partnerprogramm angezeigt werden.&quot;,&quot;checkout.brand.shippingCountry.blacklist&quot;:&quot;No se pueden enviar todos los artículos seleccionados a {0}.  Elimina alguno de tu cesta o modifica tu dirección de envío&quot;,&quot;checkout.brand.shippingCountry.blacklisted.item&quot;:&quot;Leider kann dieser Artikel nicht nach Österreich geliefert werden.&quot;,&quot;main.monday&quot;:&quot;Lunes&quot;,&quot;main.tuesday&quot;:&quot;Martes&quot;,&quot;main.wednesday&quot;:&quot;Miércoles&quot;,&quot;main.thursday&quot;:&quot;Jueves&quot;,&quot;main.friday&quot;:&quot;Viernes&quot;,&quot;main.saturday&quot;:&quot;Sábado&quot;,&quot;main.sunday&quot;:&quot;Domingo&quot;,&quot;shipping.partner.dont.support&quot;:&quot;No es posible la entrega de artículos partner en puntos de recogida. Por favor, elige otra dirección.&quot;,&quot;customer.address.packstation.noBilling&quot;:&quot;No se puede utilizar ninguna Packstation como dirección de facturación&quot;,&quot;zalando.checkout.feedback.thankyou&quot;:&quot;Muchas gracias, ¡con tu ayuda mejoramos!&quot;,&quot;zalando.checkout.feedback.noEntry&quot;:&quot;Debes rellenar, al menos, uno de los campos.&quot;,&quot;zalando.checkout.confirmation.cc.correction&quot;:&quot;No se ha podido tramitar la transferencia con tarjeta de crédito. Por favor, modifica tus datos o elige otra forma de pago.&quot;,&quot;zalando.checkout.redirect.error.PAYPAL&quot;:&quot;Se ha producido un error en el pago vía PayPal.&quot;,&quot;zalando.checkout.redirect.error.IDEAL&quot;:&quot;Se ha producido un error en el pago con iDEAL. &quot;,&quot;zalando.checkout.confirmation.paymentcontrol.error&quot;:&quot;Lamentablemente, no hemos podido proceder con el método de pago que has elegido. Por favor, selecciona otra forma de pago.&quot;,&quot;message.error.temporarily&quot;:&quot;Se ha producido un fallo. Por favor, inténtalo de nuevo más tarde.&quot;,&quot;checkout.shipping.giftcards.delivery.disabled&quot;:&quot;No es posible el envío de tarjetas regalo a puntos de recogida. Por favor, elige otra dirección.&quot;,&quot;zalando.cart.coupon.account.amountLeft&quot;:&quot;Todavía tienes un total de {0} disponible.&quot;,&quot;zalando.cart.error.coupon.notfound&quot;:&quot;El vale {0} no existe en nuestro sistema. Comprueba que es el correcto.&quot;,&quot;zalando.cart.coupon.account.empty&quot;:&quot;El vale no ha podido ser canjeado porque el saldo está agotado.&quot;,&quot;checkout.error.unavailable&quot;:&quot;Debido al éxito de nuestras ofertas, no podemos proceder con tu compra en este momento. Pero no temas, tu cesta está a salvo y no se te han cobrado los artículos. Estamos trabajando para solucionar este problema lo antes posible.&quot;,&quot;shipping.partner.no.packstation.support&quot;:&quot;Derzeit sind Lieferungen mit einigen Partner-Artikeln an DHL Packstationen nicht möglich. Bitte eine andere Adresse wählen.&quot;,&quot;zalando.checkout.step.pickupPoints.error.noPP&quot;:&quot;No se ha encontrado ningún punto de recogida cerca de esta dirección. Inténtalo de nuevo o prueba con otra dirección.&quot;,&quot;checkout.digital.error.general&quot;:&quot;Ha ocurrido un pequeño error, inténtalo de nuevo en unos instantes. Y no te preocupes, no se te ha cobrado el importe.&quot;,&quot;zalando.checkout.covid19.disabledplaceorder.error&quot;:&quot;Lo sentimos. En este momento, todos los pedidos han sido pausados. Para más información consulta nuestras FAQ o la página de Ayuda y contacto.&quot;,&quot;zalando.prodpres.notification.add_to_cart.error&quot;:&quot;No se puede añadir el artículo a la cesta en este momento. Prueba de nuevo más tarde.&quot;,&quot;zalando.checkout.disabledplaceorder.brexit.northernireland&quot;:&quot;Unfortunately, we cannot deliver parcels to your region right now. We’re currently working on a solution, thanks for your patience.&quot;,&quot;order.subprice&quot;:&quot;Subtotal&quot;,&quot;order.giftkit&quot;:&quot;Kit de regalo&quot;,&quot;main.free&quot;:&quot;gratis&quot;,&quot;order.freeShipping&quot;:&quot;Envío&quot;,&quot;checkout.confirmation.communication.mov.standard.delivery&quot;:&quot;Gratuito a partir de 24,90 €&quot;,&quot;zalando.checkout.totals.co2offsetting.label&quot;:&quot;Compensación de emisiones de CO2&quot;,&quot;zalando.cart.discount&quot;:&quot;Vale&quot;,&quot;zalando.checkout.voucher.placeholder&quot;:&quot;Introduce el código aquí&quot;,&quot;a11y.zalando.checkout.vouchercode.field&quot;:&quot;Introduce o pega tu código descuento.&quot;,&quot;zalando.cart.redeemCoupon&quot;:&quot;Canjear&quot;,&quot;checkout.cart.couponCode&quot;:&quot;Código descuento o tarjeta regalo&quot;,&quot;form.label.optional&quot;:&quot;opcional&quot;,&quot;checkout.header.backlink&quot;:&quot;Volver a la tienda&quot;,&quot;zalando.checkout.footer.faq.url&quot;:&quot;/preguntas-frecuentes/&quot;,&quot;zalando.checkout.footer.faq.title&quot;:&quot;¿Necesitas ayuda?&quot;,&quot;mobile.app.data.processing&quot;:&quot;Tratamiento de datos&quot;,&quot;footer.dataPrivacy&quot;:&quot;Protección de datos&quot;,&quot;footer.termsOfUse&quot;:&quot;CGC&quot;,&quot;link.imprint&quot;:&quot;/zalando-aviso-legal/&quot;,&quot;footer.impressum&quot;:&quot;Aviso legal&quot;,&quot;form.label.packstation&quot;:&quot;Packstation&quot;,&quot;form.label.pickpost&quot;:&quot;PickPost&quot;,&quot;zalando.checkout.success.estimation.good&quot;:&quot;¿Qué te ha convencido para comprar en Zalando? ¿Por qué?&quot;,&quot;zalando.checkout.success.estimation.bad&quot;:&quot;Nos interesa tu opinión. ¿Qué te gustaría que mejorásemos?&quot;,&quot;main.send.feedback&quot;:&quot;Enviar mi opinión&quot;,&quot;zalando.checkout.success.feedback.headline&quot;:&quot;Valora tu experiencia en Zalando&quot;,&quot;main.edit&quot;:&quot;modificar&quot;,&quot;checkout.giftkit.info.headline&quot;:&quot;Acompaña tu pedido de un precioso kit para envolverlo y decorarlo.&quot;,&quot;checkout.giftkit.info.text&quot;:&quot;El kit gratuito incluye: papel de regalo dorado, un lazo rojo y una etiqueta de felicitación.&quot;,&quot;checkout.giftkit.label&quot;:&quot;Sí, quiero recibir el kit gratis&quot;,&quot;checkout.giftkit.info.legal&quot;:&quot;Límite de un kit por pedido. Disponible hasta agotar existencias hasta el día 25/12/2016. No se permite la devolución, el cambio o el reembolso del artículo.&quot;,&quot;checkout.giftkit.article.headline&quot;:&quot;Gratis: kit para envolver regalos&quot;,&quot;checkout.giftkit.article.description&quot;:&quot;Papel de regalo, lazo y etiqueta&quot;,&quot;order.quantity&quot;:&quot;Cantidad&quot;,&quot;zalando.checkout.success.info.CREDITCARD&quot;:&quot;El importe total se reservará en tu tarjeta de crédito y el cobro del importe se realizará al enviar el pedido.&quot;,&quot;PaymentMethodType.CREDITCARD.number.endingWith&quot;:&quot;termina en {0}&quot;,&quot;PaymentMethodType.PAYLATER&quot;:&quot;Pay Later&quot;,&quot;zalando.checkout.success.info.PAYLATER&quot;:&quot;Wir ziehen den Betrag ein am: {0}. Weitere Informationen erhältst du per E-Mail.&quot;,&quot;PaymentMethodType.CASH_ON_DELIVERY&quot;:&quot;Pago contra reembolso&quot;,&quot;zalando.checkout.success.info.CASH_ON_DELIVERY&quot;:&quot;Por favor, prepara el importe exacto de tu compra, el mensajero no lleva cambio.&quot;,&quot;PaymentMethodType.CHEQUE&quot;:&quot;Cheque&quot;,&quot;PaymentMethodType.EPS&quot;:&quot;transferencia bancaria electrónica vía eps&quot;,&quot;PaymentMethodType.FREE&quot;:&quot;No se requiere pago&quot;,&quot;PaymentMethodType.IDEAL&quot;:&quot;iDEAL&quot;,&quot;PaymentMethodType.INVOICE&quot;:&quot;Con factura&quot;,&quot;zalando.checkout.success.info.INVOICE&quot;:&quot;Bitte schau, dass der offene Rechnungsbetrag innerhalb von 14 Tagen, nachdem du die Versandbestätigung per Mail bekommen hast, bei uns eingeht. Bitte vergiss bei deiner Überweisung nicht den vorgegebenen Verwendungszweck.&quot;,&quot;zalando.checkout.transferAddress.de&quot;:&quot;Destinatario: Zalando GmbH&lt;br/&gt; IBAN: DE69100700000878993500&lt;br/&gt; BIC: DEUTDEBBXXX&lt;br/&gt; Banco: Deutsche Bank&lt;br/&gt; Referencia:{0}&quot;,&quot;PaymentMethodType.MAK&quot;:&quot;Maksuturva&quot;,&quot;PaymentMethodType.PAYPAL&quot;:&quot;Pago con PayPal&quot;,&quot;zalando.checkout.success.info.PAYPAL&quot;:&quot;El importe total se cargará a tu cuenta Paypal.&quot;,&quot;PaymentMethodType.PREPAYMENT&quot;:&quot;Transferencia bancaria&quot;,&quot;zalando.checkout.success.info.PREPAYMENT&quot;:&quot;Por favor, ingresa el importe total en la siguiente cuenta. Cuanto antes recibamos el pago, antes enviaremos tu pedido.   Destinatario: Zalando SE IBAN: DE86 2107 0020 0123 0101 01 BIC: DEUTDEHH210 Número de cuenta: 123010101 Código bancario: 21070020  Banco: Deutsche Bank Referencia: 10105212260486&quot;,&quot;PaymentMethodType.P24&quot;:&quot;P24&quot;,&quot;PaymentMethodType.DEFERREDPAYMENT&quot;:&quot;Rechnung&quot;,&quot;checkout.success.OrderDetails.DEFERREDPAYMENT.detailed.txt&quot;:&quot;Wenn du soweit bist, kannst du deine Rechnung per Banküberweisung oder mithilfe weiterer Zahlungsmethoden direkt in deinem Benutzerkonto begleichen. Außerdem senden wir dir eine Email mit einem einfachen Bezahlungslink, kurz nachdem deine Bestellung versandt wurde.&quot;,&quot;PaymentMethodType.TRUSTLY&quot;:&quot;Trustly&quot;,&quot;zalando.payment.headline&quot;:&quot;Forma de pago&quot;,&quot;zalando.checkout.confirmation.moreInfo.PAYLATER&quot;:&quot;Wir ziehen den Betrag ein am:&quot;,&quot;zalando.checkout.confirmation.moreInfo.PREPAYMENT&quot;:&quot;Una vez finalizado el pedido, obtendrás información sobre cómo realizar el pago.&quot;,&quot;checkout.confirm.DEFERREDPAYMENT.short.txt&quot;:&quot;Du hast bis zu 14 Tage Zeit, dich zu entscheiden, wie du bezahlen möchtest.&quot;,&quot;a11y.zalando.checkout.editpayment.icon&quot;:&quot;Modifica los datos de tu tarjeta o método de pago&quot;,&quot;customer.address.selectSuggested.suggested&quot;:&quot;Nuestra propuesta:&quot;,&quot;customer.address.selectSuggested.original&quot;:&quot;Has escrito:&quot;,&quot;customer.address.save&quot;:&quot;Guardar dirección&quot;,&quot;voucher.payment.success.redeem&quot;:&quot;Tu tarjeta regalo valorada en {0} se añadió a tu cuenta correctamente. Tu saldo es ahora de {1}&quot;,&quot;zalando.cart.success.coupon&quot;:&quot;El vale se ha canjeado correctamente. (Código del vale: {0})&quot;,&quot;zalando.checkout.voucher.addnew&quot;:&quot;Añadir otro vale&quot;,&quot;checkout.bpostLocation.info&quot;:&quot;24 Stunden geöffnet&quot;,&quot;customer.address.colissimo.closed&quot;:&quot;cerrado&quot;,&quot;checkout.shipping.pickupPoint.openingHours&quot;:&quot;Horarios&quot;,&quot;customer.address.add&quot;:&quot;Añadir dirección&quot;,&quot;giftCard.type.printIt&quot;:&quot;Tarjeta regalo para imprimir&quot;,&quot;giftCard.type.sendViaEmail&quot;:&quot;Tarjeta regalo por correo electrónico&quot;,&quot;a11y.zalando.checkout.confirm.deleteitem.icon&quot;:&quot;Eliminar este artículo de tu pedido&quot;,&quot;cart.remove&quot;:&quot;Eliminar artículo&quot;,&quot;main.save&quot;:&quot;Guardar&quot;,&quot;customer.phone.express.note&quot;:&quot;Para poder ponernos en contacto contigo en caso necesario&quot;,&quot;zalando.checkout.confirmation.shipment.partner.info&quot;:&quot;Recibirás los artículos de tu pedido en diferentes envíos.&quot;,&quot;zalando.checkout.confirmation.shipment.unavailable.general&quot;:&quot;El servicio de envío exprés no está disponible para este pedido.&quot;,&quot;splitShipment&quot;:&quot;Sí, Zalando puede dividir mi pedido en envíos fraccionados para una mayor rapidez. Los diferentes envíos seguirán siendo gratuitos.&quot;,&quot;zalando.checkout.confirmation.samedayDelivery.hint&quot;:&quot;Wir bieten zur Zeit kontaktlose Lieferung an. Der/die Fahrer(in) wird dich fragen, ob das Paket vor der Wohnungstür abgestellt werden soll.&quot;,&quot;zalando.checkout.delivery.price.withZet&quot;:&quot;nur mit&quot;,&quot;zalando.checkout.delivery.free&quot;:&quot;gratis&quot;,&quot;checkout.mini.cart.communication.mov.standard.delivery&quot;:&quot;Si tu pedido llega a 24,90 € el envío es gratuito.&quot;,&quot;zalando.checkout.confirmation.singleShipmentBy&quot;:&quot;Envío por parte de {0}&quot;,&quot;zalando.checkout.confirmation.numberShipmentsBy&quot;:&quot;Envío {0} de {1} por {2}&quot;,&quot;checkout.shipping.zalando.name&quot;:&quot;Zalando&quot;,&quot;checkout.shipping.partner.hint&quot;:&quot;Venta a través de:&quot;,&quot;checkout.shipping.giftcards.hint&quot;:&quot;Tarjetas regalo (envío por separado)&quot;,&quot;zalando.checkout.confirmation.shipment.partner.standardDelivery&quot;:&quot;El artículo se entregará como envío estándar&quot;,&quot;zalando.checkout.confirmation.shipment&quot;:&quot;Pedido&quot;,&quot;catalog.article.colorKey&quot;:&quot;Color&quot;,&quot;catalog.article.size&quot;:&quot;Talla&quot;,&quot;zalando.checkout.confirmation.static.soldBy&quot;:&quot;Verkauf durch&quot;,&quot;form.label.value&quot;:&quot;Valor&quot;,&quot;zalando.checkout.confirmation.soldBy&quot;:&quot;Venta a través de {0}&quot;,&quot;zalando.checkout.confirmation.shipNSoldBy&quot;:&quot;Venta y envío a través de nuestro partner {0}&quot;,&quot;zalando.checkout.confirmation.co2offsetting.checkbox.txt&quot;:&quot;Sí, me gustaría añadir {0} a mi pedido para contrarrestar el impacto medioambiental.&quot;,&quot;zalando.checkout.confirmation.co2offsetting.learnmore.link&quot;:&quot;Mehr erfahren&quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.headline&quot;:&quot;Tu contribución es de gran ayuda&quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.subline&quot;:&quot;¿Tienes cambio?&quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.body.short&quot;:&quot;Tu aportación se destinará a un proyecto de reforestación con el certificado Gold Standard cuya labor compensa el impacto medioambiental de los embalajes, envíos y potenciales devoluciones de tu pedido. &quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.more.expandable&quot;:&quot;Descubre más &quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.subheading.aboutproject&quot;:&quot;Proyecto de reforestación de la comunidad de Soddo&quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.body.aboutproject&quot;:&quot;Este proyecto hace posible que 5 comunidades en cooperación regeneren y protejan los bosques nativos del sur de Etiopía. Durante más de una década han llevado a cabo labores de recuperación de la biodiversidad, reducción de la erosión del suelo y aumento de la captura de carbono (una forma de quitar activamente carbono de la atmósfera).&quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.subheading.offsetting&quot;:&quot;¿Por qué compensar las emisiones de carbono? &quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.subheading.returns&quot;:&quot;¿Y qué pasa con las devoluciones? &quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.body.offsetting&quot;:&quot;Compensar las emisiones de carbono es una forma de equilibrar las emisiones de embalajes, envíos y devoluciones. No es una solución en sí, porque no hay solo una manera de abordar la sostenibilidad. Es un camino constante, y seguimos avanzando a través de otras iniciativas también: reducción de emisiones, incremento de la eficiencia energética e inversión en energías renovables. Compensar las emisiones de carbono es el siguiente paso, gracias a ti. Cada pequeño cambio puede tener un gran impacto. &quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.legal.disclaimer&quot;:&quot;Al compensar las emisiones de carbono ayudas a reducir el impacto completo de tu pedido. Por eso no se te devolverán {0} si realizas una devolución.&quot;,&quot;zalando.checkout.confirmation.co2offsetting.modal.cta&quot;:&quot;Volver a mi pedido&quot;,&quot;zalando.checkout.confirmation.co2offsetting.info.link&quot;:&quot;¿Qué es esto?&quot;,&quot;zalando.checkout.confirmation.co2offsetting.error&quot;:&quot;No podemos procesar el pago en este momento. Inténtalo de nuevo más tarde.&quot;,&quot;zalando.checkout.confirmation.co2offsetting.error.removefee&quot;:&quot;Könnte nicht diese Spende ändern. Bitte versuche es erneut.&quot;,&quot;checkout.shipping.partner.info.title&quot;:&quot;Programa de partner&quot;,&quot;checkout.shipping.partner.info.servicepromise&quot;:&quot;Todos nuestros partners forman parte del compromiso con el cliente de Zalando.&quot;,&quot;checkout.shipping.partner.info.promise.return&quot;:&quot;Derecho de devolución de 100 días&quot;,&quot;checkout.shipping.partner.info.promise.free&quot;:&quot;Envíos y devoluciones gratuitos&quot;,&quot;checkout.shipping.partner.info.promise.fast&quot;:&quot;Entrega rápida&quot;,&quot;checkout.shipping.partner.info.promise.service&quot;:&quot;Servicio de atención al cliente de Zalando&quot;,&quot;footer.revocationRights&quot;:&quot;Instrucciones de revocación&quot;,&quot;product.flag.delivery.fast&quot;:&quot;Schnelle Lieferung&quot;,&quot;product.flag.delivery.slow&quot;:&quot;Envío de larga distancia&quot;,&quot;product.flag.delivery.plus&quot;:&quot;Premium-Lieferung&quot;,&quot;product.flag.presale.plus&quot;:&quot;Pre-sale&quot;,&quot;product.flag.earlyaccess.plus&quot;:&quot;Early Access&quot;,&quot;product.flag.and.plus&quot;:&quot;&amp;&quot;,&quot;login.phone.info&quot;:&quot;Nunca traspasaremos tus datos a terceros con fines publicitarios.&quot;,&quot;a11y.zalando.logo&quot;:&quot;Zalando&quot;,&quot;A11y.zalando.checkout.MASTERCARD.logo&quot;:&quot;Mastercard&quot;,&quot;A11y.zalando.checkout.VISA.logo&quot;:&quot;Visa&quot;,&quot;A11y.zalando.checkout.AMERICAN_EXPRESS.logo&quot;:&quot;American Express&quot;,&quot;A11y.zalando.checkout.PAYPAL.logo&quot;:&quot;Paypal&quot;,&quot;A11y.zalando.checkout.INVOICE.logo&quot;:&quot;Transferencia Bancaria&quot;,&quot;A11y.zalando.checkout.SEPA.logo&quot;:&quot;SEPA Lastschrift&quot;,&quot;A11y.zalando.checkout.DINERS_CLUB_INTERNATIONAL.logo&quot;:&quot;Diners Club International&quot;,&quot;A11y.zalando.checkout.DISCOVER.logo&quot;:&quot;Discover&quot;,&quot;A11y.zalando.checkout.ACCEPTGIRO.logo&quot;:&quot;Accept Giro&quot;,&quot;A11y.zalando.checkout.IDEAL.logo&quot;:&quot;Ideal&quot;,&quot;A11y.zalando.checkout.MAESTRO.logo&quot;:&quot;Maestro&quot;,&quot;A11y.zalando.checkout.POSTEPAY.logo&quot;:&quot;Postepay&quot;,&quot;A11y.zalando.checkout.VISA_ELECTRON.logo&quot;:&quot;Visa Electron&quot;,&quot;A11y.zalando.checkout.EPS.logo&quot;:&quot;EPS&quot;,&quot;A11y.zalando.checkout.POSTFINANCE.logo&quot;:&quot;Postfinance&quot;,&quot;A11y.zalando.checkout.COD.logo&quot;:&quot;COD&quot;,&quot;A11y.zalando.checkout.P24.logo&quot;:&quot;P24&quot;,&quot;A11y.zalando.checkout.MAKSUTURVA.logo&quot;:&quot;Maksuturva&quot;,&quot;A11y.zalando.checkout.PAGO_CONTRA_REEMBOLSO.logo&quot;:&quot;Pago contra reembolso&quot;,&quot;A11y.zalando.checkout.TRANSFERENCIA_BANCARIA.logo&quot;:&quot;Transferencia Bancaria&quot;,&quot;A11y.zalando.checkout.TRUSTLY.logo&quot;:&quot;&quot;,&quot;A11y.zalando.checkout.NEXI.logo&quot;:&quot;Nexi &quot;,&quot;PaymentMethodType.PostFinance.PostFinanceCard&quot;:&quot;PostFinance Card&quot;,&quot;PaymentMethodType.PostFinance.PostFinanceEFinance&quot;:&quot;PostFinance E-Finance&quot;,&quot;checkout.confirmation.VATreduction.text&quot;:&quot;Preise inkl. gesenkter Mehrwertsteuer. Nur garantiert für Zalando-Artikel.&quot;,&quot;zalando.checkout.address.pickuppoint.payment.unavailable&quot;:&quot;Die Lieferung an eine Sammelstelle erfolgt per Kreditkarte oder PayPal.&quot;,&quot;zalando.checkout.confirmation.shipment.express.unavailable.pickuppoint&quot;:&quot;El servicio de envío exprés no está disponible en los puntos de recogida.&quot;,&quot;zalando.checkout.address.pickuppoint.paymentanddelivery.info&quot;:&quot;Express-Lieferung an einen Hermes PaketShop kann leider nicht angeboten werden.&quot;,&quot;form.label.payment&quot;:&quot;Forma de pago&quot;,&quot;checkout.cart.couponcode.info.nextstep1&quot;:&quot;Código descuento: selecciona tu método de pago favorito e introduce tu código de descuento en el siguiente paso.&quot;,&quot;checkout.cart.couponcode.info.nextstep2&quot;:&quot;Tarjeta regalo: si tu tarjeta tiene un valor igual o superior al importe total del pedido, elige la opción PayPal para omitir este paso e introduce tu tarjeta regalo en la siguiente página.&quot;,&quot;main.payment.next&quot;:&quot;Siguiente&quot;,&quot;payment.check.confirm&quot;:&quot;Podrás comprobar tus datos antes de finalizar el pedido&quot;,&quot;zalando.checkout.progress.step.welcome&quot;:&quot;Iniciar sesión&quot;,&quot;zalando.checkout.progress.step.payment&quot;:&quot;Pago&quot;,&quot;zalando.checkout.progress.step.success&quot;:&quot;¡Hecho!&quot;,&quot;validation.zipDe&quot;:&quot;El código postal debe constar de 5 cifras.&quot;,&quot;validation.zipNl&quot;:&quot;Introduce el código postal de tu país.&quot;,&quot;validation.zipFr&quot;:&quot;Todavía no se realizan envíos a países transoceánicos.&quot;,&quot;validation.zipIt&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipGb&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipAt&quot;:&quot;El código postal debe constar de 4 cifras.&quot;,&quot;validation.zipCh&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipPl&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipBe&quot;:&quot;El código postal debe constar de 5 cifras.&quot;,&quot;validation.zipLu&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipSe&quot;:&quot;El código postal debe constar de 5 cifras.&quot;,&quot;validation.zipFi&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipDk&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipEs&quot;:&quot;Por favor ingrese un código postal válido.&quot;,&quot;validation.zipNo&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipCz&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipIe&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipPt&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipSk&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipSi&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipLt&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipLv&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipEe&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipHr&quot;:&quot;Bitte geben Sie eine gültige Postleitzahl ein.&quot;,&quot;validation.zipGr&quot;:&quot;Bitte überprüfen Sie, ob Sie eine gültige Postleitzahl eingegeben haben.&quot;,&quot;validation.zipHu&quot;:&quot;Bitte überprüfen Sie, ob Sie eine gültige Postleitzahl eingegeben haben.&quot;,&quot;validation.zipRo&quot;:&quot;Bitte überprüfen Sie, ob Sie eine gültige Postleitzahl eingegeben haben.&quot;,&quot;validation.zipMt&quot;:&quot;Bitte überprüfen Sie, ob Sie eine gültige Postleitzahl eingegeben haben.&quot;,&quot;validation.zipCy&quot;:&quot;Bitte überprüfen Sie, ob Sie eine gültige Postleitzahl eingegeben haben.&quot;,&quot;validation.zipBg&quot;:&quot;Bitte überprüfen Sie, ob Sie eine gültige Postleitzahl eingegeben haben.&quot;,&quot;zalando.checkout.address.pup.FR.shop.is.express&quot;:&quot;test&quot;,&quot;zalando.checkout.address.pup.FR.shop.is.standard&quot;:&quot;test standard&quot;,&quot;checkout.shipping.pickupPoint.list&quot;:&quot;Lista&quot;,&quot;checkout.shipping.pickupPoint.map&quot;:&quot;Mapa&quot;,&quot;form.label.phone&quot;:&quot;Teléfono móvil&quot;,&quot;checkout.shipping.home.label&quot;:&quot;Mi domicilio&quot;,&quot;checkout.shipping.pickupPoint.label&quot;:&quot;Un punto de recogida&quot;,&quot;checkout.shipping.packstation.label&quot;:&quot;DHL Packstation&quot;,&quot;customer.address.edit&quot;:&quot;Modificar la dirección&quot;,&quot;main.mandatoryField&quot;:&quot;* Campos obligatorios&quot;,&quot;customer.address.delete&quot;:&quot;Borrar dirección&quot;,&quot;a11y.zalando.checkout.deletedeliveryaddress.icon&quot;:&quot;Eliminar dirección de envío&quot;,&quot;a11y.zalando.checkout.deletebillingaddress.icon&quot;:&quot;Eliminar dirección de facturación&quot;,&quot;checkout.pickupPoints.subHL&quot;:&quot;¿Cerca de qué dirección quieres que entreguemos tu paquete?&quot;,&quot;form.label.streetAndNumber&quot;:&quot;Dirección&quot;,&quot;form.label.zip&quot;:&quot;Código postal&quot;,&quot;form.label.city&quot;:&quot;Población&quot;,&quot;checkout.shipping.pickupPoint.search&quot;:&quot;Mostrar puntos de entrega&quot;,&quot;button.pup.next&quot;:&quot;Entregar aquí&quot;,&quot;zalando.checkout.address.pup.map.FR.express.filter.use&quot;:&quot;-&quot;,&quot;zalando.checkout.address.pup.map.FR.express.filter.title&quot;:&quot;-&quot;,&quot;CustomerSex.MRS&quot;:&quot;Mujer&quot;,&quot;CustomerSex.MR&quot;:&quot;Hombre&quot;,&quot;form.label.firstname&quot;:&quot;Nombre&quot;,&quot;form.label.lastname&quot;:&quot;Apellidos&quot;,&quot;form.label.packstation.postNumber&quot;:&quot;PostNummer&quot;,&quot;form.label.packstation.number&quot;:&quot;Número de Packstation&quot;,&quot;form.label.packstationFinder&quot;:&quot;(Ir al buscador de Packstation)&quot;,&quot;checkout.additional.zip.link&quot;:&quot;Para introducir tu dirección manualmente, haz clic aquí&quot;,&quot;zalando.checkout.address.select.pup.ndd.FR.ad.banner.title&quot;:&quot;test&quot;,&quot;zalando.checkout.address.select.pup.ndd.FR.ad.banner.body&quot;:&quot;test &quot;,&quot;zalando.checkout.address.pup.map.FR.express.key.cutoff.title&quot;:&quot;- &quot;,&quot;zalando.checkout.address.pup.map.FR.express.key.cutoff.info&quot;:&quot;- &quot;,&quot;zalando.checkout.address.pup.map.FR.express.key.cutoff.tooltip&quot;:&quot;-&quot;,&quot;login.find.address&quot;:&quot;Buscar dirección&quot;,&quot;form.label.additional&quot;:&quot;Más información&quot;,&quot;form.inputInfo.address.additional&quot;:&quot;Piso, bloque edificio, escalera, puerta, etc.&quot;,&quot;catalog.article.price.saving&quot;:&quot;Descuento&quot;,&quot;form.label.addressSelect&quot;:&quot;Selecciona tu dirección&quot;,&quot;customer.address.autocomplete.zipNotFound&quot;:&quot;No se ha encontrado el código postal&quot;}' data-feature-toggles='{&quot;header-variant&quot;:false,&quot;gift-wrapping&quot;:false,&quot;split-shipment-layout-enabled&quot;:false,&quot;default-delivery-destination-pup&quot;:false,&quot;eligible-membership-trial-enabled&quot;:false,&quot;hide-express-phone-number-form&quot;:false,&quot;hide-free-delivery-partner-text&quot;:true,&quot;enable_co2_offsetting&quot;:true,&quot;show-pup-specific-message&quot;:true,&quot;campaign-flag&quot;:false}' data-mobile-mode-options='{&quot;headerMode&quot;:&quot;desktop&quot;,&quot;footerMode&quot;:&quot;desktop&quot;,&quot;applicationType&quot;:&quot;web&quot;,&quot;headers&quot;:{&quot;x-zalando-header-mode&quot;:&quot;desktop&quot;,&quot;x-zalando-footer-mode&quot;:&quot;desktop&quot;,&quot;x-zalando-checkout-app&quot;:&quot;web&quot;},&quot;isAppIos14&quot;:false}'><div data-reactroot=""><div class="z-coast-fjord-confirmation"><div class="z-coast-fjord-confirmation_content-push-footer"><span></span><div class="z-coast-header"><div class="z-coast-logoLine"><z-grid spacing="gutter"><z-grid-item><z-grid spacing="gutter"><z-grid-item span-xs="6"><a href="/" class="z-coast-logo"><span class="z-coast-logoImage"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="143" height="31" viewBox="0 -5 143 31" enable-background="new 0 0 143 31" xml:space="preserve" role="img"><title>Zalando</title><path fill="#FFFFFF" d="M40.34,20.29h-10.4c-0.35,0-0.61-0.27-0.61-0.63v-1.3c-0.01-0.32,0.09-0.46,0.29-0.71L37.9,7.8h-8.11
				});
		},
		updatePayment() {
			fetch("https://www.zalando.es/api/checkout/update-payment", {
				headers: {
					accept: "*/*",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-xsrf-token":
						"AAAAAEJd_ZvHJS2QxtJkDFW3zgUgbTqsA4dW1OM8zp6YtSLpGZa_S7KKXkaja9OFlmEltmK2aBAxaC6TdMsrMdZVOGpPb2K_lAuSEpYpYyWAZ_lS_fJx9Yrj8U7iWZX-l8wxtJSguiscLWAM6JJX6i4=",
					"x-zalando-checkout-app": "web",
					"x-zalando-footer-mode": "desktop",
					"x-zalando-header-mode": "desktop",
				},
				referrer: "https://www.zalando.es/checkout/confirm",
				referrerPolicy: "strict-origin-when-cross-origin",
				body: null,
				method: "GET",
				mode: "cors",
				credentials: "include",
			});
		},
		selectPaymentMethod() {
			fetch("https://checkout.payment.zalando.com/selection", {
				headers: {
					accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"cache-control": "max-age=0",
					"content-type": "application/x-www-form-urlencoded",
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "same-origin",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1",
				},
				referrer:
					"https://checkout.payment.zalando.com/selection?show=true",
				referrerPolicy: "strict-origin-when-cross-origin",
				body: "payz_credit_card_former_payment_method_id=-1&payz_selected_payment_method=CASH_ON_DELIVERY&iframe_funding_source_id=",
				method: "POST",
				mode: "cors",
				credentials: "include",
			});
		},
		PayPal() {
			const pp = {
				email: "janmuntsiglesias@gmail.com",
				password: "Xirimoia95!",
			};
			document.getElementById("email").value = pp.email;
			document.getElementById("password").value = pp.password;
			document.getElementById("btnLogin").click();
		},
	},
};
