
/*
 * Методы управления всплывающими уведомлениями
 */

/* global define */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
}

(function ($) {
	$.message = function () {};

	var init = false;
	var $stek = $('<div/>', {
		'id': 'message-block'
	});

	$.message.run = function (msg, msgClass) {
		if (!init) {
			$.message.init();
		}

		if (msg) {
			var $wrap = $('<div/>', {
				'class': msgClass + ' unselectable',
				'text': msg
			});
			$stek.prepend($wrap);

			$wrap.on('click', function (event) {
				console.log('click');
				event = event || window.event; // For IE
				event.preventDefault();
				$wrap.slideUp({
					queue: false,
					duration: 300,
					easing: jQuery.easing.easeInBack ? 'easeInBack' : 'linear',
					complete: $wrap.remove
				});
			});

			$wrap.slideDown({
				queue: false,
				duration: 800,
				easing: jQuery.easing.easeOutElastic ? 'easeOutElastic' : 'linear',
				complete: function () {
					setTimeout(function () {
						$wrap.slideUp({
							queue: false,
							duration: 600,
							easing: jQuery.easing.easeOutQuint ? 'easeOutQuint' : 'linear',
							complete: $wrap.remove
						});
					}, 5000);
				}
			});
		}
	};

	// Сообщение об ошибке
	$.message.warn = function (msg) {
		$.message.run(msg, 'warn');
	};

	// Сообщение об успешном выполнении
	$.message.ok = function (msg) {
		$.message.run(msg, 'ok');
	};

	// Сообщение об успешном выполнении
	$.message.info = function (msg) {
		$.message.run(msg, 'info');
	};


	// Сообщение об ошибке в ajax
	$.message.ajaxWarn = function (result) {
		var msg;

		if (result) {
			if (typeof result === 'object') {
				if (result.responseJSON && result.responseJSON.message)
					msg = result.responseJSON.message;
				else if (result.statusText)
					msg = result.statusText;
				else if (result.statusStr)
					msg = result.statusStr;
			} else {
				msg = result;
			}

			$.message.warn(msg);
		}
	};


	$.message.init = function (options) {
		options = $.extend({parent: 'body'}, options);

		if (!init) {
			$(options.parent).append($stek);
			init = true;
		}
	};
}));
