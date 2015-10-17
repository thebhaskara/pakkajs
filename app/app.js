define([
    'angular',
    'text!templates/home.html',
    'text!templates/kpi-home.html',
    // using semantic ui
    //'angular-material',
    'angular-route',
], function(angular, HomeTemplate, KpiHomeTemplate) {
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['myApp']);
        require(['semantic-ui'], function() {
            $('.ui.dropdown').dropdown();

            $('.alarm.icon')
                .popup({
                    inline: true,
                    hoverable: true,
                    popup: '.ui.flowing.basic.admission.popup',
                    position: 'bottom right',
                    delay: {
                        show: 300,
                        hide: 800
                    }
                });

        });
    });
    return angular.module('myApp', [
        'ngRoute'
    ]).config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
            when('/home', {
                template: HomeTemplate,
                controller: 'HomeCtrl'
            }).
            when('/home/kpi', {
                template: KpiHomeTemplate,
                controller: 'HomeCtrl'
            }).
            otherwise({
                redirectTo: '/home'
            });
        }
    ]);
})
