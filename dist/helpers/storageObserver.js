import { EventEmitter } from '@angular/core';
var StorageObserverHelper = (function () {
    function StorageObserverHelper() {
    }
    StorageObserverHelper.observe = function (sType, sKey) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            return this.observers[oKey];
        return this.observers[oKey] = new EventEmitter();
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
export { StorageObserverHelper };
StorageObserverHelper.observers = {};
//# sourceMappingURL=storageObserver.js.map