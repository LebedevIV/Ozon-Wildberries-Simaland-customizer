// ==UserScript==
// @name         Ozon, Wildberries and Simaland customizer: bad reviews first + interface improvements
// @name:ru      Ozon, Wildberries и Simaland настройка: сначала плохие отзывы + улучшения интерфейса
// @namespace    http://tampermonkey.net/
// @version      2024-11-12_4-31
// @description  Ozon, Wildberries and Simaland: sorting reviews by product by ascending rating
// @description:ru  Ozon, Wildberries и Simaland: сортировка отзывов по товару по возрастанию рейтинга
// @author       Igor Lebedev
// @license        GPL-3.0-or-later
// @icon         https://raw.githubusercontent.com/LebedevIV/Ozon-Wildberries-Simaland-customizer/main/icons/logo_color.svg
// @match          http://*.ozon.ru/*
// @match          https://*.ozon.ru/*
// @match          http://*.ozon.com/*
// @match          https://*.ozon.com/*
// @match          http://*.wildberries.ru/*
// @match          https://*.wildberries.ru/*
// @match          http://*.sima-land.ru/*
// @match          https://*.sima-land.ru/*
// @downloadURL https://update.greasyfork.org/scripts/495412/Ozon%2C%20Wildberries%20and%20Simaland%20customizer%3A%20bad%20reviews%20first%20%2B%20interface%20improvements.user.js
// @updateURL https://update.greasyfork.org/scripts/495412/Ozon%2C%20Wildberries%20and%20Simaland%20customizer%3A%20bad%20reviews%20first%20%2B%20interface%20improvements.meta.js
// ==/UserScript==

/* global GM_config */

(() => {
    'use strict'

    // получаем текущий адрес страницы
    const currentURL = window.location.href
    const config = {
        // advanced: false,
        SettingsOnOff: true,
        isRunningAsExtension: false,
    };
    let api

    // определение среды выполнения скрипта: как пользовательский или в составе расширения
    function isRunningAsExtension() {
        const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.id !== 'undefined';
        const isBrowserExtension = typeof browser !== 'undefined' && browser.runtime && typeof browser.runtime.id !== 'undefined';

        const currentScript = document.currentScript;
        const isInlineScript = currentScript && currentScript.src && currentScript.src.startsWith('chrome-extension://');

        return isChromeExtension || isBrowserExtension || isInlineScript;
    }

    if (isRunningAsExtension()) {
        // console.log('Script is running as a browser extension.');
        config.isRunningAsExtension = true
    } else {
        // console.log('Script is running independently.');
        config.isRunningAsExtension = false
    }

    // опредлеение типа браузера
    function getBrowser() {
        if (typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined") {
            return chrome
        } else if (
            typeof browser !== "undefined" &&
            typeof browser.runtime !== "undefined"
        ) {
            return browser
        }
        else {
            console.log("browser is not supported");
            return false
        }
    }

    if (config.isRunningAsExtension === true) api = getBrowser()


    // Ozon: Функция для добавления к ссылкам на страницах каталогов параметра сортировки рейтинга по возрастанию - на случай если пользователь будет вручную открывать ссылки с карточкой товара в новой вкладке
    // Так же добавление ссылок на отзывы для блоков рейтингов (звёздочек)
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
                    const divStars = link_parentNode.querySelector('div.tsBodyMBold') || link_parentNode.querySelector('div.tsCaptionBold')
                    // + проверка что ссылка уже не была назначена ранее - почему-то происходит двойное срабатывание скрипта
                    if (divStars && divStars.parentNode.nodeName !== 'A') {
                        let url1Base = linkOrig.match(/(^[^\?]+)/g)[0];

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

    // Wildberries: Ожидание загрузки страницы товара до появления элемента сортировки рейтинга и искусственное двойное нажатие этого элемента чтобы добиться сортировки рейтинга по возрастанию
    function sortWildberriesReviews() {
        const interval = setInterval(() => {
            // ожидание загрузки страницы до необходимого значения
            const preloader = document.querySelector('#app > div[data-link="visible{:router.showPreview}"]')
            if (preloader?.style.display === 'none') {
                const sortButton = document.querySelector("#app > div:nth-child(5) > div > section > div.product-feedbacks__main > div.user-activity__tab-content > div.product-feedbacks__sorting > ul > li:nth-child(2) > a");
                if (sortButton) {
                    clearInterval(interval);

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
                }
            }
        }, 50);
    }

    // Wildberries: Показать блок "Характеристики и описание" и разместить под фото товара()
    function Показать_блок__Характеристики_и_описание__и_разместить_под_фото_товара() {
        let popup_product_details = document.querySelector('div.popup-product-details')

        // Перенос Характеристик и описания из вызываемого всплывающего блока под блок товара
        function popup_product_details_Replace() {
            const popup__content = popup_product_details.querySelector('div.popup__content')
            const product_page__grid = document.querySelector('div.product-page__grid')
            if (popup__content && product_page__grid) {
                product_page__grid.insertAdjacentElement('afterend', popup__content)
            }
            popup_product_details.remove()
        }

        if (popup_product_details) {
            popup_product_details_Replace()
        }
        else {
            const interval = setInterval(() => {
                // ожидание загрузки страницы до необходимого значения
                const preloader = document.querySelector('#app button.product-page__btn-detail')
                if (preloader) {
                    clearInterval(interval)
                    preloader.click()
                    const interval_popup_product_details = setInterval(() => {
                        popup_product_details = document.querySelector('div.popup-product-details')
                        if (popup_product_details) {
                            clearInterval(interval_popup_product_details)
                            popup_product_details_Replace()
                        }
                    }, 50);
                }
            }, 50);
        }
    }

    // Wildberries: каталог: добавление ссылок для блоков рейтингов (звёздочек)
    function addWildberriesSortParamToLinks() {
        if (config.SettingsOnOff) {

            // Функция для выполнения действий с новыми элементами
            function handleNewElement(element) {

                const interval_main_page__content = setInterval(() => {
                    // проверка загрузки блока с визитками товаров
                    const main_page__content = document.querySelector('div.main-page__content');
                    if (main_page__content) {
                        clearInterval(interval_main_page__content)
                        const rating_wraps = document.querySelectorAll('p.product-card__rating-wrap');
                        rating_wraps.forEach(rating_wrap => {
                            // ссылка на карточку товара
                            const outerLink = rating_wrap.parentNode.parentNode.querySelector('a')
                            // получение ссылки на отзывы
                            const linkReviews = outerLink.href.replace('/detail.aspx', '/feedbacks')


                            const rating_wrap_parentNode = rating_wrap.parentNode
                            // Привязка к блоку рейтингов (звёздочек) ссылки на рейтинги
                            if(rating_wrap_parentNode.tagName.toLowerCase() === 'div') {


                                // Создание нового узла <a>
                                let aNode = document.createElement('a');

                                // Установка параметров узла
                                aNode.href = linkReviews
                                aNode.style.cssText = 'display: flex; width: 100%; height: 100%; cursor: pointer; text-decoration: none; z-index: 4;'; // z-index: 4 - должен быть больше чем z-index у внешней ссылки для всей визитки (z-index: 3)

                                // Вставляем новый узел aNode перед rating_wrap
                                rating_wrap_parentNode.insertBefore(aNode, rating_wrap);

                                // Перемещаем узел rating_wrap внутрь aNode
                                aNode.appendChild(rating_wrap);

                                rating_wrap.style.cursor = 'pointer';

                            }
                        });
                    }
                });
            }

            // Настройка MutationObserver
            const observer = new MutationObserver((mutationsList) => {
                outerLoop: for (let mutation of mutationsList) {
                    // изменения всего блока визиток товаров
                    if (mutation.type === 'childList' && mutation.target.className === 'main-page__content-wrapper') {
                        // муткация где происходит вставка сразу всех нод - можно сразу выходит из цикла
                        for (let node of mutation.addedNodes) {
                            // if (node.nodeType === Node.ELEMENT_NODE && node.matches('p.product-card__rating-wrap')) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                handleNewElement(node);
                                break outerLoop;
                            }
                        }
                    }
                }
            });

            // Указываем, за какими изменениями наблюдать
            observer.observe(document.body, {
                childList: true,       // Наблюдаем за добавлением/удалением детей
                subtree: true         // Также отслеживаем все поддеревья
            });

        }
    }



    // Simaland: Ожидание фрейма с отзывами и его обработка
    function clickLinkReviews() {
        const interval2 = setInterval(() => {
            // отключаем динамический выезд (пока не получается)
            // const frameWithReviews = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div.dfZ2S8")
            // if (frameWithReviews) {
            // frameWithReviews.style.transition = 'transform 0s';
            // }
            // ожидание дозагрузки страницы до появления ссылки открытия списка сортировки
            // const divGpksVe = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div.GpksVe")
            // if (divGpksVe)
            // divGpksVe.style.setProperty("--transition-duration", "0ms");
            const sortButton =
                  document.querySelector('a[role="button"][data-testid="sort"]') ||
                  document.querySelector("button.vuz3sk");
            if (sortButton) {
                clearInterval(interval2);

                if (config.SettingsOnOff) {
                    // проверка что список уже не раскрыт (Сайт Сималенд этот список может раскрывать заранее)
                    const sortButtonSortingPoint =
                          document.querySelector('div[data-overlayscrollbars-viewport="scrollbarHidden overflowXHidden overflowYHidden"] > div:nth-child(4)')
                    document.querySelector('div[data-overlayscrollbars-viewport="scrollbarHidden overflowXHidden overflowYHidden"] > div > div > button:nth-child(4)');
                    if (sortButtonSortingPoint) {
                        sortButtonSortingPoint.click();
                    } else {
                        const programmaticClickEvent = new CustomEvent('customClick', { detail: { isProgrammatic: true } });
                        sortButton?.addEventListener('customClick', (event) => {
                            if (event.detail && event.detail.isProgrammatic) {
                                sortButton.click();
                                const interval3 = setInterval(() => {
                                    // ожидание дозагрузки страницы до раскрытия списка сортировки ипоявления пункта сортировки по возрастанию рейтинга
                                    const sortButtonSortingPoint =
                                          document.querySelector('div[data-overlayscrollbars-viewport="scrollbarHidden overflowXHidden overflowYHidden"] > div:nth-child(4)') ||
                                          document.querySelector('div[data-overlayscrollbars-viewport="scrollbarHidden overflowXHidden overflowYHidden"] > div > div > button:nth-child(4)');
                                    if (sortButtonSortingPoint) {
                                        clearInterval(interval3);
                                        if (config.SettingsOnOff) {
                                            sortButtonSortingPoint.click();
                                        }
                                    }
                                }, 50);
                            } else {
                                // console.log('Button was clicked manually.');
                            }

                        });
                        sortButton.dispatchEvent(programmaticClickEvent);
                    }
                }
            }
        }, 50);
    }

    // Simaland: Ожидание загрузки страницы товара до появления элемента сортировки рейтинга и искусственное нажатие этого элемента чтобы добиться сортировки рейтинга по возрастанию
    function sortSimaLandReviews() {
        const interval = setInterval(() => {
            // ожидание загрузки страницы до появления ссылки на отзывы: соответствено для десктопной или мобильной версии
            const aReviews =
                  document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(1) > div > div > div.hb20Nd > div.bcg7Pf > div > div > div.RB0Z2S.vZiVTa > a") ||
                  document.querySelector("button[data-testid='reviews-button']");

            if (aReviews) {
                clearInterval(interval);
                // если ссылка активна (когда отзывы есть в случае десктопной версии) или счётчик отзывов > 0 (в случае мобильной версии)
                if ((aReviews.tagName === 'A' && aReviews.getAttribute('tabindex') === "0" && !aReviews.classList.contains('HuzmFE'))
                    || (aReviews.tagName === 'BUTTON' && Number(aReviews.querySelector('.WKsLn3 >span.HrbHuT')?.innerText) > 0)
                   ) {
                    aReviews?.addEventListener('click', (event) => {
                        clickLinkReviews()
                    });
                }
            }
        }, 50);
        // Ссылка на отзывы внизу страницы Все отзывы - появляется только при прокрутке вниз и более не исчезает
        const intervalAllReviewsBottom = setInterval(() => {
            // ожидание загрузки страницы до появления ссылки на отзывы: второй элемент из-за влияния подгружаемого блока (в дальнейшем найти более надёжную привязку)
            const AllReviewsBottom =
                  document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(2) > div > div:nth-child(5) > div > div.D5cu9p > div.M0Dw8o > a") ||
                  document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(2) > div > div:nth-child(6) > div > div.D5cu9p > div.M0Dw8o > a")
            if (AllReviewsBottom) {
                clearInterval(intervalAllReviewsBottom);
                // если ссылка активна (когда отзывы есть в случае десктопной версии) или счётчик отзывов > 0 (в случае мобильной версии)
                if (AllReviewsBottom.tagName === 'A' && AllReviewsBottom.getAttribute('tabindex') === "0" && AllReviewsBottom.role === 'button') {
                    AllReviewsBottom.addEventListener('click', (event) => {
                        clickLinkReviews()
                    });
                }
            }
        }, 50);

        SimaLandAllReviewsPanelTop()

    }

    // Ссылка на отзывы на панели вверху страницы - появляется только при прокрутке вниз и исчезает при прокрутке вверх
    function SimaLandAllReviewsPanelTop() {
        // Выбираем элемент, внутри которого будем отслеживать изменения
        const targetNode = document.body;

        // Опции для обсерватора (какие именно изменения нужно отслеживать)
        const configObserver = {
            childList: true,
            subtree: true
        };
        // Функция-коллбэк, которая будет вызвана при изменениях
        const callback = function(mutationsList, observer) {
            for (let mutation of mutationsList) {
                // Если произошло добавление узла
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.matches('div.M4Ud_g')) {
                            // console.log('Элемент <a role="button"> появился на странице:', node);
                            const AllReviewsPanelTop = document.querySelector("#product__root > div > div.M4Ud_g > div > div > div > div.xx8J2G > div > div.pQ3PLI > a:nth-child(2)")
                            if (AllReviewsPanelTop) {
                                // если ссылка активна (когда отзывы есть в случае десктопной версии) или счётчик отзывов > 0 (в случае мобильной версии)
                                if (AllReviewsPanelTop.tagName === 'A' && AllReviewsPanelTop.getAttribute('tabindex') === "0" && AllReviewsPanelTop.role === 'button') {
                                    AllReviewsPanelTop.addEventListener('click', (event) => {
                                        clickLinkReviews()
                                    });
                                }
                            }
                        }
                    });
                }
            }
        };

        // Создаем экземпляр обсерватора с указанием коллбэк-функции
        const observer = new MutationObserver(callback);

        // Начинаем наблюдение за целевым узлом с переданными опциями
        observer.observe(targetNode, configObserver);
    }

    // Simaland: страница карточки товара, вызванная из каталога при нажатии ссылки рейтинга
    // Simaland: Ожидание загрузки страницы товара до появления элемента рейтинга и искусственное нажатие этого элемента
    function SimaLandCatalogReviewsOpen() {
        function clickLinkReviews_appWrappers(){
            const interval_appWrappers = setInterval(() => {
                let appWrappers = document.querySelectorAll('[data-testid="app-wrapper"]');
                if (appWrappers) {
                    clearInterval(interval_appWrappers);
                    clickLinkReviews()
                }
            }, 50);
        }
        const interval = setInterval(() => {
            // отключение динамического выезда
            const frameWithReviews = document.querySelector("#product__root > div > div.Fa76rh > div.iOZqnu > div:nth-child(2) > div > div.dfZ2S8")
            if (frameWithReviews) {
                frameWithReviews.style.transition = 'transform 0s';
            }
            // ожидание загрузки страницы до появления ссылки на отзывы
            const aReviews =
                  document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(1) > div > div > div.hb20Nd > div.bcg7Pf > div > div > div.RB0Z2S.vZiVTa > a") ||
                  document.querySelector("#product__root > div > div.k41rqL > div:nth-child(10) > button")
            if (aReviews) {
                clearInterval(interval);
                // если ссылка активна (когда отзывы есть в случае десктопной версии) или счётчик отзывов > 0 (в случае мобильной версии)
                if ((aReviews.tagName === 'A' && aReviews.getAttribute('tabindex') === "0" && !aReviews.classList.contains('HuzmFE'))
                    || (aReviews.tagName === 'BUTTON' && Number(aReviews.querySelector('.WKsLn3 >span.HrbHuT')?.innerText) > 0)
                   ) {
                    aReviews.addEventListener('click', (event) => {
                        clickLinkReviews_appWrappers()
                    });
                    if (config.SettingsOnOff) {
                        aReviews.click();
                    }
                }
            }
        }, 50);
        // Ссылка на отзывы внизу страницы Все отзывы - появляется только при прокрутке вниз и более не исчезает
        const intervalAllReviewsBottom = setInterval(() => {
            // ожидание загрузки страницы до появления ссылки на отзывы
            const AllReviewsBottom = document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(2) > div > div:nth-child(5) > div > div.D5cu9p > div.M0Dw8o > a")
            if (AllReviewsBottom) {
                clearInterval(intervalAllReviewsBottom);
                // если ссылка активна (когда отзывы есть в случае десктопной версии) или счётчик отзывов > 0 (в случае мобильной версии)
                if (AllReviewsBottom.tagName === 'A' && AllReviewsBottom.getAttribute('tabindex') === "0" && AllReviewsBottom.role === 'button') {
                    AllReviewsBottom.addEventListener('click', (event) => {
                        clickLinkReviews_appWrappers()
                    });
                }
            }
        }, 50);
        SimaLandAllReviewsPanelTop()
        SimaLandOptimization()
    }

    // Sima-lend: Ожидание загружки страницы каталога привязка к рейтингам ссылок на страницы товара
    function SimaLandCatalogReviews() {
        // выбор всех Рейтинги на странице каталога: div с классом 'YREwlL'
        const interval = setInterval(() => {
            // ожидание загрузки страницы до появления ссылки на отзывы: десктопная и мобильная версии
            const aReviews =
                  // document.querySelector("#category-page__root > div > div.SvXTv3.pPpF_h.Go7gld.MoKdBA.ckfJXr.elXZ47 > div.WBjroC > div.YF_0Ly > div.R4UxqH > div") ||
                  document.querySelector("div.catalog") ||
                  // document.querySelector("div.Jweg1q")
                  document.querySelector('div[data-testid="items-list"]')

            if (aReviews) {
                clearInterval(interval);
                // var divs = document.querySelectorAll('.YREwlL');
                // десктопная версия
                // var divs = document.querySelectorAll('.ulVbvy')
                // var divs = document.querySelectorAll('div[data-testid="feedback-side-bar:count-comments"]')
                var divs = document.querySelectorAll('div[data-testid="rating-counter"]') // для десктопной и мобильной версий одновременно
                // или мобильная
                if (divs.length === 0) { // устарело, на всякий случай
                    divs = document.querySelectorAll('div.Ca1QyR')
                }
                // цикл по каждому div
                divs.forEach((div) => {
                    // если ссылка ранее не была добавлена: повторное добавление после загрузки всей страницы. По каким-то причинам в конце загрузки страницы ссылки удаляются, но их добавление во время загузки необходимо чтобы пльзователь имел возможность нажимать
                    if (!div.querySelector('a')) {
                        // div.parentNode.parentNode.parentNode.querySelector('div[data-testid="item-name"] a')
                        // десктопная и мобильная версии
                        const div_itemName = div.closest('div:has(div[data-testid="item-name"] a)') || div.closest('div[data-testid="catalog-item:row"] a')
                        if (!div_itemName) return
                        let link = div_itemName.querySelector('a')

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
            }
        }, 50);
    }

    // Simaland: Оптимизация вида
    function SimaLandOptimization() {
        // Сималенд: Карточка товара: Характеристики
        const interval_Characteristics_mini = setInterval(() => {
            const Characteristics_mini = document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(1) > div > div > div.hb20Nd > div.gnpN7o > div.yV_RnX > div:nth-child(1)")

            if (Characteristics_mini) {
                clearInterval(interval_Characteristics_mini);
                // Блок с: Все товары данной фирмы
                const interval_Prices = setInterval(() => {
                    const Prices = document.querySelector("#product__root > div > div.Fa76rh > div:nth-child(1) > div > div > div.hb20Nd > div.gnpN7o > div.nl50DW")
                    if (Prices) {
                        clearInterval(interval_Prices);
                        // Переместим узел SimilarProducts внутрь узла details в самый конец
                        Prices.append(Characteristics_mini);
                    }

                })
                }
        })

        // Блок с: Похожие товары; Также рекомендуем
        let details
        const interval_SimilarProducts_AlsoRecommend = setInterval(() => {
            const SimilarProducts = document.querySelector('#product__root > div > div.Fa76rh > div:nth-child(2) > div > div[data-testid="similar-recommendations-ref"]')
            const AlsoRecommend = document.querySelector('#product__root > div > div.Fa76rh > div:nth-child(2) > div > div[data-testid="related-recommendations-ref"]')
            const SimilarProducts_AlsoRecommend = SimilarProducts || AlsoRecommend

            if (SimilarProducts_AlsoRecommend && SimilarProducts_AlsoRecommend.children.length > 0) {

                // Если определён только один из двух блоков - details не был создан ранее
                if (!details) {
                    // Создать элемент <details> и установить его в свернутом состоянии по умолчанию
                    details = document.createElement('details');
                    details.style.marginTop = "2em";
                    // Создать элемент <summary> с текстом
                    const summary = document.createElement('summary');
                    summary.classList.add('N6SYKn');
                    summary.textContent = 'Похожие товары + Также рекомендуем';
                    summary.style.cursor = 'pointer';

                    // Добавить элемент <summary> в <details>
                    details.appendChild(summary);

                    // Добавить созданный элемент <details> перед любым из двух блоков, который вывелся первым
                    SimilarProducts_AlsoRecommend.insertAdjacentElement('beforebegin', details);
                    // Переместить SimilarProducts_AlsoRecommend внутрь <details>
                    details.appendChild(SimilarProducts_AlsoRecommend);
                    // определён и второй блок
                } else {
                    clearInterval(interval_SimilarProducts_AlsoRecommend);
                    // Переместим узел SimilarProducts внутрь узла details в самое начало
                    if (SimilarProducts_AlsoRecommend === SimilarProducts) {
                        details.prepend(SimilarProducts);
                    } else if (SimilarProducts_AlsoRecommend === AlsoRecommend) {
                        // Переместим узел SimilarProducts внутрь узла details в самый конец
                        details.append(AlsoRecommend);
                    }
                }
            }
        }, 50);
    }



    // Проверка, является ли страница карточкой товара, содержащей отзывы, и если да - сортировка отзывов по возрастанию рейтинга. В случае Simaland важна последовательность
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
                if (config.isRunningAsExtension) {
                    api.runtime.sendMessage({action: "redirect", url: NewURL}); // перезагрузка страницы приводит к оходу данного условия и переходу к следующим условиям
                } else {
                    window.location.href = NewURL; // перезагрузка страницы приводит к оходу данного условия и переходу к следующим условиям
                }
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
                    clearInterval(intervalReviewsFoto);
                    ReviewsFoto.style.display = 'none'
                }
            }, 50);
            // Блок с: Информация о продавце; Другие предложения от продавцов на Ozon.ru
            const intervalSellers = setInterval(() => {
                const Sellers = document.querySelector("#layoutPage > div.b2 > div:nth-child(7) > div > div.container.b6 > div.d8") // инфа по продавцам
                if (Sellers) {
                    // Другие предложения от продавцов на Ozon.ru - скрываем так как он дублирует аналогичный блок внизу страницы
                    const SellersOtherOffers = Sellers.querySelector("div > div.j6y")
                    if (SellersOtherOffers) {
                        // SellersOtherOffers.style.display = 'none'
                        clearInterval(intervalSellers);
                    }
                }
            }, 50);
            // Блок с: Похожие товары; Покупают вместе
            const interval_AlsoRecommend_BuyTogether = setInterval(() => {
                // const AlsoRecommend_BuyTogether = document.querySelector("#layoutPage > div.b2 > div:nth-child(7) > div > div.container.b6 > div.ml6.l2n.m9l.nl0 > div:nth-child(1)") || document.querySelector("#layoutPage > div.b2.b4 > div:nth-child(10) > div > div > div.pj6")
                // десктопная версия
                const AlsoRecommend_BuyTogether = document.querySelector('div[data-widget="skuShelfGoods"]') // всего два таких лемента, на достаточно выбрать первый
                let AlsoRecommend_BuyTogether_Full
                if (AlsoRecommend_BuyTogether) AlsoRecommend_BuyTogether_Full = AlsoRecommend_BuyTogether.parentNode.parentNode

                // мобильная версия
                const AlsoRecommend_BuyTogether_mobile_Divs = document.querySelectorAll('div[data-widget="skuScroll"]')

                if (AlsoRecommend_BuyTogether || AlsoRecommend_BuyTogether_mobile_Divs.length > 0) {
                    // пока отключаю, потом буду сворачивать
                    clearInterval(interval_AlsoRecommend_BuyTogether);

                    let UseDetails = true
                    const observer = new MutationObserver((mutationsList, observer) => {
                        for (const mutation of mutationsList) {
                            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                                console.log('Изменение содержимого div или атрибутов div обнаружено.');

                                // Дополнительная логика проверки:
                                if (UseDetails) {
                                    // if ((AlsoRecommend_BuyTogether && AlsoRecommend_BuyTogether.children.length === 1 && AlsoRecommend_BuyTogether.children[0].children.length === 1) ||
                                    //     (!AlsoRecommend_BuyTogether && AlsoRecommend_BuyTogether_mobile_Divs.length === 0)) {
                                    if (AlsoRecommend_BuyTogether || AlsoRecommend_BuyTogether_mobile_Divs.length > 0) {
                                        UseDetails = false
                                        // Если нужно остановить наблюдение в будущем:
                                        // Но срабатывает не мгновенно - приходится использовать флаг UseDetails
                                        observer.disconnect();
                                        // Создать элемент <details> и установить его в свернутом состоянии по умолчанию
                                        const details = document.createElement('details');

                                        // Создать элемент <summary> с текстом
                                        const summary = document.createElement('summary');
                                        summary.classList.add('tsHeadline500Medium');
                                        summary.textContent = 'Похожие товары + Покупают вместе';
                                        summary.style.cursor = 'pointer';


                                        // Добавить элемент <summary> в <details>
                                        details.appendChild(summary);
                                        // десктопная версия
                                        if (AlsoRecommend_BuyTogether) {
                                            // Добавить созданный элемент <details> перед элементом AlsoRecommend_BuyTogether
                                            AlsoRecommend_BuyTogether_Full.insertAdjacentElement('beforebegin', details);

                                            // Переместить существующий элемент AlsoRecommend_BuyTogether внутрь <details>

                                            details.appendChild(AlsoRecommend_BuyTogether_Full);
                                            // details перемещаем до блока комментариев
                                            const div_Description = document.querySelector("#comments")
                                            if (div_Description) div_Description.insertAdjacentElement('beforebegin', details);
                                        }
                                        // мобильная версия
                                        if (AlsoRecommend_BuyTogether_mobile_Divs.length > 0) {
                                            // Добавить созданный элемент <details> перед элементом AlsoRecommend_BuyTogether
                                            AlsoRecommend_BuyTogether_mobile_Divs[0].insertAdjacentElement('beforebegin', details);

                                            // Переместить элементы AlsoRecommend_BuyTogether_mobile_Divs внутрь <details>
                                            AlsoRecommend_BuyTogether_mobile_Divs.forEach(div => {
                                                details.appendChild(div);
                                            });

                                            const div_Description = document.querySelector('div[data-widget="webMobTabs"]')
                                            if (div_Description) div_Description.insertAdjacentElement('afterend', details);
                                        }

                                    }
                                }
                            }
                        }
                    });

                    // Указываем, за какими изменениями хотим наблюдать:
                    const config = { attributes: true, childList: true, subtree: true };

                    // Начинаем наблюдение:
                    if (AlsoRecommend_BuyTogether) {
                        observer.observe(AlsoRecommend_BuyTogether_Full, config);
                    } else if (AlsoRecommend_BuyTogether_mobile_Divs.length > 0) {
                        observer.observe(AlsoRecommend_BuyTogether_mobile_Divs[0], config)
                    }

                    // Если нужно остановить наблюдение в будущем:
                    // observer.disconnect();

                }

            }, 50);

            // Блок с рекламой
            function OzonpPoductRemoveElements() {
                // десктопная версия
                document.querySelectorAll('div[data-widget="skuGrid"]').forEach(function(element) {
                    element.remove();
                });
                // мобильная версия
                document.querySelectorAll('div.q3j_23[data-widget="skuScroll"]').forEach(function(element) {
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
        if (config.SettingsOnOff) {
            addOzonSortParamToLinks()
        }
        // Ozon: Страница главная
    } else if (currentURL==='https://www.ozon.ru/' ) {
        if (config.SettingsOnOff) {
            // Добавление кнопки "Реклама"
            const EspeciallyForYou = CreateEspeciallyForYou()
            // let EspeciallyForYou_factView = false // факт вывода раскрывающегося блока рекламы
            // вырезание верхнего баннера
            const targetNode = document.querySelector('div[data-widget="advBanner"]')
            // targetNode?.remove()
            function Add_targetNode_into_EspeciallyForYou(targetNode) {
                if (targetNode && targetNode.parentNode !== EspeciallyForYou) {
                    if (!targetNode.parentNode.contains(EspeciallyForYou)) {
                        targetNode.parentNode.insertBefore(EspeciallyForYou, targetNode)
                    }
                    targetNode.style.marginTop = '0.3rem'
                    EspeciallyForYou?.appendChild(targetNode)
                }
            }
            Add_targetNode_into_EspeciallyForYou(targetNode)
            // Настраиваем наблюдение за изменениями в документе
            const observer = new MutationObserver((mutationsList, observer) => {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'DIV') {
                                if (node.dataset.widget === "advBanner") {
                                    Add_targetNode_into_EspeciallyForYou(node)
                                }
                            }
                        });

                    }
                }
            });
            const observer_config = { attributes: true, childList: true, subtree: true };
            observer.observe(document.querySelector('div#__ozon'), observer_config);
        }

        // Wildberries: карточка товара
    } else if (currentURL.includes('wildberries.ru/catalog/') && currentURL.includes('/feedbacks')) {

        sortWildberriesReviews();
        Показать_блок__Характеристики_и_описание__и_разместить_под_фото_товара()
        // Wildberries: каталоги
    } else if (currentURL.includes('wildberries.ru/')) {
        if (config.SettingsOnOff) {

            window.addEventListener('load', addWildberriesSortParamToLinks)
        }
        // Simaland: страница карточки товара
    } else if (currentURL.match(/^https:\/\/www\.sima-land\.ru\/\d+\/.+\/$/)) {
        // } else if (/^https:\/\/www\.sima-land\.ru\/\d{7}\/.*\/$/.test(currentURL)) {
        sortSimaLandReviews();
        SimaLandOptimization()
        // Simaland: страница карточки товара, вызванная из каталога при нажатии ссылки рейтинга
    } else if (currentURL.match(/^https:\/\/www\.sima-land\.ru\/\d+\/.+\/###$/)) {
        // } else if (/^https:\/\/www\.sima-land\.ru\/\d{7}\/.*\/###$/.test(currentURL)) {
        // SimaLandCatalogReviews();
        // приходится ждать загруки страницы так, иначе не подвязываются необходиме функции обработки клика по ссылке рейтинга
        window.addEventListener('load', SimaLandCatalogReviewsOpen)
        // SimaLandCatalogReviewsOpen()
        // Страница каталога товаров
    } else if (currentURL.match(/^https:\/\/www\.sima-land\.ru\/.+\/(.*)$/)) {
        // } else if (/^https:\/\/www\.sima-land\.ru\/.+\/$/.test(currentURL)) {
        SimaLandCatalogReviews()
        window.addEventListener('load', SimaLandCatalogReviews) // в дальнейшем можно разремить при условии проверки на добавленые в div ссылки
    }


    // Wildberries: определение совершения перехода на карточку товара с разделом отзывов
    // перехват событияй истории (кнопок назад-вперёд)
    window.onpopstate = () => {
        // получаем текущий адрес страницы
        if (new URL(window.location.href).pathname.startsWith('/catalog/') && window.location.href.includes('/feedbacks')) {
            sortWildberriesReviews();
            Показать_блок__Характеристики_и_описание__и_разместить_под_фото_товара()
        }
    };

    const originalPushState = history.pushState;
    history.pushState = function (state, ...args) {
        originalPushState.apply(this, [state, ...args]);
        // Вызываем функцию сортировки после пуша состояния
        sortWildberriesReviews();
        Показать_блок__Характеристики_и_описание__и_разместить_под_фото_товара()
    };

    history.replaceState = new Proxy(history.replaceState, {
        apply: function(target, thisArg, argArray) {
            target.apply(thisArg, argArray);
            sortWildberriesReviews();
            Показать_блок__Характеристики_и_описание__и_разместить_под_фото_товара()
        }
    });

    if (config.isRunningAsExtension) {
        // событие изменения адреса данной вкладки
        api.runtime.onMessage.addListener((request, sender, sendResponse) => {
            // получаем текущий адрес страницы
            if (new URL(request.url).pathname.startsWith('/catalog/') && request.url.includes('/feedbacks')) {
                sortWildberriesReviews();
                Показать_блок__Характеристики_и_описание__и_разместить_под_фото_товара()
            }
        });
    }

    // Ozon: Замена ссылок на странице на случай если пользователь захочет открыть ссылку карточки товара в новой вкладке. Отработает позднее, после загрузки. Не обязательное действие.
    // Вызываем функцию сразу после загрузки страницы
    if (currentURL.startsWith('https://www.ozon.ru/')) {
        window.addEventListener('load', addOzonSortParamToLinks)
    }



    // For extentions
    function initConfig() {
        initializeSettingsOnOff();
    }

    // получение значения при загрузке popup
    function initializeSettingsOnOff() {
        api.storage.local.get(["SettingsOnOff"], (res) => {
            if ("SettingsOnOff" in res){
                handleSettingsOnOffChangeEvent(res.SettingsOnOff)
            }else{
                handleSettingsOnOffChangeEvent(true);
                api.storage.local.set({ SettingsOnOff: true })
            }
        });
    }

    //если в хранилище произошли изменения соответствующего параметра...
    function storageChangeHandler(changes, area) {
        if (area === 'local') {
            if (changes.SettingsOnOff !== undefined) {
                // if (changes.SettingsOnOff?.newValue) {
                handleSettingsOnOffChangeEvent(
                    changes.SettingsOnOff.newValue
                )
            }

        }
    }
    //... происходит установка значения конфига и контрола
    function handleSettingsOnOffChangeEvent(value) {
        config.SettingsOnOff = value;
    }

    if (config.isRunningAsExtension) {
        //добавление прослушивания события изменения хранилища
        api.storage.onChanged.addListener(storageChangeHandler)
    }

    // Добавлекние раскрывающегося блока "Реклама"
    function CreateEspeciallyForYou() {
        // Создание стилей с помощью JavaScript
        const style = document.createElement("style")
        style.textContent = `
                details {
                    // display: none;
                    font-family: Arial, sans-serif;
                    font-size: 18px;
                    color: #333;
                    position: relative;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #fff;
                    max-height: 50vh;
                    overflow-y: auto;
                }
                summary {
                    cursor: pointer;
                    outline: none;
                    position: relative;
                    z-index: 1;
                    color: #df0f70; /* Изменение цвета текста на красный */
                }
                .shimmer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%);
                    animation: shimmer 60s linear infinite;
                    pointer-events: none;
                }
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `;
        document.head.appendChild(style);

        // Создание элемента details
        const details = document.createElement("details");
        // Добавляем класс my-details-class к элементу <details>
        details.classList.add('details_EspeciallyForYou');

        // Определение языка браузера
        const browserLanguage = navigator.language || navigator.userLanguage;
        let messageSpecialOffer = 'Реклама'

        switch (browserLanguage) {
            case "uken":
                messageSpecialOffer = 'Реклама'
                break;
            default:
                messageSpecialOffer = 'Реклама'
        }
        const summary = document.createElement("summary");
        summary.textContent = messageSpecialOffer;

        const shimmer = document.createElement("div");
        shimmer.className = "shimmer";

        // const content = document.createElement("p");
        // content.textContent = "Содержимое деталей...";

        details.appendChild(summary);
        details.appendChild(shimmer);
        // details.appendChild(content);

        // document.body.appendChild(details);
        return details
    }

})();
