const assert = require('assert');
const { mapResults } = require('../helper')
const { isEqual } = require('lodash')

const nodePingResult = [{
  '_id': '1',
  's': 1,
  'e': 1,
  'rt': 1,
  'l': { '1': 'ld' },
  'tg': 'https://s.com',
  'i': 1,
  'su': true
}]
const mapped = {
  id: '1',
  start: 1,
  end: 1,
  duration: 1,
  locations: '{"1":"ld"}',
  target: 'https://s.com',
  interval: 1,
  success: true
}

describe('helper', function () {
  describe('#mapResults()', function () {
    it('result should be array', function () {
      assert.ok(Array.isArray(mapResults(nodePingResult)))
    })

    it('should convert nodeping result to human readable format', function () {
      assert.ok(isEqual(mapResults(nodePingResult)[0], mapped))
    });
  });
});
