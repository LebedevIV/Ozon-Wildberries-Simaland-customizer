//@author Igor Lebedev
// console.log("popup!")

/*   Config   */
const config = {
  advanced: false,
  SettingsOnOff: true,
  links: {
	website: "https://github.com/LebedevIV/Ozon-Wildberries-Simaland-customizer",
	website_install: "https://github.com/LebedevIV/Ozon-Wildberries-Simaland-customizer",
   github: "https://github.com/LebedevIV/Ozon-Wildberries-Simaland-customizer",
   donate: "https://sites.google.com/view/facts-and-fakes/ru/donate",
    donate_YooMoney: "https://yoomoney.ru/to/4100117799116116",	//	https://sobe.ru/na/facts_and_fakes
    donate_Crypto: "../popup/crypto.html",
  }
};

const api = getBrowser();


document.addEventListener('DOMContentLoaded', function() {

	localizeHtmlPage()


	document
	  .getElementById("toggle-button_SettingsOnOff")
	  .addEventListener("click", (ev) => {
			api.storage.local.set({ SettingsOnOff: ev.target.checked });
		}
	);

	/*   Buttons Options and Close   */
	button_CloseCurrentView.addEventListener("click", () => {
		ShowViews("divSettings");
	})
	/*   Buttons Settings  */
	button_Settings.addEventListener("click", () => {
		ShowViews("divSettings");
	})
	/*   Donate   */
	button_Donate.addEventListener("click", () => {
		ShowViews("divDonate");
	})

	createLink(config.links.website, "extensionName_div")
	createLink(config.links.donate_YooMoney, "link_donate_YooMoney")
	createLink(config.links.donate_Crypto, "link_donate_Crypto")
	createLink(config.links.website_install, "ext")


	// Визуальные эффекты кнопки Пожертвований
	const buttonLinkDonate = document.querySelector('#button_Donate');

	buttonLinkDonate.addEventListener('mouseover', () => {
		buttonLinkDonate.style.backgroundColor = '#80ffa0';
	//    buttonLinkDonate.style.color = 'black';
		// buttonLinkDonate.style.transform = 'scale(1.1)';
	});

	buttonLinkDonate.addEventListener('mouseleave', () => {
		buttonLinkDonate.style.backgroundColor = '#c2f5d3';//салатовый
	//    buttonLinkDonate.style.color = 'black';
		// buttonLinkDonate.style.transform = 'scale(1)';
	});


	ShowViews("divSettings")
	initConfig()


	//добавление прослушивания события изменения хранилища
	api.storage.onChanged.addListener(storageChangeHandler)

	
})

// window.onload = function() {
    // к этому моменту страница загружена
	// ShowViews("divSettings");//глюк - не показывает style, возможно не успевает прогрузиться страница
	// initConfig();
// };

function getBrowser() {
	if (typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined") {
		return chrome
	} else if (
		typeof browser !== "undefined" &&
		typeof browser.runtime !== "undefined"
	) {
		return browser
	} 
	else {
		console.log("browser is not supported");
		return false
	}
}

// /*   Change language   */
// function localizeHtmlPage() {
	// //Localize by replacing __MSG_***__ meta tags
	// var objects = document.getElementsByTagName("html")
	// for (var j = 0; j < objects.length; j++) {
		// var obj = objects[j]

		// var valStrH = obj.innerHTML.toString()
		// var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function (match, v1) {
			// return v1 ? api.i18n.getMessage(v1) : ""
		// })

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

// Call the function on page load
document.addEventListener('DOMContentLoaded', localizeHtmlPage);

// Call the function on page load
document.addEventListener('DOMContentLoaded', localizeHtmlPage);

function createLink(url, id) {
	if ( url.trim().length < 10 )
		return
	const elem = document.getElementById(id)

	if (elem){
		elem.removeEventListener("click", clickLink, false)
		elem.addEventListener("click", function(){clickLink(url)}, false)
		
		if (elem.style.display = "none") 
			elem.style.removeProperty("display")
	
		function clickLink(url){
			api.tabs.create({ url: url })
		}
	}
}


/*
function setTitle() {
  document.getElementById('title').innerHTML = api.i18n.getMessage('appTitle');
}
window.addEventListener('load', setTitle);
*/

//даже если вид текущий - делаем спецэффект
/**	Вывод требуемого View	*/
function ShowViews(TypeShowView){
	button_CloseCurrentView.style.visibility = "visible";
	button_Settings.style.visibility = "visible";
	center_Donate.style.removeProperty("display")
	extensionName_h2.style.marginRight = "50px"
	switch(TypeShowView){
	case 'divSettings':
		button_Settings.style.visibility = "hidden";
		button_CloseCurrentView.style.visibility = "hidden";
		extensionName_h2.style.marginRight = "0"
		break
	case 'divDonate':
		center_Donate.style.display = "none"
		break
		break
	default:
	}
    document.querySelectorAll('.div-view').forEach(divView => {
		divView.style.display = "none";
		divView.style.transform = "scale(1.1)";
		if (divView.id == TypeShowView){
			divView.style.transform = "scale(1)";
			divView.style.removeProperty('display')
		}
    });
	
}

function initConfig() {
	initializeSettingsOnOff();
	initializeVersionNumber();
}


function initializeVersionNumber() {
	const version = api.runtime.getManifest().version;
	const ExtVersion = document.getElementById("ext-version")
	// ExtVersion.innerHTML = "v" + version;
	ExtVersion.textContent = "v" + version;
}

// returns whether current < latest
function compareVersions(latestStr, currentStr) {
  let latestarr = latestStr.split(".");
  let currentarr = currentStr.split(".");
  let outdated = false;
  // goes through version numbers from left to right from greatest to least significant
  for (let i = 0; i < Math.max(latestarr.length, currentarr.length); i++) {
    let latest = i < latestarr.length ? parseInt(latestarr[i]) : 0;
    let current = i < currentarr.length ? parseInt(currentarr[i]) : 0;
    if (latest > current) {
      outdated = true;
      break;
    } else if (latest < current) {
      outdated = false;
      break;
    }
  }
  return outdated;
}
// получение значения при загрузке popup
function initializeSettingsOnOff() {
	api.storage.local.get(["SettingsOnOff"], (res) => {
		if ("SettingsOnOff" in res){
			// защита от невозможного что значение окажется не false/true
			if (res.SettingsOnOff === false || res.SettingsOnOff === true) {
				handleSettingsOnOffChangeEvent(res.SettingsOnOff)

			} else {
				api.storage.local.set({ SettingsOnOff: true })
				handleSettingsOnOffChangeEvent(true)			
			}	

		} else {
			api.storage.local.set({ SettingsOnOff: true })
			handleSettingsOnOffChangeEvent(true)
		}
	});
}


//если в хранилище произошли изменения соответствующего параметра...
function storageChangeHandler(changes, area) {
	if (area === 'local') {
		if (changes.SettingsOnOff !== undefined) {
			// защита от невозможного что значение окажется не false/true
			if (changes.SettingsOnOff?.newValue === false || changes.SettingsOnOff?.newValue === true) {
				handleSettingsOnOffChangeEvent(
					changes.SettingsOnOff.newValue
				)
			} else {
				// вызовет данную функцию повторно с корректным значением
				api.storage.local.set({ SettingsOnOff: true })
			}			

		}

	}
}
//... происходит установка значения конфига и контрола
function handleSettingsOnOffChangeEvent(value) {

	config.SettingsOnOff = value;
	document.getElementById("toggle-button_SettingsOnOff").checked = value;
  
  	switch(value){
	case true:
		document.getElementById("toggle-button_SettingsOnOff").labels[0].textContent = api.i18n.getMessage("SettingsExtensionOn","message")
		break
	case false:
		document.getElementById("toggle-button_SettingsOnOff").labels[0].textContent = api.i18n.getMessage("SettingsExtensionOff","message")
		break
	}
	
	changeIcon()
}

function changeIcon(tabId = null) {

	let iconName_16
	let iconName_48
	let iconName_128
	if ( config.SettingsOnOff ) {
		iconName_16 = "icon_color-16.png"
		iconName_48 = "icon_color-48.png"
		iconName_128 = "icon_color-128.png"
	}
	else {
		iconName_16 = "icon_disabled-16.png"
		iconName_48 = "icon_disabled-48.png"
		iconName_128 = "icon_disabled-128.png"
	}
	
	if (api.action !== undefined)
		api.action.setIcon({ path: "../images/" + iconName_16 })
	else if (api.browserAction !== undefined)
		api.action.setIcon({ path: "../images/" + iconName_16 })
	else console.log("changing icon is not supported")

}