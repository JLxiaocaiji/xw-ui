const userAgentKey = {
    Opera: "Opera",
    Chrome: "Chrome",
    Firefox: "Firefox",
    Edge: "Edge",
    Edg: 'Edg',
    IE: "IE",
    Safari: "Safari",
}

function getBrowserType() {
    const {userAgent} = navigator;
    // 判断是否为Edge浏览器
    if(userAgent.includes("Edge")) {
        return userAgentKey.Edge;
    }
    if(userAgent.includes("Edg")) {
        return userAgentKey.Edg;
    }
    // 判断是否为Firefox浏览器
    if(userAgent.includes("Firefox")) {
        return userAgentKey.Firefox;
    }
    // 判断是否为Chrome浏览器
    if(userAgent.includes("Chrome")) {
        return userAgentKey.Chrome;
    }
    // 判断是否为Safari浏览器
    if(userAgent.includes("Safari")) {
        return userAgentKey.Safari;
    }
    // 判断是否为IE浏览器
    if(userAgent.includes("compatible")
        && userAgent.includes("MSIE")
        && userAgent.includes("Opera")
    ) {
        return userAgentKey.IE;
    }
    // 判断是否为Opera浏览器
    if(userAgent.includes("Opera")) {
        return userAgentKey.Opera;
    }
    return "";
}

// 获取浏览器位数
function getBrowserBit() {
    return navigator.userAgent.includes("x64") || navigator.userAgent.includes("x86_64") ? 64 : 32;
}

function getBrowserVersion(browserType) {
    const {userAgent} = navigator;
    return userAgent.split(browserType)[1].split(".")[0].slice(1)
}

function checkBrowser() {
    const browserType = getBrowserType();
    // 32位浏览器也需要使用单线程
    const browserBit = getBrowserBit();
    const browserVersion = getBrowserVersion(browserType);
    let isVersionCompliance = false;
    let errorCode = 0;
    switch(browserType) {
        case userAgentKey.Chrome:
            isVersionCompliance = browserVersion >= 91 && browserBit === 64;
            errorCode = 701;
            break;
        case userAgentKey.Firefox:
            isVersionCompliance = browserVersion >= 97;
            errorCode = 702;
            break;
        case userAgentKey.Edge:
            isVersionCompliance = browserVersion >= 91;
            errorCode = 703;
            break;
        case userAgentKey.Edg:
            isVersionCompliance = browserVersion >= 91;
            errorCode = 703;
            break;
        default:
            isVersionCompliance = 0;
    }
    return {isVersionCompliance, browserType, errorCode};
}

function validFunction(fn) {
    return toString.call(fn) === "[object Function]";
}

function validObject(obj) {
    return toString.call(obj) === "[object Object]";
}

/**
 * 将入参的所有对象全部合并到新对象中
 */
function mergeObject() {
    let target = {};
    for(let i = 0; i < arguments.length; i++) {
        let source = arguments[i];
        for(let prop in source) {
            let value = source[prop];
            if(validObject(value)) {
                target[prop] = mergeObject(value);
            } else {
                target[prop] = value;
            }
        }
    }
    return target;
}

/**
 * 获取当前时间
 * @returns {(number|number)[]}
 */
function getDate() {
    let date = new Date();
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
    ];
}

/**
 * 使用下划线获取当前时间
 * @returns {string}
 */
function getDateFormatByUnderline() {
    return getDate().join("_");
}

// 节流函数：在触发事件后，delay时间内无法重复触发
function throttle(fn, delay) {
    let timeoutId;
    return function() {
        if(!timeoutId) {
            fn.apply(this, arguments);
            timeoutId = setTimeout(() => {
                timeoutId = 0;
            }, delay)
        }
    }
}

// 防抖函数：某一个事件在delay时间内没有重复触发，则执行
function debounce(fn, delay) {
    let timeoutId;
    return function() {
        if(timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn.apply(this, arguments);
            timeoutId = 0;
        }, delay)
    }
}

export default {
    checkBrowser,
    validFunction,
    mergeObject,
    getDateFormatByUnderline,
    throttle,
    debounce,
}
