var $ready;
	var HTMLSTRCOPY;
	var APPCONFIG;
	var startX, startY, endX, endY;
	var startCx, startCy, endCx, endCy;
	var IS_CAPTURED = false;
	var $SELECTOR;
	var OPTIONS;
	var MAX_ZINDEX = 2147483646;
	var WIDGETBOTTOM = -8;
	var SELECTOR_BORDER = 2;

	var OCR_LIMIT = {
		min: {
			width: 40,
			height: 40
		},
		max: {
			width: 2600,
			height: 2600
		}
	};
	var ISPOSITIONED = false;
	var TextOverlay = window.__TextOverlay__;
	var OcrEngine =  null;
	var transitionEngine = null;
function onOCRMouseDown(e) {
    var $body = $('body');
    $body.addClass('ocrext-overlay ocrext-ch')
    Mask.addToBody().show();

    $('.ocrext-mask p.ocrext-element').css('transform', 'scale(0,0)');
    $SELECTOR = $('<div class="ocrext-selector"></div>');
    $SELECTOR.appendTo($body);
    startX = e.pageX;
        startY = e.pageY;
        $SELECTOR.css({
            'position': 'absolute'
        });
    startCx = e.clientX;
    startCy = e.clientY;


    $SELECTOR.css({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        zIndex: 999 - 1
    });

    $body.on('mousemove', onOCRMouseMove);

    // we need the closure here. `.one` would automagically remove the listener when done
    $body.one('mouseup', function (evt) {
        var $dialog;
        endCx = evt.clientX;
        endCy = evt.clientY;

        // turn off the mousemove event, we no longer need it
        $body.off('mousemove', onOCRMouseMove);

        // manipulate DOM to remove temporary cruft
        $body.removeClass('ocrext-ch');
        $SELECTOR.remove();
        Mask.hide();
        // show the widget
        _setZIndex();
        $dialog = $body.find('.ocrext-wrapper');
        $dialog
            .css({
                // zIndex: MAX_ZINDEX,
                // opacity: 0,
                bottom: -$dialog.height()
            })
            .show();

        // initiate image capture
         _captureImageOntoCanvas().done(function () {
            _processOCRTranslate();
        }); 
    });
}

function _captureImageOntoCanvas() {
    var $canOrig = $('#ocrext-canOrig'),
        $can = $('#ocrext-can'),
        $dialog = $('body').find('.ocrext-wrapper');
    var $captureComplete = $.Deferred();
    // capture the current tab using the background page. On success it returns
    // dataURL and zoom of the captured image
    var $imageLoadDfd = $.Deferred();
    var img = new Image();

    img.onload = function () {
        $imageLoadDfd.resolve();
    };

    img.src = response.dataURL;

    $imageLoadDfd
        .done(function () {
            // the screencapture is messed up when pixel density changes; compare the window width
            // and image width to determine if it needs to be fixed
            // also, this fix problem with page zoom
            var dpf = window.innerWidth / img.width;
            var scaleFactor = 1 / dpf,
                sx = Math.min(startCx, endCx) * scaleFactor,
                sy = Math.min(startCy, endCy) * scaleFactor,
                width = Math.abs(endCx - startCx) ,
                height = Math.abs(endCy - startCy),
                scaledWidth = width * scaleFactor ,
                scaledHeight = height * scaleFactor ;

            $canOrig.attr({
                width: scaledWidth,
                height: scaledHeight
            });

            $can.attr({
                width: width,
                height: height
            });

            var ctxOrig = $canOrig.get(0).getContext('2d');
            ctxOrig.drawImage(img, sx, sy, scaledWidth, scaledHeight, 0, 0, scaledWidth, scaledHeight);

            var ctx = $can.get(0).getContext('2d');
            ctx.drawImage(img, sx, sy, scaledWidth, scaledHeight, 0, 0, width, height); // Or at whatever offset you like
            $dialog.css({
                opacity: 1,
                bottom: WIDGETBOTTOM
            });
            $captureComplete.resolve();
        });

    return $captureComplete;
}
function onOCRMouseMove(e) {
    var l, tonOCRMouseMove, w, h;
    if (ISPOSITIONED) {
        endX = e.pageX - $('body').scrollLeft();
        endY = e.pageY - $('body').scrollTop();
        $SELECTOR.css({
            'position': 'fixed'
        });
    } else {
        endX = e.pageX;
        endY = e.pageY;
        $SELECTOR.css({
            'position': 'absolute'
        });
    }

    l = Math.min(startX, endX);
    t = Math.min(startY, endY);
    w = Math.abs(endX - startX);
    h = Math.abs(endY - startY);

    $SELECTOR.css({
        left: l,
        top: t,
        width: w,
        height: h
    });

     Mask.reposition({
        tl: [l + SELECTOR_BORDER, t + SELECTOR_BORDER],
        tr: [l + w + SELECTOR_BORDER, t + SELECTOR_BORDER],
        bl: [l + SELECTOR_BORDER, t + h + SELECTOR_BORDER],
        br: [l + w + SELECTOR_BORDER, t + h + SELECTOR_BORDER]
    }); 
}
var _setZIndex = function () {
		/*
		 * Google Translate - 1201 Perapera - 7777 GDict - 99997 Transover - 2147483647
		 */
		$('.ocrext-wrapper').css('zIndex', 1200);
			let $textarea = $('textarea.ocrext-result');

			if ($('#popup_support_text').length === 0){

				$textarea.after(`<p id="popup_support_text" class="${$textarea.prop('classList')}">${$textarea.val()}</p>`);
				$textarea.hide();

			}
    };
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
    
            return SrangecreenCap.readFileAsBlob(range)
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
    var Mask = (function () {
		var $body;
		var $MASK;
		var maskString = [
			'<div class="ocrext-element ocrext-mask">',
			'<p class="ocrext-element">Please select text to grab.</p>',
			'<div class="ocrext-overlay-corner ocrext-corner-tl"></div>',
			'<div class="ocrext-overlay-corner ocrext-corner-tr"></div>',
			'<div class="ocrext-overlay-corner ocrext-corner-br"></div>',
			'<div class="ocrext-overlay-corner ocrext-corner-bl"></div>',
			'</div>'
		].join('');

		var tl;
		var tr;
		var bl;
		var br;

		return {
			addToBody: function () {
				$body = $('body');
				if (!$MASK && !$body.find('.ocrext-mask').length) {
					$MASK = $(maskString)
						.css({
							left: 0,
							top: 0,
							width: '100%',
							height: '100%',
							zIndex: MAX_ZINDEX - 2,
							display: 'none'
						});
					$MASK.appendTo($body);

					tl = $('.ocrext-corner-tl');
					tr = $('.ocrext-corner-tr');
					br = $('.ocrext-corner-br');
					bl = $('.ocrext-corner-bl');

					this.resetPosition();
				}
				$MASK.width($(document).width());
				$MASK.height($(document).width());
				if (['absolute', 'relative', 'fixed'].indexOf($('body').css('position')) >= 0) {
					$MASK.css('position', 'fixed');
				}
				return this;
			},

			width: function (w) {
				if (w === undefined) {
					return $MASK.width();
				}
				$MASK.width(w);
			},

			height: function (h) {
				if (h === undefined) {
					return $MASK.height();
				}
				$MASK.height(h);
			},

			show: function () {
				this.resetPosition();
				$MASK.show();
				return this;
			},

			hide: function () {
				$MASK.hide();
				return this;
			},

			remove: function () {
				$MASK.remove();
				$MASK = null;
			},

			resetPosition: function () {
				var width = $(document).width();
				var height = $(document).height();
				tl.css({
					top: 0,
					left: 0,
					width: width / 2,
					height: height / 2
				});
				tr.css({
					top: 0,
					left: width / 2,
					width: width / 2,
					height: height / 2
				});
				bl.css({
					top: height / 2,
					left: 0,
					width: width / 2,
					height: height / 2
				});
				br.css({
					top: height / 2,
					left: width / 2,
					width: width / 2,
					height: height / 2
				});
			},

			reposition: function (pos) {
				var width = $(document).width();
				var height = $(document).height();

				tl.css({
					left: 0,
					top: 0,
					width: pos.tr[0],
					height: pos.tl[1]
				});

				tr.css({
					left: pos.tr[0],
					top: 0,
					width: (width - pos.tr[0]),
					height: pos.br[1]
				});

				br.css({
					left: pos.bl[0],
					top: pos.bl[1],
					width: (width - pos.bl[0]),
					height: (height - pos.bl[1])
				});

				bl.css({
					left: 0,
					top: pos.tl[1],
					width: pos.tl[0],
					height: (height - pos.tl[1])
				});
			}
		};
	}());
$(document).ready(function() {
    console.log(11111)
    document.addEventListener('mousedown', onOCRMouseDown)
})