(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.Component = factory();
    }
}(this, function() {

    var uniqueId = 0,
        bodyEl = document.getElementsByTagName("body")[0],
        headEl = document.getElementsByTagName("head")[0];

    BaseViewModel = function(options) {
        var componentName = options.name || 'component-' + uniqueId++,

            controller = options.controller;


        return function() {

            var scope = this,
                div = document.createElement('div');

            // getting DOM
            div.innerHTML = options.html || '';

            var elements = scope.$elements = div.childNodes.length > 0 ? div.childNodes || div;

        };
    };

    return BaseViewModel;
}));
