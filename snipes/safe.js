//snipes\main.js

var preCart = false;

var generatePrecart = false;

let currentUrl = location;

var url = location.toString();

var addedToCart;

// function urlReplace() {
// 	if (url.inclu) {
// 		var newUrl = url.replace(".com", ".es");
// 		location.replace(newUrl);
// 	}
// }
// urlReplace();

var snipesRegion = '.es';

const functionsDelay = 1500;

var ATCButtonClick = 0;
var paymentButtonClick = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	// checkATCSuccess(message.request)
	console.log(message.request.statusCode)
	addedToCart = true;
	console.log('ATC detected!')
});

//---------------------------- snipes ----------------------------\\
const snipes = {
	username: "janmuntsiglesias@gmail.com",
	password: "Xirimoia95",
	title: "Herr",
	name: "Jan",
	surname: "Munts",
	zipCode: "05250",
	city: "Sant Joan de Vilatorrada",
	street: "Maria Aurèlia Capmany",
    adress2: "31-33 1º 2ª",
	streetNumber: "31",
	country: "Spain",
    countryCode: "ES",
	email: "janmuntsiglesias@gmail.com",
	phone: "0034689708580",
    deliveryType: 'home-delivery_es',

	login() {
		const loginElement = document.getElementById(
				"dwfrm_profile_customer_email"
			),
			passwordElement = document.getElementById(
				"dwfrm_profile_login_password"
			),
			loginButtonElement = document.getElementsByClassName(
				"f-button f-button--medium f-button--primary f-button--full-width js-submit"
			)[0];

		loginElement.value = this.username;
		passwordElement.value = this.password;
		loginButtonElement.click();
	},

	size_select: {
		orderableClassValue: "b-swatch-value--orderable",
		soldOutClassValue: "b-swatch-value--sold-out",
		selectedClassValue: "b-swatch-value--selected",

		sizeAttribute: "data-attr-value",

		sizes: [],
		soldOutSizes: [],
		availableSizes: [],
		availableSizesNumbers: [],
		selectedSize: 0,

		getSizes() {
			const dataAttrValues = document.querySelectorAll(
				"[data-attr-value]"
			);
			dataAttrValues.forEach((size) => {
				if (size.className.includes("b-size-value")) {
					snipes.size_select.sizes.push(size);
				}
			});
		},

		selected: false,

		checkSelected() {
			snipes.size_select.sizes.forEach((size) => {
				if (
					size.className.includes(
						snipes.size_select.selectedClassValue
					)
				) {
					snipes.size_select.selected = true;
					return true;
				}
			});
			return snipes.size_select.selected;
		},

		checkAvailability() {
			snipes.size_select.sizes.forEach((size) => {
				if (
					size.className.includes(
						snipes.size_select.orderableClassValue
					) &&
					!size.className.includes(
						snipes.size_select.soldOutClassValue
					)
				) {
					snipes.size_select.availableSizes.push(size);
				} else {
					snipes.size_select.soldOutSizes.push(size);
				}
			});
		},

		getSizesNumber() {
			snipes.size_select.availableSizes.forEach((size) => {
				snipes.size_select.availableSizesNumbers.push(
					size.getAttribute(snipes.size_select.sizeAttribute)
				);
			});
		},

		selectSize(sizesList = 0) {
			//pass in a array of sizes (ordered by preference) Ex. [41, 45, 43]. Pass [0] for random.
			if (snipes.size_select.availableSizes.length != 0) {
				if (sizesList === 0) {
					snipes.size_select.availableSizes[0].click();
				} else {
					let success = false;
					sizesList.forEach((s) => {
						if (
							snipes.size_select.availableSizesNumbers.includes(
								s.toString()
							) &&
							success === false
						) {
							success = true;
							snipes.size_select.availableSizes.forEach(
								(size) => {
									if (
										size.getAttribute(
											snipes.size_select
												.sizeAttribute
										) === s.toString()
									) {
										size.click();
										snipes.size_select.selectedSize = size;
									}
								}
							);
						}
					});
					if (success === false) {
						snipes.size_select.availableSizes[0].click();
					}
					setTimeout(snipes.ATC, functionsDelay);
				}
			}
		},
		selectSizeProcess(sizes) {
			snipes.size_select.getSizes();
			snipes.size_select.checkSelected();
			snipes.size_select.checkAvailability();
			snipes.size_select.getSizesNumber();
			snipes.size_select.selectSize(sizes);
		},
	},

	ATC() {
		// const ATCButtonElement = document.getElementsByClassName(
		// 		"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
		// 	)[0],
		// 	ATCReady =
		// 		"f-pdp-button f-pdp-button--active js-btn-add-to-cart",
		// 	ATCNotReady =
		// 		"f-pdp-button f-pdp-button--active js-btn-add-to-carth-not-ready-to-add js-not-ready-to-add";

		// ATCButtonElement.addEventListener("click", function () {
		// 	setTimeout(snipes.checkoutRedirect, functionsDelay);
		// });

		// ATCButtonClick = setInterval(function () {
		// 	const ATCButtonElement = document.getElementsByClassName(
		// 		"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
		// 	)[0];
		// 	if (!ATCButtonElement.disabled) {
		// 		ATCButtonElement.click();
		// 	}
		// }, 300);
		// // setTimeout(this.checkoutRedirect, 1000);

		ATCButtonClick = setInterval(function () {
			const ATCButtonElement = document.getElementsByClassName(
				"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
			)[0];
			if (!ATCButtonElement.disabled && addedToCart != true) {
				ATCButtonElement.click();	 
			} else if (addedToCart == true) {
				snipes.checkoutRedirect();
			}
		}, 300);
	},

	checkoutRedirect() {
		clearInterval(ATCButtonClick);
		if (preCart === true) {
			location.replace(
				`https://www.snipes${snipesRegion}/checkout?stage=placeOrder#placeOrder`
			);
		} else {
			location.replace(
				`https://www.snipes${snipesRegion}/checkout?stage=shipping#shipping`
			);
		}
	},

	checkout: {
		shipping() {
			if (
				document.getElementsByClassName(
					"js-shipment f-native-radio-input"
				).length === 0 ||
				(document.getElementsByClassName(
					"js-shipment f-native-radio-input"
				).length != 0 &&
					!document.getElementsByClassName(
						"js-shipment f-native-radio-input"
					)[0].checked)
			) {
				const titleMrElement = document.querySelectorAll(
						'[data-value="Herr"]'
					)[0],
					titleMrsElement = document.querySelectorAll(
						'[data-value="Frau"]'
					)[0],
					nameElement = document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_firstName"
					),
					surnameElement = document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_lastName"
					),
					zipCodeElement = document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_postalCode"
					),
					cityElement = document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_city"
					),
					streetElement = document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_street"
					),
					streetNumberElement = document.getElementById(
						"dwfrm_shipping_shippingAddress_addressFields_suite"
					),
					countryElement = document.getElementsByClassName(
						"js-custom-select-title f-custom-select-title"
					),
					emailElement = document.getElementById(
						"dwfrm_contact_email"
					),
					phoneElement = document.getElementById(
						"dwfrm_contact_phone"
					);

				titleMrElement.click();
				nameElement.value = snipes.name;
				surnameElement.value = snipes.surname;
				zipCodeElement.value = snipes.zipCode;
				cityElement.value = snipes.city;
				streetElement.value = snipes.street;
				streetNumberElement.value = snipes.streetNumber;
				emailElement.value = snipes.email;
				phoneElement.value = snipes.phone;
			}
			const checkoutButtonElement = document.getElementsByClassName(
				"f-button f-button--primary f-button--medium a-checkout-step-submit f-button--full-width js-checkout-step-submit"
			)[0];
			checkoutButtonElement.click();
			this.payment();
		},
		payment() {
			const paypalSelectElement = document.getElementById(
				"paymentMethod_Paypal"
			);
			const selectPayment = setInterval(function () {
				paypalSelectElement.checked = true;
				paypalSelectElement.click();
			}, functionsDelay);
			paypalSelectElement.addEventListener("click", function () {
				snipes.checkout.paymentButtonClick();
				// clearInterval(selectPayment);
			});
		},
		paymentButtonClick() {
			const checkoutPaymentButtonElement = document.querySelector(
				"[value='submit-payment']"
			);

			var paymentButton = setInterval(function () {
				if (location.toString().includes(checkoutPaymentPath)) {
					checkoutPaymentButtonElement.click();
					console.log(1);
				}
			}, 300);
			checkoutPaymentButtonElement.addEventListener(
				"click",
				function () {
					setTimeout(clearInterval(paymentButton), 500);
					snipes.checkout.placeOrder();
				}
			);
		},
		placeOrder() {
			if (generatePrecart != true) {
				const checkoutPlaceOrderButtonElement = document.querySelector(
					"[value='place-order']"
				);
				setTimeout(function () {
					checkoutPlaceOrderButtonElement.click();
				}, 2000);
				// 	url = location.toString();
				// 	checkoutPlaceOrderButtonElement.addEventListener(
				// 		"click",
				// 		clearInterval(placeOrderButtonClick)
				// 	);
				// 	var placeOrderButtonClick = setInterval(function () {
				// 		var warningElement = document.querySelectorAll(
				// 			'[data-namespace="checkout.placeorder"]'
				// 		)[0];

				// 		if (warningElement.className.includes("t-uniserv-notice t-uniserv-notice--error")) {
				// 			clearInterval(placeOrderButtonClick);
				// 			window.open("https://www.snipes.es/cart");
				// 		}

				// 		checkoutPlaceOrderButtonElement.click();
				// 	}, 500);

				// } else {
				// 	location.replace("https://www.snipes.es/cart");
			}
		},
		checkoutProcess() {
			this.shipping();
		},
		deletePreCartItem() {
			console.log(1);
			const deleteItemButtonElement = document.getElementsByClassName(
				"i-remove"
			)[0];
			const deleteConfirmationButton = document.getElementsByClassName(
				"f-cart-remove-btn js-remove-confirmation-action f-button f-button--primary"
			)[0];

			deleteItemButtonElement.click();
			deleteConfirmationButton.click();
			chrome.storage.local.set({ preCartGenerated: true });
		},
	},

	captcha: {
		redTextCheck() {
			const hiddenClassValue = "h-hide",
				shownClassValue =
					"t-uniserv-notice t-uniserv-notice--error",
				warningElement = document.querySelectorAll(
					'[data-namespace="checkout.placeorder"]'
				)[0];
			var checkWarning = setInterval(function () {
				if (warningElement.className === shownClassValue) {
					window.open(`https://www.snipes${snipesRegion}/cart`);
					clearInterval(checkWarning);
				} else if (location.toString().includes("paypal")) {
					clearInterval(checkWarning);
				}
			}, 500);
		},
	},

	check404() {
		if (document.getElementsByClassName('t-error-page-title-exp')[0]) {
			console.log('404 page detected')
			this.bypass404()
		} else {
			snipes.size_select.selectSizeProcess([])
		}

	},

	bypass404() {
		pid = document.getElementsByClassName('s-page js-page ')[0].dataset.querystring;
		console.log('Attempting ATC...');
		fetch(`https://www.snipes${snipesRegion}/on/demandware.store/Sites-snse-SOUTH-Site/es_ES/Cart-AddProduct?format=ajax`, {
			"headers": {
			  "accept": "application/json, text/javascript, */*; q=0.01",
			  "accept-language": "en,ca;q=0.9,es;q=0.8",
			  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
			  "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
			  "sec-ch-ua-mobile": "?0",
			  "sec-fetch-dest": "empty",
			  "sec-fetch-mode": "cors",
			  "sec-fetch-site": "same-origin",
			  "x-requested-with": "XMLHttpRequest"
			},
			"referrer": "https://www.snipes.es/p/vans-ua_sk8-hi_stacked__-black%2Fblanc_de_blanc-00013801917698.html",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": `${pid}&quantity=1`,
			"method": "POST",
			"mode": "cors",
			"credentials": "include"
		}).then(response => response.json())
		.then(data => {
			response = data;
			errorMessage = data.message;
			error = data.error;
		})
		.then(() => {
			if (error != true) {
				console.log('Added to cart!');
				snipes.checkoutRedirect();
			} else {
				console.log('Error while adding to cart: ' + errorMessage);
			}
		})
		
	},

	requestATC() {
		console.log('Checking atc...')
		response = document.querySelector('body > pre').innerHTML;
		gave404 = true;
		var responseFormatted = JSON.parse(response);
		responseError = responseFormatted.error;
		if (responseError != true){
			window.open(`https://www.snipes${snipesRegion}/checkout`);
			console.log(responseFormatted.message);
		} else if (responseError == true){
			console.log(responseFormatted.message);
			return;

		}
	}
};

//------------------------- snipes paths -------------------------\\
const loginPath = "/login";
const productPath = "/p/";
const catalogPath = "/c/";
const cartPath = "/cart";
const checkoutLoginPath = "Checkout-Login";
const checkoutPath = "/checkout";
const checkoutShippingPath = "/checkout?stage=shipping#shipping";
const checkoutPaymentPath = "/checkout?stage=payment#payment";
const checkoutPlaceOrderPath = "/checkout?stage=placeOrder#placeOrder";
const atcLink = "Cart-AddProduct";

const checkoutDelay = [0, 1000, 2500, 5000];
const selectedDelay = checkoutDelay[3];

url = location.toString();

if (url.includes(loginPath) || url.includes(checkoutLoginPath)) {
	document.addEventListener("DOMContentLoaded", snipes.login());
} else if (url.includes(atcLink)) {
	snipes.requestATC()
} else if (url.includes(cartPath) && generatePrecart === true) {
	document.addEventListener(
		"DOMContentLoaded",
		snipes.checkout.deletePreCartItem()
	);
} else if (url.includes(productPath)) {
	document.addEventListener(
		"DOMContentLoaded",
		snipes.check404()
	);
} else if (url.includes(checkoutPath)) {
	document.addEventListener(
		"DOMContentLoaded",
		snipes.checkout.checkoutProcess()
	);
}
