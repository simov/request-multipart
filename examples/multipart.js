
var request = require('../').extend({
  Request: {
    oauth: require('request-oauth'),
    multipart: require('../'),
  }
}).client

// ----------------------------------------------------------------------------

var fs = require('fs')
var path = require('path')

var file = {
  cat: path.resolve(__dirname, '../test/fixtures/cat.png'),
  beep: path.resolve(__dirname, '../test/fixtures/beep.mp3'),
}

// ----------------------------------------------------------------------------

;({

  asana: async () => {
    var token = '...' // no scopes
    var task = '...'
    await request({
      method: 'POST',
      url: `https://app.asana.com/api/1.0/tasks/${task}/attachments`,
      headers: {
        authorization: `Bearer ${token}`
      },
      multipart: {
        file: fs.createReadStream(file.cat)
      }
    })
  },

  box: async () => {
    var token = '...' // scope: root_readwrite
    await request({
      method: 'POST',
      url: 'https://upload.box.com/api/2.0/files/content',
      headers: {
        authorization: `Bearer ${token}`
      },
      multipart: {
        attributes: JSON.stringify({
          name: 'cat.png',
          parent: {id: 0},
        }),
        file: fs.createReadStream(file.cat)
      }
    })
  },

  drive: async () => {
    var token = '...' // scope: drive.file
    await request({
      method: 'POST',
      url: 'https://www.googleapis.com/upload/drive/v3/files',
      headers: {
        authorization: `Bearer ${token}`
      },
      qs: {
        uploadType: 'multipart'
      },
      multipart: [
        {
          'Content-Type': 'application/json',
          body: JSON.stringify({name: 'cat.png'})
        },
        {
          'Content-Type': 'image/png',
          body: fs.createReadStream(file.cat)
        }
      ]
    })
  },

  flickr: async () => {
    await request({
      method: 'POST',
      url: 'https://up.flickr.com/services/upload/',
      qs: {
        title: `Sent on ${new Date()}`,
        description: 'Hi',
        is_public: 0
      },
      oauth: { // scope: write
        consumer_key: '...',
        consumer_secret: '...',
        token: '...',
        token_secret: '...',
      },
      multipart: {
        title: `Sent on ${new Date()}`,
        description: 'Hi',
        is_public: 0,
        photo: fs.createReadStream(file.cat)
      }
    })
  },

  mailgun: async () => {
    var apikey = '...'
    var subdomain = '...'
    await request({
      method: 'POST',
      url: `https://api.mailgun.net/v3/${subdomain}/messages`,
      auth: {user: 'api', pass: apikey},
      multipart: {
        from: 'purest@mailinator.com',
        to: 'purest1@mailinator.com,purest2@mailinator.com',
        subject: 'Purest is awesome! (mailgun+attachments)',
        html: '<h1>Purest is awesome!</h1>',
        text: 'True idd!',
        attachment: [
          fs.createReadStream(file.cat),
          fs.createReadStream(file.beep)
        ]
      }
    })
  },

  slack: async () => {
    var token = '...' // scope: files:write:user
    await request({
      method: 'POST',
      url: 'https://slack.com/api/files.upload',
      headers: {
        authorization: `Bearer ${token}`
      },
      multipart: {
        file: fs.createReadStream(file.cat)
      }
    })
  },

  trello: async () => {
    var card = '...'
    await request({
      method: 'POST',
      url: `https://api.trello.com/1/cards/${card}/attachments`,
      qs: { // scope: read, write
        key: '...',
        token: '...'
      },
      multipart: {
        file: fs.createReadStream(file.cat)
      }
    })
  },

  twitter: async () => {
    await request({
      method: 'POST',
      url: 'https://api.twitter.com/1.1/statuses/update_with_media.json',
      oauth: { // app with write access
        consumer_key: '...',
        consumer_secret: '...',
        token: '...',
        token_secret: '...',
      },
      multipart: {
        status: `Sent on ${new Date()}`,
        'media[]': fs.createReadStream(file.cat)
      }
    })
  },

})[process.argv[2]]()
