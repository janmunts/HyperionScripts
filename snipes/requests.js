//SNIPES ACO ---- REQUEST MODE

//defining global variables
let currentUrl = location;

var url = location.toString();

const functionsDelay = 1000;

var CSRFtoken;

var shipUUID;

snipesRegion = '.es'; //DEFINE REGION HERE!

var gave404 = false;

var redText;

var addedToCart;

var adressID;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log(message.request.statusCode)
	addedToCart = true;
	console.log('ATC detected!')
});

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

	captchaSolve() {

	},

    startCheckout() {
		if (gave404 != true) {
			clearInterval(ATCButtonClick);
		} 
        console.log('Getting CSRF Token...');
		fetch(`https://www.snipes${snipesRegion}/on/demandware.store/Sites-snse-SOUTH-Site/es_ES/CSRF-Generate?format=ajax`, {
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
                "referrer": `https://www.snipes${snipesRegion}/de_DE/checkout?registration=false`,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
              })
              
              .then(response => response.json())
              .then(data => {
                  CSRFtoken = data.csrf.token;
				  success = data.success;
              })
			//   .then(() => console.log(CSRFtoken))
              .then(() => console.log('Successfully retrieved CSRF token!'))
              .then(() => console.log('Getting adress...'))
              .then(() => fetch(`https://www.snipes${snipesRegion}/on/demandware.store/Sites-snse-SOUTH-Site/es_ES/CheckoutShippingServices-SelectShippingMethod?format=ajax`, {
				"headers": {
				  "accept": "application/json, text/javascript, */*; q=0.01",
				  "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ja-FR;q=0.6,ja;q=0.5",
				  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				  "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
				  "sec-ch-ua-mobile": "?0",
				  "sec-fetch-dest": "empty",
				  "sec-fetch-mode": "cors",
				  "sec-fetch-site": "same-origin",
				  "x-requested-with": "XMLHttpRequest"
				},
				"referrer": `https://www.snipes${snipesRegion}/p/nike-crater_impact_-light_bone%2Fblack%2Fstone%2Fvolt-00013801929982.html`,
				"referrerPolicy": "strict-origin-when-cross-origin",
				"body": `methodID=${this.deliveryType}&shipmentUUID=`,
				"method": "POST",
				"mode": "cors",
				"credentials": "include"
			  }))  
              .then(response => response.json())
              .then(data => {
				adressID = data.customer.addresses[0].ID;
				shipUUID = data.order.shipping[0].UUID;
			})
              .then(() => console.log('Successfully retrieved adress!'))
			  .then(() => console.log('Submitting shipping...'))
			  .then(() => fetch(`https://www.snipes${snipesRegion}/on/demandware.store/Sites-snse-SOUTH-Site/es_ES/CheckoutShippingServices-SubmitShipping?format=ajax`, {
                "headers": {
                  "accept": "application/json, text/javascript, */*; q=0.01",
                  "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                  "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-requested-with": "XMLHttpRequest"
                },
                "referrer": `https://www.snipes${snipesRegion}/checkout?stage=shipping`,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": 
				
				`originalShipmentUUID=${shipUUID}c&shipmentUUID=${shipUUID}c&dwfrm_shipping_shippingAddress_shippingMethodID=${snipes.deliveryType}
				&address-selector=${adressID}&dwfrm_shipping_shippingAddress_addressFields_title=${snipes.title}&dwfrm_shipping_shippingAddress_addressFields_firstName=${snipes.name}
				&dwfrm_shipping_shippingAddress_addressFields_lastName=${snipes.surname}&dwfrm_shipping_shippingAddress_addressFields_postalCode=${snipes.zipCode}
				&dwfrm_shipping_shippingAddress_addressFields_city=${snipes.city}&dwfrm_shipping_shippingAddress_addressFields_street=${this.street}
				&dwfrm_shipping_shippingAddress_addressFields_suite=${this.streetNumber}&dwfrm_shipping_shippingAddress_addressFields_address1=${this.street + ' ' + this.streetNumber}
				&dwfrm_shipping_shippingAddress_addressFields_address2=${this.adress2}&dwfrm_shipping_shippingAddress_addressFields_phone=${this.phone}
				&dwfrm_shipping_shippingAddress_addressFields_countryCode=${this.countryCode}&dwfrm_billing_billingAddress_addressFields_title=${this.title}
				&dwfrm_billing_billingAddress_addressFields_firstName=${snipes.name}&dwfrm_billing_billingAddress_addressFields_lastName=${this.surname}
				&dwfrm_billing_billingAddress_addressFields_postalCode=${this.zipCode}&dwfrm_billing_billingAddress_addressFields_city=${this.city}
				&dwfrm_billing_billingAddress_addressFields_street=${this.street}&dwfrm_billing_billingAddress_addressFields_suite=${this.streetNumber}
				&dwfrm_billing_billingAddress_addressFields_address1=${this.street + ' ' + this.streetNumber}&dwfrm_billing_billingAddress_addressFields_address2=${this.adress2}
				&dwfrm_billing_billingAddress_addressFields_countryCode=${this.countryCode}&dwfrm_billing_billingAddress_addressFields_phone=${this.phone}
				&dwfrm_contact_email=${this.email}&dwfrm_contact_phone=${this.phone}&dwfrm_contact_subscribe=true&csrf_token=${CSRFtoken}`,

                "method": "POST",
                "mode": "cors",
                "credentials": "include"
              }))
			  .then(response => response.json())
			  .then(() =>console.log('Successfully submitted shipping!'))
			  .then(() =>console.log('Submitting payment method...'))
			  .then(() => fetch(`https://www.snipes${snipesRegion}/on/demandware.store/Sites-snse-SOUTH-Site/es_ES/CheckoutServices-SubmitPayment?format=ajax`, {
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
				"referrer": `https://www.snipes${snipesRegion}/checkout?stage=payment`,
				"referrerPolicy": "strict-origin-when-cross-origin",
				"body": `dwfrm_billing_paymentMethod=Paypal&dwfrm_giftCard_cardNumber=&dwfrm_giftCard_pin=&csrf_token=${CSRFtoken}`,
				"method": "POST",
				"mode": "cors",
				"credentials": "include"
			  }
			  ))
			  .then(response => response.json())
			//   .then(data => console.log(data))
			  .then(() => console.log('Successfully submitted payment!'))
			  .then(() => console.log('Placing order...'))
			  .then(() => fetch(`https://www.snipes${snipesRegion}/on/demandware.store/Sites-snse-SOUTH-Site/es_ES/CheckoutServices-PlaceOrder?format=ajax`, {
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
				"referrer": `https://www.snipes${snipesRegion}/checkout?stage=placeOrder`,
				"referrerPolicy": "strict-origin-when-cross-origin",
				"body": null,
				"method": "POST",
				"mode": "cors",
				"credentials": "include"
			  }
			  ))
			  .then(response => response.json())
			  .then(data => {
				  redText = data.error;
				  if (redText != true) {
					  window.open(data.continueUrl)
					  console.log('Successful checkout! Dont forget to pay your order')
				  } else {
					  console.log('Red Text Error')
					  window.open(`https://wwww.snipes${snipesRegion}/checkout?stage=placeOrder#placeOrder`)
				  }
			  })
			
			// //   .then(data => window.open(data.continueUrl))
			//   .then(() => console.log('Successful checkout! Dont forget to pay your order'));
	},



	ATC() {
		const ATCButtonElement = document.getElementsByClassName(
			"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
		)[0],
			ATCReady =
				"f-pdp-button f-pdp-button--active js-btn-add-to-cart",
			ATCNotReady =
				"f-pdp-button f-pdp-button--active js-btn-add-to-carth-not-ready-to-add js-not-ready-to-add";

		// ATCButtonElement.addEventListener("click", function () {
		// 	setTimeout(snipes.startCheckout, functionsDelay);
		// });

		// ATCButtonClick = setInterval(function () {
		// 	const ATCButtonElement = document.getElementsByClassName(
		// 		"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
		// 	)[0];
		// 	if (!ATCButtonElement.disabled) {
		// 		ATCButtonElement.click();
        //         snipes.startCheckout();
		// 	}
		// }, 300);

		ATCButtonClick = setInterval(function () {
			const ATCButtonElement = document.getElementsByClassName(
				"f-pdp-button f-pdp-button--active js-btn-add-to-cart"
			)[0];
			if (!ATCButtonElement.disabled && addedToCart != true) {
				ATCButtonElement.click();	 
			} else if (addedToCart == true) {
				snipes.startCheckout();
			}
		}, 300);

		
	},

	check404() {
		if (document.getElementsByClassName('t-error-page-title-exp')[0]) {
			console.log('404 page detected');
			gave404 = true;
			this.bypass404();
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
			"referrer": `https://www.snipes${snipesRegion}/p/vans-ua_sk8-hi_stacked__-black%2Fblanc_de_blanc-00013801917698.html`,
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
				snipes.startCheckout();
			} else {
				console.log('Error while adding to cart:' + errorMessage);
			}
		})
		
	},

	requestATC() {
		response = document.querySelector('body > pre').innerHTML;
		gave404 = true;
		var responseFormatted = JSON.parse(response);
		responseError = responseFormatted.error;
		if (responseError != true){
			snipes.startCheckout();
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
const atcLink = "Cart-AddProduct?format=a"

const checkoutDelay = [0, 1000, 2500, 5000];
const selectedDelay = checkoutDelay[3];

url = location.toString();

if (url.includes(loginPath) || url.includes(checkoutLoginPath)) {
	document.addEventListener("DOMContentLoaded", snipes.login());
} else if (url.includes(atcLink)) {
	snipes.requestATC()
}else if (url.includes(productPath)) {
	document.addEventListener(
		"DOMContentLoaded",
		snipes.check404()
	);
} 