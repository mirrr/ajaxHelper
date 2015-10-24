/* global define */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else {
		factory(jQuery);
	}
}

(function ($) {
	$.jeremi = function () {};

	var init = false;
	var $stek = $('<div/>', {
		'id': 'jeremi-block'
	});

	/**
	 * Вывести сообщение
	 * @param  {String} title
	 * @param  {String} info
	 * @param  {String} msgClass  ['info', 'filter']
	 * @param  {String} type      ['show', 'title', 'play']
	 */
	$.jeremi.run = function (title, info, msgClass, type) {

		type = type || 'title';
		var clotimer = null;

		if (!init) {
			$.jeremi.init();
		}

		if (title) {
			var $title = $('<div class="title"><span class="ticon fa fa-' + msgClass +
				'"></span><span>' + title +
				'</span><span class="close fa fa-angle-up fa-angle-down"></span></div>');

			var $info = $('<div/>', {
				'class': 'info',
				'html': info
			});
			var $wrap = $('<div/>', {'class': msgClass});

			$wrap.append($title).append($info);
			$stek.prepend($wrap);


			$wrap.on('click, mouseover', function () {
				if (clotimer) {
					clearTimeout(clotimer);
					clotimer = null;
				}
			});
			$title.on('click', function () {
				$title.find('.close').toggleClass('fa-angle-down');
				$info.slideToggle({
					queue: false,
					duration: 600,
					easing: jQuery.easing.easeOutQuint ? 'easeOutQuint' : 'linear',
				});
			});
			if (type === 'title') {
				$info.hide();
				$title.find('.close').toggleClass('fa-angle-down');
			}
			setTimeout(function () {
				$wrap.slideDown({
					queue: false,
					duration: 1000,
					easing: jQuery.easing.easeOutExpo ? 'easeOutExpo' : 'linear',
					complete: function () {
						if (type === 'play') {
							clotimer = setTimeout(function () {
								$title.find('.close').toggleClass('fa-angle-down');
								$info.slideUp({
									queue: false,
									duration: 600,
									easing: jQuery.easing.easeOutQuint ? 'easeOutQuint' : 'linear',
								});
							}, 4000);
						}
					}
				});
			}, 1000);
		}
	};

	// Сообщение об успешном выполнении
	$.jeremi.filter = function (title, message, type) {
		$.jeremi.run(title, message, 'filter', type);
	};

	// Сообщение об успешном выполнении
	$.jeremi.info = function (title, message, type) {
		$.jeremi.run(title, message, 'info', type);
	};

	// Сообщение об успешном выполнении
	$.jeremi.info = function (title, message, type) {
		$.jeremi.run(title, message, 'info', type);
	};

	$.jeremi.init = function (options) {
		options = $.extend({parent: 'body'}, options);

		if (!init) {
			$(options.parent).append($stek);
			init = true;
		}
	};
}));
