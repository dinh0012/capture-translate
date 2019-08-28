'use strict';
let dataUrls = [];

let ScreenCap = {


	sum: (...list) => {
		return list.reduce((x, y) => x + y, 0);
	},

	blobToDataURL: (blob, withBase64Prefix = false)  => {
		return new Promise((resolve, reject) => {
			let reader = new FileReader()
			reader.onerror = reject
			reader.onload = (e) => {

				const str = reader.result

				if (withBase64Prefix){
					$("#imageViewerContainer").verySimpleImageViewer({
						imageSource: str,
						frame: [screen.width - 50 + 'px',screen.height - 50 + 'px',true],
						mouse: true
					});
					// //add zoom button
					// $('.image_viewer_inner_container').append(`
					// 	 <div class="zoom-container">
					// 		<button id="zoom-btn" data-value="0.5">
					// 		  Show Original Size
					// 		</button>
         			// 	 </div>
					// `);
					//
					// const $zoomBtn = $('#zoom-btn');
					//
					// $zoomBtn.click(function () {
					//
					// 	let value = $zoomBtn.data( "value" );
					//
					// 	if (value === 0.5){
					// 		$zoomBtn.text('Show 50%').data('value',1);
					// 		$('#imageViewerContainer img').css({
					// 			zoom: 1
					// 		})
					// 	}else if(value === 1){
					// 		$zoomBtn.text('Show Original Size').data('value',0.5)
					// 		$('#imageViewerContainer img').css({
					// 			zoom: .5
					// 		})
					// 	}
					// });

					return resolve(str)
				}

				const b64 = 'base64,'
				const i   = str.indexOf(b64)
				const ret = str.substr(i + b64.length)
				$("#imageViewerContainer").verySimpleImageViewer({
					imageSource: ret,
					mouse: true
				});
				resolve(ret)
			}
			reader.readAsDataURL(blob)
		})
	},

	dataURItoArrayBuffer: (dataURI) => {
		// convert base64 to raw binary data held in a string
		// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
		var byteString = atob(
			/^data:/.test(dataURI) ? dataURI.split(',')[1] : dataURI
		);

		// write the bytes of the string to an ArrayBuffer
		var ab = new ArrayBuffer(byteString.length);

		// create a view into the buffer
		var ia = new Uint8Array(ab);

		// set the bytes of the buffer to the correct values
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		return ab
	},

	concatUint8Array : (...arrays) => {
	const totalLength = ScreenCap.sum(...arrays.map(arr => arr.length));
	const result = new Uint8Array(totalLength);
	for (let i = 0, offset = 0, len = arrays.length; i < len; i += 1) {
		result.set(arrays[i], offset);
		offset += arrays[i].length;
	}
	return result;
	},

	readFileAsArrayBuffer: (range) => {

		return new Promise((resolve, reject) => {
			const result = range.rangeEnd > range.rangeStart ? dataUrls.concat([range.buffer]) : dataUrls;

			console.log(dataUrls, 12312312);
			const arr = ScreenCap.concatUint8Array(...result.map(result => new Uint8Array(ScreenCap.dataURItoArrayBuffer(result))));
			console.log(arr.buffer, 12312312);
			resolve(arr.buffer);
		});
	},

	readFileAsBlob: (range) => {
		return new Promise((resolve, reject) => {
			resolve(ScreenCap.readFileAsArrayBuffer(range)
				.then(buffer => new Blob([buffer])));
		});

	},

	readFileAsDataURL: (range, withBase64Prefix = true) => {

		return ScreenCap.readFileAsBlob(range)
			.then(blob => ScreenCap.blobToDataURL(blob, withBase64Prefix));
	},

	init: function () {
		this.title = chrome.i18n.getMessage('appName') + ' - ' + chrome.i18n.getMessage('screenCapture');
		$('title,.title').text(this.title);
		$('.placeholder').text(chrome.i18n.getMessage('screenCaptureWaitMessage'));

		chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

			if (request.evt === 'desktopcaptureData') {
				// enable only if resources are loaded and available
				if (request.result.buffer){
					// $('#main_img').attr("src",`data:application/octet-stream;base64,${request.result.buffer}`).css({width: "1920px",
					// height: "1080px",
					// zoom: 1});


					const setImage = ScreenCap.readFileAsDataURL(request.result);
					$('.placeholder')
						.text(chrome.i18n.getMessage('screenCaptureNotify'))
						.addClass('notify');



				}else{
					alert('capture error')
				}

			}
			// ACK back
			return true;
		});
	}

};
$(ScreenCap.init);

