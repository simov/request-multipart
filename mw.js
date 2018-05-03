
var lib = require('./lib/multipart')


module.exports = (multipart) => ({options, options: {headers}}) => {

  var content = Object.keys(headers)
    .find((name) => name.toLowerCase() === 'content-type')

  var contentType
  if (content) {
    contentType = headers[content]
  }

  var {contentType, body} = lib({multipart, contentType})
  headers['content-type'] = contentType

  return {options, body}

}
