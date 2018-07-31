require('module-alias/register')

const _ = require('lodash')
const figlet = require('figlet')
const config = require('../config.json')
const compareVersions = require('compare-versions')
const fs = require('fs')

// logger
const Logger = require('../src/bot/logging')
global.logger = new Logger()

const dropFiles = [
  'playlist.db', 'songrequest.db', 'ranks.db', 'prices.db',
  'commands.db', 'keywords.db', 'cooldowns.db', 'alias.db',
  'cooldowns.viewers.db', 'raffles.db', 'raffle_participants.db',
  'timers.db', 'timers.responses.db'
]

if (process.argv[2] && process.argv[2] === '--delete') {
  console.info(('-').repeat(56))
  console.info('Removing nedb files')

  if (fs.existsSync('db/nedb/')) {
    for (let file of dropFiles) {
      if (fs.existsSync(`db/nedb/${file}`)) {
        console.info(`- Removing db/nedb/${file}`)
        fs.unlinkSync(`db/nedb/${file}`)
      }
    }
  } else {
    console.info('Nothing to do')
  }
  console.info(('-').repeat(56))
  process.exit()
}

// db
const Database = require('../src/bot/databases/database')
global.db = new Database(false)

var runMigration = async function () {
  if (!global.db.engine.connected) {
    setTimeout(() => runMigration(), 1000)
    return
  }
  let info = await global.db.engine.find('info')
  const version = _.get(process, 'env.npm_package_version', '999.9.9-SNAPSHOT')

  let dbVersion = _.isEmpty(info) || _.isNil(_.find(info, (o) => !_.isNil(o.version)).version)
    ? '0.0.0'
    : _.find(info, (o) => !_.isNil(o.version)).version

  if (version === dbVersion && !_.includes(version, 'SNAPSHOT')) {
    process.exit()
  }

  console.log(figlet.textSync('MIGRATE', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  }))

  console.info(('-').repeat(56))
  console.info('Current bot version: %s', version)
  console.info('DB version: %s', dbVersion)
  console.info('DB engine: %s', config.database.type)
  console.info(('-').repeat(56))

  await updates(dbVersion, version)

  console.info(('-').repeat(56))
  console.info('All process DONE! Database is upgraded to %s', version)
  if (dbVersion !== '0.0.0') await global.db.engine.update('info', { version: dbVersion }, { version: version })
  else await global.db.engine.insert('info', { version: version })
  process.exit()
}
runMigration()

let updates = async (from, to) => {
  console.info('Performing update from %s to %s', from, to)
  console.info(('-').repeat(56))

  let migrate = []

  for (let table of _.values(migration)) {
    for (let i of table) {
      if (compareVersions(to.replace('-SNAPSHOT', ''), i.version) !== -1 && compareVersions(i.version, from.replace('-SNAPSHOT', '')) !== -1) {
        migrate.push(i)
      }
    }
  }
  for (let i of _.orderBy(migrate, 'version', 'asc')) { await i.do() }
}

let migration = {
  timers: [{
    version: '7.6.0',
    do: async () => {
      console.info('Moving timers to systems.timers')
      let items = await global.db.engine.find('timers')
      let processed = 0
      for (let item of items) {
        let newItem = await global.db.engine.insert('systems.timers', item)
        let responses = await global.db.engine.find('timers.responses', { timerId: String(item._id) })
        for (let response of responses) {
          response.timerId = String(newItem._id)
          await global.db.engine.insert('systems.timers.responses', response)
          processed++
        }
        processed++
      }
      await global.db.engine.remove('timers', {})
      await global.db.engine.remove('timers.responses', {})
      console.info(` => ${processed} processed`)
      console.info(` !! timers collection can be deleted`)
      console.info(` !! timers.responses collection can be deleted`)
    }
  }],
  songs: [{
    version: '7.6.0',
    do: async () => {
      console.info('Moving playlist to systems.songs.playlist')
      let items = await global.db.engine.find('playlist')
      let processed = 0
      for (let item of items) {
        delete item._id
        await global.db.engine.insert('systems.songs.playlist', item)
        processed++
      }
      await global.db.engine.remove('playlist', {})
      console.info(` => ${processed} processed`)
      console.info(` !! playlist collection can be deleted`)
    }
  },
  {
    version: '7.6.0',
    do: async () => {
      console.info('Moving bannedsong to systems.songs.ban')
      let items = await global.db.engine.find('bannedsong')
      let processed = 0
      for (let item of items) {
        delete item._id
        await global.db.engine.insert('systems.songs.ban', item)
        processed++
      }
      await global.db.engine.remove('bannedsong', {})
      console.info(` => ${processed} processed`)
      console.info(` !! bannedsong collection can be deleted`)
    }
  },
  {
    version: '7.6.0',
    do: async () => {
      console.info('Moving songrequest to systems.songs.request')
      let items = await global.db.engine.find('songrequest')
      let processed = 0
      for (let item of items) {
        delete item._id
        await global.db.engine.insert('systems.songs.request', item)
        processed++
      }
      await global.db.engine.remove('songrequest', {})
      console.info(` => ${processed} processed`)
      console.info(` !! songrequest collection can be deleted`)
    }
  }],
  ranks: [{
    version: '7.6.0',
    do: async () => {
      console.info('Moving ranks from ranks to systems.ranks')
      let items = await global.db.engine.find('ranks')
      let processed = 0
      for (let item of items) {
        delete item._id
        await global.db.engine.insert('systems.ranks', item)
        processed++
      }
      await global.db.engine.remove('ranks', {})
      console.info(` => ${processed} processed`)
      console.info(` !! ranks collection can be deleted`)
    }
  }],
  prices: [{
    version: '7.6.0',
    do: async () => {
      console.info('Moving prices from prices to systems.price')
      let items = await global.db.engine.find('prices')
      let processed = 0
      for (let item of items) {
        delete item._id
        item.command = `!${item.command}`
        await global.db.engine.insert('systems.price', item)
        processed++
      }
      await global.db.engine.remove('prices', {})
      console.info(` => ${processed} processed`)
      console.info(` !! prices collection can be deleted`)
    }
  }],
  moderation: [{
    version: '7.6.0',
    do: async () => {
      console.info('Moving blacklist and whitelist from settings to systems.moderation.settings')
      let processed = 0
      for (let list of ['whitelist', 'blacklist']) {
        let item = await global.db.engine.findOne('settings', { key: list })
        if (!_.isEmpty(item)) {
          for (let word of item.value) {
            await global.db.engine.insert('systems.moderation.settings', { category: 'lists', key: list, value: word, isMultiValue: true })
            processed++
          }
        }
        await global.db.engine.remove('settings', { key: list })
      }
      console.info(` => ${processed} processed`)
    }
  }],
  keywords: [{
    version: '7.6.0',
    do: async () => {
      console.info('Moving keywords to systems.keywords')
      let items = await global.db.engine.find('keywords')
      let processed = 0
      for (let item of items) {
        delete item._id
        await global.db.engine.insert('systems.keywords', item)
        processed++
      }
      await global.db.engine.remove('keywords', {})
      console.info(` => ${processed} processed`)
      console.info(` !! keywords collection can be deleted`)
    }
  }],
  customcommands: [{
    version: '7.6.0',
    do: async () => {
      console.info('Moving custom commands from customcommands to systems.customcommands')
      let items = await global.db.engine.find('commands')
      let processed = 0
      for (let item of items) {
        delete item._id
        item.command = `!${item.command}`
        await global.db.engine.insert('systems.customcommands', item)
        processed++
      }
      await global.db.engine.remove('commands', {})
      console.info(` => ${processed} processed`)
      console.info(` !! commands collection can be deleted`)
    }
  }],
  cooldown: [{
    version: '7.6.0',
    do: async () => {
      console.info('Moving cooldowns from cooldowns to systems.cooldown')
      let items = await global.db.engine.find('cooldowns')
      let processed = 0
      for (let item of items) {
        delete item._id
        await global.db.engine.insert('systems.cooldown', item)
        processed++
      }
      await global.db.engine.remove('cooldowns', {})
      console.info(` => ${processed} processed`)
      console.info(` !! cooldowns collections can be deleted`)
    }
  }],
  alias: [{
    version: '7.0.0',
    do: async () => {
      console.info('Migration alias to %s', '7.0.0')
      let alias = await global.db.engine.find('alias')
      const constants = require('../src/bot/constants')
      for (let item of alias) {
        await global.db.engine.update('alias', { _id: item._id.toString() }, { permission: constants.VIEWERS })
      }
    }
  }, {
    version: '7.6.0',
    do: async () => {
      console.info('Moving alias from alias to systems.alias')
      let items = await global.db.engine.find('alias')
      let processed = 0
      for (let item of items) {
        delete item._id
        item.alias = `!${item.alias}`
        item.command = `!${item.command}`
        await global.db.engine.insert('systems.alias', item)
        processed++
      }
      await global.db.engine.remove('alias', {})
      console.info(` => ${processed} processed`)
      console.info(` !! alias collection can be deleted`)
    }
  }],
  widgets: [{
    version: '7.6.0',
    do: async () => {
      console.info('Removing joinpart widget')
      let items = await global.db.engine.find('widgets', { id: 'joinpart' })
      await global.db.engine.remove('widgets', { id: 'joinpart' })
      let processed = items.length
      console.info(` => ${processed} deleted joinpart widgets`)
    }
  }],
  cache: [{
    version: '7.5.0',
    do: async () => {
      console.info('Moving gameTitles from cache to cache.titles')
      let cache = await global.db.engine.findOne('cache', { key: 'gamesTitles' })
      let processed = 0
      if (!_.isEmpty(cache)) {
        for (let [game, titles] of Object.entries(cache['games_and_titles'])) {
          for (let title of titles) {
            await global.db.engine.insert('cache.titles', { game, title })
            processed++
          }
        }
        await global.db.engine.remove('cache', { key: 'gamesTitles' })
      }
      console.info(` => ${processed} titles`)
    }
  }],
  users: [{
    version: '7.3.0',
    do: async () => {
      console.info('Removing users incorrect created_at time %s', '7.3.0')
      let users = await global.db.engine.find('users')
      for (let user of users) {
        if (_.isNil(user.time)) continue
        await global.db.engine.remove('users', { _id: String(user._id) })
        delete user._id; delete user.time.created_at
        await global.db.engine.insert('users', user)
      }
    }
  }, {
    version: '7.5.0',
    do: async () => {
      console.info('Removing users is.online')
      let users = await global.db.engine.find('users')
      let updated = 0
      for (let user of users) {
        if (_.isNil(user.is) || _.isNil(user.is.online)) continue
        updated++
        await global.db.engine.remove('users', { _id: String(user._id) })
        delete user._id; delete user.is.online
        await global.db.engine.insert('users', user)
      }
      console.info(` => ${updated} users`)
    }
  }, {
    version: '7.4.0',
    do: async () => {
      console.info('Migration of messages stats')
      let users = await global.db.engine.find('users')
      let updated = 0
      for (let user of users) {
        if (_.isNil(user.stats) || _.isNil(user.stats.messages)) continue
        updated++
        await global.db.engine.remove('users', { _id: String(user._id) })
        await global.db.engine.insert('users.messages', { username: user.username, messages: parseInt(user.stats.messages, 10) })
        delete user._id; delete user.stats.messages
        await global.db.engine.insert('users', user)
      }
      console.info(` => ${updated} users`)
    }
  }, {
    version: '7.6.0',
    do: async () => {
      console.info('Migration of watched stats')
      let users = await global.db.engine.find('users')
      let updated = 0
      for (let user of users) {
        if (_.isNil(user.time) || _.isNil(user.time.watched)) continue
        updated++
        await global.db.engine.remove('users', { _id: String(user._id) })
        await global.db.engine.insert('users.watched', { username: user.username, watched: parseInt(user.time.watched, 10) })
        delete user._id; delete user.time.watched
        await global.db.engine.insert('users', user)
      }
      console.info(` => ${updated} users`)
    }
  }],
  points: [{
    version: '7.3.0',
    do: async () => {
      console.info('Migration points to %s', '7.3.0')
      let users = await global.db.engine.find('users')
      for (let user of users) {
        if (_.isNil(user.points)) continue
        await global.db.engine.remove('users', { _id: user._id.toString() })
        await global.db.engine.insert('users.points', { username: user.username, points: parseInt(user.points, 10) })

        delete user._id; delete user.points
        await global.db.engine.insert('users', user)
      }
    }
  }],
  commands: [{
    version: '7.0.0',
    do: async () => {
      console.info('Migration commands to %s', '7.0.0')
      let commands = await global.db.engine.find('commands')
      const constants = require('../src/bot/constants')
      for (let command of commands) {
        await global.db.engine.update('commands', { _id: command._id.toString() }, { permission: constants.VIEWERS })
      }
    }
  }],
  bits: [{
    version: '7.0.0',
    do: async () => {
      console.info('Migration bits to %s', '7.0.0')
      let users = await global.db.engine.find('users')
      for (let user of users) {
        if (!_.has(user, 'stats.bits') || _.isNil(user.stats.bits)) continue // skip if bits are null/undefined
        await global.db.engine.remove('users', { username: user.username })
        await global.db.engine.insert('users.bits', { username: user.username, amount: user.stats.bits, message: 'Migrated from 6.x', timestamp: _.now() })
        delete user.stats.bits
        delete user._id
        await global.db.engine.update('users', { username: user.username }, user)
      }
    }
  }]
}
