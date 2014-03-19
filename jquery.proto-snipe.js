/*
 *  Project: Proto-Snipe
 *  Description: A basic jquery plugin to detect support for a given protocol
 *  Author: Aaron Latham-Ilari
 *  License: BSD
 */

;(function ($, window, document, undefined) {

	ProtoSnipe = function() {

		// public properties
		// ---------------------------------

    	this.pluginVersion = "0.0.1";
		this.pluginName    = "proto-snipe";

		// private properties
		// ---------------------------------

		var protocol    = null,
	        isSupported	= false,
	        callback    = null;

		// public methods
		// ---------------------------------

		var setProtocol = function(protocol_to_test) {
			protocol = protocol_to_test;
		};

		var getProtocol = function(){
			return protocol;
		};

		var setCallback = function(func) {
			callback = func;
		};

		var getCallback = function() {
			return callback();
		};

		var getUrl = function(){
			p = getProtocol();
			p = /:/.test(p) ? p : p + '://';
			return p + "google.com";
		};

		var isIE = function() {
			return /MSIE/.test(navigator.userAgent);
		};

		var isMozilla = function() {
			return /Mozilla/.test(navigator.userAgent) && !isIE();
		};

		var isChrome = function() {
			return /Chrome/.test(navigator.userAgent);
		};

		var test = function() {

			if ( isMozilla() || isChrome() ) {
				testMozilla();
			} else if ( isIE() ) {
				testIE();
			}

			return isSupported;

		};

		var handleCallback = function() {
			if (typeof callback == 'function') callback(isSupported);
		}

		// private methods
		// ---------------------------------

		// review https://gist.github.com/rajeshsegu/3716941
		var testIE = function() {

			var url = getUrl(),
				$a  = $('<a href="' + url + '"></a>');

			isSupported = false;

			// try ms launch uri IE10+
			// -----------------------

			if(navigator.msLaunchUri){
				navigator.msLaunchUri(
					url,
					function () {
						isSupported = true;
						handleCallback();
					},
					function () {
						isSupported = false;
						handleCallback()
					}
				);
				return;
			}

			// try protocolLong
			// returns unknown protocol for unknown protocols (http passes but mailto doesn't)
			// ----------------

			$('body').append($a);

			if ( $a[0].protocolLong != "Unknown Protocol" ) {

				isSupported = true;
				$a.remove();
				handleCallback();

				return;
			}

			$a.remove();

		};

		//Handle Firefox
		var testMozilla = function() {

			// locals
			var url 	= getUrl(),
			    $iframe = $('<iframe src="#"></iframe>');

			// "globals"
			isSupported = false;

			$('body').append($iframe);

			//Set iframe.src and handle exception
			try {
				$iframe[0].contentWindow.location.href = url;
				isSupported = true;
			} catch(e) {
				if (e.name == "NS_ERROR_UNKNOWN_PROTOCOL") isSupported = false;
			}

			$iframe.remove();
			handleCallback();
		};

		return {
			test : function(test_val, callback_func) {
				setCallback(callback_func);
				setProtocol(test_val);
				test();
			}
		};

	};

	// make sure we have a supports object
	if (typeof $.supports == 'undefined') $.supports = {};

	// attach the tester to the $.browser.supports.protocol object
    $.supports.protocol = function(protocol_str, callback_func) {
    	var tester = new ProtoSnipe;
    	tester.test(protocol_str, callback_func);
    	return $;
    }


})(jQuery, window, document);
