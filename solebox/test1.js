checkout = {
	CSRFtoken: "",
	fullProcess() {},
	redirect() {
		chrome.storage.local.get(["settings"], function (result) {
			if (result.settings.features.preCart.generated !== true) {
				location.replace(
					location
						.toString()
						.slice(0, location.toString().indexOf("/p/")) +
						paths.checkout.path
				);
			} else {
				location.replace(
					location
						.toString()
						.slice(0, location.toString().indexOf("/p/")) +
						paths.checkout.placeOrder
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
			requests.generateCSRF(requests.checkout.shipping.getAddressID);
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
					console.log(data);
					if (
						data.error === true ||
						data.customer.registeredUser
					) {
						console.log(
							`%cHyperionScripts - %cSuccessfully got user adresses!`,
							"color: rgb(206, 182, 102); font-size: 12px",
							"color: rgb(100, 200, 0); font-size: 12px"
						);
						requests.checkout.shipping.customerProfile = {
							...data.customer.preferredAddress,
							...data.customer.profile,
						};
						requests.checkout.shipping.addressID =
							data.customer.addresses[0].addressId;
						requests.checkout.shipping.getRates();
					} else {
						console.error(
							`%cHyperionScripts - User not logged in! Retrying in 3 seconds.`,
							"color: rgb(206, 182, 102); font-size: 12px"
						);
						if (requests.checkout.shipping.attempts < 3) {
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
														"/",
														9
													) + 1
											)
									) + paths.login
							);
						}

						setTimeout(function () {
							requests.checkout.shipping.process();
						}, 3000);
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
						body: `selected=true&id=${
							requests.checkout.shipping.addressID
						}&addressType=home-delivery&snipesStore=&postOfficeNumber=&packstationNumber=&postNumber=&postalCode=${
							requests.checkout.shipping.customerProfile
								.postalCode
						}&countryCode=${
							requests.checkout.shipping.customerProfile
								.countryCode.value
						}&suite=${
							requests.checkout.shipping.customerProfile
								.suite
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
							requests.checkout.shipping.customerProfile
								.title
						}&csrf_token=${requests.checkout.CSRFtoken}`,
						method: "POST",
						mode: "cors",
						credentials: "include",
					}
				)
					.then((response) => response.json())
					.then((data) => {
						console.log(data);
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
			chrome.storage.local.get(["websites"], function (result) {
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
						console.log(
							`%cHyperionScripts - %cSuccessfully submitted shipping!`,
							"color: rgb(206, 182, 102); font-size: 12px",
							"color: rgb(100, 200, 0); font-size: 12px"
						);
						requests.checkout.shipping.submitted = true;
						requests.checkout.payment.submit();
					});
			});
		},
	},
	payment: {
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
						requests.checkout.payment.submitted = true;
						requests.checkout.placeOrder.submit();
					}
				});
		},
	},
	placeOrder: {
		submitted: false,
		cartOpened: false,
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
					redText = data.error;
					if (!redText && data.continueUrl) {
						console.log(
							`%cHyperionScripts - %cSuccessfully placed order!`,
							"color: rgb(206, 182, 102); font-size: 12px",
							"color: rgb(100, 200, 0); font-size: 12px"
						);
						console.log(
							`%cHyperionScripts - %cPayPal link:\n${data.continueUrl}`,
							"color: rgb(206, 182, 102); font-size: 12px",
							"color: rgb(0, 156, 218); font-size: 12px"
						);
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
										checkout: checkoutFromStorage,
									},
									function () {
										window.open(data.continueUrl);
									}
								);
							}
						);
					} else {
						if (!requests.checkout.placeOrder.cartOpened) {
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
														"/",
														9
													) + 1
											)
									) + paths.cart
							);
						}
					}
				});
		},
	},
};

// checkout = {
// 	CSRFtoken: "",
// 	retryAttempts: 2,
// 	time: { start: 0, finish: 0, total: 0 },
// 	fullProcess() {},
// 	redirect() {
// 		chrome.storage.local.get(["settings"], function (result) {
// 			if (result.settings.features.preCart.generated !== true) {
// 				location.replace(
// 					location
// 						.toString()
// 						.slice(0, location.toString().indexOf("/p/")) +
// 						paths.checkout.path
// 				);
// 			} else {
// 				location.replace(
// 					location
// 						.toString()
// 						.slice(0, location.toString().indexOf("/p/")) +
// 						paths.checkout.placeOrder
// 				);
// 			}
// 		});
// 	},
// 	shipping: {
// 		submitted: false,
// 		addressID: "",
// 		shipUUID: "",
// 		customerProfile: {},
// 		attempts: 0,
// 		process() {
// 			requests.generateCSRF(requests.checkout.shipping.getAddressID);
// 			requests.checkout.time.start = new Date();
// 		},
// 		getAddressID() {
// 			console.log(
// 				`%cHyperionScripts - Getting user addresses...`,
// 				"color: rgb(206, 182, 102); font-size: 12px"
// 			);
// 			fetch(
// 				"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-SelectShippingMethod?format=ajax",
// 				{
// 					headers: {
// 						accept: "application/json, text/javascript, */*; q=0.01",
// 						"accept-language":
// 							"en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ja-FR;q=0.6,ja;q=0.5",
// 						"content-type":
// 							"application/x-www-form-urlencoded; charset=UTF-8",
// 						"sec-ch-ua":
// 							'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
// 						"sec-ch-ua-mobile": "?0",
// 						"sec-fetch-dest": "empty",
// 						"sec-fetch-mode": "cors",
// 						"sec-fetch-site": "same-origin",
// 						"x-requested-with": "XMLHttpRequest",
// 					},
// 					referrer: location.toString(),
// 					referrerPolicy: "strict-origin-when-cross-origin",
// 					body: "methodID=home-delivery&shipmentUUID=",
// 					method: "POST",
// 					mode: "cors",
// 					credentials: "include",
// 				}
// 			)
// 				.then((response) => response.json())
// 				.then((data) => {
// 					console.log(data);
// 					requests.checkout.shipping.customerProfile = {
// 						...data.customer.preferredAddress,
// 						...data.customer.profile,
// 					};
// 					if (data.customer.registeredUser) {
// 						console.log(
// 							`%cHyperionScripts - %cSuccessfully got user adresses!`,
// 							"color: rgb(206, 182, 102); font-size: 12px",
// 							"color: rgb(100, 200, 0); font-size: 12px"
// 						);
// 						requests.checkout.shipping.addressID =
// 							data.customer.addresses[0].addressId;
// 						requests.checkout.shipping.shipUUID =
// 							data.order.shipping[0].UUID;
// 						requests.checkout.shipping.getRates();
// 						requests.checkout.shipping.attempts = 0;
// 					} else {
// 						if (
// 							requests.checkout.shipping.attempts <
// 							requests.checkout.retryAttempts
// 						) {
// 							requests.checkout.shipping.attempts++;
// 							if (
// 								requests.checkout.shipping.attempts ===
// 								1
// 							) {
// 								window.open(
// 									location
// 										.toString()
// 										.slice(
// 											0,
// 											location
// 												.toString()
// 												.indexOf(
// 													"/",
// 													location
// 														.toString()
// 														.indexOf(
// 															"solebox."
// 														)
// 												)
// 										) + paths.login
// 								);
// 							}
// 							console.error(
// 								`%cHyperionScripts - User not logged in! Retrying in 3 seconds... Try ${requests.checkout.shipping.attempts} of ${requests.checkout.retryAttempts}.`,
// 								"color: rgb(206, 182, 102); font-size: 12px"
// 							);
// 							setTimeout(function () {
// 								requests.checkout.shipping.process();
// 							}, 3000);
// 						} else {
// 							console.error(
// 								`%cHyperionScripts - Could not get user addresses. Reload the page to try again.`,
// 								"color: rgb(206, 182, 102); font-size: 12px"
// 							);
// 						}
// 					}

// 					requests.saveItemInfo(
// 						data.order.items.items[0].gtm,
// 						data.order.items.items[0].images[0].pdp.srcD,
// 						data.order.items.items[0].urls.pdp
// 					);
// 				});
// 		},
// 		getRates() {
// 			console.log(
// 				`%cHyperionScripts - Getting shipping rates...`,
// 				"color: rgb(206, 182, 102); font-size: 12px"
// 			);
// 			console.log(
// 				`selected=true&id=${
// 					requests.checkout.shipping.addressID
// 				}&addressType=home-delivery&snipesStore=&postOfficeNumber=&packstationNumber=&postNumber=&postalCode=${
// 					requests.checkout.shipping.customerProfile.postalCode
// 				}&countryCode=${
// 					requests.checkout.shipping.customerProfile.countryCode
// 						.value
// 				}&suite=${
// 					requests.checkout.shipping.customerProfile.suite
// 				}&street=${requests.checkout.shipping.customerProfile.street.replaceAll(
// 					" ",
// 					"+"
// 				)}&city=${requests.checkout.shipping.customerProfile.city.replaceAll(
// 					" ",
// 					"+"
// 				)}&address2=${requests.checkout.shipping.customerProfile.address2.replaceAll(
// 					" ",
// 					"+"
// 				)}&lastName=${requests.checkout.shipping.customerProfile.lastName.replaceAll(
// 					" ",
// 					"+"
// 				)}&firstName=${requests.checkout.shipping.customerProfile.firstName.replaceAll(
// 					" ",
// 					"+"
// 				)}&title=${
// 					requests.checkout.shipping.customerProfile.title
// 				}&csrf_token=${requests.checkout.CSRFtoken}`
// 			);
// 			chrome.storage.local.get(["websites"], function (result) {
// 				fetch(
// 					"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-ShippingRates?format=ajax",
// 					{
// 						headers: {
// 							accept: "application/json, text/javascript, */*; q=0.01",
// 							"accept-language": "en,ca;q=0.9,es;q=0.8",
// 							"content-type":
// 								"application/x-www-form-urlencoded; charset=UTF-8",
// 							"sec-ch-ua":
// 								'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
// 							"sec-ch-ua-mobile": "?0",
// 							"sec-fetch-dest": "empty",
// 							"sec-fetch-mode": "cors",
// 							"sec-fetch-site": "same-origin",
// 							"x-requested-with": "XMLHttpRequest",
// 						},
// 						referrer: location.toString(),
// 						referrerPolicy: "strict-origin-when-cross-origin",
// 						body: `selected=true&id=${
// 							requests.checkout.shipping.addressID
// 						}&addressType=home-delivery&snipesStore=&postOfficeNumber=&packstationNumber=&postNumber=&postalCode=${
// 							requests.checkout.shipping.customerProfile
// 								.postalCode
// 						}&countryCode=${
// 							requests.checkout.shipping.customerProfile
// 								.countryCode.value
// 						}&suite=${
// 							requests.checkout.shipping.customerProfile
// 								.suite
// 						}&street=${requests.checkout.shipping.customerProfile.street.replaceAll(
// 							" ",
// 							"+"
// 						)}&city=${requests.checkout.shipping.customerProfile.city.replaceAll(
// 							" ",
// 							"+"
// 						)}&address2=${requests.checkout.shipping.customerProfile.address2.replaceAll(
// 							" ",
// 							"+"
// 						)}&lastName=${requests.checkout.shipping.customerProfile.lastName.replaceAll(
// 							" ",
// 							"+"
// 						)}&firstName=${requests.checkout.shipping.customerProfile.firstName.replaceAll(
// 							" ",
// 							"+"
// 						)}&title=${
// 							requests.checkout.shipping.customerProfile
// 								.title
// 						}&csrf_token=${requests.checkout.CSRFtoken}`,
// 						method: "POST",
// 						mode: "cors",
// 						credentials: "include",
// 					}
// 				)
// 					.then((response) => response.json())
// 					.then((data) => {
// 						console.log(data);
// 						console.log(
// 							`%cHyperionScripts - %cSuccessfully got shipping rates!`,
// 							"color: rgb(206, 182, 102); font-size: 12px",
// 							"color: rgb(100, 200, 0); font-size: 12px"
// 						);
// 						requests.checkout.shipping.shipUUID =
// 							data.order.shipping[0].UUID;
// 						requests.checkout.shipping.submit();
// 						success = data.success;
// 						fullResponse = data;
// 					});
// 			});
// 		},
// 		submit() {
// 			console.log(
// 				`%cHyperionScripts - Submitting shipping...`,
// 				"color: rgb(206, 182, 102); font-size: 12px"
// 			);
// 			fetch(
// 				`https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutShippingServices-SubmitShipping?region=europe&country=undefined&addressId=${requests.checkout.shipping.addressID}&format=ajax`,
// 				{
// 					headers: {
// 						accept: "application/json, text/javascript, */*; q=0.01",
// 						"accept-language": "en,ca;q=0.9,es;q=0.8",
// 						"content-type":
// 							"application/x-www-form-urlencoded; charset=UTF-8",
// 						"sec-ch-ua":
// 							'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
// 						"sec-ch-ua-mobile": "?0",
// 						"sec-fetch-dest": "empty",
// 						"sec-fetch-mode": "cors",
// 						"sec-fetch-site": "same-origin",
// 						"x-requested-with": "XMLHttpRequest",
// 					},
// 					referrer: location.toString(),
// 					referrerPolicy: "strict-origin-when-cross-origin",
// 					body: `originalShipmentUUID=${requests.checkout.shipping.shipUUID}&shipmentUUID=${requests.checkout.shipping.shipUUID}&dwfrm_shipping_shippingAddress_shippingMethodID=home-delivery_europe&address-selector=${requests.checkout.shipping.addressID}&dwfrm_shipping_shippingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_shipping_shippingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_shipping_shippingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_shipping_shippingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_shipping_shippingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_shipping_shippingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_shipping_shippingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_shipping_shippingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_shipping_shippingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_shipping_shippingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_shipping_shippingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&serviceShippingMethod=ups-standard&dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress=true&dwfrm_billing_billingAddress_addressFields_title=${requests.checkout.shipping.customerProfile.title}&dwfrm_billing_billingAddress_addressFields_firstName=${requests.checkout.shipping.customerProfile.firstName}&dwfrm_billing_billingAddress_addressFields_lastName=${requests.checkout.shipping.customerProfile.lastName}&dwfrm_billing_billingAddress_addressFields_postalCode=${requests.checkout.shipping.customerProfile.postalCode}&dwfrm_billing_billingAddress_addressFields_city=${requests.checkout.shipping.customerProfile.city}&dwfrm_billing_billingAddress_addressFields_street=${requests.checkout.shipping.customerProfile.street}&dwfrm_billing_billingAddress_addressFields_suite=${requests.checkout.shipping.customerProfile.suite}&dwfrm_billing_billingAddress_addressFields_address1=${requests.checkout.shipping.customerProfile.address1}&dwfrm_billing_billingAddress_addressFields_address2=${requests.checkout.shipping.customerProfile.address2}&dwfrm_billing_billingAddress_addressFields_countryCode=${requests.checkout.shipping.customerProfile.countryCode.value}&dwfrm_billing_billingAddress_addressFields_phone=${requests.checkout.shipping.customerProfile.phone}&dwfrm_contact_email=${requests.checkout.shipping.customerProfile.email}&dwfrm_contact_phone=${requests.checkout.shipping.customerProfile.phone}&csrf_token=${requests.checkout.CSRFtoken}`,
// 					method: "POST",
// 					mode: "cors",
// 					credentials: "include",
// 				}
// 			)
// 				.then((response) => response.json())
// 				.then((data) => {
// 					if (data.error === true || data.errorMessage) {
// 						if (
// 							requests.checkout.shipping.attempts <
// 								requests.checkout.retryAttempts &&
// 							data.errorMessage !== "Too many requests"
// 						) {
// 							requests.checkout.shipping.attempts++;
// 							console.error(
// 								`%cHyperionScripts - Could not submit shipping. Retrying in 3 seconds... Try ${requests.checkout.shipping.attempts} of ${requests.checkout.retryAttempts}.`,
// 								"color: rgb(206, 182, 102); font-size: 12px"
// 							);
// 							setTimeout(function () {
// 								requests.checkout.shipping.submit();
// 							}, 3000);
// 						} else {
// 							console.error(
// 								`%cHyperionScripts - Could not submit shipping. Reload the page to try again.`,
// 								"color: rgb(206, 182, 102); font-size: 12px"
// 							);
// 						}
// 					} else {
// 						console.log(
// 							`%cHyperionScripts - %cSuccessfully submitted shipping!`,
// 							"color: rgb(206, 182, 102); font-size: 12px",
// 							"color: rgb(100, 200, 0); font-size: 12px"
// 						);
// 						requests.checkout.shipping.submitted = true;
// 						requests.checkout.payment.submit();
// 					}
// 				});
// 		},
// 	},
// 	payment: {
// 		attempts: 0,
// 		submitted: false,
// 		submit() {
// 			console.log(
// 				`%cHyperionScripts - Submitting payment...`,
// 				"color: rgb(206, 182, 102); font-size: 12px"
// 			);
// 			fetch(
// 				"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutServices-SubmitPayment?format=ajax",
// 				{
// 					headers: {
// 						accept: "application/json, text/javascript, */*; q=0.01",
// 						"accept-language": "en,ca;q=0.9,es;q=0.8",
// 						"content-type":
// 							"application/x-www-form-urlencoded; charset=UTF-8",
// 						"sec-ch-ua":
// 							'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
// 						"sec-ch-ua-mobile": "?0",
// 						"sec-fetch-dest": "empty",
// 						"sec-fetch-mode": "cors",
// 						"sec-fetch-site": "same-origin",
// 						"x-requested-with": "XMLHttpRequest",
// 					},
// 					referrer: location.toString(),
// 					referrerPolicy: "strict-origin-when-cross-origin",
// 					body: `dwfrm_billing_paymentMethod=Paypal&csrf_token=${requests.checkout.CSRFtoken}`,
// 					method: "POST",
// 					mode: "cors",
// 					credentials: "include",
// 				}
// 			)
// 				.then((response) => response.json())
// 				.then((data) => {
// 					console.log(data);
// 					if (!data.error) {
// 						console.log(
// 							`%cHyperionScripts - %cSuccessfully submitted payment!`,
// 							"color: rgb(206, 182, 102); font-size: 12px",
// 							"color: rgb(100, 200, 0); font-size: 12px"
// 						);
// 						requests.checkout.payment.submitted = true;
// 						requests.checkout.placeOrder.submit();
// 					} else {
// 						if (
// 							requests.checkout.payment.attempts <
// 							requests.checkout.retryAttempts
// 						) {
// 							requests.checkout.payment.attempts++;
// 							console.error(
// 								`%cHyperionScripts - Could not submit payment. Retrying in 3 seconds... Try ${requests.checkout.payment.attempts} of ${requests.checkout.retryAttempts}.`,
// 								"color: rgb(206, 182, 102); font-size: 12px"
// 							);
// 							setTimeout(function () {
// 								requests.checkout.payment.submit();
// 							}, 3000);
// 						} else {
// 							console.error(
// 								`%cHyperionScripts - Could not submit payment. Reload the page to try again.`,
// 								"color: rgb(206, 182, 102); font-size: 12px"
// 							);
// 						}
// 					}
// 				});
// 		},
// 	},
// 	placeOrder: {
// 		submitted: false,
// 		cartOpened: false,
// 		attempts: 0,
// 		submit() {
// 			console.log(
// 				`%cHyperionScripts - Placing order...`,
// 				"color: rgb(206, 182, 102); font-size: 12px"
// 			);
// 			fetch(
// 				"https://www.solebox.com/on/demandware.store/Sites-solebox-Site/de_DE/CheckoutServices-PlaceOrder?format=ajax",
// 				{
// 					headers: {
// 						accept: "application/json, text/javascript, */*; q=0.01",
// 						"accept-language": "en,ca;q=0.9,es;q=0.8",
// 						"content-type":
// 							"application/x-www-form-urlencoded; charset=UTF-8",
// 						"sec-ch-ua":
// 							'"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
// 						"sec-ch-ua-mobile": "?0",
// 						"sec-fetch-dest": "empty",
// 						"sec-fetch-mode": "cors",
// 						"sec-fetch-site": "same-origin",
// 						"x-requested-with": "XMLHttpRequest",
// 					},
// 					referrer: location.toString(),
// 					referrerPolicy: "strict-origin-when-cross-origin",
// 					body: null,
// 					method: "POST",
// 					mode: "cors",
// 					credentials: "include",
// 				}
// 			)
// 				.then((response) => response.json())
// 				.then((data) => {
// 					if (!data.error && data.continueUrl) {
// 						requests.checkout.time.finish = new Date();
// 						requests.checkout.time.total =
// 							requests.checkout.time.finish -
// 							requests.checkout.time.start;
// 						console.log(
// 							`%cHyperionScripts - %cSuccessfully placed order!`,
// 							"color: rgb(206, 182, 102); font-size: 12px",
// 							"color: rgb(100, 200, 0); font-size: 12px"
// 						);
// 						console.log(
// 							`%cHyperionScripts - %cPayPal link:\n${data.continueUrl}`,
// 							"color: rgb(206, 182, 102); font-size: 12px",
// 							"color: rgb(0, 156, 218); font-size: 12px"
// 						);
// 						console.log(
// 							`%cHyperionScripts - CHECKOUT DATA:\n-  ATC TIME: %c${
// 								requests.product.time.total
// 							}ms\n%c-  CHECKOUT TIME: %c${
// 								requests.checkout.time.total
// 							}ms\n%c-  TOTAL TIME: %c${
// 								requests.product.time.total +
// 								requests.checkout.time.total
// 							}ms`,
// 							"color: rgb(206, 182, 102); font-size: 12px",
// 							"color: rgb(190, 41, 236); font-size: 12px",
// 							"color: rgb(206, 182, 102); font-size: 12px",
// 							"color: rgb(190, 41, 236); font-size: 12px",
// 							"color: rgb(206, 182, 102); font-size: 12px",
// 							"color: rgb(190, 41, 236); font-size: 12px"
// 						);
// 						chrome.storage.local.get(
// 							["checkout", "websites"],
// 							function (result) {
// 								let checkoutFromStorage =
// 									result.checkout;
// 								checkoutFromStorage.lastCheckout.ATCtime =
// 									requests.product.time.total;
// 								checkoutFromStorage.lastCheckout.checkoutTime =
// 									requests.checkout.time.total;

// 								chrome.storage.local.set(
// 									{
// 										checkout: checkoutFromStorage,
// 									},
// 									function () {
// 										window.open(data.continueUrl);
// 									}
// 								);
// 							}
// 						);
// 					} else {
// 						if (
// 							requests.checkout.placeOrder.attempts <
// 							requests.checkout.retryAttempts
// 						) {
// 							requests.checkout.placeOrder.attempts++;
// 							console.error(
// 								`%cHyperionScripts - Could not place order. Retrying in 3 seconds... Try ${requests.checkout.placeOrder.attempts} of ${requests.checkout.retryAttempts}.`,
// 								"color: rgb(206, 182, 102); font-size: 12px"
// 							);
// 							setTimeout(function () {
// 								requests.checkout.placeOrder.submit();
// 							}, 3000);
// 						} else {
// 							console.error(
// 								`%cHyperionScripts - Could not place order. Reload the page to try again.`,
// 								"color: rgb(206, 182, 102); font-size: 12px"
// 							);
// 						}
// 						if (!requests.checkout.placeOrder.cartOpened) {
// 							window.open(
// 								location
// 									.toString()
// 									.slice(
// 										0,
// 										location
// 											.toString()
// 											.indexOf(
// 												"/",
// 												location
// 													.toString()
// 													.indexOf(
// 														"solebox."
// 													)
// 											)
// 									) + paths.checkout.path
// 							);
// 							requests.checkout.placeOrder.cartOpened = true;
// 						}
// 					}
// 				});
// 		},
// 	},
// };
