$(function() {
  $.ajaxSetup({ cache: false });
  'use strict';
  $.getJSON(chrome.extension.getURL('config/config.json'))
    .done(function(appConfig) {
      var suppressSaves;
      var defaults = appConfig.defaults;
      var ocrnameArray = appConfig.ocr_languages;
      var statusTimeout;

      var checkBoxes = {
        visualCopyAutoTranslate: ['.auto-translate', defaults.visualCopyAutoTranslate],
        visualCopySupportDicts: ['.popup-dicts', defaults.visualCopySupportDicts],
        visualCopyTextOverlay: ['.text-overlay', defaults.visualCopyTextOverlay]
      };


//free plan
			$('.show_status').each(function(index, el) {
					$(this).text(defaults.status);
			});



      var setChromeSyncStorage = function(obj) {
        chrome.storage.sync.set(obj, function() {
          // Update status to let user know options were saved.
          $('.status-text').addClass('visible');
          clearTimeout(statusTimeout);
          statusTimeout = setTimeout(function() {
            $('.status-text').removeClass('visible');
          }, 5000);
        });
      };
      // // render the Input Language select box
      // var htmlStrArr = $(ocrnameArray).map(function (i, val) {
      // 	return '<option value="' + val.lang + '">' + val.name + '</option>';
      // });
      //
      //
      //
      // $('#input-lang').html(htmlStrArr.toArray().join(' '));
      // htmlStrArr.splice(0, htmlStrArr.length);
      //
      // // render the quick select checkboxes
      // htmlStrArr = $(ocrnameArray).map(function (i, val) {
      // 	return '<option value="' + val.lang + '" data-shhort="' + val.short + '">' + val.name + '-' + val.short + '</option>';
      // });
      // $('.lang-quickselect').each(function (i, node) {
      // 	$(node).append(htmlStrArr.toArray().join(' '));
      // });
      // htmlStrArr.splice(0, htmlStrArr.length);

      // fetch options while defaulting them when unavailable
      chrome.storage.sync.get({
        visualCopyOCRLang: defaults.visualCopyOCRLang,
        visualCopyTranslateLang: defaults.visualCopyTranslateLang,
        visualCopyAutoTranslate: defaults.visualCopyAutoTranslate,
        visualCopyOCRFontSize: defaults.visualCopyOCRFontSize,
        visualCopySupportDicts: defaults.visualCopySupportDicts,
        visualCopyQuickSelectLangs: defaults.visualCopyQuickSelectLangs,
        visualCopyTextOverlay: defaults.visualCopyTextOverlay,
        openGrabbingScreenHotkey: defaults.openGrabbingScreenHotkey,
        closePanelHotkey: defaults.closePanelHotkey,
        copyTextHotkey: defaults.copyTextHotkey,
        ocrEngine: defaults.ocrEngine,
        transitionEngine: defaults.transitionEngine,
				status: defaults.status

      }, function(items) {

        console.log('settings', items);
				//pro status
				if (items.status == 'PRO') {
					$('.show_status').each(function(index, el) {
							$(this).text(items.status);
					});
					$('#OcrGoogle').removeAttr('disabled').parents().removeClass('is-disabled');
				}else if (items.status == 'PRO+') {

					$('.show_status').each(function(index, el) {
							$(this).text(items.status);
					});

					$('#OcrGoogle').removeAttr('disabled').parents().removeClass('is-disabled');
					$('#YandexTranslator').removeAttr('disabled').parents().removeClass('is-disabled');
					$('#GoogleTranslator').removeAttr('disabled').parents().removeClass('is-disabled');
					$('#switch-auto-translate').removeAttr('disabled').parents().removeClass('is-disabled');
				}else if (items.status === 'Free Plan'){
                  const $OcrSpace =  $('#OcrSpace');

                  if (!$OcrSpace.attr('checked')){
                    $('#OcrSpace').click();
                    setTimeout(()=> {
                      $('.status-text').removeClass('visible');
                    },100)

                  }

                }
        //radio buttons values
        $(`#${items.ocrEngine}`).attr('checked', 'checked').parent().addClass('is-checked');

        //get  translationEngine value   in chrome storage and check it
        $(`#${items.transitionEngine}`).attr('checked', 'checked').parent().addClass('is-checked');

        if (items.transitionEngine == "GoogleTranslator") {
          //render translate api language
          var translateArray = appConfig.google_languages;
          var translateLangArray = $(translateArray).map(function(i, val) {
            let langCode = Object.keys(val)[0];

            return '<option value="' + langCode + '">' + val[langCode] + '</option>';
          });

          $('#output-lang').html(translateLangArray.toArray().join(' '));

        } else if (items.transitionEngine == "YandexTranslator") {

          //render translate api language
          var translateArray = appConfig.yandex_languages;
          var translateLangArray = $(translateArray).map(function(i, val) {
            let langCode = Object.keys(val)[0];

            return '<option value="' + langCode + '">' + val[langCode] + '</option>';
          });

          $('#output-lang').html(translateLangArray.toArray().join(' '));
        }
        if (items.ocrEngine == "OcrGoogle") {

          var ocrnameArray = appConfig.ocr_google_languages;
          // render the Input Language select box
          var htmlStrArr = $(ocrnameArray).map(function(i, val) {
            return '<option value="' + val.lang + '">' + val.name + '</option>';
          });

          $('#input-lang').html(htmlStrArr.toArray().join(' '));
          htmlStrArr.splice(0, htmlStrArr.length);

          // render the quick select checkboxes
          htmlStrArr = $(ocrnameArray).map(function(i, val) {
            return '<option value="' + val.lang + '" data-short="' + val.short + '">' + val.name + '-' + val.short + '</option>';
          });
          $('.lang-quickselect').each(function(i, node) {
            $(node).append(htmlStrArr.toArray().join(' '));
          });
          htmlStrArr.splice(0, htmlStrArr.length);
        } else if (items.ocrEngine == "OcrSpace") {

          //render translate api language
          var translateArray = appConfig.yandex_languages;
          var translateLangArray = $(translateArray).map(function(i, val) {
            let langCode = Object.keys(val)[0];

            return '<option value="' + langCode + '">' + val[langCode] + '</option>';
          });

          $('#output-lang').html(translateLangArray.toArray().join(' '));


          var ocrnameArray = appConfig.ocr_languages;
          // render the Input Language select box
          var htmlStrArr = $(ocrnameArray).map(function(i, val) {
            return '<option value="' + val.lang + '">' + val.name + '</option>';
          });

          $('#input-lang').html(htmlStrArr.toArray().join(' '));
          htmlStrArr.splice(0, htmlStrArr.length);

          // render the quick select checkboxes
          htmlStrArr = $(ocrnameArray).map(function(i, val) {
            return '<option value="' + val.lang + '" data-short="' + val.short + '">' + val.name + '-' + val.short + '</option>';
          });
          $('.lang-quickselect').each(function(i, node) {
            $(node).append(htmlStrArr.toArray().join(' '));
          });
          htmlStrArr.splice(0, htmlStrArr.length);
        }



        // don't persist any triggered changes
        suppressSaves = true;

        $('#input-lang').val(items.visualCopyOCRLang);
        $('#output-lang').val(items.visualCopyTranslateLang);
        $('#ocr-fontsize').val(items.visualCopyOCRFontSize);
        /*set checkbox state(s)*/
        $.each(checkBoxes, function(key, value) {
          if ((!items[key] && $(value[0]).hasClass('is-checked')) ||
            (items[key] && !$(value[0]).hasClass('is-checked'))) {
            $('#switch-' + value[0].substr(1)).click();
          }
        });
        if (!items.visualCopyQuickSelectLangs.length) {
          $('.lang-quickselect').each(function(i, node) {
            $(node).val('none');
          });
        } else {
          $.each(items.visualCopyQuickSelectLangs, function(i, language) {
            $('#input-lang-' + (i + 1)).val(language);
          });
        }
        // hotkey
        $('#openHotkey').val(items.openGrabbingScreenHotkey);
        $('#closeHotkey').val(items.closePanelHotkey);
        $('#copyHotkey').val(items.copyTextHotkey);
        suppressSaves = false;
      });

      $('body')
        .on('change', function(e) {
          var $target = $(e.target);
          var quickSelectLangs = [];
          if (suppressSaves) {
            return true;
          }
          if ($target.is('#input-lang')) {
            setChromeSyncStorage({
              visualCopyOCRLang: $('#input-lang').val()
            });
          } else if ($target.is('#output-lang')) {
            setChromeSyncStorage({
              visualCopyTranslateLang: $target.val()
            });
          } else if ($target.is('#ocr-fontsize')) {
            setChromeSyncStorage({
              visualCopyOCRFontSize: $target.val()
            });
          } else if ($target.is('#output-lang')) {
            setChromeSyncStorage({
              visualCopyOCRLang: $target.val()
            });
          } else if ($target.is('#switch-auto-translate')) {
            setChromeSyncStorage({
              visualCopyAutoTranslate: $target.parent().hasClass('is-checked')
            });
          } else if ($target.is('#switch-popup-dicts')) {
            setChromeSyncStorage({
              visualCopySupportDicts: $target.parent().hasClass('is-checked')
            });
          } else if ($target.is('#switch-text-overlay')) {
            setChromeSyncStorage({
              visualCopyTextOverlay: $target.parent().hasClass('is-checked')
            });
          } else if ($target.is('.lang-quickselect')) {
            $('.lang-quickselect').each(function(i, node) {
              quickSelectLangs.push($(node).val());
            });
            setChromeSyncStorage({
              visualCopyQuickSelectLangs: quickSelectLangs
            });
          } else if ($target.is("#openHotkey")) {
            setChromeSyncStorage({
              openGrabbingScreenHotkey: +$target.val()
            });
          } else if ($target.is("#closeHotkey")) {
            setChromeSyncStorage({
              closePanelHotkey: +$target.val()
            });
          } else if ($target.is("#copyHotkey")) {
            setChromeSyncStorage({
              copyTextHotkey: +$target.val()
            });
          } else if ($target.is("#OcrSpace")) {
            setChromeSyncStorage({
              ocrEngine: $target.val()
            });


            var ocrnameArray = appConfig.ocr_languages;
            // render the Input Language select box
            var htmlStrArr = $(ocrnameArray).map(function(i, val) {
              return '<option value="' + val.lang + '">' + val.name + '</option>';
            });



            $('#input-lang').html(htmlStrArr.toArray().join(' '));
            htmlStrArr.splice(0, htmlStrArr.length);

            // render the quick select checkboxes
            htmlStrArr = $(ocrnameArray).map(function(i, val) {
              return '<option value="' + val.lang + '" data-short="' + val.short + '">' + val.name + '-' + val.short + '</option>';
            });
            $('.lang-quickselect').each(function(i, node) {
              $(node).children('option').not(':first').remove();
              $(node).append(htmlStrArr.toArray().join(' '));
            });
            htmlStrArr.splice(0, htmlStrArr.length);
            // reset Input Language Quickselect if OcrIsChanged
            setChromeSyncStorage({
              visualCopyOCRLang: "eng",
              visualCopyQuickSelectLangs: ["none", "none", "none"]
            });


            // reset Input Language Quickselect if OcrIsChanged
            $('.lang-quickselect').each(function(i, node) {
              $(node).val('none');
            });

          } else if ($target.is("#OcrGoogle")) {
            setChromeSyncStorage({
              ocrEngine: $target.val()
            });
            //render translate api language
            var translateArray = appConfig.google_languages;
            var translateLangArray = $(translateArray).map(function(i, val) {
              let langCode = Object.keys(val)[0];

              return '<option value="' + langCode + '">' + val[langCode] + '</option>';
            });
            setChromeSyncStorage({
              visualCopyTranslateLang: 'en'
            });

            $('#output-lang').html(translateLangArray.toArray().join(' '));
            var ocrnameArray = appConfig.ocr_google_languages;

            // render the Input Language select box
            var htmlStrArr = $(ocrnameArray).map(function(i, val) {
              return '<option value="' + val.lang + '">' + val.name + '</option>';
            });

            $('#input-lang').html(htmlStrArr.toArray().join(' '));
            htmlStrArr.splice(0, htmlStrArr.length);

            // render the quick select checkboxes
            htmlStrArr = $(ocrnameArray).map(function(i, val) {
              return '<option value="' + val.lang + '" data-short="' + val.short + '">' + val.name + '-' + val.short + '</option>';
            });
            $('.lang-quickselect').each(function(i, node) {
              $(node).children('option').not(':first').remove();
              $(node).append(htmlStrArr.toArray().join(' '));
            });
            htmlStrArr.splice(0, htmlStrArr.length);

            // reset Input Language Quickselect if OcrIsChanged
            setChromeSyncStorage({
              visualCopyOCRLang: "avto",
              visualCopyQuickSelectLangs: ["none", "none", "none"]
            });
            // reset Input Language Quickselect if OcrIsChanged
            $('.lang-quickselect').each(function(i, node) {
              $(node).val('none');
            });
          } else if ($target.is("#YandexTranslator")) {
            setChromeSyncStorage({
              transitionEngine: $target.val()
            });

            //render translate api language
            var translateArray = appConfig.yandex_languages;
            var translateLangArray = $(translateArray).map(function(i, val) {
              let langCode = Object.keys(val)[0];

              return '<option value="' + langCode + '">' + val[langCode] + '</option>';
            });

            $('#output-lang').html(translateLangArray.toArray().join(' '));
            setChromeSyncStorage({
              visualCopyTranslateLang: 'en'
            });

          } else if ($target.is("#GoogleTranslator")) {
            setChromeSyncStorage({
              transitionEngine: $target.val()
            });

            //render translate api language
            var translateArray = appConfig.google_languages;
            var translateLangArray = $(translateArray).map(function(i, val) {
              let langCode = Object.keys(val)[0];

              return '<option value="' + langCode + '">' + val[langCode] + '</option>';
            });

            $('#output-lang').html(translateLangArray.toArray().join(' '));
            setChromeSyncStorage({
              visualCopyTranslateLang: 'en'
            });

          }
        })
        /*.on('click', '.btn-save', function() {
            var quickSelectLangs = [];
            $('.lang-quickselect').each(function(i, node) {
                var $node = $(node);
                quickSelectLangs.push($node.val());
            });
            chrome.storage.sync.set({
                visualCopyOCRLang: $('#input-lang').val(),
                visualCopyTranslateLang: $('#output-lang').val(),
                visualCopyOCRFontSize: $('#ocr-fontsize').val(),
                visualCopyAutoTranslate: $('.auto-translate').hasClass('is-checked'),
                visualCopySupportDicts: $('.popup-dicts').hasClass('is-checked'),
                visualCopyQuickSelectLangs: quickSelectLangs,
                visualCopyTextOverlay: $('.text-overlay').hasClass('is-checked')
            }, function() {
                // Update status to let user know options were saved.
                $('.status-text').addClass('visible');
                setTimeout(function() {
                    $('.status-text').removeClass('visible');
                }, 5000);
            });
        })*/
        .on('click', '.btn-reset', function() {
          $('#input-lang').val(defaults.visualCopyOCRLang);
          $('#output-lang').val(defaults.visualCopyTranslateLang);
          $('#ocr-fontsize').val(defaults.visualCopyOCRFontSize);
          $.each(checkBoxes, function(key, value) {
            if ((!value[1] && $(value[0]).hasClass('is-checked')) ||
              (value[1] && !$(value[0]).hasClass('is-checked'))) {
              $('#switch-' + value[0].substr(1)).click();
            }
          });

          $('.lang-quickselect').each(function(i, node) {
            $(node).val('none');
          });
        })
        .on('submit', 'form[name=mc-embedded-subscribe-form]', function(e) {
          var $this = $(this);
          var url = $this.attr('action') + "&" + $this.serialize();
          window.open(url);
          e.preventDefault();
        });
    });

  // check file access status
  chrome.storage.sync.get(['fileAccessStatus'], function(result) {
          const fileAccessStatus = result.fileAccessStatus;

          if (fileAccessStatus) {
            $('.file-access-status-done').css('display', 'block');
          }else if (!fileAccessStatus) {
              $('.file-access-status-error').css('display', 'block');
          }
  });
  //key checker
  $('.keyChecker_btn').click(function(event) {
    checkKey($('.keyChecker_input').val().toLowerCase());
  });

  let xmodule_version;
  //get xmodule version
  chrome.runtime.sendMessage({evt: "getVersion"});
  chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {

        if (request.evt === "x_module_version"){
          console.log(request.version)
          if (request.version)  {
            $('.status-box span').text(`Installed (${request.version})`).css({color: "#2b9beb"});
            $('.status-box a').text('Check for update');

            if (xmodule_version){
              alert(`status updated: Installed (${request.version})`)
            }
          }

        }else if(request.evt === "not_installed"){

            alert(`status updated: not Installed`)

        }else if(request.message === 'showXmoduleOption'){
              let $target = $('#xmodule-item');
              $('html, body').stop().animate({
                'scrollTop': $target.offset().top - $(window).height()/3
              }, 500, 'swing', function () {
                // lets add a div in the background
                $target.css({border: '0 solid #ff0000'}).animate({
                  borderWidth: 3
                }, 1200,function() {
                  $target.animate({
                    borderWidth: 0
                  }, 600);
                });

              });
        }else if(request.message === 'reloadPage'){

          location.reload()
        }

    });

  $('#check-update-xmodule').click(() => {
    chrome.runtime.sendMessage({evt: "getVersion",check: true});
    xmodule_version = true;
  });





  function checkKey(keyData) {
    let key = keyData;
    let keyChar = key.substr(1, 9);
    if (key.length === 20) {

      if (key.charAt(1) === 'p') {

        $.get("https://a9t9.com/xcopyfish/" + keyChar + ".json", function(data, status, xhr) {
          if (xhr.status == 200) {
            chrome.storage.sync.set({"key": key });

            chrome.runtime.sendMessage({evt: "checkKey"});

            if ($('.show_status').text() == 'PROPRO') {
              $('#status_msg').text("PRO plan already activated");

              setTimeout(function () {
                $('#status_msg').text("");
              }, 3000);
            }else {
              $('.show_status').each(function(index, el) {
                $(this).text('PRO');
              });

              $('#OcrGoogle').removeAttr('disabled').click().parents().removeClass('is-disabled');

              $('#status_msg_success').text("PRO plan activated");

              setTimeout(function () {
                $('#status_msg_success').text("");
              }, 3000);

              $.get("https://a9t9.com/xcopyfish/"+ keyChar + ".json", function(data, status, xhr) {
                chrome.storage.sync.set({status: 'PRO',google_ocr_api_url: data.google_ocr_api_url,google_ocr_api_key: data.google_ocr_api_key});
              });

            }


          }
        }).fail(function(data, status, xhr) {

          $.get("https://a9t9.com/xcopyfish/onlinetest.json", function(data) {

          }).fail(function(data, status, xhr) {
            if (data.status == 200) {
              $('#status_msg').text("Invalid key");
              setTimeout(function () {
                $('#status_msg').text("");
              }, 3000);

            } else if (data.status == 404) {
              $('#status_msg').text("License server can not be reached. Please try again.");
              setTimeout(function () {
                $('#status_msg').text("");
              }, 3000);
            }

          })

        })

        $('.keyChecker_input').val('');


      } else if (key.charAt(1) === 't') {

        $.get("https://a9t9.com/xcopyfish/" + keyChar + ".json", function(data, status, xhr) {
          if (xhr.status == 200) {
            chrome.storage.sync.set({"key": key });
            chrome.runtime.sendMessage({evt: "checkKey"});
            $('.show_status').each(function(index, el) {
              $(this).text('PRO+');
            });

            $('#OcrGoogle').removeAttr('disabled').click().parents().removeClass('is-disabled');
            $('#YandexTranslator').removeAttr('disabled').parents().removeClass('is-disabled');
            $('#GoogleTranslator').removeAttr('disabled').click().parents().removeClass('is-disabled');
            $('#switch-auto-translate').removeAttr('disabled').click().parents().removeClass('is-disabled');
            $('#output-lang').removeAttr('disabled');

            $('#status_msg_success').text("PRO+ plan activated");
            setTimeout(function () {
              $('#status_msg_success').text("");
            }, 3000);
            $.get("https://a9t9.com/xcopyfish/" + keyChar + ".json", function(data, status, xhr) {
              chrome.storage.sync.set({status: 'PRO+',google_ocr_api_url: data.google_ocr_api_url,google_ocr_api_key: data.google_ocr_api_key,google_trs_api_url: data.google_trs_api_url,google_trs_api_key: data.google_trs_api_key});

            });

          }
        }).fail(function(data, status, xhr) {

          $.get("https://a9t9.com/xcopyfish/onlinetest.json", function(data) {

          }).fail(function(data, status, xhr) {
            if (data.status == 200) {
              $('#status_msg').text("Invalid key");
              setTimeout(function () {
                $('#status_msg').text("");
              }, 3000);
            } else if (data.status == 404) {
              $('#status_msg').text("License server can not be reached. Please try again later");
              setTimeout(function () {
                $('#status_msg').text("");
              }, 3000);
            }

          })

        })
        $('.keyChecker_input').val('');
      } else {

        $('#status_msg').text('Invalid key');
        setTimeout(function () {
          $('#status_msg').text("");
        }, 3000);
        $('.keyChecker_input').val('');
      }


    } else {
      //if key.length !== 15
      $('#status_msg').text('Invalid key');
      setTimeout(function () {
        $('#status_msg').text("");
      }, 3000);
    }
    //		$('.keyChecker_input').val('');
  }










  $('.keyChecker_input').keypress(function(e) {
    if (e.which == 13) { //Enter key pressed
      $('.keyChecker_btn').click(); //Trigger search button click event
    } else if (e.which == 32) {
      //disable space button
      return e.which !== 32;
    }
  });

  //check plan button code

  $('#check-status-btn').click( function (e) {
    chrome.runtime.sendMessage({evt: "checkKey"});
  })

  //trim text in past in password field
  $(document).on('paste', '.keyChecker_input', function(e) {
    e.preventDefault();
    // prevent copying action
    const text  =  e.originalEvent.clipboardData.getData('Text')
    let withoutSpaces = text.trim();

    $(this).val(withoutSpaces);

  });
  //trim text in drop in password field
  $(document).on('drop', '.keyChecker_input', function(e) {
    e.preventDefault();
    // prevent copying action
    const text  =  e.originalEvent.dataTransfer.getData('Text')
    let withoutSpaces = text.trim();

    $(this).val(withoutSpaces);

  });

});
