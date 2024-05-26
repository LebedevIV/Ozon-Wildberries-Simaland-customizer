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



// /*   Change language   */
// function localizeHtmlPage() {
  // //Localize by replacing __MSG_***__ meta tags
  // var objects = document.getElementsByTagName("html");
  // for (var j = 0; j < objects.length; j++) {
    // var obj = objects[j];

    // var valStrH = obj.innerHTML.toString();
    // var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function (match, v1) {
	  // return v1 ? api.i18n.getMessage(v1) : "";
    // });

    // if (valNewH != valStrH) {
      // obj.innerHTML = valNewH;
    // }
  // }
// }
/* Change language */
function localizeHtmlPage() {
    // Determine the correct API namespace for the localization
    const i18n = typeof browser !== 'undefined' ? browser.i18n : (typeof chrome !== 'undefined' ? chrome.i18n : null);

    // Check if the i18n API is available
    if (i18n && typeof i18n.getMessage === 'function') {
        // Select all elements in the document
        var elements = document.querySelectorAll('*');

        // Iterate over all elements
        elements.forEach(function(element) {
            // Iterate over all child nodes of each element
            element.childNodes.forEach(function(node) {
                // Check if the node is a text node
                if (node.nodeType === Node.TEXT_NODE) {
                    var matches = node.nodeValue.match(/__MSG_(\w+)__/g);
                    if (matches) {
                        var text = node.nodeValue;
                        matches.forEach(function(match) {
                            var key = match.match(/__MSG_(\w+)__/)[1];
                            var localizedText = i18n.getMessage(key);
                            text = text.replace(match, localizedText);
                        });
                        node.nodeValue = text;
                    }
                }

                // Check if the node is an element node and replace placeholders, titles, and alt attributes
                else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.hasAttribute('placeholder') && node.getAttribute('placeholder').match(/__MSG_(\w+)__/)) {
                        var key = node.getAttribute('placeholder').match(/__MSG_(\w+)__/)[1];
                        var localizedText = i18n.getMessage(key);
                        node.setAttribute('placeholder', localizedText);
                    }
                    if (node.hasAttribute('title') && node.getAttribute('title').match(/__MSG_(\w+)__/)) {
                        var key = node.getAttribute('title').match(/__MSG_(\w+)__/)[1];
                        var localizedText = i18n.getMessage(key);
                        node.setAttribute('title', localizedText);
                    }
                    if (node.hasAttribute('alt') && node.getAttribute('alt').match(/__MSG_(\w+)__/)) {
                        var key = node.getAttribute('alt').match(/__MSG_(\w+)__/)[1];
                        var localizedText = i18n.getMessage(key);
                        node.setAttribute('alt', localizedText);
                    }
                }
            });
        });
    } else {
        console.error('Localization API not available.');
    }
}

localizeHtmlPage();
