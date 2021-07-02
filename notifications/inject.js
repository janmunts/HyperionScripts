var toastrTag = document.createElement("script");
toastrTag.type = "text/javascript";
toastrTag.src =
	"//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js";
toastrTag.onload = function () {
	global.notifications.loaded = true;
	global.notifications.sendOnLoad.forEach(function (notification) {
		global.notifications.send(notification[0], notification[1]);
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
	document.documentElement.appendChild(toastrTag);
};
document.documentElement.appendChild(jqueryTag);

var cssTag = document.createElement("link");
cssTag.rel = "stylesheet";
cssTag.href =
	"//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css";
document.documentElement.appendChild(cssTag);


