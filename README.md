
# request-multipart

[![npm-version]][npm] [![travis-ci]][travis] [![coveralls-status]][coveralls]

[multipart/form-data][form-data] and [multipart/related][related] support for [request-compose]

```js
var compose = require('request-compose')
compose.Request.multipart = require('request-multipart')
var fs = require('fs')

;(async () => {
  try {
    var {body} = await compose.client({
      method: 'POST',
      url: 'https://slack.com/api/files.upload',
      qs: {title: 'My Awesome Cat!'},
      headers: {authorization: 'Bearer [ACCESS TOKEN]'},
      multipart: {file: fs.readFileSync('cat.png')}
    })
    console.log(body)
  }
  catch (err) {
    console.error(err)
  }
})()
```

# Table of Contents

- [multipart/**form-data**](#multipart-form-data)
- [multipart/**related**](#multipart-related)
- [**examples**][examples]


# multipart/form-data

*value* can be `String`, `Buffer` or `Stream`

```js
multipart: {
  key: 'value'
}
```
```js
multipart: {
  key: [
    'value',
    'value',
  ]
}
```
```js
multipart: {
  key: {
    value: 'value',
    options: {filename: '', contentType: '', knownLength: 0}
  }
}
```

# multipart/related

*body* can be `String`, `Buffer` or `Stream`

```js
multipart: [
  {key: 'value', body: 'body'},
  {key: 'value', body: 'body'},
]
```


  [npm-version]: https://img.shields.io/npm/v/request-multipart.svg?style=flat-square (NPM Package Version)
  [travis-ci]: https://img.shields.io/travis/simov/request-multipart/master.svg?style=flat-square (Build Status - Travis CI)
  [coveralls-status]: https://img.shields.io/coveralls/simov/request-multipart.svg?style=flat-square (Test Coverage - Coveralls)
  [codecov-status]: https://img.shields.io/codecov/c/github/simov/request-multipart.svg?style=flat-square (Test Coverage - Codecov)

  [npm]: https://www.npmjs.com/package/request-multipart
  [travis]: https://travis-ci.org/simov/request-multipart
  [coveralls]: https://coveralls.io/github/simov/request-multipart
  [codecov]: https://codecov.io/github/simov/request-multipart?branch=master

  [request-compose]: https://www.npmjs.com/package/request-compose
  [examples]: https://github.com/simov/request-compose#examples

  [form-data]: https://tools.ietf.org/html/rfc2388
  [related]: https://tools.ietf.org/html/rfc2387
