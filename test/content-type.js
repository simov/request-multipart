
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


describe('content-type', () => {
  var server

  before((done) => {
    server = http.createServer()
    server.on('request', (req, res) => {
      // header
      if (req.url === '/form-data') {
        t.ok(
          /^multipart\/form-data; boundary=[^\s;]+$/.test(req.headers['content-type']),
          'multipart/form-data + default boundary'
        )
      }
      else if (req.url === '/form-data-boundary') {
        t.ok(
          /^multipart\/form-data; boundary=XXX$/.test(req.headers['content-type']),
          'multipart/form-data + custom boundary'
        )
      }
      else if (req.url === '/related') {
        t.ok(
          /^multipart\/related; boundary=[^\s;]+$/.test(req.headers['content-type']),
          'multipart/related + default boundary'
        )
      }
      else if (req.url === '/mixed') {
        t.ok(
          /^multipart\/mixed; boundary=[^\s;]+$/.test(req.headers['content-type']),
          'multipart/mixed + default boundary'
        )
      }
      else if (req.url === '/related-boundary') {
        t.ok(
          /^multipart\/related; boundary=XXX; type=text\/xml; start="<root>"$/
            .test(req.headers['content-type']),
          'multipart/related + custom header'
        )
      }
      // body
      var form = new formidable.IncomingForm()
      form.parse(req)
      form.onPart = async (part) => {
        // form-data
        if (part.name === 'string') {
          t.equal(part.mime, 'text/plain', 'string mime')
          t.equal((await read(part)).toString(), 'value', 'string value')
        }
        else if (part.name === 'buffer') {
          t.equal(part.mime, 'application/octet-stream', 'buffer mime')
          t.equal((await read(part)).length, 3, 'buffer value')
        }
        // related
        else if (part.headers.name === 'string') {
          t.equal((await read(part)).toString(), 'value', 'string value')
        }
        else if (part.headers.name === 'buffer') {
          t.equal((await read(part)).length, 3, 'buffer value')
        }
      }
      form.on('end', () => {
        res.end()
      })
    })
    server.listen(5000, done)
  })

  it('header', async () => {
    var test = ({type, path, header}) =>
      request({
        method: 'POST',
        url: `http://localhost:5000${path}`,
        headers: header ? {'content-type': header} : null,
        multipart: type === 'form-data' ?
        {
          string: 'value',
          buffer: Buffer.from([1, 2, 3]),
        } :
        [
          {name: 'string', body: 'value'},
          {name: 'buffer', body: Buffer.from([1, 2, 3])},
        ]
      })

    await test({type: 'form-data', path: '/form-data'})
    await test({type: 'form-data', path: '/form-data-boundary',
      header: 'multipart/form-data; boundary=XXX'})
    await test({type: 'related', path: '/related'})
    await test({type: 'related', path: '/mixed',
      header: 'multipart/mixed'})
    await test({type: 'related', path: '/related-boundary',
      header: 'multipart/related; boundary=XXX; type=text/xml; start="<root>"'})
  })

  after((done) => {
    server.close(done)
  })
})
