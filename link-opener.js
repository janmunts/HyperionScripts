/*

console.log("LINK OPENER INJECTED");

const productKeywords = prompt("product keyword")
    .toLowercase()
    .replace('"', "")
    .split("");
const serverID = "";
let linkOpened = false;

setInterval(function () {
    console.log(`Looking for "${productKeyword}"...`);
    document.querySelectorAll("a").forEach(function (element) {
        let match = true;
        productKeywords.forEach(function (keyword) {
            if (
                element.innerHTML.toLowerCase().includes(keyword) &&
                match === true
            ) {
                console.log(element.innerHTML);
                // if (!linkOpened) {
                //     window.open(element.href);
                //     linkOpened = true;
                // }
            } else {
                match = false;
            }
        });
        if (!linkOpened && match === true) {
            window.open(element.href);
            linkOpened = true;
        }
    });
}, 5000);

*/
