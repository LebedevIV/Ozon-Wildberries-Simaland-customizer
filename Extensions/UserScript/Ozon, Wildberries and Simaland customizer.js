// ==UserScript==
// @name         Ozon, Wildberries and Simaland customizer: bad reviews first + interface enhancements
// @name:ru      Ozon, Wildberries и Simaland настройка: сначала плохие отзывы + улучшения интерфейса
// @namespace    http://tampermonkey.net/
// @version      2024-05-28_14-49
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
// @downloadURL https://update.greasyfork.org/scripts/495412/Ozon%2C%20Wildberries%20and%20Simaland%20customizer%3A%20bad%20reviews%20first.user.js
// @updateURL https://update.greasyfork.org/scripts/495412/Ozon%2C%20Wildberries%20and%20Simaland%20customizer%3A%20bad%20reviews%20first.meta.js
// ==/UserScript==


(() => {
    'use strict'

    // получаем текущий адрес страницы
    const currentURL = window.location.href
	const config = {
	  // advanced: false,
	  SettingsOnOff: true,
	};

    // Ozon: Функция для добавления к ссылкам на страницах каталогов параметра сортировки рейтинга по возрастанию - на случай если пользователь будет вручную открывать ссылки с карточкой товара в новой вкладке
	// Так же добавление ссылок для блоков рейтингов (звёздочек)
    function addOzonSortParamToLinks() {
		if (config.SettingsOnOff) {
			const links = document.querySelectorAll('a[href^="/product/"]:not([href*="&sort=score_asc"])');
			links.forEach(link => {
				const linkOrig = link.href
				link.href += '&sort=score_asc';
				// Проверяем, является ли родительский элемент (parentNode) div с классом 'iy6'
				const link_parentNode = link.parentNode
				// Привязка к блоку рейтингов (звёздочек) ссылки на рейтинги
				// if(link_parentNode.tagName.toLowerCase() === 'div' && link_parentNode.classList.contains('iy6')) {
				if(link_parentNode.tagName.toLowerCase() === 'div') {

					// Определение наличия вложенного элемента, содержащего рейтинги
					var divStars = link_parentNode.querySelector('div.tsBodyMBold');
					if (divStars) {
						// Сохранение текущего содержимого div
						// let oldHTML = divStars.innerHTML;
						// // Оборачивание существующего содержимого div в собственную ссылку
						// // и присвоение стиля 'cursor: pointer'
						// // привязка полученного href к текущему div + добавление к ссылке метки в виде трёх символов якоря, которые не удаляется из строки
						let url1Base = linkOrig.match(/(^[^\?]+)/g)[0];
						// divStars.innerHTML = `<a href="${url1Base}reviews?sort=score_asc" style="display: flex; width: 100%; height: 100%; cursor: pointer;">${oldHTML}</a>`;

						// Создание нового узла <a>
						let aNode = document.createElement('a');

						// Установка параметров узла
						aNode.href = `${url1Base}reviews?sort=score_asc`;
						aNode.style.cssText = 'display: flex; width: 100%; height: 100%; cursor: pointer; text-decoration: none;';

						// Получаем родительский элемент div
						let parentNode = divStars.parentNode;

						// Вставляем новый узел перед div1
						parentNode.insertBefore(aNode, divStars);

						// Перемещаем узел div внутрь aNode
						aNode.appendChild(divStars);
						divStars.style.cursor = 'pointer';

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
            // ожидание загрузки страницы до появления ссылки на отзывы: соответствено для десктопной или мобильной версии
            const aReviews = document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(1) > div > div > div.hb20Nd > div.bcg7Pf > div > div > div.RB0Z2S.vZiVTa > a") || document.querySelector("#product__root > div > div.k41rqL > div:nth-child(9) > button");
            if (aReviews) {
                // если ссылка активна (когда отзывы есть в случае десктопной версии) или счётчик отзывов > 0 (в случае мобильной версии)
                if ((aReviews.tagName === 'A' && aReviews.getAttribute('tabindex') === "0" && !aReviews.classList.contains('HuzmFE'))
						|| (aReviews.tagName === 'BUTTON' && Number(aReviews.querySelector('.WKsLn3 >span.HrbHuT')?.innerText) > 0)
				) {
                    // aReviews.addEventListener('load', addOzonSortParamToLinks)
                    aReviews?.addEventListener('click', (event) => {
                        // event.preventDefault(); // Предотвратить переход по ссылке
                        const interval2 = setInterval(() => {
                            // ожидание дозагрузки страницы до появления ссылки открытия списка сортировки
                            const sortButton = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div > div.BucAGq > div.HnQBoO > div > a") || document.querySelector("button.vuz3sk");
                            if (sortButton) {
                                sortButton?.addEventListener('click', (event) => {
                                    const interval3 = setInterval(() => {
                                        // ожидание дозагрузки страницы до раскрытия списка сортировки ипоявления пункта сортировки по возрастанию рейтинга
                                        const sortButtonSortingPoint = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div > div.BucAGq > div.HnQBoO > div > div > div > div.os-padding > div > div > div:nth-child(4)") || document.querySelector("#product__root > div.lPxD1I > div > div > div.os-host.os-host-foreign.os-theme-dark.os-host-resize-disabled.os-host-scrollbar-horizontal-hidden.VV8J6y.XTXFkP.os-host-flexbox.os-host-scrollbar-vertical-hidden.os-host-transition > div.os-padding > div > div > div > div > button:nth-child(4)");
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

    // Sima-lend: Ожидание загрузки страницы товара до появления элемента рейтинга и искусственное нажатие этого элемента
    function SimaLendCatalogReviewsOpen() {
        const interval = setInterval(() => {
            // ожидание загрузки страницы до появления ссылки на отзывы
            const aReviews = document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(1) > div > div > div.hb20Nd > div.bcg7Pf > div > div > div.RB0Z2S.vZiVTa > a")
            if (aReviews) {
                // если ссылка активна (когда отзывы есть в случае десктопной версии) или счётчик отзывов > 0 (в случае мобильной версии)
                if ((aReviews.tagName === 'A' && aReviews.getAttribute('tabindex') === "0" && !aReviews.classList.contains('HuzmFE'))
						|| (aReviews.tagName === 'BUTTON' && Number(aReviews.querySelector('.WKsLn3 >span.HrbHuT')?.innerText) > 0)
				) {
                    aReviews?.addEventListener('click', (event) => {

                        const interval_appWrappers = setInterval(() => {
                            let appWrappers = document.querySelectorAll('[data-testid="app-wrapper"]');
                            if (appWrappers) {
                                const interval2 = setInterval(() => {
                                    // ожидание дозагрузки страницы до появления ссылки открытия списка сортировки
                                    const sortButton = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div > div.BucAGq > div.HnQBoO > div > a") || document.querySelector("button.vuz3sk");
                                    if (sortButton) {
                                        sortButton?.addEventListener('click', (event) => {
                                            const interval3 = setInterval(() => {
                                                // ожидание дозагрузки страницы до раскрытия списка сортировки ипоявления пункта сортировки по возрастанию рейтинга
                                                const sortButtonSortingPoint = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div > div.BucAGq > div.HnQBoO > div > div > div > div.os-padding > div > div > div:nth-child(4)") || document.querySelector("#product__root > div.lPxD1I > div > div > div.os-host.os-host-foreign.os-theme-dark.os-host-resize-disabled.os-host-scrollbar-horizontal-hidden.VV8J6y.XTXFkP.os-host-flexbox.os-host-scrollbar-vertical-hidden.os-host-transition > div.os-padding > div > div > div > div > button:nth-child(4)");
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
            const aReviews = document.querySelector("#category-page__root > div > div.SvXTv3.pPpF_h.Go7gld.MoKdBA.ckfJXr.elXZ47 > div.WBjroC > div.YF_0Ly > div.R4UxqH > div") || document.querySelector("div.Jweg1q")

            if (aReviews) {
                // var divs = document.querySelectorAll('.YREwlL');
                var divs = document.querySelectorAll('.ulVbvy');
				if (divs.length === 0) {
					divs = document.querySelectorAll('div.Ca1QyR')
				}
                // цикл по каждому div
                divs.forEach((div) => {
                    // если ссылка ранее не была добавлена: повторное добавление после загрузки всей страницы. По каким-то причинам в конце загрузки страницы ссылки удаляются, но их добавление во время загузки необходимо чтобы пльзователь имел возможность нажимать
                    if (!div.querySelector('a')) {
			    let link
                        // получение ссылки из parentnode.parentnode
						// десктопная версия
						if (div.classList.contains('ulVbvy')) {
							link = div.parentNode.parentNode.parentNode.querySelector('.o7U8An a')
						}
						// мобильная версия
						else if (div.classList.contains('Ca1QyR')) {
							link = div.parentNode.parentNode.parentNode
						}
                        if(link?.tagName === "A") {
                            var href = link.getAttribute('href');

							// Создание нового узла <a>
							let aNode = document.createElement('a');

							// Установка параметров узла
							aNode.href = `${href}###`;
							aNode.style.cssText = 'display: flex; width: 100%; height: 100%; cursor: pointer; text-decoration: none;';

							// Перемещаем все дочерние узлы из div1 в новый узел <a>
							while (div.firstChild) {
								aNode.appendChild(div.firstChild);
							}
							// Перемещаем узел div внутрь aNode
							div.appendChild(aNode);
                        }
                    }
                });
                clearInterval(interval);
            }
        }, 50);
    }




    // Проверка, является ли страница карточкой товара, содержащей отзывы, и если да - сортировка отзывов по возрастанию рейтинга. В случае Simalend важна последовательность
    // Ozon: начинается ли адрес страницы со 'https://www.ozon.ru/product/' и не содержит ли он уже '&sort=score_asc' и прочие варианты сортировки
    if (currentURL.includes('ozon.ru/product/') && !currentURL.includes('&sort=score_asc') && !currentURL.includes('?sort=score_asc') && !currentURL.includes('&sort=score_desc') && !currentURL.includes('?sort=score_desc')) {
        // Если условия выполняются - добавляем к адресу параметр и перезагружаем страницу с новым адресом, производящим сортировку рейтингов по возрастанию
        if (config.SettingsOnOff) {
			let NewURL
			if (!currentURL.includes('/reviews?sort=score_asc') && !currentURL.includes('/reviews?sort=score_desc')) {
				if (currentURL.includes('/reviews')) {
					NewURL = currentURL.replace('/reviews', '/reviews?sort=score_asc');
				} else {
					NewURL = `${currentURL}&sort=score_asc`;
				}
                window.location.href = NewURL; // перезагрузка страницы приводит к оходу данного условия и переходу к следующим условиям
			}
		}
    // Ozon: Страница карточки товара
    } else if (currentURL.includes('ozon.ru/product/')) {
        // Если условия выполняются - добавляем к адресу параметр и перезагружаем страницу с новым адресом, производящим сортировку рейтингов по возрастанию
        if (config.SettingsOnOff) {
            // сокрытие и перестановка мешающих блоков
            // первый блок фото из отзывов - скрываем, так как он дублирует этот же блок в отзывах
			const intervalReviewsFoto = setInterval(() => {
                const ReviewsFoto = document.querySelector("#layoutPage > div.b2 > div:nth-child(7) > div > div.container.b6 > div:nth-child(1)") // фотки из отзывов - скрыть
                if (ReviewsFoto) {
                    ReviewsFoto.style.display = 'none'
                    clearInterval(intervalReviewsFoto);
                }
            }, 50);
            // Блок с: Информация о продавце; Другие предложения от продавцов на Ozon.ru
			const intervalSellers = setInterval(() => {
                const Sellers = document.querySelector("#layoutPage > div.b2 > div:nth-child(7) > div > div.container.b6 > div.d8") // инфа по продавцам
                if (Sellers) {
                    // Другие предложения от продавцов на Ozon.ru - скрываем так как он дублирует аналогичный блок внизу страницы
                    const SellersOtherOffers = Sellers.querySelector("div > div.j6y")
                    if (SellersOtherOffers) {
                        SellersOtherOffers.style.display = 'none'
                        clearInterval(intervalSellers);
                    }
                }
            }, 50);
            // Блок с: Похожие товары; Покупают вместе
			const interval_AlsoRecommend_BuyTogether = setInterval(() => {
                const AlsoRecommend_BuyTogether = document.querySelector("#layoutPage > div.b2 > div:nth-child(7) > div > div.container.b6 > div.ml6.l2n.m9l.nl0 > div:nth-child(1)")
                if (AlsoRecommend_BuyTogether) {
                    // пока отключаю, потом буду сворачивать
                    // AlsoRecommend_BuyTogether.style.display = 'none'
                    clearInterval(interval_AlsoRecommend_BuyTogether);
                    // Создать элемент <details> и установить его в свернутом состоянии по умолчанию
                    const details = document.createElement('details');

                    // Создать элемент <summary> с текстом
                    const summary = document.createElement('summary');
                    summary.classList.add('k1y');
                    summary.textContent = '⏵ Похожие товары + Покупают вместе';
                    summary.style.cursor = 'pointer';

                    // Добавить элемент <summary> в <details>
                    details.appendChild(summary);

                    // Добавить созданный элемент <details> перед элементом AlsoRecommend_BuyTogether
                    AlsoRecommend_BuyTogether.insertAdjacentElement('beforebegin', details);

                    // Переместить существующий элемент AlsoRecommend_BuyTogether внутрь <details>
                    details.appendChild(AlsoRecommend_BuyTogether);

                    const interval_tagList = setInterval(() => {
                        const tagList = document.querySelector('#layoutPage > div.b2 > div:nth-child(7) > div > div.container.b6 > div.ml6.l2n.m9l.nl0 > div:nth-child(2) > div > div > div[data-widget="tagList"]')
                        if (tagList) {
                            clearInterval(interval_tagList);
                            tagList.insertAdjacentElement('afterend', details);
                        }
                    }, 50);
                }
            }, 50);
            // Блок с рекламой
            function OzonpPoductRemoveElements() {
                document.querySelectorAll('div.j5n[data-widget="skuGrid"]').forEach(function(element) {
                    element.remove();
                });
            }
            // Удаление при загрузке содержимого
            OzonpPoductRemoveElements();

            window.addEventListener('load', ()=>{
                // Удаление при прокрутке страницы
                window.addEventListener('scroll', OzonpPoductRemoveElements);

                // Наблюдатель за изменениями в DOM
                const observer = new MutationObserver(OzonpPoductRemoveElements);

                // Настройки наблюдателя
                const config = { childList: true, subtree: true };

                // Наблюдение за изменениями в body
                observer.observe(document.body, config);
            });
		}
    // Ozon: Страница каталога товаров
    } else if (currentURL.includes('ozon.ru/category/') ) {
        // Если условия выполняются - добавляем к адресу параметр и перезагружаем страницу с новым адресом, производящим сортировку рейтингов по возрастанию
        if (config.SettingsOnOff) {
			addOzonSortParamToLinks()
        }


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
