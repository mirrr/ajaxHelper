
(function ($) {
	/**
	 * Вешаем обработчик на отправку формы через ajax
	 * @param  {Object} options
	 * @example
	 * $('#form-ajax').ajaxFormSender ({
	 * 		url:     'http://...',              // адрес отправки (по умолчанию берется из формы или из options.action)
	 * 		method:  'POST',                    // метод отправки (по умолчанию берется из формы или 'POST')
	 * 		timeout: 1500,                      // 1.5 sec.
	 * 		check:   function () {....},        // колбек проверки (return true/false - успешность проверки)
	 * 		success: function (result) {....},  // колбек на успешное выполнение (return true - закрыть окно)
	 * 		error:   function (result) {....}   // колбек на ошибку в ответе сервера
	 * });
	 */
	$.fn.ajaxFormSender = function (options) {
		options = options || {};

		// Обработчик
		$('body').on('submit', this.selector, function (event) {
			event = event || window.event;

			var $this = $(event.target);
			var action = options.action || $this.attr('action') || '';
			var settings = $.extend({
				url     : ((window.baseUrl && action.indexOf('/') === -1) ? (window.baseUrl + '/') : '') + action,
				method  : $this.attr('method') || 'POST',
				timeout : 1500,
				check   : (function () {return true;}),
				success : (function (result) {
					$.message.ok(result.message);
					return true;
				}),
				error   : (function (result) {
					$.message.ajaxWarn(result);
				})
			}, options);

			var data = $this.serialize();

			var obj = {};
			$this.serializeArray().forEach(function (el) {
				obj[el.name] = el.value;
			});

			if (settings.check(obj, $this, settings)) {
				$.ajax({
					url     : settings.url,
					type    : settings.method,
					data    : data,
					timeout : settings.timeout,
					success : function (result) {
						if (settings.success(result)) {
							$.wbox.close();
						}
					},
					error: settings.error
				});
			}

			$('body').off('submit', this.selector);
			event.preventDefault();
			return false;
		});
	};



	/**
	 * Вешаем обработчик на кнопки действий в таблице
	 * @param  {Object} options
	 * @example
	 * $('table .status, table .remove, table .trash').ajaxActionSender ({
	 * 		url:     'http://...',              // адрес отправки (options.url или window.baseUrl + '/' + options.target)
	 * 		method:  'POST',                    // метод отправки (по умолчанию 'GET')
	 * 		action:  'edit',                    // ajax-действие  (по умолчанию берется из data-action)
	 * 		timeout: 1500,                      // 1.5 sec.
	 * 		check:   function () {....},        // колбек проверки (return true/false - успешность проверки)
	 * 		success: function (result) {....},  // колбек на успешное выполнение (return true - закрыть окно)
	 * 		error:   function (result) {....}   // колбек на ошибку в ответе сервера
	 * });
	 */
	$.fn.ajaxActionSender = function (options) {

		// Обработчик
		$(this.selector).forceClick(function (event) {
			var opt = {};

			if (typeof options === 'function') {
				opt = options.call(this, event);
			} else {
				opt = typeof options === 'object' ? options : {};
			}

			var $this = $(event.target);

			var settings = $.extend({
				action: $this.data('action') || 'edit',
				data: {},
				dataKeys: [],
				dataId: 'id',
				id: null,
				method: 'GET',
				remove: false,
				timeout: 1500,
				url: options.target ? (window.baseUrl + '/' + options.target) : '',
				check: (function () {return true;}),
				success: (function (result) {$.message.ok(result.message);}),
				error: (function (result) {$.message.ajaxWarn(result);}),
				after: (function () {})
			}, opt);

			var sel = settings.selector ? $this.closest(settings.selector) : (
				settings.findSelector ? $this.find(settings.findSelector) : (
					settings.thisSelector ? $this : $this.closest('tr')
				)
			);
			var id = sel.data(settings.id || settings.dataId);

			settings.dataKeys.forEach(function (el) {
				if (sel.data(el)) {
					settings.data[el] = sel.data(el);
				}
			});

			var data = $.extend({action: settings.action, id: id}, settings.data);

			if (settings.check(data, $this, settings) && settings.url) {
				$.ajax({
					url     : settings.url,
					type    : settings.method,
					data    : data,
					timeout : settings.timeout,
					success : function (result) {
						if (settings.success(result, $this, settings) || settings.remove) {
							$this.closest('tr').hide().remove();
						}

						settings.after();
					},
					error: function (result) {
						settings.error(result, $this, settings);
					}
				});
			}
		});
	};


	$.fn.forceClick = function (func) {
		if (typeof func !== 'function') {
			throw new Error('Не указана функция - обработчик');
		}

		$('body').on('click', this.selector, function (event) {
			event = event || window.event;
			event.preventDefault();
			func.call(this, event);
			$('body').off('click', this.selector);
			return false;
		});
	};

})(jQuery);
