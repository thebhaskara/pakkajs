//var assert = require('assert');
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function(done) {
            // assert.equal(-1, [1,2,3].indexOf(4));
            setTimeout(function() {
            	tryCatch(function(){
            		expect([1, 2, 3].indexOf(4)).to.eql(-1);
            	}, done);
            }, 1000)
        });
    });
});
