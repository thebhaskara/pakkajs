define([
    'app'
], function(app) {
    app.controller('HeaderCtrl', ['$scope', 'MyService', function($scope, MyService) {
		$scope.search = "he he he";
        $scope.mm = MyService;
    }]);
    return app;
})
