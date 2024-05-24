function getBrowser() {
	if (typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined") {
		return chrome;
	} else if (
		typeof browser !== "undefined" &&
		typeof browser.runtime !== "undefined"
	) {
		return browser;
	} else {
		console.log("browser is not supported");
		return false;
	}
}

const api = getBrowser();



/*   Change language   */
function localizeHtmlPage() {
  //Localize by replacing __MSG_***__ meta tags
  var objects = document.getElementsByTagName("html");
  for (var j = 0; j < objects.length; j++) {
    var obj = objects[j];

    var valStrH = obj.innerHTML.toString();
    var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function (match, v1) {
	  return v1 ? api.i18n.getMessage(v1) : "";
    });

    if (valNewH != valStrH) {
      obj.innerHTML = valNewH;
    }
  }
}

localizeHtmlPage();
