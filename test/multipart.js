
var t = require('assert')
var fs = require('fs')
var path = require('path')
var http = require('http')

var formidable = require('formidable')

var compose = require('request-compose')
compose.Request.multipart = require('../')
var request = compose.client

var files = [
  {path: path.resolve(__dirname, 'fixtures/file1.png')},
  {path: path.resolve(__dirname, 'fixtures/file2.png')},
]
files[0].size = fs.statSync(files[0].path).size
files[1].size = fs.statSync(files[1].path).size


var read = (part) => new Promise((resolve) => {
  var buf = []
  part.on('data', (chunk) => buf.push(chunk))
  part.on('end', () => resolve(Buffer.concat(buf)))
})


describe('multipart', () => {
  var server

  before((done) => {
    server = http.createServer()
    server.on('request', (req, res) => {
      if (req.url === '/file') {
        res.writeHead(200, {'content-type': 'image/request'})
        fs.createReadStream(files[1].path).pipe(res)
      }
      else if (req.url === '/multipart') {
        // header
        t.ok(
          /^multipart\/related; boundary=[^\s;]+$/.test(req.headers['content-type']),
          'multipart/related + default boundary'
        )
        // body
        var form = new formidable.IncomingForm()
        form.parse(req)
        form.onPart = async (part) => {
          if (part.headers.name === 'string') {
            t.equal((await read(part)).toString(), 'value', 'string value')
          }
          else if (part.headers.name === 'buffer') {
            t.equal((await read(part)).length, 3, 'buffer value')
          }
          else if (part.headers.name === 'file') {
            t.equal((await read(part)).length, files[0].size, 'file value')
          }
          else if (part.headers.name === 'request') {
            t.equal((await read(part)).length, files[1].size, 'request value')
          }
        }
        form.on('end', () => {
          res.end()
        })
      }
    })
    server.listen(5000, done)
  })

  it('request', async () => {
    await request({
      method: 'POST',
      url: 'http://localhost:5000/multipart',
      multipart: [
        {name: 'string', body: 'value'},
        {name: 'buffer', body: Buffer.from([1, 2, 3])},
        {name: 'file', body: fs.createReadStream(files[0].path)},
        {name: 'request', body: (await compose.stream({url: 'http://localhost:5000/file'})).res},
      ]
    })
  })

  after((done) => {
    server.close(done)
  })
})
