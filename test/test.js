const assert = require('assert');
const { mapResults } = require('../helper')
const { isEqual } = require('lodash')

const nodePingResult = [{
  '_id': '1111',
  's': 1111,
  'e': 1111,
  'rt': 18,
  'l': { '1111': 'ld' },
  'tg': 'https://xxxx.com',
  'i': 1,
  'su': true
}]
const mapped = {
  id: '1111',
  start: 1111,
  end: 1111,
  duration: 18,
  locations: '{ \'1111\': \'ld\' }',
  target: 'https://xxxx.com',
  interval: 1,
  success: true
}

describe('helper', function () {
  describe('#mapResults()', function () {
    it('result should be array', function (done) {
      assert.ok(Array.isArray(mapResults(nodePingResult)))
    })

    it('should convert nodeping result to human readable format', function () {
      assert.ok(isEqual(mapResults(nodePingResult)[0], mapped))
    })
  })
})
