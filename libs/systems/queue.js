'use strict'

// 3rdparty libraries
var _ = require('lodash')
var util = require('util')
// bot libraries
var constants = require('../constants')
var log = global.log

/*
 * !queue               - gets an info whether queue is opened or closed
 * !queue open          - open a queue
 * !queue close         - close a queue
 * !queue pick [amount] - pick [amount] (optional) of users from queue
 * !queue join          - join a queue
 * !queue clear         - clear a queue
 */
function Queue () {
  this.locked = true
  this.users = []

  if (global.commons.isSystemEnabled(this)) {
    global.parser.register(this, '!queue pick', this.pick, constants.OWNER_ONLY)
    global.parser.register(this, '!queue join', this.join, constants.VIEWERS)
    global.parser.register(this, '!queue clear', this.clear, constants.OWNER_ONLY)
    global.parser.register(this, '!queue close', this.close, constants.OWNER_ONLY)
    global.parser.register(this, '!queue open', this.open, constants.OWNER_ONLY)
    global.parser.register(this, '!queue', this.info, constants.VIEWERS)

    this._update(this)
  }
}

Queue.prototype._update = function (self) {
  global.botDB.findOne({ _id: 'queue' }, function (err, item) {
    if (err) return log.error(err)
    if (_.isNull(item)) return

    self.locked = item.locked
    self.users = item.users
  })
}

Queue.prototype._save = function () {
  var queue = {
    locked: this.locked,
    users: this.users
  }
  global.botDB.update({ _id: 'queue' }, { $set: queue }, { upsert: true })
}

Queue.prototype.setLocked = function (locked) {
  this.locked = locked
  this._save()
}

Queue.prototype.addUser = function (username) {
  if (this.users.indexOf(username) === -1) {
    this.users.push(username)
    this._save()
  }
}

Queue.prototype.getUser = function () {
  var user = this.users.shift()
  this._save()
  return user
}

Queue.prototype.info = function (self, sender) {
  global.commons.sendMessage(global.translate(self.locked ? 'queue.info.closed' : 'queue.info.opened'), sender)
}

Queue.prototype.open = function (self, sender) {
  self.setLocked(false)
  global.commons.sendMessage(global.translate('queue.open'), sender)
}

Queue.prototype.close = function (self, sender) {
  self.setLocked(true)
  global.commons.sendMessage(global.translate('queue.close'), sender)
}

Queue.prototype.join = function (self, sender) {
  if (!self.locked) {
    self.addUser(sender.username)
    global.commons.sendMessage(global.translate('queue.join.opened'), sender)
  } else {
    global.commons.sendMessage(global.translate('queue.join.closed'), sender)
  }
}

Queue.prototype.clear = function (self, sender) {
  self.users = []
  global.commons.sendMessage(global.translate('queue.clear'), sender)
}

Queue.prototype.pick = function (self, sender, text) {
  var input = text.match(/^(\d+)?/)[0]
  var amount = (input === '' ? 1 : parseInt(input, 10))
  var picked = []

  do {
    amount -= 1
    picked.push('@' + self.getUser())
  } while (amount > 0)

  global.commons.sendMessage(global.translate('queue.picked')
    .replace('(users)', picked.join(', ')), sender)
}

module.exports = new Queue()
