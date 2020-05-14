var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var { getGamesList } = require('../src/controlCenter/controller');

describe("Routes", function() {
  describe("GET Games", function() {

      it("should respond", function() {
        //TODO, esto es un copy paste de internet, y obviamente falla
        var req,res,spy;

        req = res = {};
        spy = res.send = sinon.spy();

        getGamesList(req, res);
        expect(spy.calledOnce).to.equal(true);
      });     

  });
});