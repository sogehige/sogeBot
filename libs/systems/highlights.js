'use strict'

// 3rdparty libraries
var _ = require('lodash')
var moment = require('moment')
require('moment-precise-range-plugin')
const debug = require('debug')
const cluster = require('cluster')
const axios = require('axios')

// bot libraries
const constants = require('../constants')
const config = require('../../config.json')
const System = require('./_interface')

const ERROR_STREAM_NOT_ONLINE = '1'

/*
 * !highlight <?description> - save highlight with optional description
 * !highlight list           - get list of highlights in current running or latest stream
 */

class Highlights extends System {
  constructor () {
    const collection = {
      data: 'systems.highlights',
      settings: 'systems.highlights.settings'
    }
    const settings = {
      commands: [
        { name: '!highlight list', permission: constants.OWNER_ONLY },
        { name: '!highlight', permission: constants.OWNER_ONLY }
      ]
    }
    super({collection, settings})

    if (cluster.isMaster) {
      global.panel.addMenu({category: 'manage', name: 'highlights', id: 'highlights/list'})

      cluster.on('message', (worker, message) => {
        if (message.type !== 'highlight') return
        this.main(message.opts)
      })
    }
  }

  sockets () {
    this.socket.on('connection', (socket) => {
      socket.on('highlight', () => {
        this.main({ parameters: '', sender: null })
      })
      socket.on('list', async (cb) => {
        cb(null, await global.db.engine.find(this.collection.data))
      })
      socket.on('delete', async (_id, cb) => {
        await global.db.engine.remove(this.collection.data, { _id })
        cb(null)
      })
      socket.on('settings', async (cb) => {
        cb(null, await this.getAllSettings())
      })
      socket.on('settings.update', async (data, cb) => {
        const enabled = await this.settings.enabled
        for (let [key, value] of Object.entries(data)) {
          if (key === 'enabled' && value !== enabled) this.status(value)
          else if (key === 'commands') {
            for (let [defaultValue, currentValue] of Object.entries(value)) {
              this.settings.commands[defaultValue] = currentValue
            }
          } else {
            this.settings[key] = value
          }
        }
        setTimeout(() => cb(null), 1000)
      })
    })
  }

  async main (opts) {
    if (cluster.isWorker) {
      // as we are using API, go through master
      return process.send({ type: 'highlight', opts })
    } else {
      const d = debug('systems:highlight:highlight')
      const cid = await global.cache.channelId()
      const when = await global.cache.when()
      const url = `https://api.twitch.tv/helix/videos?user_id=${cid}&type=archive&first=1`

      const needToWait = _.isNil(cid)
      if (needToWait) {
        setTimeout(() => this.highlight(opts), 1000)
        return
      }

      try {
        if (_.isNil(when.online)) throw Error(ERROR_STREAM_NOT_ONLINE)

        d('Searching in API')
        // we need to load video id
        const request = await axios.get(url, {
          headers: {
            'Authorization': 'Bearer ' + config.settings.bot_oauth.split(':')[1],
            'Client-ID': config.settings.client_id
          }
        })
        let highlight = request.data.data[0]
        d(highlight)
        let timestamp = moment.preciseDiff(moment().valueOf(), moment(when.online).valueOf(), true)
        highlight.timestamp = { hours: timestamp.hours, minutes: timestamp.minutes, seconds: timestamp.seconds }
        highlight.game = _.get(await global.db.engine.findOne('api.current', { key: 'game' }), 'value', 'n/a')
        highlight.title = _.get(await global.db.engine.findOne('api.current', { key: 'status' }), 'value', 'n/a')

        this.add(highlight, timestamp, opts.sender)
        global.panel.io.emit('api.stats', { data: request.data.data, timestamp: _.now(), call: 'updateChannelViews', api: 'helix', endpoint: url, code: request.status, remaining: 'n/a' })
      } catch (e) {
        if (e.message !== ERROR_STREAM_NOT_ONLINE) {
          global.panel.io.emit('api.stats', { timestamp: _.now(), call: 'updateChannelViews', api: 'helix', endpoint: url, code: `${e.status} ${_.get(e, 'body.message', e.statusText)}`, remaining: 'n/a' })
          global.log.error(e.stack)
        }
        switch (e.message) {
          case ERROR_STREAM_NOT_ONLINE:
            global.commons.sendMessage(global.translate('highlights.offline'), opts.sender)
            break
        }
      }
    }
  }

  add (highlight, timestamp, sender) {
    global.commons.sendMessage('/marker', { username: global.commons.getOwner() }) // user /marker as well for highlights
    global.commons.sendMessage(global.translate('highlights.saved')
      .replace(/\$hours/g, (timestamp.hours < 10) ? '0' + timestamp.hours : timestamp.hours)
      .replace(/\$minutes/g, (timestamp.minutes < 10) ? '0' + timestamp.minutes : timestamp.minutes)
      .replace(/\$seconds/g, (timestamp.seconds < 10) ? '0' + timestamp.seconds : timestamp.seconds), sender)

    global.db.engine.insert(this.collection.data, highlight)
  }

  async list (opts) {
    let highlights = await global.db.engine.find(this.collection.data)
    const sortedHighlights = _.orderBy(highlights, 'id', 'desc')
    const latestStreamId = sortedHighlights.length > 0 ? sortedHighlights[0].id : null

    if (_.isNull(latestStreamId)) {
      global.commons.sendMessage(global.translate('highlights.list.empty'), opts.sender)
      return
    }
    highlights = _.filter(highlights, function (o) { return o.id === latestStreamId })
    let list = []

    for (let highlight of highlights) {
      list.push(highlight.timestamp.hours + 'h' +
        highlight.timestamp.minutes + 'm' +
        highlight.timestamp.seconds + 's')
    }
    global.commons.sendMessage(global.translate(list.length > 0 ? 'highlights.list.items' : 'highlights.list.empty')
      .replace(/\$items/g, list.join(', ')), opts.sender)
  }
}

module.exports = new Highlights()
