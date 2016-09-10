(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.BaseViewModel = factory();
    }
}(this, function() {

    var uniqueId = 0,
        bodyEl = document.getElementsByTagName("body")[0],
        headEl = document.getElementsByTagName("head")[0];
    BaseViewModel = function(options) {
        return function() {

        };
        var moduleName = options.moduleName || 'module' + uniqueId++,
            controller = options.controller,
            div = document.createElement('div'),
            elements;

        // getting DOM
        div.innerHTML = options.html || '';
        elements = controller.prototype.elements = div.childNodes.length > 0 ? div.childNodes || div;


        return controller;
    };

    return BaseViewModel;
}));
