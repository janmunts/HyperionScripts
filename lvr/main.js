let currentUrl = location;

var url = location.toString();

const lvr = {

    email: 'nastopkajonas@gmail.com',
    FirstName: 'Jonas',
    LastName: 'Nastopka',
    phone: '627007921',
    countryCode: 'ES',
    adress: 'Casa Rectoral, Esglesia de Sant Andreu',
    zipCode: '08256',
    city: 'Aguilar de Segarra',
    paymentType: 'PPA',
    paymentMethod: 'banktransfer',
    
    ATC() {
        console.log('Waiting for manual atc...');
        const checkATC = setInterval(function(){
            if (document.getElementsByClassName('_2oidPJDaXY')[3]) {
                console.log('Product carted!')
                location.replace('https://www.luisaviaroma.com/myarea/myCart.aspx')
                clearInterval(checkATC)
            } else {
                console.log('Product not carted')
            }
        }, 100);
    },

    checkout() {
        const checkoutRedirect = setInterval(function (){
            if (document.querySelector('#bsk_totaldiv > div.cpRff2e62N > div._2ToMDI87tI > button')) {
                document.querySelector('#bsk_totaldiv > div.cpRff2e62N > div._2ToMDI87tI > button').click()
                clearInterval(checkoutRedirect)
            } else {
                console.log('stupid')
            }  
        }, 100) 
        placeOrder = document.querySelector('#root-bag > div > div > div:nth-child(2) > div.col-sm-7.col-md-8.no-padding-xs > div.checkout-row > div > div > button')
        const getElement = setInterval(function (){
            if (document.querySelector('#root-bag > div > div > div:nth-child(2) > div.col-sm-7.col-md-8.no-padding-xs > div.Table.Table__nobefore > div._1h7EfcEU4y.checkout-row > div.row.paymentcontainer > div:nth-child(1) > div > div.input-part > div > div > label')) {
                paypalCheckout = document.querySelector('#root-bag > div > div > div:nth-child(2) > div.col-sm-7.col-md-8.no-padding-xs > div.Table.Table__nobefore > div._1h7EfcEU4y.checkout-row > div.row.paymentcontainer > div:nth-child(1) > div > div.input-part > div > div > label')
                btCheckout = document.querySelector('#root-bag > div > div > div:nth-child(2) > div.col-sm-7.col-md-8.no-padding-xs > div.Table.Table__nobefore > div._1h7EfcEU4y.checkout-row > div.row.paymentcontainer > div:nth-child(5) > div > div.input-part > div > div > label')
                if (lvr.paymentMethod === 'paypal'){
                    paypalCheckout.click()
                } else if (lvr.paymentMethod === 'banktransfer') {
                    btCheckout.click()
                }
                placeOrder = document.querySelector('#root-bag > div > div > div:nth-child(2) > div.col-sm-7.col-md-8.no-padding-xs > div.checkout-row > div > div > button').click()
                clearInterval(getElement)
            } else {
                console.log('element not found, retrying...')
            }
        }, 200)

        
    }

}


if (url.includes('/p')) {
    lvr.ATC();
} else if (url.includes('myCart')) {
    lvr.checkout();
}
