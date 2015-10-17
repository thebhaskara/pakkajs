define([
    'app',
    'text!templates/header.html'
], function(app, HeaderTemplate) {
    //angular.module('myApp', ['ngMaterial'])
    app.controller('FullPageCtrl', ['$scope', 'MyService', function($scope, MyService) {
        $scope.HeaderTemplate = HeaderTemplate;
        $scope.MyService = MyService;
        
    }]);
    return app;
})
