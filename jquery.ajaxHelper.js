
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
		$('body').off('submit', this.selector);
		$('body').on('submit', this.selector, function (event) {
			event = event || window.event;
			event.preventDefault();

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
				if (typeof obj[el.name] === 'undefined' && el.name.indexOf('[]') === -1) {
					obj[el.name] = el.value;
				} else {
					var name = el.name.replace('[]', '');

					if (typeof obj[name] === 'undefined') {
						obj[name] = [];
					} else if (!Array.isArray(obj[name])) {
						obj[name] = [obj[name]];
					}

					obj[name].push(el.value);
				}
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

			return false;
		});
	};



	/**
	 * Вешаем обработчик на кнопки действий в таблице
	 * (INFO: Вместо объекта опций можно передать ф-ю, отдающую этот объект)
	 *
	 * @param  {Object/Function} options
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
				url: opt.target ? ((window.baseUrl ? window.baseUrl + '/' : '') + opt.target) : '',
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


	/**
	 * "Умный" обработчик для линков
	 *
	 * @param  {Function} func
	 */
	$.fn.forceClick = function (func) {
		if (typeof func !== 'function') {
			throw new Error('Не указана функция - обработчик');
		}

		$('body').off('click', this.selector);
		$('body').on('click', this.selector, function (event) {
			event = event || window.event;
			event.preventDefault();
			func.call(this, event);
			return false;
		});
		return this;
	};




	/**
	 * Простейшая загрузка элементов таблицы или списка (with doT.js)
	 *
	 * @param  {Object} options
	 *
	 * @example
	 * $('table>body').ajaxActionSender ({
	 * 		url:     'http://...',              // адрес отправки (options.url или window.baseUrl + '/' + options.target)
	 * 		// или :
	 * 		target:  'edit',                    // ajax-контроллер (для кабмина)
	 * 		timeout: 1500,                      // 1.5 sec.
	 * 		success: function (result) {....},  // колбек на успешное выполнение (return true - закрыть окно)
	 * 		error:   function (result) {....}   // колбек на ошибку в ответе сервера
	 * });
	 *
	 */
	$.fn.listLoad = function (options) {
		var $this = $(this.selector);
		options = $.extend({
			target: $this.data('target') || '',
			itemTpl: 'item',
			data: {},
			method: 'GET',
			timeout: 1500,
			success   : (function () {}),
			error   : (function (result) {
				$.message.ajaxWarn(result);
			})
		}, options);

		if (!options.url && options.target) {
			options.url =  (window.baseUrl ? window.baseUrl + '/' : '') + options.target;
		}

		$.ajax({
			url     : options.url,
			type    : options.method,
			data    : options.data,
			timeout : options.timeout,
			success : function (result) {
				$this.tpl(options.itemTpl, result.data);

				if (typeof options.success === 'function') {
					options.success(result);
				}
			},
			error: function (result) {
				if (options.noitemsTpl) {
					$this.tpl(options.noitemsTpl);
				}

				if (typeof options.error === 'function') {
					options.error(result);
				}
			}
		});
	};

})(jQuery);
