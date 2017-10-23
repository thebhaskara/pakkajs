var app = pakka.create({
    elementsSelector: '#replacerapp'
});

var KeyValueItem = pakka({
    html: document.getElementById('keyValueHtml').innerHTML,
});

app.addKeyValue = function (e) {
	addKeyValue();
}
var addKeyValue = function (key, value) {
	app.$getSet('keyValues', function(keyValues){
		keyValues = keyValues || [];

		var comp = new KeyValueItem();
		app.$listen(comp, 'key', debouncedMakeOutputText);
		app.$listen(comp, 'value', debouncedMakeOutputText);
		if(key){
			comp.$set('key', key);
		}
		if(value){
			comp.$set('value', value);
		}
		keyValues.push(comp);

		return keyValues;
	})
};

app.$watch('inputText', _.debounce(function(inputText){
	var pairs = {};

	var keyValues = app.$get('keyValues');
	_.each(keyValues, function(keyVal){
		var key = keyVal.$get('key');
		var value = keyVal.$get('value');
		pairs[key] = value;
	});

	var splits = inputText.split('{');
	splits.shift();
	_.each(splits, function(split){
		var s = split.split('}');
		pairs[s[0]] = pairs[s[0]] || '';
	});

	_.each(keyValues, function(asdf){
		asdf.$destroy();
	})
	app.$set('keyValues', []);
	_.each(pairs, function(value, key){
		addKeyValue(key, value);
	})
}, 500));

var makeOutputText = function(){
	var inputText = app.$get('inputText');

	var keyValues = app.$get('keyValues');

	_.each(keyValues, function(keyVal){
		var key = keyVal.$get('key');
		var value = keyVal.$get('value');

		inputText = inputText.replace(new RegExp('{'+key+'}', 'g'), value);
	});

	app.$set('outputText', inputText);
}
var debouncedMakeOutputText = _.debounce(makeOutputText, 200);