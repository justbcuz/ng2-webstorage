(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
    (factory((global.ng2Webstorage = global.ng2Webstorage || {}),global.ng.core));
}(this, (function (exports,_angular_core) { 'use strict';

var STORAGE;
(function (STORAGE) {
    STORAGE[STORAGE["local"] = 0] = "local";
    STORAGE[STORAGE["session"] = 1] = "session";
})(STORAGE || (STORAGE = {}));

var LIB_KEY = 'ng2-webstorage';
var LIB_KEY_SEPARATOR = '|';
var LIB_KEY_CASE_SENSITIVE = false;
var STORAGE_NAMES = (_a = {},
    _a[STORAGE.local] = 'local',
    _a[STORAGE.session] = 'session',
    _a);
var _a;

var CUSTOM_LIB_KEY = LIB_KEY;
var CUSTOM_LIB_KEY_SEPARATOR = LIB_KEY_SEPARATOR;
var CUSTOM_LIB_KEY_CASE_SENSITIVE = LIB_KEY_CASE_SENSITIVE;
function isManagedKey(sKey) {
    return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
}
var KeyStorageHelper = (function () {
    function KeyStorageHelper() {
    }
    KeyStorageHelper.isManagedKey = function (sKey) {
        return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
    };
    KeyStorageHelper.retrieveKeysFromStorage = function (storage) {
        return Object.keys(storage).filter(isManagedKey);
    };
    KeyStorageHelper.genKey = function (raw) {
        if (typeof raw !== 'string')
            throw Error('attempt to generate a storage key with a non string value');
        return "" + CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR + this.formatKey(raw);
    };
    KeyStorageHelper.formatKey = function (raw) {
        var key = raw.toString();
        return CUSTOM_LIB_KEY_CASE_SENSITIVE ? key : key.toLowerCase();
    };
    KeyStorageHelper.setStorageKeyPrefix = function (key) {
        if (key === void 0) { key = LIB_KEY; }
        CUSTOM_LIB_KEY = key;
    };
    KeyStorageHelper.setCaseSensitivity = function (enable) {
        if (enable === void 0) { enable = LIB_KEY_CASE_SENSITIVE; }
        CUSTOM_LIB_KEY_CASE_SENSITIVE = enable;
    };
    KeyStorageHelper.setStorageKeySeparator = function (separator) {
        if (separator === void 0) { separator = LIB_KEY_SEPARATOR; }
        CUSTOM_LIB_KEY_SEPARATOR = separator;
    };
    return KeyStorageHelper;
}());

var StorageObserverHelper = (function () {
    function StorageObserverHelper() {
    }
    StorageObserverHelper.observe = function (sType, sKey) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            return this.observers[oKey];
        return this.observers[oKey] = new _angular_core.EventEmitter();
    };
    StorageObserverHelper.emit = function (sType, sKey, event) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            this.observers[oKey].emit(event);
    };
    StorageObserverHelper.genObserverKey = function (sType, sKey) {
        return sType + '|' + sKey;
    };
    return StorageObserverHelper;
}());
StorageObserverHelper.observers = {};

var MockStorageHelper = (function () {
    function MockStorageHelper() {
    }
    MockStorageHelper.isSecuredField = function (field) {
        return !!~MockStorageHelper.securedFields.indexOf(field);
    };
    MockStorageHelper.getStorage = function (sType) {
        if (!this.mockStorages[sType])
            this.mockStorages[sType] = MockStorageHelper.generateStorage();
        return this.mockStorages[sType];
    };
    MockStorageHelper.generateStorage = function () {
        var storage = {};
        Object.defineProperties(storage, {
            setItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key, value) {
                    if (!MockStorageHelper.isSecuredField(key))
                        this[key] = value;
                },
            },
            getItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    return !MockStorageHelper.isSecuredField(key) ? this[key] || null : null;
                },
            },
            removeItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    if (!MockStorageHelper.isSecuredField(key))
                        delete this[key];
                },
            },
            length: {
                enumerable: false,
                configurable: false,
                get: function () {
                    return Object.keys(this).length;
                }
            }
        });
        return storage;
    };
    return MockStorageHelper;
}());
MockStorageHelper.securedFields = ['setItem', 'getItem', 'removeItem', 'length'];
MockStorageHelper.mockStorages = {};

var CACHED = (_a$1 = {}, _a$1[STORAGE.local] = {}, _a$1[STORAGE.session] = {}, _a$1);
var STORAGEAVAILABILITY = (_b = {}, _b[STORAGE.local] = null, _b[STORAGE.session] = null, _b);
var WebStorageHelper = (function () {
    function WebStorageHelper() {
    }
    WebStorageHelper.store = function (sType, sKey, value) {
        var oldValue = WebStorageHelper.retrieveFromStorage(sType, sKey);
        var storageEvent = this.genStorageEvent(sType, sKey, value, oldValue);
        this.getStorage(sType).setItem(sKey, JSON.stringify(value));
        CACHED[sType][sKey] = value;
        StorageObserverHelper.emit(sType, sKey, storageEvent);
    };
    WebStorageHelper.retrieve = function (sType, sKey) {
        if (CACHED[sType][sKey])
            return CACHED[sType][sKey];
        return CACHED[sType][sKey] = WebStorageHelper.retrieveFromStorage(sType, sKey);
    };
    WebStorageHelper.retrieveFromStorage = function (sType, sKey) {
        var data = null;
        try {
            data = JSON.parse(this.getStorage(sType).getItem(sKey));
        }
        catch (err) {
            console.warn("invalid value for " + sKey);
        }
        return data;
    };
    WebStorageHelper.refresh = function (sType, sKey) {
        if (!KeyStorageHelper.isManagedKey(sKey))
            return;
        var value = WebStorageHelper.retrieveFromStorage(sType, sKey);
        if (value === null) {
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        }
        else if (value !== CACHED[sType][sKey]) {
            var storageEvent = this.genStorageEvent(sType, sKey, value, CACHED[sType][sKey]);
            CACHED[sType][sKey] = value;
            StorageObserverHelper.emit(sType, sKey, storageEvent);
        }
    };
    WebStorageHelper.clearAll = function (sType) {
        var storage = this.getStorage(sType);
        KeyStorageHelper.retrieveKeysFromStorage(storage)
            .forEach(function (sKey) {
            storage.removeItem(sKey);
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        });
    };
    WebStorageHelper.clear = function (sType, sKey) {
        this.getStorage(sType).removeItem(sKey);
        delete CACHED[sType][sKey];
        StorageObserverHelper.emit(sType, sKey, null);
    };
    WebStorageHelper.getStorage = function (sType) {
        if (this.isStorageAvailable(sType))
            return this.getWStorage(sType);
        else
            return MockStorageHelper.getStorage(sType);
    };
    WebStorageHelper.getWStorage = function (sType) {
        var storage;
        switch (sType) {
            case STORAGE.local:
                storage = localStorage;
                break;
            case STORAGE.session:
                storage = sessionStorage;
                break;
            default:
                throw Error('invalid storage type');
        }
        return storage;
    };
    WebStorageHelper.isStorageAvailable = function (sType) {
        if (typeof STORAGEAVAILABILITY[sType] === 'boolean')
            return STORAGEAVAILABILITY[sType];
        var isAvailable = true, storage;
        try {
            storage = this.getWStorage(sType);
            if (typeof storage === 'object') {
                storage.setItem('test-storage', 'foobar');
                storage.removeItem('test-storage');
            }
            else
                isAvailable = false;
        }
        catch (e) {
            isAvailable = false;
        }
        if (!isAvailable)
            console.warn(STORAGE_NAMES[sType] + " storage unavailable, Ng2Webstorage will use a fallback strategy instead");
        return STORAGEAVAILABILITY[sType] = isAvailable;
    };
    WebStorageHelper.genStorageEvent = function (sType, sKey, value, oldValue) {
        var sTypeString = sType == STORAGE.local ? 'local' : 'session';
        var storageEvent = new StorageEvent(sTypeString, {
            key: sKey,
            newValue: value,
            oldValue: oldValue,
            storageArea: this.getStorage(sType),
            url: null,
            scoped: false,
            bubbles: false,
            cancelable: false
        });
        return storageEvent;
    };
    return WebStorageHelper;
}());
var _a$1;
var _b;

var WebStorageService = (function () {
    function WebStorageService(sType) {
        if (sType === void 0) { sType = null; }
        this.sType = sType;
        this.sType = sType;
    }
    WebStorageService.prototype.store = function (raw, value) {
        var sKey = KeyStorageHelper.genKey(raw);
        WebStorageHelper.store(this.sType, sKey, value);
    };
    WebStorageService.prototype.retrieve = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return WebStorageHelper.retrieve(this.sType, sKey);
    };
    WebStorageService.prototype.clear = function (raw) {
        if (raw)
            WebStorageHelper.clear(this.sType, KeyStorageHelper.genKey(raw));
        else
            WebStorageHelper.clearAll(this.sType);
    };
    WebStorageService.prototype.observe = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return StorageObserverHelper.observe(this.sType, sKey);
    };
    return WebStorageService;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LocalStorageService = (function (_super) {
    __extends(LocalStorageService, _super);
    function LocalStorageService() {
        return _super.call(this, STORAGE.local) || this;
    }
    return LocalStorageService;
}(WebStorageService));
LocalStorageService.decorators = [
    { type: _angular_core.Injectable },
];
/** @nocollapse */
LocalStorageService.ctorParameters = function () { return []; };

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SessionStorageService = (function (_super) {
    __extends$1(SessionStorageService, _super);
    function SessionStorageService() {
        return _super.call(this, STORAGE.session) || this;
    }
    return SessionStorageService;
}(WebStorageService));
SessionStorageService.decorators = [
    { type: _angular_core.Injectable },
];
/** @nocollapse */
SessionStorageService.ctorParameters = function () { return []; };

var WebstorageConfig = (function () {
    function WebstorageConfig(config) {
        this.prefix = LIB_KEY;
        this.separator = LIB_KEY_SEPARATOR;
        this.caseSensitive = LIB_KEY_CASE_SENSITIVE;
        if (config && config.prefix !== undefined) {
            this.prefix = config.prefix;
        }
        if (config && config.separator !== undefined) {
            this.separator = config.separator;
        }
        if (config && config.caseSensitive !== undefined) {
            this.caseSensitive = config.caseSensitive;
        }
    }
    return WebstorageConfig;
}());

function WebStorage(webSKey, sType, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.local, targetedClass, raw, defaultValue);
    };
}
function WebStorageDecorator(webSKey, sType, targetedClass, raw, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    var key = webSKey || raw;
    Object.defineProperty(targetedClass, raw, {
        get: function () {
            var sKey = KeyStorageHelper.genKey(key);
            return WebStorageHelper.retrieve(sType, sKey);
        },
        set: function (value) {
            var sKey = KeyStorageHelper.genKey(key);
            this[sKey] = value;
            WebStorageHelper.store(sType, sKey, value);
        }
    });
    if (targetedClass[raw] === null)
        targetedClass[raw] = defaultValue;
}

function LocalStorage(webSKey, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.local, targetedClass, raw, defaultValue);
    };
}

function SessionStorage(webSKey, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.session, targetedClass, raw, defaultValue);
    };
}

var WEBSTORAGE_CONFIG = new _angular_core.OpaqueToken('WEBSTORAGE_CONFIG');
var Ng2Webstorage = (function () {
    function Ng2Webstorage(ngZone, config) {
        this.ngZone = ngZone;
        if (config) {
            KeyStorageHelper.setStorageKeyPrefix(config.prefix);
            KeyStorageHelper.setStorageKeySeparator(config.separator);
            KeyStorageHelper.setCaseSensitivity(config.caseSensitive);
        }
        this.initStorageListener();
    }
    Ng2Webstorage.forRoot = function (config) {
        return {
            ngModule: Ng2Webstorage,
            providers: [
                {
                    provide: WEBSTORAGE_CONFIG,
                    useValue: config
                },
                {
                    provide: WebstorageConfig,
                    useFactory: provideConfig,
                    deps: [
                        WEBSTORAGE_CONFIG
                    ]
                }
            ]
        };
    };
    Ng2Webstorage.prototype.initStorageListener = function () {
        var _this = this;
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', function (event) { return _this.ngZone.run(function () {
                var storage = window.sessionStorage === event.storageArea ? STORAGE.session : STORAGE.local;
                WebStorageHelper.refresh(storage, event.key);
            }); });
        }
    };
    return Ng2Webstorage;
}());
Ng2Webstorage.decorators = [
    { type: _angular_core.NgModule, args: [{
                declarations: [],
                providers: [SessionStorageService, LocalStorageService],
                imports: []
            },] },
];
/** @nocollapse */
Ng2Webstorage.ctorParameters = function () { return [
    { type: _angular_core.NgZone, },
    { type: WebstorageConfig, decorators: [{ type: _angular_core.Optional }, { type: _angular_core.Inject, args: [WebstorageConfig,] },] },
]; };
function provideConfig(config) {
    return new WebstorageConfig(config);
}
function configure(_a) {
    var _b = _a === void 0 ? {
        caseSensitive: LIB_KEY_CASE_SENSITIVE,
        prefix: LIB_KEY,
        separator: LIB_KEY_SEPARATOR
    } : _a, prefix = _b.prefix, separator = _b.separator, caseSensitive = _b.caseSensitive;
    /*@Deprecation*/
    console.warn('[ng2-webstorage:deprecation] The configure method is deprecated since the v1.5.0, consider to use forRoot instead');
    KeyStorageHelper.setStorageKeyPrefix(prefix);
    KeyStorageHelper.setStorageKeySeparator(separator);
    KeyStorageHelper.setCaseSensitivity(caseSensitive);
}

exports.WEBSTORAGE_CONFIG = WEBSTORAGE_CONFIG;
exports.Ng2Webstorage = Ng2Webstorage;
exports.provideConfig = provideConfig;
exports.configure = configure;
exports.WebstorageConfig = WebstorageConfig;
exports.LocalStorage = LocalStorage;
exports.SessionStorage = SessionStorage;
exports.WebStorage = WebStorage;
exports.WebStorageDecorator = WebStorageDecorator;
exports.WebStorageService = WebStorageService;
exports.LocalStorageService = LocalStorageService;
exports.SessionStorageService = SessionStorageService;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2Rpc3QvZW51bXMvc3RvcmFnZS5qcyIsIi4uL2Rpc3QvY29uc3RhbnRzL2xpYi5qcyIsIi4uL2Rpc3QvaGVscGVycy9rZXlTdG9yYWdlLmpzIiwiLi4vZGlzdC9oZWxwZXJzL3N0b3JhZ2VPYnNlcnZlci5qcyIsIi4uL2Rpc3QvaGVscGVycy9tb2NrU3RvcmFnZS5qcyIsIi4uL2Rpc3QvaGVscGVycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy9sb2NhbFN0b3JhZ2UuanMiLCIuLi9kaXN0L3NlcnZpY2VzL3Nlc3Npb25TdG9yYWdlLmpzIiwiLi4vZGlzdC9pbnRlcmZhY2VzL2NvbmZpZy5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9kZWNvcmF0b3JzL2xvY2FsU3RvcmFnZS5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy9zZXNzaW9uU3RvcmFnZS5qcyIsIi4uL2Rpc3QvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB2YXIgU1RPUkFHRTtcbihmdW5jdGlvbiAoU1RPUkFHRSkge1xuICAgIFNUT1JBR0VbU1RPUkFHRVtcImxvY2FsXCJdID0gMF0gPSBcImxvY2FsXCI7XG4gICAgU1RPUkFHRVtTVE9SQUdFW1wic2Vzc2lvblwiXSA9IDFdID0gXCJzZXNzaW9uXCI7XG59KShTVE9SQUdFIHx8IChTVE9SQUdFID0ge30pKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xuZXhwb3J0IHZhciBMSUJfS0VZID0gJ25nMi13ZWJzdG9yYWdlJztcbmV4cG9ydCB2YXIgTElCX0tFWV9TRVBBUkFUT1IgPSAnfCc7XG5leHBvcnQgdmFyIExJQl9LRVlfQ0FTRV9TRU5TSVRJVkUgPSBmYWxzZTtcbmV4cG9ydCB2YXIgU1RPUkFHRV9OQU1FUyA9IChfYSA9IHt9LFxuICAgIF9hW1NUT1JBR0UubG9jYWxdID0gJ2xvY2FsJyxcbiAgICBfYVtTVE9SQUdFLnNlc3Npb25dID0gJ3Nlc3Npb24nLFxuICAgIF9hKTtcbnZhciBfYTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpYi5qcy5tYXAiLCJpbXBvcnQgeyBMSUJfS0VZLCBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFLCBMSUJfS0VZX1NFUEFSQVRPUiB9IGZyb20gJy4uL2NvbnN0YW50cy9saWInO1xudmFyIENVU1RPTV9MSUJfS0VZID0gTElCX0tFWTtcbnZhciBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IgPSBMSUJfS0VZX1NFUEFSQVRPUjtcbnZhciBDVVNUT01fTElCX0tFWV9DQVNFX1NFTlNJVElWRSA9IExJQl9LRVlfQ0FTRV9TRU5TSVRJVkU7XG5leHBvcnQgZnVuY3Rpb24gaXNNYW5hZ2VkS2V5KHNLZXkpIHtcbiAgICByZXR1cm4gc0tleS5pbmRleE9mKENVU1RPTV9MSUJfS0VZICsgQ1VTVE9NX0xJQl9LRVlfU0VQQVJBVE9SKSA9PT0gMDtcbn1cbnZhciBLZXlTdG9yYWdlSGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBLZXlTdG9yYWdlSGVscGVyKCkge1xuICAgIH1cbiAgICBLZXlTdG9yYWdlSGVscGVyLmlzTWFuYWdlZEtleSA9IGZ1bmN0aW9uIChzS2V5KSB7XG4gICAgICAgIHJldHVybiBzS2V5LmluZGV4T2YoQ1VTVE9NX0xJQl9LRVkgKyBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IpID09PSAwO1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5yZXRyaWV2ZUtleXNGcm9tU3RvcmFnZSA9IGZ1bmN0aW9uIChzdG9yYWdlKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhzdG9yYWdlKS5maWx0ZXIoaXNNYW5hZ2VkS2V5KTtcbiAgICB9O1xuICAgIEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5ID0gZnVuY3Rpb24gKHJhdykge1xuICAgICAgICBpZiAodHlwZW9mIHJhdyAhPT0gJ3N0cmluZycpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignYXR0ZW1wdCB0byBnZW5lcmF0ZSBhIHN0b3JhZ2Uga2V5IHdpdGggYSBub24gc3RyaW5nIHZhbHVlJyk7XG4gICAgICAgIHJldHVybiBcIlwiICsgQ1VTVE9NX0xJQl9LRVkgKyBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IgKyB0aGlzLmZvcm1hdEtleShyYXcpO1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5mb3JtYXRLZXkgPSBmdW5jdGlvbiAocmF3KSB7XG4gICAgICAgIHZhciBrZXkgPSByYXcudG9TdHJpbmcoKTtcbiAgICAgICAgcmV0dXJuIENVU1RPTV9MSUJfS0VZX0NBU0VfU0VOU0lUSVZFID8ga2V5IDoga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgfTtcbiAgICBLZXlTdG9yYWdlSGVscGVyLnNldFN0b3JhZ2VLZXlQcmVmaXggPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT09IHZvaWQgMCkgeyBrZXkgPSBMSUJfS0VZOyB9XG4gICAgICAgIENVU1RPTV9MSUJfS0VZID0ga2V5O1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRDYXNlU2Vuc2l0aXZpdHkgPSBmdW5jdGlvbiAoZW5hYmxlKSB7XG4gICAgICAgIGlmIChlbmFibGUgPT09IHZvaWQgMCkgeyBlbmFibGUgPSBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFOyB9XG4gICAgICAgIENVU1RPTV9MSUJfS0VZX0NBU0VfU0VOU0lUSVZFID0gZW5hYmxlO1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5U2VwYXJhdG9yID0gZnVuY3Rpb24gKHNlcGFyYXRvcikge1xuICAgICAgICBpZiAoc2VwYXJhdG9yID09PSB2b2lkIDApIHsgc2VwYXJhdG9yID0gTElCX0tFWV9TRVBBUkFUT1I7IH1cbiAgICAgICAgQ1VTVE9NX0xJQl9LRVlfU0VQQVJBVE9SID0gc2VwYXJhdG9yO1xuICAgIH07XG4gICAgcmV0dXJuIEtleVN0b3JhZ2VIZWxwZXI7XG59KCkpO1xuZXhwb3J0IHsgS2V5U3RvcmFnZUhlbHBlciB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9a2V5U3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbnZhciBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFN0b3JhZ2VPYnNlcnZlckhlbHBlcigpIHtcbiAgICB9XG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLm9ic2VydmUgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcbiAgICAgICAgdmFyIG9LZXkgPSB0aGlzLmdlbk9ic2VydmVyS2V5KHNUeXBlLCBzS2V5KTtcbiAgICAgICAgaWYgKG9LZXkgaW4gdGhpcy5vYnNlcnZlcnMpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZlcnNbb0tleV07XG4gICAgICAgIHJldHVybiB0aGlzLm9ic2VydmVyc1tvS2V5XSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB9O1xuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0ID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5LCBldmVudCkge1xuICAgICAgICB2YXIgb0tleSA9IHRoaXMuZ2VuT2JzZXJ2ZXJLZXkoc1R5cGUsIHNLZXkpO1xuICAgICAgICBpZiAob0tleSBpbiB0aGlzLm9ic2VydmVycylcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzW29LZXldLmVtaXQoZXZlbnQpO1xuICAgIH07XG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmdlbk9ic2VydmVyS2V5ID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5KSB7XG4gICAgICAgIHJldHVybiBzVHlwZSArICd8JyArIHNLZXk7XG4gICAgfTtcbiAgICByZXR1cm4gU3RvcmFnZU9ic2VydmVySGVscGVyO1xufSgpKTtcbmV4cG9ydCB7IFN0b3JhZ2VPYnNlcnZlckhlbHBlciB9O1xuU3RvcmFnZU9ic2VydmVySGVscGVyLm9ic2VydmVycyA9IHt9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RvcmFnZU9ic2VydmVyLmpzLm1hcCIsInZhciBNb2NrU3RvcmFnZUhlbHBlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTW9ja1N0b3JhZ2VIZWxwZXIoKSB7XG4gICAgfVxuICAgIE1vY2tTdG9yYWdlSGVscGVyLmlzU2VjdXJlZEZpZWxkID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgIHJldHVybiAhIX5Nb2NrU3RvcmFnZUhlbHBlci5zZWN1cmVkRmllbGRzLmluZGV4T2YoZmllbGQpO1xuICAgIH07XG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIuZ2V0U3RvcmFnZSA9IGZ1bmN0aW9uIChzVHlwZSkge1xuICAgICAgICBpZiAoIXRoaXMubW9ja1N0b3JhZ2VzW3NUeXBlXSlcbiAgICAgICAgICAgIHRoaXMubW9ja1N0b3JhZ2VzW3NUeXBlXSA9IE1vY2tTdG9yYWdlSGVscGVyLmdlbmVyYXRlU3RvcmFnZSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5tb2NrU3RvcmFnZXNbc1R5cGVdO1xuICAgIH07XG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIuZ2VuZXJhdGVTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3RvcmFnZSA9IHt9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzdG9yYWdlLCB7XG4gICAgICAgICAgICBzZXRJdGVtOiB7XG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghTW9ja1N0b3JhZ2VIZWxwZXIuaXNTZWN1cmVkRmllbGQoa2V5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0SXRlbToge1xuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhTW9ja1N0b3JhZ2VIZWxwZXIuaXNTZWN1cmVkRmllbGQoa2V5KSA/IHRoaXNba2V5XSB8fCBudWxsIDogbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbW92ZUl0ZW06IHtcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIU1vY2tTdG9yYWdlSGVscGVyLmlzU2VjdXJlZEZpZWxkKGtleSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1trZXldO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVuZ3RoOiB7XG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMpLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3RvcmFnZTtcbiAgICB9O1xuICAgIHJldHVybiBNb2NrU3RvcmFnZUhlbHBlcjtcbn0oKSk7XG5leHBvcnQgeyBNb2NrU3RvcmFnZUhlbHBlciB9O1xuTW9ja1N0b3JhZ2VIZWxwZXIuc2VjdXJlZEZpZWxkcyA9IFsnc2V0SXRlbScsICdnZXRJdGVtJywgJ3JlbW92ZUl0ZW0nLCAnbGVuZ3RoJ107XG5Nb2NrU3RvcmFnZUhlbHBlci5tb2NrU3RvcmFnZXMgPSB7fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1vY2tTdG9yYWdlLmpzLm1hcCIsImltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcbmltcG9ydCB7IFN0b3JhZ2VPYnNlcnZlckhlbHBlciB9IGZyb20gJy4vc3RvcmFnZU9ic2VydmVyJztcbmltcG9ydCB7IEtleVN0b3JhZ2VIZWxwZXIgfSBmcm9tICcuL2tleVN0b3JhZ2UnO1xuaW1wb3J0IHsgTW9ja1N0b3JhZ2VIZWxwZXIgfSBmcm9tICcuL21vY2tTdG9yYWdlJztcbmltcG9ydCB7IFNUT1JBR0VfTkFNRVMgfSBmcm9tICcuLi9jb25zdGFudHMvbGliJztcbnZhciBDQUNIRUQgPSAoX2EgPSB7fSwgX2FbU1RPUkFHRS5sb2NhbF0gPSB7fSwgX2FbU1RPUkFHRS5zZXNzaW9uXSA9IHt9LCBfYSk7XG52YXIgU1RPUkFHRUFWQUlMQUJJTElUWSA9IChfYiA9IHt9LCBfYltTVE9SQUdFLmxvY2FsXSA9IG51bGwsIF9iW1NUT1JBR0Uuc2Vzc2lvbl0gPSBudWxsLCBfYik7XG52YXIgV2ViU3RvcmFnZUhlbHBlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gV2ViU3RvcmFnZUhlbHBlcigpIHtcbiAgICB9XG4gICAgV2ViU3RvcmFnZUhlbHBlci5zdG9yZSA9IGZ1bmN0aW9uIChzVHlwZSwgc0tleSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIG9sZFZhbHVlID0gV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZUZyb21TdG9yYWdlKHNUeXBlLCBzS2V5KTtcbiAgICAgICAgdmFyIHN0b3JhZ2VFdmVudCA9IHRoaXMuZ2VuU3RvcmFnZUV2ZW50KHNUeXBlLCBzS2V5LCB2YWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICB0aGlzLmdldFN0b3JhZ2Uoc1R5cGUpLnNldEl0ZW0oc0tleSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICAgICAgQ0FDSEVEW3NUeXBlXVtzS2V5XSA9IHZhbHVlO1xuICAgICAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuZW1pdChzVHlwZSwgc0tleSwgc3RvcmFnZUV2ZW50KTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIucmV0cmlldmUgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcbiAgICAgICAgaWYgKENBQ0hFRFtzVHlwZV1bc0tleV0pXG4gICAgICAgICAgICByZXR1cm4gQ0FDSEVEW3NUeXBlXVtzS2V5XTtcbiAgICAgICAgcmV0dXJuIENBQ0hFRFtzVHlwZV1bc0tleV0gPSBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlRnJvbVN0b3JhZ2Uoc1R5cGUsIHNLZXkpO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZUZyb21TdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5KSB7XG4gICAgICAgIHZhciBkYXRhID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHRoaXMuZ2V0U3RvcmFnZShzVHlwZSkuZ2V0SXRlbShzS2V5KSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiaW52YWxpZCB2YWx1ZSBmb3IgXCIgKyBzS2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIucmVmcmVzaCA9IGZ1bmN0aW9uIChzVHlwZSwgc0tleSkge1xuICAgICAgICBpZiAoIUtleVN0b3JhZ2VIZWxwZXIuaXNNYW5hZ2VkS2V5KHNLZXkpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB2YXIgdmFsdWUgPSBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlRnJvbVN0b3JhZ2Uoc1R5cGUsIHNLZXkpO1xuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBDQUNIRURbc1R5cGVdW3NLZXldO1xuICAgICAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlICE9PSBDQUNIRURbc1R5cGVdW3NLZXldKSB7XG4gICAgICAgICAgICB2YXIgc3RvcmFnZUV2ZW50ID0gdGhpcy5nZW5TdG9yYWdlRXZlbnQoc1R5cGUsIHNLZXksIHZhbHVlLCBDQUNIRURbc1R5cGVdW3NLZXldKTtcbiAgICAgICAgICAgIENBQ0hFRFtzVHlwZV1bc0tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0KHNUeXBlLCBzS2V5LCBzdG9yYWdlRXZlbnQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlSGVscGVyLmNsZWFyQWxsID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIHZhciBzdG9yYWdlID0gdGhpcy5nZXRTdG9yYWdlKHNUeXBlKTtcbiAgICAgICAgS2V5U3RvcmFnZUhlbHBlci5yZXRyaWV2ZUtleXNGcm9tU3RvcmFnZShzdG9yYWdlKVxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKHNLZXkpIHtcbiAgICAgICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbShzS2V5KTtcbiAgICAgICAgICAgIGRlbGV0ZSBDQUNIRURbc1R5cGVdW3NLZXldO1xuICAgICAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIuY2xlYXIgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcbiAgICAgICAgdGhpcy5nZXRTdG9yYWdlKHNUeXBlKS5yZW1vdmVJdGVtKHNLZXkpO1xuICAgICAgICBkZWxldGUgQ0FDSEVEW3NUeXBlXVtzS2V5XTtcbiAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZUhlbHBlci5nZXRTdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzU3RvcmFnZUF2YWlsYWJsZShzVHlwZSkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRXU3RvcmFnZShzVHlwZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBNb2NrU3RvcmFnZUhlbHBlci5nZXRTdG9yYWdlKHNUeXBlKTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIuZ2V0V1N0b3JhZ2UgPSBmdW5jdGlvbiAoc1R5cGUpIHtcbiAgICAgICAgdmFyIHN0b3JhZ2U7XG4gICAgICAgIHN3aXRjaCAoc1R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU1RPUkFHRS5sb2NhbDpcbiAgICAgICAgICAgICAgICBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTVE9SQUdFLnNlc3Npb246XG4gICAgICAgICAgICAgICAgc3RvcmFnZSA9IHNlc3Npb25TdG9yYWdlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcignaW52YWxpZCBzdG9yYWdlIHR5cGUnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RvcmFnZTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIuaXNTdG9yYWdlQXZhaWxhYmxlID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgU1RPUkFHRUFWQUlMQUJJTElUWVtzVHlwZV0gPT09ICdib29sZWFuJylcbiAgICAgICAgICAgIHJldHVybiBTVE9SQUdFQVZBSUxBQklMSVRZW3NUeXBlXTtcbiAgICAgICAgdmFyIGlzQXZhaWxhYmxlID0gdHJ1ZSwgc3RvcmFnZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHN0b3JhZ2UgPSB0aGlzLmdldFdTdG9yYWdlKHNUeXBlKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RvcmFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBzdG9yYWdlLnNldEl0ZW0oJ3Rlc3Qtc3RvcmFnZScsICdmb29iYXInKTtcbiAgICAgICAgICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rlc3Qtc3RvcmFnZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlzQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlzQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0F2YWlsYWJsZSlcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihTVE9SQUdFX05BTUVTW3NUeXBlXSArIFwiIHN0b3JhZ2UgdW5hdmFpbGFibGUsIE5nMldlYnN0b3JhZ2Ugd2lsbCB1c2UgYSBmYWxsYmFjayBzdHJhdGVneSBpbnN0ZWFkXCIpO1xuICAgICAgICByZXR1cm4gU1RPUkFHRUFWQUlMQUJJTElUWVtzVHlwZV0gPSBpc0F2YWlsYWJsZTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIuZ2VuU3RvcmFnZUV2ZW50ID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5LCB2YWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgdmFyIHNUeXBlU3RyaW5nID0gc1R5cGUgPT0gU1RPUkFHRS5sb2NhbCA/ICdsb2NhbCcgOiAnc2Vzc2lvbic7XG4gICAgICAgIHZhciBzdG9yYWdlRXZlbnQgPSBuZXcgU3RvcmFnZUV2ZW50KHNUeXBlU3RyaW5nLCB7XG4gICAgICAgICAgICBrZXk6IHNLZXksXG4gICAgICAgICAgICBuZXdWYWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBvbGRWYWx1ZTogb2xkVmFsdWUsXG4gICAgICAgICAgICBzdG9yYWdlQXJlYTogdGhpcy5nZXRTdG9yYWdlKHNUeXBlKSxcbiAgICAgICAgICAgIHVybDogbnVsbCxcbiAgICAgICAgICAgIHNjb3BlZDogZmFsc2UsXG4gICAgICAgICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3RvcmFnZUV2ZW50O1xuICAgIH07XG4gICAgcmV0dXJuIFdlYlN0b3JhZ2VIZWxwZXI7XG59KCkpO1xuZXhwb3J0IHsgV2ViU3RvcmFnZUhlbHBlciB9O1xudmFyIF9hLCBfYjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdlYlN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciwgV2ViU3RvcmFnZUhlbHBlciwgU3RvcmFnZU9ic2VydmVySGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy9pbmRleCc7XG52YXIgV2ViU3RvcmFnZVNlcnZpY2UgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFdlYlN0b3JhZ2VTZXJ2aWNlKHNUeXBlKSB7XG4gICAgICAgIGlmIChzVHlwZSA9PT0gdm9pZCAwKSB7IHNUeXBlID0gbnVsbDsgfVxuICAgICAgICB0aGlzLnNUeXBlID0gc1R5cGU7XG4gICAgICAgIHRoaXMuc1R5cGUgPSBzVHlwZTtcbiAgICB9XG4gICAgV2ViU3RvcmFnZVNlcnZpY2UucHJvdG90eXBlLnN0b3JlID0gZnVuY3Rpb24gKHJhdywgdmFsdWUpIHtcbiAgICAgICAgdmFyIHNLZXkgPSBLZXlTdG9yYWdlSGVscGVyLmdlbktleShyYXcpO1xuICAgICAgICBXZWJTdG9yYWdlSGVscGVyLnN0b3JlKHRoaXMuc1R5cGUsIHNLZXksIHZhbHVlKTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VTZXJ2aWNlLnByb3RvdHlwZS5yZXRyaWV2ZSA9IGZ1bmN0aW9uIChyYXcpIHtcbiAgICAgICAgdmFyIHNLZXkgPSBLZXlTdG9yYWdlSGVscGVyLmdlbktleShyYXcpO1xuICAgICAgICByZXR1cm4gV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZSh0aGlzLnNUeXBlLCBzS2V5KTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VTZXJ2aWNlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIChyYXcpIHtcbiAgICAgICAgaWYgKHJhdylcbiAgICAgICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIuY2xlYXIodGhpcy5zVHlwZSwgS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkocmF3KSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIuY2xlYXJBbGwodGhpcy5zVHlwZSk7XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlU2VydmljZS5wcm90b3R5cGUub2JzZXJ2ZSA9IGZ1bmN0aW9uIChyYXcpIHtcbiAgICAgICAgdmFyIHNLZXkgPSBLZXlTdG9yYWdlSGVscGVyLmdlbktleShyYXcpO1xuICAgICAgICByZXR1cm4gU3RvcmFnZU9ic2VydmVySGVscGVyLm9ic2VydmUodGhpcy5zVHlwZSwgc0tleSk7XG4gICAgfTtcbiAgICByZXR1cm4gV2ViU3RvcmFnZVNlcnZpY2U7XG59KCkpO1xuZXhwb3J0IHsgV2ViU3RvcmFnZVNlcnZpY2UgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdlYlN0b3JhZ2UuanMubWFwIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XG5pbXBvcnQgeyBXZWJTdG9yYWdlU2VydmljZSB9IGZyb20gJy4vd2ViU3RvcmFnZSc7XG52YXIgTG9jYWxTdG9yYWdlU2VydmljZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKExvY2FsU3RvcmFnZVNlcnZpY2UsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gTG9jYWxTdG9yYWdlU2VydmljZSgpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlci5jYWxsKHRoaXMsIFNUT1JBR0UubG9jYWwpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBMb2NhbFN0b3JhZ2VTZXJ2aWNlO1xufShXZWJTdG9yYWdlU2VydmljZSkpO1xuZXhwb3J0IHsgTG9jYWxTdG9yYWdlU2VydmljZSB9O1xuTG9jYWxTdG9yYWdlU2VydmljZS5kZWNvcmF0b3JzID0gW1xuICAgIHsgdHlwZTogSW5qZWN0YWJsZSB9LFxuXTtcbi8qKiBAbm9jb2xsYXBzZSAqL1xuTG9jYWxTdG9yYWdlU2VydmljZS5jdG9yUGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtdOyB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9jYWxTdG9yYWdlLmpzLm1hcCIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xuaW1wb3J0IHsgV2ViU3RvcmFnZVNlcnZpY2UgfSBmcm9tICcuL3dlYlN0b3JhZ2UnO1xudmFyIFNlc3Npb25TdG9yYWdlU2VydmljZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFNlc3Npb25TdG9yYWdlU2VydmljZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTZXNzaW9uU3RvcmFnZVNlcnZpY2UoKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBTVE9SQUdFLnNlc3Npb24pIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBTZXNzaW9uU3RvcmFnZVNlcnZpY2U7XG59KFdlYlN0b3JhZ2VTZXJ2aWNlKSk7XG5leHBvcnQgeyBTZXNzaW9uU3RvcmFnZVNlcnZpY2UgfTtcblNlc3Npb25TdG9yYWdlU2VydmljZS5kZWNvcmF0b3JzID0gW1xuICAgIHsgdHlwZTogSW5qZWN0YWJsZSB9LFxuXTtcbi8qKiBAbm9jb2xsYXBzZSAqL1xuU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlLmN0b3JQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW107IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXNzaW9uU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBMSUJfS0VZLCBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFLCBMSUJfS0VZX1NFUEFSQVRPUiB9IGZyb20gJy4uL2NvbnN0YW50cy9saWInO1xudmFyIFdlYnN0b3JhZ2VDb25maWcgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFdlYnN0b3JhZ2VDb25maWcoY29uZmlnKSB7XG4gICAgICAgIHRoaXMucHJlZml4ID0gTElCX0tFWTtcbiAgICAgICAgdGhpcy5zZXBhcmF0b3IgPSBMSUJfS0VZX1NFUEFSQVRPUjtcbiAgICAgICAgdGhpcy5jYXNlU2Vuc2l0aXZlID0gTElCX0tFWV9DQVNFX1NFTlNJVElWRTtcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcucHJlZml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMucHJlZml4ID0gY29uZmlnLnByZWZpeDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5zZXBhcmF0b3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXBhcmF0b3IgPSBjb25maWcuc2VwYXJhdG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmNhc2VTZW5zaXRpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5jYXNlU2Vuc2l0aXZlID0gY29uZmlnLmNhc2VTZW5zaXRpdmU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFdlYnN0b3JhZ2VDb25maWc7XG59KCkpO1xuZXhwb3J0IHsgV2Vic3RvcmFnZUNvbmZpZyB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29uZmlnLmpzLm1hcCIsImltcG9ydCB7IEtleVN0b3JhZ2VIZWxwZXIsIFdlYlN0b3JhZ2VIZWxwZXIgfSBmcm9tICcuLi9oZWxwZXJzL2luZGV4JztcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcbmV4cG9ydCBmdW5jdGlvbiBXZWJTdG9yYWdlKHdlYlNLZXksIHNUeXBlLCBkZWZhdWx0VmFsdWUpIHtcbiAgICBpZiAoZGVmYXVsdFZhbHVlID09PSB2b2lkIDApIHsgZGVmYXVsdFZhbHVlID0gbnVsbDsgfVxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0ZWRDbGFzcywgcmF3KSB7XG4gICAgICAgIFdlYlN0b3JhZ2VEZWNvcmF0b3Iod2ViU0tleSwgU1RPUkFHRS5sb2NhbCwgdGFyZ2V0ZWRDbGFzcywgcmF3LCBkZWZhdWx0VmFsdWUpO1xuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gV2ViU3RvcmFnZURlY29yYXRvcih3ZWJTS2V5LCBzVHlwZSwgdGFyZ2V0ZWRDbGFzcywgcmF3LCBkZWZhdWx0VmFsdWUpIHtcbiAgICBpZiAoZGVmYXVsdFZhbHVlID09PSB2b2lkIDApIHsgZGVmYXVsdFZhbHVlID0gbnVsbDsgfVxuICAgIHZhciBrZXkgPSB3ZWJTS2V5IHx8IHJhdztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0ZWRDbGFzcywgcmF3LCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNLZXkgPSBLZXlTdG9yYWdlSGVscGVyLmdlbktleShrZXkpO1xuICAgICAgICAgICAgcmV0dXJuIFdlYlN0b3JhZ2VIZWxwZXIucmV0cmlldmUoc1R5cGUsIHNLZXkpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHNLZXkgPSBLZXlTdG9yYWdlSGVscGVyLmdlbktleShrZXkpO1xuICAgICAgICAgICAgdGhpc1tzS2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgV2ViU3RvcmFnZUhlbHBlci5zdG9yZShzVHlwZSwgc0tleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHRhcmdldGVkQ2xhc3NbcmF3XSA9PT0gbnVsbClcbiAgICAgICAgdGFyZ2V0ZWRDbGFzc1tyYXddID0gZGVmYXVsdFZhbHVlO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBXZWJTdG9yYWdlRGVjb3JhdG9yIH0gZnJvbSAnLi93ZWJTdG9yYWdlJztcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcbmV4cG9ydCBmdW5jdGlvbiBMb2NhbFN0b3JhZ2Uod2ViU0tleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgaWYgKGRlZmF1bHRWYWx1ZSA9PT0gdm9pZCAwKSB7IGRlZmF1bHRWYWx1ZSA9IG51bGw7IH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldGVkQ2xhc3MsIHJhdykge1xuICAgICAgICBXZWJTdG9yYWdlRGVjb3JhdG9yKHdlYlNLZXksIFNUT1JBR0UubG9jYWwsIHRhcmdldGVkQ2xhc3MsIHJhdywgZGVmYXVsdFZhbHVlKTtcbiAgICB9O1xufVxuO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9jYWxTdG9yYWdlLmpzLm1hcCIsImltcG9ydCB7IFdlYlN0b3JhZ2VEZWNvcmF0b3IgfSBmcm9tICcuL3dlYlN0b3JhZ2UnO1xuaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xuZXhwb3J0IGZ1bmN0aW9uIFNlc3Npb25TdG9yYWdlKHdlYlNLZXksIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmIChkZWZhdWx0VmFsdWUgPT09IHZvaWQgMCkgeyBkZWZhdWx0VmFsdWUgPSBudWxsOyB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXRlZENsYXNzLCByYXcpIHtcbiAgICAgICAgV2ViU3RvcmFnZURlY29yYXRvcih3ZWJTS2V5LCBTVE9SQUdFLnNlc3Npb24sIHRhcmdldGVkQ2xhc3MsIHJhdywgZGVmYXVsdFZhbHVlKTtcbiAgICB9O1xufVxuO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2Vzc2lvblN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgTmdNb2R1bGUsIE5nWm9uZSwgT3BhcXVlVG9rZW4sIEluamVjdCwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IExJQl9LRVksIExJQl9LRVlfU0VQQVJBVE9SLCBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFIH0gZnJvbSAnLi9jb25zdGFudHMvbGliJztcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuL2VudW1zL3N0b3JhZ2UnO1xuaW1wb3J0IHsgTG9jYWxTdG9yYWdlU2VydmljZSwgU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9pbmRleCc7XG5pbXBvcnQgeyBXZWJTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi9oZWxwZXJzL3dlYlN0b3JhZ2UnO1xuaW1wb3J0IHsgV2Vic3RvcmFnZUNvbmZpZyB9IGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciB9IGZyb20gJy4vaGVscGVycy9rZXlTdG9yYWdlJztcbmV4cG9ydCAqIGZyb20gJy4vaW50ZXJmYWNlcy9pbmRleCc7XG5leHBvcnQgKiBmcm9tICcuL2RlY29yYXRvcnMvaW5kZXgnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXJ2aWNlcy9pbmRleCc7XG5leHBvcnQgdmFyIFdFQlNUT1JBR0VfQ09ORklHID0gbmV3IE9wYXF1ZVRva2VuKCdXRUJTVE9SQUdFX0NPTkZJRycpO1xudmFyIE5nMldlYnN0b3JhZ2UgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE5nMldlYnN0b3JhZ2Uobmdab25lLCBjb25maWcpIHtcbiAgICAgICAgdGhpcy5uZ1pvbmUgPSBuZ1pvbmU7XG4gICAgICAgIGlmIChjb25maWcpIHtcbiAgICAgICAgICAgIEtleVN0b3JhZ2VIZWxwZXIuc2V0U3RvcmFnZUtleVByZWZpeChjb25maWcucHJlZml4KTtcbiAgICAgICAgICAgIEtleVN0b3JhZ2VIZWxwZXIuc2V0U3RvcmFnZUtleVNlcGFyYXRvcihjb25maWcuc2VwYXJhdG9yKTtcbiAgICAgICAgICAgIEtleVN0b3JhZ2VIZWxwZXIuc2V0Q2FzZVNlbnNpdGl2aXR5KGNvbmZpZy5jYXNlU2Vuc2l0aXZlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluaXRTdG9yYWdlTGlzdGVuZXIoKTtcbiAgICB9XG4gICAgTmcyV2Vic3RvcmFnZS5mb3JSb290ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IE5nMldlYnN0b3JhZ2UsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGU6IFdFQlNUT1JBR0VfQ09ORklHLFxuICAgICAgICAgICAgICAgICAgICB1c2VWYWx1ZTogY29uZmlnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGU6IFdlYnN0b3JhZ2VDb25maWcsXG4gICAgICAgICAgICAgICAgICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGVDb25maWcsXG4gICAgICAgICAgICAgICAgICAgIGRlcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFdFQlNUT1JBR0VfQ09ORklHXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBOZzJXZWJzdG9yYWdlLnByb3RvdHlwZS5pbml0U3RvcmFnZUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7IHJldHVybiBfdGhpcy5uZ1pvbmUucnVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcmFnZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZSA9PT0gZXZlbnQuc3RvcmFnZUFyZWEgPyBTVE9SQUdFLnNlc3Npb24gOiBTVE9SQUdFLmxvY2FsO1xuICAgICAgICAgICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIucmVmcmVzaChzdG9yYWdlLCBldmVudC5rZXkpO1xuICAgICAgICAgICAgfSk7IH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gTmcyV2Vic3RvcmFnZTtcbn0oKSk7XG5leHBvcnQgeyBOZzJXZWJzdG9yYWdlIH07XG5OZzJXZWJzdG9yYWdlLmRlY29yYXRvcnMgPSBbXG4gICAgeyB0eXBlOiBOZ01vZHVsZSwgYXJnczogW3tcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVyczogW1Nlc3Npb25TdG9yYWdlU2VydmljZSwgTG9jYWxTdG9yYWdlU2VydmljZV0sXG4gICAgICAgICAgICAgICAgaW1wb3J0czogW11cbiAgICAgICAgICAgIH0sXSB9LFxuXTtcbi8qKiBAbm9jb2xsYXBzZSAqL1xuTmcyV2Vic3RvcmFnZS5jdG9yUGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtcbiAgICB7IHR5cGU6IE5nWm9uZSwgfSxcbiAgICB7IHR5cGU6IFdlYnN0b3JhZ2VDb25maWcsIGRlY29yYXRvcnM6IFt7IHR5cGU6IE9wdGlvbmFsIH0sIHsgdHlwZTogSW5qZWN0LCBhcmdzOiBbV2Vic3RvcmFnZUNvbmZpZyxdIH0sXSB9LFxuXTsgfTtcbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQ29uZmlnKGNvbmZpZykge1xuICAgIHJldHVybiBuZXcgV2Vic3RvcmFnZUNvbmZpZyhjb25maWcpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZShfYSkge1xuICAgIHZhciBfYiA9IF9hID09PSB2b2lkIDAgPyB7XG4gICAgICAgIGNhc2VTZW5zaXRpdmU6IExJQl9LRVlfQ0FTRV9TRU5TSVRJVkUsXG4gICAgICAgIHByZWZpeDogTElCX0tFWSxcbiAgICAgICAgc2VwYXJhdG9yOiBMSUJfS0VZX1NFUEFSQVRPUlxuICAgIH0gOiBfYSwgcHJlZml4ID0gX2IucHJlZml4LCBzZXBhcmF0b3IgPSBfYi5zZXBhcmF0b3IsIGNhc2VTZW5zaXRpdmUgPSBfYi5jYXNlU2Vuc2l0aXZlO1xuICAgIC8qQERlcHJlY2F0aW9uKi9cbiAgICBjb25zb2xlLndhcm4oJ1tuZzItd2Vic3RvcmFnZTpkZXByZWNhdGlvbl0gVGhlIGNvbmZpZ3VyZSBtZXRob2QgaXMgZGVwcmVjYXRlZCBzaW5jZSB0aGUgdjEuNS4wLCBjb25zaWRlciB0byB1c2UgZm9yUm9vdCBpbnN0ZWFkJyk7XG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5UHJlZml4KHByZWZpeCk7XG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5U2VwYXJhdG9yKHNlcGFyYXRvcik7XG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRDYXNlU2Vuc2l0aXZpdHkoY2FzZVNlbnNpdGl2ZSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAuanMubWFwIl0sIm5hbWVzIjpbIkV2ZW50RW1pdHRlciIsIl9hIiwidGhpcyIsIkluamVjdGFibGUiLCJfX2V4dGVuZHMiLCJPcGFxdWVUb2tlbiIsIk5nTW9kdWxlIiwiTmdab25lIiwiT3B0aW9uYWwiLCJJbmplY3QiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLElBQUksT0FBTyxDQUFDO0FBQ25CLENBQUMsVUFBVSxPQUFPLEVBQUU7SUFDaEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDeEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7Q0FDL0MsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEFBQzlCOztBQ0pPLElBQUksT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ3RDLEFBQU8sSUFBSSxpQkFBaUIsR0FBRyxHQUFHLENBQUM7QUFDbkMsQUFBTyxJQUFJLHNCQUFzQixHQUFHLEtBQUssQ0FBQztBQUMxQyxBQUFPLElBQUksYUFBYSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUU7SUFDL0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPO0lBQzNCLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsU0FBUztJQUMvQixFQUFFLENBQUMsQ0FBQztBQUNSLElBQUksRUFBRSxDQUFDLEFBQ1A7O0FDUkEsSUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDO0FBQzdCLElBQUksd0JBQXdCLEdBQUcsaUJBQWlCLENBQUM7QUFDakQsSUFBSSw2QkFBNkIsR0FBRyxzQkFBc0IsQ0FBQztBQUMzRCxBQUFPLFNBQVMsWUFBWSxDQUFDLElBQUksRUFBRTtJQUMvQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ3hFO0FBQ0Qs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
