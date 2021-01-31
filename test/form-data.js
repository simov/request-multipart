
var t = require('assert')
var fs = require('fs')
var path = require('path')
var http = require('http')

var formidable = require('formidable')

var compose = require('request-compose')
compose.Request.multipart = require('../')
var request = compose.client

var files = [
  {path: path.resolve(__dirname, 'fixtures/cat.png')},
  {path: path.resolve(__dirname, 'fixtures/cat2.png')},
]
files[0].size = fs.statSync(files[0].path).size
files[1].size = fs.statSync(files[1].path).size


var read = (part) => new Promise((resolve) => {
  var buf = []
  part.on('data', (chunk) => buf.push(chunk))
  part.on('end', () => resolve(Buffer.concat(buf)))
})


describe('form-data', () => {
  var server

  before((done) => {
    server = http.createServer()
    server.on('request', (req, res) => {
      if (req.url === '/file') {
        res.writeHead(200, {
          'content-type': 'image/request',
          'content-length': files[1].size
        })
        fs.createReadStream(files[1].path).pipe(res)
      }
      else if (req.url === '/multipart') {
        // header
        t.ok(
          /^multipart\/form-data; boundary=[^\s;]+$/.test(req.headers['content-type']),
          'multipart/form-data + default boundary'
        )
        t.equal(
          req.headers['content-length'],
          77014,
          'content-length should be set'
        )
        // body
        var form = new formidable.IncomingForm()
        form.parse(req)
        form.onPart = async (part) => {
          if (part.name === 'string') {
            t.equal(part.mime, 'text/plain', 'string mime')
            t.equal((await read(part)).toString(), 'value', 'string value')
          }
          else if (part.name === 'buffer') {
            t.equal(part.mime, 'application/octet-stream', 'buffer mime')
            t.equal((await read(part)).length, 3, 'buffer value')
          }
          else if (part.name === 'file') {
            t.equal(part.mime, 'image/png', 'file mime')
            t.equal((await read(part)).length, files[0].size, 'file value')
            t.equal(part.filename, 'cat.png', 'file name')
          }
          else if (part.name === 'request') {
            t.equal(part.mime, 'image/request', 'request mime')
            t.equal((await read(part)).length, files[1].size, 'request value')
          }
          else if (part.name === 'options') {
            t.equal(part.mime, 'image/custom', 'options mime')
            t.equal((await read(part)).length, files[0].size, 'options value')
            t.equal(part.filename, 'topsecret.jpg', 'options name')
          }
          else if (part.name === 'batch') {
            if (part.filename === 'cat.png') {
              t.equal(part.mime, 'image/png', 'batch mime')
              t.equal((await read(part)).length, files[0].size, 'batch value')
              t.equal(part.filename, 'cat.png', 'batch name')
            }
            else if (part.filename === 'cat2.png') {
              t.equal(part.mime, 'image/png', 'batch mime')
              t.equal((await read(part)).length, files[1].size, 'batch value')
              t.equal(part.filename, 'cat2.png', 'batch name')
            }
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
      multipart: {
        string: 'value',
        buffer: Buffer.from([1, 2, 3]),
        file: fs.createReadStream(files[0].path),
        request: (await compose.stream({url: 'http://localhost:5000/file'})).res,
        options: {
          body: fs.readFileSync(files[0].path),
          options: {
            name: 'topsecret.jpg',
            type: 'image/custom',
            // knownLength: 5
          }
        },
        batch: [
          fs.createReadStream(files[0].path),
          fs.createReadStream(files[1].path)
        ]
      }
    })
  })

  after((done) => {
    server.close(done)
  })
})
