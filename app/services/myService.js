define([
    'app'
], function(app) {
    app.factory('MyService', function() {
    	var that = this;
    	_name = 'Bhaskar';

		setName = function(name){
			_name = name;
		}

		getName = function(){
			return _name;
		}

		return function() {
			_name: 'sasdsdf'
		}
        
    });
    return app;
})
