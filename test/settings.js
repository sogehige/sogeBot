/* global describe it before beforeEach afterEach */

const fs = require('fs')
const assert = require('chai').assert
const until = require('test-until')
const _ = require('lodash')
require('mocha-sinon')

// setup config
const config = require('../config.json')
config.settings.bot_owners = 'soge__'
config.settings.broadcaster_username = 'soge__'
fs.writeFileSync('../config.json', JSON.stringify(config))

// users
const owner = { username: 'soge__' }

// load up a bot
require('../main.js')

describe('Settings tests', () => {
  before(() => {
    global.configuration.register('testBool', 'settings.testBool', 'bool', true)
    global.configuration.register('testNumber', 'settings.testNumber', 'number', 1)
    global.configuration.register('testString', 'settings.testString', 'string', 'test')
  })
  beforeEach(async function () {
    this.sinon.stub(global.commons, 'sendMessage')
  })
  describe('testBool', () => {
    describe('/bool/', function () {
      before(function () {
        global.parser.parse(owner, '!set testBool false')
      })
      it('success message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, '{missing_translation: en.settings.testBool.false}')
      })
      it('should be set in db', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testBool' })
        assert.isNotEmpty(item)
        assert.equal(item.value, false)
      })
    })
    describe('/string/', function () {
      before(function () {
        global.parser.parse(owner, '!set testBool test')
      })
      it('fail message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, 'Sorry, $sender, cannot parse !set command.')
      })
      it('should not be set in db', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testBool' })
        assert.notEqual(item.value, 'test')
      })
    })
    describe('/number/', function () {
      before(function () {
        global.parser.parse(owner, '!set testBool 10')
      })
      it('fail message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, 'Sorry, $sender, cannot parse !set command.')
      })
      it('should not be set in db', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testBool' })
        assert.notEqual(item.value, 10)
      })
    })
    describe('/empty/', function () {
      before(function () {
        global.parser.parse(owner, '!set testBool')
      })
      it('success message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, '{missing_translation: en.settings.testBool.true}')
      })
      it('should be set in db as default', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testBool' })
        assert.equal(item.value, true)
      })
    })
  })
  describe('testNumber', () => {
    describe('/number/', function () {
      before(function () {
        global.parser.parse(owner, '!set testNumber 10')
      })
      it('success message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, '{missing_translation: en.settings.testNumber}')
      })
      it('should be set in db', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testNumber' })
        assert.isNotEmpty(item)
        assert.equal(item.value, 10)
      })
    })
    describe('/string/', function () {
      before(function () {
        global.parser.parse(owner, '!set testNumber test')
      })
      it('fail message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, 'Sorry, $sender, cannot parse !set command.')
      })
      it('should not be set in db', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testNumber' })
        assert.notEqual(item.value, 'test')
      })
    })
    describe('/bool/', function () {
      before(function () {
        global.parser.parse(owner, '!set testNumber true')
      })
      it('fail message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, 'Sorry, $sender, cannot parse !set command.')
      })
      it('should not be set in db', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testNumber' })
        assert.notEqual(item.value, true)
      })
    })
    describe('/empty/', function () {
      before(function () {
        global.parser.parse(owner, '!set testNumber')
      })
      it('success message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, '{missing_translation: en.settings.testNumber}')
      })
      it('should be set in db as default', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testNumber' })
        assert.equal(item.value, 1)
      })
    })
  })
  describe('testString', () => {
    describe('/string/', function () {
      before(function () {
        global.parser.parse(owner, '!set testString testMe!')
      })
      it('success message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, '{missing_translation: en.settings.testString}')
      })
      it('should be set in db', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testString' })
        assert.isNotEmpty(item)
        assert.equal(item.value, 'testMe!')
      })
    })
    describe('/number/', function () {
      before(function () {
        global.parser.parse(owner, '!set testString 10')
      })
      it('fail message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, 'Sorry, $sender, cannot parse !set command.')
      })
      it('should not be set in db', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testString' })
        assert.notEqual(item.value, 10)
      })
    })
    describe('/bool/', function () {
      before(function () {
        global.parser.parse(owner, '!set testString true')
      })
      it('fail message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, 'Sorry, $sender, cannot parse !set command.')
      })
      it('should not be set in db', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testString' })
        assert.notEqual(item.value, true)
      })
    })
    describe('/empty/', function () {
      before(function () {
        global.parser.parse(owner, '!set testString')
      })
      it('success message expected', async function () {
        await until(() => global.commons.sendMessage.calledOnce, 5000)

        let message = global.commons.sendMessage.getCall(0).args[0]
        assert.equal(message, '{missing_translation: en.settings.testString}')
      })
      it('should be set in db as default', async function () {
        let item = await global.db.engine.findOne('settings', { key: 'testString' })
        assert.equal(item.value, 'test')
      })
    })
  })
})
