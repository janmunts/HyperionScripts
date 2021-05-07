var url = location.toString();

const loginPath = "/view/secured/content/login";
const productPath = "/view/product/";
const cartPath = "/view/content/basket";
const checkoutPath = "https://www.offspring.co.uk/checkout/singlePageCheckout";
const checkoutPaymentPath = "https://www.offspring.co.uk/view/checkout/content/checkoutPayment_worldpayCard";


const os = {
    username: "nastopkajonas@gmail.com",
    password: "qibqow-ryhGej-kutxe0",
    email: "ligma@gmail.com",
    title: "Mr",
    firstName: "Joe",
    lastName: "Mama",
    number: "07911123456",
    zip: "EN3 7RW",
    address1: "69420 Cum Road",
    adress2: "",
    city: "London", 
    size: "080",

    sizeSelect() {
        document.getElementById('selectSize').click();
        const checkSizeElement = setInterval(function() {
            if (document.querySelector(`[data-name="${os.size}"]`)) {
                document.querySelector(`[data-name="${os.size}"]`).click();
                clearInterval(checkSizeElement);
            }
        }, 200);
        
    },

    ATC() {
        this.sizeSelect();
        const atcButtonElement = document.getElementsByClassName(
            'btn btn--sm btn--left product__actions-cart product__actions-cart--pdp js-add-to-bag-btn'
        )[0];
        const addedToCartElement = document.getElementById(
            'addToBagAlert'
            );
        atcButtonElement.click()
        setInterval(function () {
            if (addedToCartElement.className != "alert-overlay overlay--entrance") {
                atcButtonElement.click()
            } else {
                location.replace('https://www.offspring.co.uk/checkout/singlePageCheckout')
            }
        }, 100);
      
    },


    checkoutNoLogin() {
        function countrySelect() {
            const editElement = document.getElementsByClassName(
                'spc-edit-cta js-deliveryCountryEdit'
            )[0];
            editElement.click();
        }

        function deliveryMethod() {
            const deliveryMethod = document.getElementsByClassName(
                'spc-mode-tile js-deliveryMode'
            )[0];
            deliveryMethod.click();
            console.log("delivery selected");
            const checkManualAdressElement = setInterval(function () {
                if (document.getElementsByClassName('spc-link-cta h-space-20 js-enterAddressManually')[0]) {
                    enterAdressManually();
                    clearInterval(checkManualAdressElement);
                }
            }, 500);
        }

        function enterAdressManually() {
            const enterAdressManually = document.getElementsByClassName(
                'spc-link-cta h-space-20 js-enterAddressManually'
            )[0];
            enterAdressManually.click();
            console.log("manual adress opened");
            const checkShippingFields = setInterval(function () {
                if (document.getElementById('deliveryLine1')) {
                    fillShipping();
                    clearInterval(checkShippingFields);
                }
            }, 500);
        }

        function fillShipping() {
            const emailElement = document.getElementById(
                'deliveryEmail'
            );
            const titleMr = document.getElementById(
                ('deliveryTitle-3')
            );
            const firstNameElement = document.getElementById(
                ('deliveryFirstName')
            );
            const lastNameElement = document.getElementById(
                ('deliveryLastName')
            );
            const numberElement = document.getElementById(
                ('deliveryMobileNumber')
            );
            const postcodeLookElement = document.getElementById(
                ('deliveryPostcodeLookup')
            );
            const adress1Element = document.getElementById(
                ('deliveryLine1')
            );
            const adress2Element = document.getElementById(
                ('deliveryLine2')
            );
            const cityElement = document.getElementById(
                ('deliveryTown')
            );
            const zipElement = document.getElementById(
                ('deliveryPostCode')
            );
            
            emailElement.value = os.email;
            titleMr.click();
            firstNameElement.value = os.firstName;
            lastNameElement.value = os.lastName;
            numberElement.value = os.number;
            adress1Element.value = os.address1;
            adress2Element.value = os.adress2;
            cityElement.value = os.city;
            zipElement.value = os.zip;

            const shippingSubmit = document.getElementsByClassName(
                'btn btn-primary btn-fluid h-space-30 js-submitBtn js-continueToPaymentBtn'
            )[0];

            shippingSubmit.click();
            console.log("shipping submitted");
            

            const checkPaymentSelect = setInterval(function () {
                if (document.getElementsByClassName('spc-mode-tile js-paymentMode is-available')[1]) {
                    selectPayment();
                    clearInterval();
                }
            }, 1000);
            

        }

        function selectPayment() {
            const selectPayment = document.querySelector(
                '[data-code="worldpay"]'
            );
            selectPayment.click();
            console.log('payment selected')
            const submitPayment = document.getElementsByClassName(
                'btn btn-primary btn-fluid hover-opacity btn--payment'
            )[0];
            submitPayment.click()
            console.log('payment submitted')
            
                
        
        }


        // alert('Are you sure you want to start ACO?');
        deliveryMethod();
    },

    getPaymentLink() {

        // alert('Press OK to ACO payment');

        function retrievePayment(){
            const checkIframe = setInterval(function () {
                if (document.getElementById('wp-cl-custom-html-iframe')) {
                    iframe = document.getElementById('wp-cl-custom-html-iframe');
                    console.log('Successfully defined iframe');
                    location.replace(iframe.src);
                    clearInterval(checkManualAdressElement);
                }
            }, 1000);

        }

        retrievePayment();

        
    },
};

if(url.includes(productPath)) {
    os.ATC();
} else if (url == checkoutPath) {
    os.checkoutNoLogin();
} else if (url == checkoutPaymentPath) {
    os.getPaymentLink();
};



