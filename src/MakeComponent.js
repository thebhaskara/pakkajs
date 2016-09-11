(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.MakeComponent = factory();
    }
}(this, function() {

    var componentNameCounter = 0;
    var componentIdCounter = 0;
    var bodyEl = document.getElementsByTagName('body')[0];
    var headEl = document.getElementsByTagName('head')[0];

    var addClass = function(el, className) {
        if (el.classList) {
            addClass = function(el, className) {
                el.classList.add(className);
            }
        } else {
            addClass = function(el, className) {
                el.className += ' ' + className;
            }
        }
        addClass(el, className);
    };

    var MakeComponent = function(options) {
        var componentName = options.name ||
            'component-' + componentNameCounter++;

        var addStyleSheet = function() {
            if (options.css) {
                var styleEl = document.createElement('style');
                styleEl.innerHTML = options.css;
                headEl.appendChild(styleEl);
            }
            addStyleSheet = function() {};
        }



        return function() {
            var that = this;
            addStyleSheet();
            var component = new options.controller();
            var div = document.createElement('div');

            div.innerHTML = options.html || '<div></div>';
            var $elements = that.$elements = div.children;
            for (var i = 0; i < $elements.length; i++) {
                addClass($elements[i], componentName);
            }
        }
    }


    return MakeComponent;
}));
