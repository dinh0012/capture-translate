'use strict';
var TAB_AVAILABILITY_TIMEOUT = 150;
let planCheckTime = 864 * 1000 * 100; //one day

$.ajaxSetup({ cache: false });
/*
 * how does the enable/disable icon work?
 * Ans: website:document.ready -> 'ready' message to background -> enables icon
 *
 * how does clicking on the extension icon work?
 * Ans: browserAction:onclick -> 'enableselection' event to specific tab -> selection enabled in that tab
 */

var activeOnTab = {};

var isUpdated = false;

const screenshotDelay  = 3000;

setInterval(checkPlanEveryDay,planCheckTime);

let nextInvocationId = 0;
let port = null;
let params;
let totalSize;
let optionsTabId;
let imageURI = '';
let imagepath;
let errorConnect = false;

const connectAsync = () => {
	errorConnect = false;
	 port = chrome.runtime.connectNative("com.a9t9.kantu.cv");



	port.onMessage.addListener(function(msg) {
		if (typeof msg.result === "object"){
			console.log(msg,"file_range");
				imageURI = btoa(atob(imageURI) + atob(msg.result.buffer))
			if (msg.result.rangeEnd >= totalSize || msg.result.rangeEnd <= msg.result.rangeStart){
				msg.result.buffer = imageURI;

				chrome.tabs.sendMessage(optionsTabId,{
					evt: 'desktopcaptureData',
					result: msg.result
				});
			}else{

				params = {
					path: imagepath,
					rangeStart:  msg.result.rangeEnd
				}
				invokeAsync("read_file_range", params);
			}

		}else if(typeof msg.result === "number"){
			console.log(msg,"file_size");
			totalSize = msg.result;
			invokeAsync("read_file_range", params);
		}else if(isLetter(msg.result) === null){
			console.log(msg,"version")
			chrome.runtime.sendMessage({evt: "x_module_version", version: msg.result});
		}else{

			console.log(msg,"screen capture")
			imagepath = msg.result;
			imageURI="";
			params = {
				path:  msg.result,
				rangeStart: 0
			}
			invokeAsync("get_file_size", params);

		}
	});

	port.onDisconnect.addListener(function() {
		errorConnect = true;
		console.log("Disconnected");
	});

}

function isLetter(str) {
	try{
		return str.match(/[a-z]/i);
	}catch (e) {
		return false
	}

}
const  invoke  = async (method , params) => {

	const id = nextInvocationId++;
	const requestObject = {
		id: id,
		method: method,
		params: params
	};


	return Promise.resolve(port.postMessage(requestObject));
};

const invokeAsync = async (method,params) => {

	return new Promise((resolve, reject) => {
		invoke(method, params, (result, error) => {
			console.log(error)
			if (error) {
				reject(error);
			} else {
				console.log(result)
				resolve(result);
			}
		});
	});
}

connectAsync();



function updateIcons() {
	for (var tabId in activeOnTab) {
		if (activeOnTab.hasOwnProperty(tabId)) {
			// if (activeOnTab[tabId]) {
			// 	disableIcon(+tabId);
			// } else {
			enableIcon(+tabId);
			//}
		}
	}

	chrome.tabs.query({}, function (tabs) {
		for (var i = 0; i < tabs.length; i++) {
			var tab = tabs[i];
			//if (/^chrome:/.test(tab.url)) {
			//	disableIcon(tab.id);
			// else {
				enableIcon(tab.id);
		//	}
		}
	});
}

function enableIcon(tabId) {
	activeOnTab[tabId] = true;
	chrome.browserAction.enable(tabId);
	/*if (isUpdated) {
		chrome.browserAction.setIcon({
			'path': {
				'19': 'images/icon-19_new.png',
				'38': 'images/icon-38_new.png'
			},
			tabId: tabId
		});
	} else {
		chrome.browserAction.setIcon({
			'path': {
				'19': 'images/icon-19.png',
				'38': 'images/icon-38.png'
			},
			tabId: tabId
		});
	}*/
}



function disableIcon(tabId) {

	activeOnTab[tabId] = false;
	chrome.browserAction.disable(tabId);
	chrome.browserAction.setIcon({
		'path': {
			'19': 'images/icon-19_disabled.png',
			'38': 'images/icon-38_disabled.png'
		},
		tabId: tabId
	});
}

function checkPlanEveryDay() {

	chrome.storage.sync.get(['lastPlanCheck',"key"], function(result) {
		const currentDate = new Date().getTime();
		let planCheck = result.lastPlanCheck;

		if (result.key){

			let check_key_interval;
			clearTimeout(check_key_interval);
			check_key_interval = setTimeout(checkPlanEveryDay,60 * 1000 * 60);

			if (!planCheck) {

				chrome.storage.sync.set({"lastPlanCheck": currentDate});

			}else{
				chrome.storage.sync.set({"lastPlanCheck": currentDate});

				checkKey(result.key);
			}

		}

	});


}

checkPlanEveryDay()

function reloadOptionsPage() {
	chrome.runtime.sendMessage({message: "reloadPage"});
}

function checkKey(keyData) {
	let key = keyData;
	let keyChar = key.substr(1, 9);
	if (key.length === 20) {

		if (key.charAt(1) === 'p') {

			$.get("https://a9t9.com/xcopyfish/" + keyChar + ".json", function(data, status, xhr) {
				if (xhr.status === 200) {

					$.get("https://a9t9.com/xcopyfish/"+ keyChar + ".json", function(data, status, xhr) {
							if (data.google_ocr_api_key === 'freeplan'){

								//key is invalid
								chrome.storage.sync.set({status: "Free Plan",ocrEngine: "OcrSpace",transitionEngine: false,visualCopyAutoTranslate: false,visualCopyOCRLang:"eng"});

								chrome.storage.sync.remove("key");


								reloadOptionsPage()
								chrome.runtime.openOptionsPage()

								chrome.notifications.create({
									type: 'basic',
									iconUrl: 'images/icon-38.png',
									title: "It seems your PRO/PRO+ subscription is expire",
									message: `Copyfish will go back to the free mode. \n If you think this message is an error, please contact us at team@ocr.space`,
									silent: true
								});



							}else{
								console.log('pro activated')

								chrome.storage.sync.set({status: 'PRO',google_ocr_api_url: data.google_ocr_api_url,google_ocr_api_key: data.google_ocr_api_key});

							}

					});

				}
			}).fail(function() {

				//if key is invalid
				chrome.storage.sync.set({status: "Free Plan",ocrEngine: "OcrSpace",transitionEngine: false,visualCopyAutoTranslate: false,visualCopyOCRLang:"eng"});

				chrome.storage.sync.remove("key");

				reloadOptionsPage()

				chrome.runtime.openOptionsPage()


				chrome.notifications.create({
					type: 'basic',
					iconUrl: 'images/icon-38.png',
					title: "It seems your PRO/PRO+ subscription is expire",
					message: `Copyfish will go back to the free mode. \n If you think this message is an error, please contact us at team@ocr.space.com`
				});


			});

		} else if (key.charAt(1) === 't') {
			console.log(21321)
			$.get("https://a9t9.com/xcopyfish/" + keyChar + ".json", function(data, status, xhr) {


				if (xhr.status === 200) {

					$.get("https://a9t9.com/xcopyfish/" + keyChar + ".json", function(data, status, xhr) {

						if (data.google_ocr_api_key === 'freeplan'){

							//key is invalid
							chrome.storage.sync.set({status: "Free Plan",ocrEngine: "OcrSpace",transitionEngine: false,visualCopyAutoTranslate: false,visualCopyOCRLang:"eng"});

							chrome.storage.sync.remove("key");

							reloadOptionsPage()

							chrome.runtime.openOptionsPage()


							chrome.notifications.create({
								type: 'basic',
								iconUrl: 'images/icon-38.png',
								title: "It seems your PRO/PRO+ subscription is expire",
								message: `Copyfish will go back to the free mode. \n If you think this message is an error, please contact us at team@ocr.space.com`
							});


						}else{


							chrome.storage.sync.set({status: 'PRO+',google_ocr_api_url: data.google_ocr_api_url,google_ocr_api_key: data.google_ocr_api_key,google_trs_api_url: data.google_trs_api_url,google_trs_api_key: data.google_trs_api_key});


						}

					});

				}
			}).fail(function() {

				//if key is invalid
				chrome.storage.sync.set({status: "Free Plan",ocrEngine: "OcrSpace",transitionEngine: false,visualCopyAutoTranslate: false,visualCopyOCRLang:"eng"});

				chrome.storage.sync.remove("key");

				reloadOptionsPage()

				chrome.runtime.openOptionsPage()


				chrome.notifications.create({
					type: 'basic',
					iconUrl: 'images/icon-38.png',
					title: "It seems your PRO/PRO+ subscription is expire",
					message: `Copyfish will go back to the free mode. \n If you think this message is an error, please contact us at team@ocr.space`
				});


			});
		} else {

			//if key is invalid
			chrome.storage.sync.set({status: "Free Plan",ocrEngine: "OcrSpace",transitionEngine: false,visualCopyAutoTranslate: false,visualCopyOCRLang:"eng"});

			chrome.storage.sync.remove("key");

			reloadOptionsPage()

			chrome.runtime.openOptionsPage()


			chrome.notifications.create({
				type: 'basic',
				iconUrl: 'images/icon-38.png',
				title: "It seems your PRO/PRO+ subscription is expire",
                message: `Copyfish will go back to the free mode. \n If you think this message is an error, please contact us at team@ocr.space`
			});

		}


	}else{


		//if key is invalid
		chrome.storage.sync.set({status: "Free Plan",ocrEngine: "OcrSpace",transitionEngine: false,visualCopyAutoTranslate: false,visualCopyOCRLang:"eng"});

		chrome.storage.sync.remove("key");

		reloadOptionsPage()

		chrome.runtime.openOptionsPage()


		chrome.notifications.create({
			type: 'basic',
			iconUrl: 'images/icon-38.png',
			title: "It seems your PRO/PRO+ subscription is expire",
            message: `Copyfish will go back to the free mode. \n If you think this message is an error, please contact us at team@ocr.space`
		});

	}


}


function captureScreen() {


		if (errorConnect === false) {
			console.log(port)
			chrome.notifications.create({
				type: 'basic',
				iconUrl: 'images/icon-38.png',
				title: "Desktop capture",
				message: `About to take desktop screenshot in 3 seconds`
			});

			setTimeout(() => {



				chrome.tabs.create({
					url: chrome.extension.getURL('/screencapture.html')
				}, function (destTab) {


					optionsTabId = destTab.id;
					invokeAsync("capture_desktop", undefined);

				});



			},screenshotDelay)
		}else{

			chrome.notifications.create({
				type: 'basic',
				iconUrl: 'images/icon-38.png',
				title: "Desktop capture",
				message: `Please install the Copyfish Desktop Screenshot module first`
			});

			openXmoduleInstallOption();

		}



}

function openXmoduleInstallOption() {
	setTimeout(function () {
			chrome.runtime.openOptionsPage(function (){

					setTimeout(function () {
						chrome.runtime.sendMessage({message: "showXmoduleOption"});
					},300)
			})
	},500)
}

// supports autotimeout
function isTabAvailable(tabId) {
	function _checkAvailability() {
		var _tabId = tabId;
		var $dfd = $.Deferred();
		chrome.tabs.sendMessage(_tabId, {
			evt: 'isavailable'
		}, function (resp) {
			if ($dfd.state() !== 'rejected') {
				if (resp && resp.farewell === 'isavailable:OK') {
					$dfd.resolve();
				} else if (resp && resp.farewell === 'isavailable:FAIL') {
					$dfd.reject();
				}
			}
		});

		setTimeout(function () {
			if ($dfd.state() !== 'resolved') {
				$dfd.reject();
			}
		}, TAB_AVAILABILITY_TIMEOUT);

		return $dfd;
	}

	return _checkAvailability();
}

// ensure the config is available before doing anything else
$.getJSON(chrome.extension.getURL('config/config.json'))
	.done(function (appConfig) {
		/*
		 * Should ideally be a BST, but a tree for 3 nodes is overkill.
		 * The underlying structure can be converted to a BST in future if required. Since the methods exposed remain the
		 * same, side effects should be near zero
		 */
		var OcrDS = (function () {
			var _maxResponseTime = 99;
			var _randNotEqual = function (serverList, server) {
				var idx = Math.floor(Math.random() * serverList.length);
				if (serverList.length === 1) {
					return serverList[0];
				}
				if (serverList[idx].id !== server.id) {
					return serverList[idx];
				} else {
					return _randNotEqual(serverList, server);
				}
			};
			var _ocrDSAPI = {
				resetTime: appConfig.ocr_server_reset_time,
				currentBest: {},
				reset: function () {
					this.getAll().done(function (items) {
						if (Date.now() - items.ocrServerLastReset > this.resetTime) {
							$.each(items.ocrServerList, function (i, server) {
								server.responseTime = 0;
							});
						}
					});
				},
				getAll: function () {
					var $dfd = $.Deferred();
					chrome.storage.sync.get({
						ocrServerLastReset: -1,
						ocrServerList: []
					}, function (items) {
						$dfd.resolve(items);
					});
					return $dfd;
				},
				getBest: function () {
					var $dfd = $.Deferred();
					var self = this;
					this.getAll().done(function (items) {
						var serverList = items.ocrServerList;
						var best = serverList[0];
						var allValuesSame = true;

						// 1. check if all values are same
						var cmp;
						$.each($.map(serverList, function (s) {
							return s.responseTime;
						}), function (i, s) {
							if (i === 0) {
								cmp = s;
								return true;
							}
							if (cmp !== s) {
								allValuesSame = false;
								return false;
							}
						});

						if (allValuesSame) {
							// if all values are same and one of them is zero, use the first occurrence
							if (serverList[0].responseTime === 0) {
								self.currentBest = serverList[0];
							} else {
								self.currentBest = _randNotEqual(serverList, self.currentBest);
							}
							return $dfd.resolve(self.currentBest);
						}

						// 2. Linear search to find best server
						$.each(serverList, function (i, server) {
							if (server.responseTime < best.responseTime) {
								best = server;
							}
						});
						self.currentBest = best;
						$dfd.resolve(self.currentBest);
					});
					return $dfd;
				},
				set: function (id, responseTime) {
					var $dfd = $.Deferred();
					this.getAll().done(function (items) {
						var serverList = items.ocrServerList;
						if (responseTime === -1) {
							responseTime = _maxResponseTime;
						}
						$.each(serverList, function (i, server) {
							if (id === server.id) {
								server.responseTime = responseTime;
								return false;
							}
						});
						chrome.storage.sync.set({
							ocrServerList: serverList
						}, function () {
							$dfd.resolve();
						});
					});
					return $dfd;
				}
			};

			// init
			chrome.storage.sync.get({
				ocrServerLastReset: -1,
				ocrServerList: []
			}, function (items) {
				var serverList;
				if (items.ocrServerLastReset === -1) {
					serverList = [];
					// if -1, then the store is empty. Populate it
					$.each(appConfig.ocr_api_list, function (i, api) {
						serverList.push({
							id: api.id,
							responseTime: 0
						});
					});
					chrome.storage.sync.set({
						ocrServerList: serverList,
						ocrServerLastReset: Date.now()
					});
				} else {
					// store is not empty, reset if required
					_ocrDSAPI.reset();
				}
			});

			return _ocrDSAPI;
		}());

		chrome.contextMenus.create({
			contexts: ['browser_action'],
			title: 'Desktop Text Capture',
			id: 'capture-desktop',
			onclick: captureScreen
		});

		// disableIcon();
		chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
				enableIcon(tabId);
		});

		chrome.storage.sync.get({
			visualCopyOCRLang: '',
			visualCopyTranslateLang: '',
			visualCopyAutoTranslate: '',
			visualCopyOCRFontSize: '',
			visualCopySupportDicts: '',
			visualCopyQuickSelectLangs: [],
			visualCopyTextOverlay: ''
		}, function (items) {
			var itemsToBeSet;
			if (!items.visualCopyOCRLang) {
				// first run of the extension, set everything
				chrome.storage.sync.set(appConfig.defaults, function () {});
			} else {
				// if any of these fields return '', they have not been set yet.
				itemsToBeSet = {};
				$.each(items, function (k, item) {
					if (item === '') {
						itemsToBeSet[k] = appConfig.defaults[k];
					}
				});
				if (Object.keys(itemsToBeSet).length) {
					chrome.storage.sync.set(itemsToBeSet, function () {});
				}
			}
		});

	//if browser action on click is desktop capture set green icon

		const changeIcon = (url,tabId) => {

			if (url && (/^chrome\-extension:\/\//.test(url) || /^chrome:\/\//.test(url) || /^https:\/\/chrome\.google\.com\/webstore\//.test(url))) {


				if (/screencapture.html/gi.test(url)) {
					console.log('screen selection activate')
				}else {
					chrome.browserAction.setIcon({
						'path': {
							'19': 'images/icon-19_desktop.png',
							'38': 'images/icon-38_desktop.png'
						},
						tabId
					});
				}


			}

		};

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			changeIcon(tab.url,tab.id)
		});

		chrome.tabs.onActivated.addListener(function(activeInfo) {
			// how to fetch tab url using activeInfo.tabid
			chrome.tabs.get(activeInfo.tabId, function(tab){
				changeIcon(activeInfo.tabId,tab.url)
			});
		});
		chrome.browserAction.onClicked.addListener(
			function(tab) {
				const url = tab.url || !1;
				if (url && (/^chrome\-extension:\/\//.test(url) || /^chrome:\/\//.test(url) || /^https:\/\/chrome\.google\.com\/webstore\//.test(url))) {
					if (/screencapture.html/gi.test(url)) {
						activate(tab);
					}else {
						captureScreen();
					}
				}else {
					activate(tab);
				}
			}
		);

		function activate(tab) {

			chrome.tabs.sendMessage(tab.id, {
				evt: 'disableselection'
			});

			if (isUpdated) {
				chrome.tabs.create({
                    url: "https://ocr.space/copyfish/whatsnew?b=chrome"
				});

				isUpdated = false;
				updateIcons();
				return;
			}


			isTabAvailable(tab.id)
				.done(function () {
					console.log('activate for this tab')
					chrome.tabs.sendMessage(tab.id, {
						evt: 'enableselection'
					});
				})
				.fail(function () {

					loadFiles(tab.id)
						.then(function () {

							isTabAvailable(tab.id)
								.done(function () {
									chrome.tabs.sendMessage(tab.id, {
										evt: 'enableselection'
									});
								})
								.fail(function () {
									let wantScreenCapture = confirm(chrome.i18n.getMessage('captureError'));

									if (wantScreenCapture === true){
										captureScreen();
									}
									enableIcon(tab.id);
								});
						})
						.catch(() => {
							let wantScreenCapture = confirm(chrome.i18n.getMessage('captureError'));

							if (wantScreenCapture === true){
								captureScreen();
						}
							enableIcon(tab.id);
						});
				});
		}

		function loadFiles(tabId) {
			var files = ["styles/material.min.css", "styles/cs.css", "scripts/jquery.min.js", "scripts/material.min.js", "scripts/overlay.js", "scripts/cs.js"];
			var result = Promise.resolve();
			files.forEach(function (file) {
				result = result.then(function () {
					if (/css$/.test(file)) {
						return insertCSS(tabId, file);
					} else {
						return executeScript(tabId, file);
					}
				});
			});

			return result;
		}

		function insertCSS(tabId, file) {
			return new Promise(function (resolve, reject) {
				chrome.tabs.insertCSS(tabId, {
					file: file
				}, function () {
					resolve();
				});
			});
		}

		function executeScript(tabId, file) {
			return new Promise(function (resolve, reject) {
				chrome.tabs.executeScript(tabId, {
					file: file
				}, function () {
					resolve();
				});
			});
		}

		chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
			var tab = sender.tab;
			var copyDiv;
			var overlayInfo;
			var imgDataURI;
			if (!tab) {
				return false;
			}
			if (request.evt === 'ready') {
				enableIcon(tab.id);
				sendResponse({
					farewell: 'ready:OK'
				});
				return true;
			}else if(request.evt === 'checkKey'){

				checkPlanEveryDay();

			} else if (request.evt === 'activate') {
				activate(tab);
			} else if (request.evt === 'capture-screen') {
				chrome.tabs.captureVisibleTab(function (dataURL) {
					chrome.tabs.getZoom(tab.id, function (zf) {
						sendResponse({
							dataURL: dataURL,
							zf: zf
						});
					});
				});
				return true;
			} else if (request.evt === 'capture-done') {
				enableIcon(tab.id);
				sendResponse({
					farewell: 'capture-done:OK'
				});
			} else if (request.evt === 'copy') {
				copyDiv = document.createElement('div');
				copyDiv.contentEditable = true;
				document.body.appendChild(copyDiv);
				copyDiv.textContent = request.text;
				copyDiv.unselectable = 'off';
				copyDiv.focus();
				document.execCommand('SelectAll');
				document.execCommand('Copy', false, null);
				document.body.removeChild(copyDiv);
				sendResponse({
					farewell: 'copy:OK'
				});
			} else if (request.evt === 'open-settings') {
				chrome.tabs.create({
					'url': chrome.extension.getURL('options.html')
				});
				sendResponse({
					farewell: 'open-settings:OK'
				});
			} else if (request.evt === 'get-best-server') {
				OcrDS.getBest().done(function (server) {
					sendResponse({
						server: server
					});
				});
				return true;
			} else if (request.evt === 'set-server-responsetime') {
				OcrDS.set(request.serverId, request.serverResponseTime).done(function () {
					sendResponse({
						farewell: 'set-server-responsetime:OK'
					});
				});
				return true;
			} else if (request.evt === 'show-overlay-tab') {
				// trap them props
				overlayInfo = request.overlayInfo;
				imgDataURI = request.imgDataURI;
				chrome.tabs.create({
					url: chrome.extension.getURL('/overlay.html')
				}, function (destTab) {
					setTimeout(function () {
						chrome.tabs.sendMessage(destTab.id, {
							evt: 'init-overlay-tab',
							overlayInfo: overlayInfo,
							imgDataURI: imgDataURI,
							canWidth: request.canWidth,
							canHeight: request.canHeight
						}, function () {
							// chrome.tabs.sendMessage(destTab.id, {
							//     evt: 'enableselection'
							// });
							sendResponse({
								farewell: 'show-overlay-tab:OK'
							});
						});
					}, 300);
				});
				return true;
			}else if (request.evt === 'google-translate') {
				let OPTIONS = request.options;
				let text  = request.text;
				$.ajax({
					url: OPTIONS.google_trs_api_url,
					data: {
						key: OPTIONS.google_trs_api_key,
						target: OPTIONS.visualCopyTranslateLang,
						q: text
					},
					type: 'GET',
					success: function (data) {
						console.log(data,"data");
						if (data.data.translations[0].translatedText != null) {
							sendResponse({
								success: true,
								data: data.data.translations[0].translatedText
							});
						}
					},
					error: function (x, t) {
						var errData;
						try {
							errData = JSON.parse(x.responseText);
						} catch (e) {
							errData = {};
						}
						sendResponse({
							success: false,
							data: errData,
							time: t
						});

					}
				});

				return true;
			}else if (request.evt === 'google-ocr') {
				let OPTIONS = request.options;
				$.ajax({
		 		 method: 'POST',
		 		 url: OPTIONS.google_ocr_api_url +'?key='+OPTIONS.google_ocr_api_key,
		 		 contentType: 'application/json',
		 		 data: JSON.stringify(request.request),
		 		 processData: false,
		 		 success: function (data) {
					 sendResponse({
						 success: true,
						 data: data
					 });
		 			}
		 		})
				return true
			}
		});
	});
//


//TODO активировать эту часть кода перед продакщеном


chrome.runtime.onInstalled.addListener(function (object) {
	if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		// Open page after installation
		chrome.tabs.create({
            url: "https://ocr.space/copyfish/welcome?b=chrome"
		});

		updateIcons();
	} else if (object.reason === chrome.runtime.OnInstalledReason.UPDATE) {
		// Update icon for all tabs
		//isUpdated = true;
		updateIcons();
	}
});


//detect file access status
chrome.extension.isAllowedFileSchemeAccess((status) => {

	chrome.storage.sync.set({fileAccessStatus: status});

})

// Open page after uninstall
chrome.runtime.setUninstallURL("https://ocr.space/copyfish/why?b=chrome");
