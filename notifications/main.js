var head = document.getElementsByTagName("head")[0];

var jqueryTag = document.createElement("script");
jqueryTag.type = "text/javascript";
jqueryTag.src =
	"https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";

var toastrTag = document.createElement("script");
toastrTag.type = "text/javascript";
toastrTag.src =
	"//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js";

var cssTag = document.createElement("link");
cssTag.rel = "stylesheet";
cssTag.href =
	"//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css";

head.appendChild(jqueryTag);
head.appendChild(toastrTag);
head.appendChild(cssTag);

var body = document.getElementsByTagName("body")[0];

setTimeout(function () {
	var script = document.createElement("script");
	script.type = "text/javascript";

	var scriptCode =
		document.createTextNode(`toastr.options.closeButton = true;
    toastr.options.progressBar = true;
    toastr.options.timeOut = 1500;

    setInterval(function () {
        toastr.success("Successfully logged in!");
    }, 3000);`);
	script.appendChild(scriptCode);

	body.appendChild(script);
}, 3000);
