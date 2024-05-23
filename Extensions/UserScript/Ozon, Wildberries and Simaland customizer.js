// ==UserScript==
// @name         Ozon, Wildberries and Simaland customizer: sorting reviews by ascending rating
// @name:ru      Ozon, Wildberries и Simaland настройка: сортировка отзывов по возрастанию рейтинга
// @namespace    http://tampermonkey.net/
// @version      2024-05-23
// @description  Ozon, Wildberries and Simaland: sorting reviews by product by ascending rating
// @description:ru  Ozon, Wildberries и Simaland: сортировка отзывов по товару по возрастанию рейтинга
// @author       Igor Lebedev
// @license        GPL-3.0-or-later
// @icon         https://raw.githubusercontent.com/LebedevIV/Ozon-Wildberries-Simaland-customizer/main/icons/logo_color.svg
// @match          http://*.ozon.ru/*
// @match          https://*.ozon.ru/*
// @match          http://*.wildberries.ru/*
// @match          https://*.wildberries.ru/*
// @match          http://*.sima-land.ru/*
// @match          https://*.sima-land.ru/*
// @downloadURL    https://raw.githubusercontent.com/LebedevIV/Ozon-Wildberries-Simaland-customizer/main/Extensions/UserScript/Ozon%2C%20Wildberries%20and%20Simaland%20customizer.js
// @updateURL      https://raw.githubusercontent.com/LebedevIV/Ozon-Wildberries-Simaland-customizer/main/Extensions/UserScript/Ozon%2C%20Wildberries%20and%20Simaland%20customizer.js
// ==/UserScript==


(function() {
    'use strict'

    // получаем текущий адрес страницы
    const currentURL = window.location.href

    // Ozon: Функция для добавления к ссылкам параметра сортировки рейтинга по возрастанию - на случай если пользователь будет вручную открывать ссылки с карточкой товара в новой вкладке
    function addOzonSortParamToLinks() {
		if (config.SettingsOnOff) {
			const links = document.querySelectorAll('a[href^="/product/"]:not([href*="&sort=score_asc"])');
			links.forEach(link => {
				const linkOrig = link.href
				link.href += '&sort=score_asc';
				// Проверяем, является ли родительский элемент (parentNode) div с классом 'iy6'
				const link_parentNode = link.parentNode
				// Привязка к блоку рейтингов (звёздочек) ссылки на рейтинги
				if(link_parentNode.tagName.toLowerCase() === 'div' && link_parentNode.classList.contains('iy6')) {
					// Определение наличия вложенного элемента, содержащего рейтинги
					var divStars = link_parentNode.querySelector('div.iw.wi1');
					if (divStars) {
						// Сохранение текущего содержимого div
						let oldHTML = divStars.innerHTML;
						// Оборачивание существующего содержимого div в собственную ссылку
						// и присвоение стиля 'cursor: pointer'
						// привязка полученного href к текущему div + добавление к ссылке метки в виде трёх символов якоря, которые не удаляется из строки
						let url1Base = linkOrig.match(/(^[^\?]+)/g)[0];
						divStars.innerHTML = `<a href="${url1Base}reviews?sort=score_asc" style="display: flex; width: 100%; height: 100%; cursor: pointer;">${oldHTML}</a>`;
					}
				}					
			});
		}
    }
	
    // Wildberries: Ожидание загружки страницы товара до появления элемента сортировки рейтинга и искусственное двойное нажатие этого элемента чтобы добиться сортировки рейтинга по возрастанию
    function sortWildberriesReviews() {
        const interval = setInterval(() => {
            // ожидание загрузки страницы до необходимого значения
		const preloader = document.querySelector('#app > div[data-link="visible{:router.showPreview}"]')
		if (preloader?.style.display === 'none') {
	                const sortButton = document.querySelector("#app > div:nth-child(5) > div > section > div.product-feedbacks__main > div.user-activity__tab-content > div.product-feedbacks__sorting > ul > li:nth-child(2) > a");
	                if (sortButton) {
	                    // Инициируем событие на элементе
	                    // Проверяет, содержит ли элемент класс 'sorting__selected'
	                    if (sortButton.classList.contains('sorting__selected')) {
	                        // Находим элемент <span> внутри найденного <a>
	                        let span = sortButton.querySelector('span');
	                        // Проверяем, содержит ли <span> класс 'sorting__decor--up'
	                        // Если содержит, значит, сортировка по возрастанию уже произведена и никаких действий производить не нужно (всё равно приходится произвести два клика, так как, по-видимому, по мере загрузки происходит последующий сброс настроек) - надо отловить объект, который появляется уже после сброса, и зацепиться за него
	                        if (span && span.classList.contains('sorting__decor--up')) {
	                            // Первое нажатие производит сортировку по убыванию рейтинга
	                            // sortButton.click();
	                            // Второе нажатие производит сортировку по возрастанию рейтинга
	                            // sortButton.click();
	                        } else {
	                            // Нажатие производит сортировку по возрастанию рейтинга
	                            sortButton.click();
	                        }
	                    } else {
	                        // Первое нажатие производит сортировку по убыванию рейтинга
	                        sortButton.click();
	                        // Второе нажатие производит сортировку по возрастанию рейтинга
	                        sortButton.click();
	                    }
	                    clearInterval(interval);
	                }
            	}	
        }, 50);
    }

    // Sima-lend: Ожидание загружки страницы товара до появления элемента сортировки рейтинга и искусственное нажатие этого элемента чтобы добиться сортировки рейтинга по возрастанию
    function sortSimaLendReviews() {
        const interval = setInterval(() => {
            // ожидание загрузки страницы до появления ссылки на отзывы
            const aReviews = document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(1) > div > div > div.hb20Nd > div.bcg7Pf > div > div > div.RB0Z2S.vZiVTa > a");
            if (aReviews) {
                // если ссылка активна (когда отзывыы есть)
                if (aReviews?.getAttribute('tabindex') === "0" && !aReviews.classList.contains('HuzmFE')) {
                    // aReviews.addEventListener('load', addOzonSortParamToLinks)
                    aReviews?.addEventListener('click', (event) => {
                        // event.preventDefault(); // Предотвратить переход по ссылке
                        const interval2 = setInterval(() => {
                            // ожидание дозагрузки страницы до появления ссылки открытия списка сортировки
                            const sortButton = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div > div.BucAGq > div.HnQBoO > div > a");
                            if (sortButton) {
                                sortButton?.addEventListener('click', (event) => {
                                    const interval3 = setInterval(() => {
                                        // ожидание дозагрузки страницы до раскрытия списка сортировки ипоявления пункта сортировки по возрастанию рейтинга
                                        const sortButtonSortingPoint = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div > div.BucAGq > div.HnQBoO > div > div > div > div.os-padding > div > div > div:nth-child(4)");
                                        if (sortButtonSortingPoint) {
                                            clearInterval(interval3);
                                            sortButtonSortingPoint.click();
                                        }
                                    }, 50);
                                });
                                clearInterval(interval2);
                                sortButton.click();
                            }
                        }, 50);
                    });
                }
                clearInterval(interval);
            }
        }, 50);
    }

    // Sima-lend: Ожидание загружки страницы товара до появления элемента рейтинга и искусственное нажатие этого элемента
    function SimaLendCatalogReviewsOpen() {
        const interval = setInterval(() => {
            // ожидание загрузки страницы до появления ссылки на отзывы
            const aReviews = document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(1) > div > div > div.hb20Nd > div.bcg7Pf > div > div > div.RB0Z2S.vZiVTa > a")
            if (aReviews) {
                // если ссылка активна (когда отзывыы есть)
                if (aReviews?.getAttribute('tabindex') === "0" && !aReviews.classList.contains('HuzmFE')) {

                    aReviews?.addEventListener('click', (event) => {

                        const interval_appWrappers = setInterval(() => {
                            let appWrappers = document.querySelectorAll('[data-testid="app-wrapper"]');
                            if (appWrappers) {
                                const interval2 = setInterval(() => {
                                    // ожидание дозагрузки страницы до появления ссылки открытия списка сортировки
                                    const sortButton = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div > div.BucAGq > div.HnQBoO > div > a");
                                    if (sortButton) {
                                        sortButton?.addEventListener('click', (event) => {
                                            const interval3 = setInterval(() => {
                                                // ожидание дозагрузки страницы до раскрытия списка сортировки ипоявления пункта сортировки по возрастанию рейтинга
                                                const sortButtonSortingPoint = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div > div.BucAGq > div.HnQBoO > div > div > div > div.os-padding > div > div > div:nth-child(4)");
                                                if (sortButtonSortingPoint) {
                                                    clearInterval(interval3);
                                                    sortButtonSortingPoint.click();
                                                }
                                            }, 50);
                                        });
                                        clearInterval(interval2);
                                        sortButton.click();
                                    }
                                }, 50);
                                clearInterval(interval_appWrappers);
                            }
                        }, 50);
                        // aReviews.click();
                    });
                    aReviews.click();

                }
                clearInterval(interval);
            }
        }, 50);
    }

    // Sima-lend: Ожидание загружки страницы каталога привязка к рейтингам ссылок на страницы товара
    function SimaLendCatalogReviews() {
        // выбор всех Рейтинги на странице каталога: div с классом 'YREwlL'

        const interval = setInterval(() => {
            // ожидание загрузки страницы до появления ссылки на отзывы
            const aReviews = document.querySelector("#category-page__root > div > div.SvXTv3.pPpF_h.Go7gld.MoKdBA.ckfJXr.elXZ47 > div.WBjroC > div.YF_0Ly > div.R4UxqH > div")
            if (aReviews) {
                // var divs = document.querySelectorAll('.YREwlL');
                var divs = document.querySelectorAll('.ulVbvy');
                // цикл по каждому div
                divs.forEach((div) => {
                    // если ссылка ранее не была добавлена: повторное добавление после загрузки всей страницы. По каким-то причинам в конце загрузки страницы ссылки удаляются, но их добавление во время загузки необходимо чтобы пльзователь имел возможность нажимать
                    if (!div.querySelector('a')) {
                        // получение ссылки из parentnode.parentnode
                        var link = div.parentNode.parentNode.parentNode.querySelector('.o7U8An a')
                        if(link) {
                            var href = link.getAttribute('href');

                            // Сохранение текущего содержимого div
                            var oldHTML = div.innerHTML;

                            // Оборачивание существующего содержимого div в собственную ссылку
                            // и присвоение стиля 'cursor: pointer'

                            // привязка полученного href к текущему div + добавление к ссылке метки в виде трёх символов якоря, которые не удаляется из строки
                            // div.innerHTML += `<a href="${href}###" style="display: block; width: 100%; height: 100%; cursor: pointer;">${oldHTML}></a>`;
                            div.innerHTML = `<a href="${href}###" style="display: flex; width: 100%; height: 100%; cursor: pointer;">${oldHTML}</a>`;

                        }
                    }
                });
                clearInterval(interval);
            }
        }, 50);
    }


    // Ozon: Функция для добавления к ссылкам параметра сортировки рейтинга по возрастанию - на случай если пользователь будет вручную открывать ссылки с карточкой товара в новой вкладке
    function addOzonSortParamToLinks() {
        const links = document.querySelectorAll('a[href^="/product/"]:not([href*="&sort=score_asc"])');
        links.forEach(link => {
            link.href += '&sort=score_asc';
        });
    }


    // Проверка, является ли страница карточкой товара, содержащей отзывы, и если да - сортировка отзывов по возрастанию рейтинга. В случае Simalend важна последовательность
    // Ozon: начинается ли адрес страницы со 'https://www.ozon.ru/product/' и не содержит ли он уже '&sort=score_asc' и прочие варианты сортировки
    if (currentURL.includes('ozon.ru/product/') && !currentURL.includes('&sort=score_asc') && !currentURL.includes('?sort=score_asc') && !currentURL.includes('&sort=score_desc') && !currentURL.includes('?sort=score_desc')) {
        // Если условия выполняются - добавляем к адресу параметр и перезагружаем страницу с новым адресом, производящим сортировку рейтингов по возрастанию
        if (config.SettingsOnOff) {
			let NewURL
			if (!currentURL.includes('reviews?sort=score_asc') && !currentURL.includes('reviews?sort=score_desc')) {
				if (currentURL.includes('/reviews')) {
					NewURL = currentURL.replace('/reviews', 'reviews?sort=score_asc');
				} else {
					NewURL = `${currentURL}&sort=score_asc`;				
				}
			}
			chrome.runtime.sendMessage({action: "redirect", url: NewURL});
		}
    // Ozon: Страница каталога товаров
    } else if (currentURL.includes('ozon.ru/category/') ) {
        // Если условия выполняются - добавляем к адресу параметр и перезагружаем страницу с новым адресом, производящим сортировку рейтингов по возрастанию
        if (config.SettingsOnOff) 
			addOzonSortParamToLinks()
        // Wildberries:
    } else if (currentURL.includes('wildberries.ru/catalog/') && currentURL.includes('/feedbacks?imtId=')) {
        sortWildberriesReviews();
        // Sima-land: страница карточки товара
    } else if (currentURL.match(/^https:\/\/www\.sima-land\.ru\/\d+\/.+\/$/)) {
        // } else if (/^https:\/\/www\.sima-land\.ru\/\d{7}\/.*\/$/.test(currentURL)) {
        sortSimaLendReviews();
        // Sima-land: страница карточки товара, вызванная из каталога при нажатии ссылки рейтинга
    } else if (currentURL.match(/^https:\/\/www\.sima-land\.ru\/\d+\/.+\/###$/)) {
        // } else if (/^https:\/\/www\.sima-land\.ru\/\d{7}\/.*\/###$/.test(currentURL)) {
        // SimaLendCatalogReviews();
        // приходится ждать загруки страницы так, иначе не подвязываются необходиме функции обработки клика по ссылке рейтинга
        window.addEventListener('load', SimaLendCatalogReviewsOpen)
        // SimaLendCatalogReviewsOpen()
        // Страница каталога товаров
    } else if (currentURL.match(/^https:\/\/www\.sima-land\.ru\/.+\/(.*)$/)) {
        // } else if (/^https:\/\/www\.sima-land\.ru\/.+\/$/.test(currentURL)) {
        SimaLendCatalogReviews()
        window.addEventListener('load', SimaLendCatalogReviews) // в дальнейшем можно разремить при условии проверки на добавленые в div ссылки
    }


    // Wildberries: определение совершения перехода на карточку товара с разделом отзывов
    // перехват событияй истории (кнопок назад-вперёд)
    window.onpopstate = () => {
        // получаем текущий адрес страницы
        if (new URL(window.location.href).pathname.startsWith('/catalog/') && window.location.href.includes('feedbacks?imtId=')) {
            sortWildberriesReviews();
        }
    };

    // перехват события обновления адреса страницы другим скриптом без перезагрузки страницы
    //     const originalHistoryMethods = {
    //         pushState: history.pushState,
    //         replaceState: history.replaceState
    //     };

    //     history.pushState = function(state, ...rest) {
    //         if (typeof history.onpushstate === "function") {
    //             history.onpushstate({state});
    //         }
    //         return originalHistoryMethods.pushState.apply(history, [state, ...rest]);
    //     };

    //     history.replaceState = function(state, ...rest) {
    //         if (typeof history.onreplacestate === "function") {
    //             history.onreplacestate({state});
    //         }
    //         return originalHistoryMethods.replaceState.apply(history, [state, ...rest]);
    //     };

    const originalPushState = history.pushState;
    history.pushState = function (state, ...args) {
        originalPushState.apply(this, [state, ...args]);
        // Вызываем функцию сортировки после пуша состояния
        sortWildberriesReviews();
    };

    // const originalReplaceState = history.replaceState;
    // history.replaceState = function (state, ...args) {
    //     originalReplaceState.apply(this, [state, ...args]);
    //     // Вызываем функцию сортировки после замены состояния
    //     sortWildberriesReviews();
    // };

    //     window.history.onpushstate = () => {
    //         // if (new URL(window.location.href).pathname.startsWith('/catalog/') && window.location.search.includes('feedbacks?imtId=')) {
    //         if (new URL(window.location.href).pathname.startsWith('/catalog/') ) {
    //             sortWildberriesReviews();
    //         }
    //     };

    //     history.pushState = new Proxy(history.pushState, {
    //         apply: function(target, thisArg, argArray) {
    //             target.apply(thisArg, argArray);
    //             sortWildberriesReviews();
    //         }
    //     });

    history.replaceState = new Proxy(history.replaceState, {
        apply: function(target, thisArg, argArray) {
            target.apply(thisArg, argArray);
            sortWildberriesReviews();
        }
    });



    // Ozon: Замена ссылок на странице на случай если пользователь захочет открыть ссылку карточки товара в новой вкладке. Отработает позднее, после загрузки. Не обязательное действие.
    // Вызываем функцию сразу после загрузки страницы
    if (currentURL.startsWith('https://www.ozon.ru/')) {
        window.addEventListener('load', addOzonSortParamToLinks)
    }


})();
