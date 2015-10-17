/*global require*/
'use strict';

require.config({
    paths: {
        'angular': '../bower_components/angular/angular',
        'angular-animate': '../bower_components/angular-animate/angular-animate',
        'angular-aria': '../bower_components/angular-aria/angular-aria',
        'angular-material': '../bower_components/angular-material/angular-material',
        'angular-route': '../bower_components/angular-route/angular-route',
        'text': '../bower_components/requirejs-text/text',
        'semantic-ui': '../bower_components/semantic-ui/dist/semantic',
        'jquery': '../bower_components/jquery/dist/jquery'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'jquery': {
            exports: 'jquery'
        },
        'semantic-ui': {
            deps: ['jquery']
        },
        'angular-animate': {
            deps: ['angular']
        },
        'angular-route': {
            deps: ['angular']
        },
        'angular-aria': {
            deps: ['angular']
        },
        'angular-material': {
            deps: ['angular', 'angular-animate', 'angular-aria']
        }
    },
    deps: [
        'app',
        'directives/dynamic',
        'services/myService',
        'controllers/page',
        'controllers/header',
        'controllers/home'
    ]
});