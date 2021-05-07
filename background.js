// background.js

/*

// Called when the user clicks on the browser action. //
chrome.browserAction.onClicked.addListener(function(tab) {
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    });
  });

  let alertSent = false;

  function passRequest(requestDetails) {
    if (requestDetails.url.includes('add-product') || requestDetails.url.includes('Cart-AddProduct')) {
      // console.log("URL: " + requestDetails.response);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {request: requestDetails}, function(response) {});  
      });
    }
  }
  
  chrome.webRequest.onCompleted.addListener(
    passRequest,
    {urls: ["https://www.solebox.com/*"]}
);

chrome.webRequest.onCompleted.addListener(
  passRequest,
  {urls: ["https://www.snipes.es/*"]}
);

*/



//-----------------------------------------------------------------\\
//------------------------ MESSAGE PASSING ------------------------\\
//-----------------------------------------------------------------\\

//---------------------------- SOLEBOX ----------------------------\\

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if( request.message === "execute preCart" ) {
//       chrome.tabs.executeScript(null, {file: "solebox/size_select.js"});
//     }
//   }
// );

/*
//---------- Add To Cart ----------\\
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.size === "selected" ) {
      chrome.tabs.executeScript(null, {file: "solebox/ATC.js"});
    }
  }
);

//--------- Captcha check ---------\\
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.captcha === "check" ) {
      chrome.tabs.executeScript(null, {file: "solebox/captcha_check.js"});
    }
  }
);

//---------------------------- SNIPES -----------------------------\\
//---------- Size select ----------\\
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "execute size_select" ) {
      chrome.tabs.executeScript(null, {file: "snipes/size_select.js"});
    }
  }
);

//---------- Add To Cart ----------\\
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.size === "selected" ) {
      chrome.tabs.executeScript(null, {file: "snipes/ATC.js"});
    }
  }
);

//--------- Captcha check ---------\\
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.captcha === "check" ) {
      chrome.tabs.executeScript(null, {file: "snipes/captcha_check.js"});
    }
  }
);
*/