var overlay = document.createElement("div");
overlay.id = "HS overlay";
overlay.style = "position:fixed;top:0px;z-index: 99999;";
// overlay.style.border = "5px solid rgba(206, 182, 102, 0.3)";
overlay.style.border = "5px solid rgba(255,0,0,0.3)";
overlay.style.boxShadow = "box-shadow: 120px 80px 40px 20px #0ff;";
overlay.style.width = window.innerWidth - 15 + "px";
overlay.style.height = window.innerHeight + "px";

document
	.getElementsByTagName("html")[0]
	.insertBefore(overlay, document.getElementsByTagName("body")[0]);

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
