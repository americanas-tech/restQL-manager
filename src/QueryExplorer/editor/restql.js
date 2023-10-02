import { StreamLanguage } from '@codemirror/language'

var keywords = {
  'use': true,
  'from': true,
  'to': true,
  'into': true,
  'update': true,
  'delete': true,
  'as': true,
  'headers': true,
  'depends-on': true,
  'with': true,
  'only': true,
  'timeout': true,
  'hidden': true,
  'ignore-errors': true,
  '->': true,
}

var builtIn = {
  'json': true,
  'no-multiplex': true,
  'flatten': true,
  'base64': true,
  'no-explode': true,
  'as-body': true,
  'as-query': true,
}

var atoms = {
  'true': true, 'false': true, 'null': true, 'undefined': true,
}

var cacheControl = /cache-control/

function tokenBase(stream, state) {
  var ch = stream.next()
  if (ch === '"' || ch === '\'' || ch === '`') {
    state.tokenize = tokenString(ch)
    return state.tokenize(stream, state)
  }

  if (/[\d.]/.test(ch)) {
    if (ch === '.') {
      stream.match(/^[0-9]+([eE][\-+]?[0-9]+)?/)
    } else if (ch === '0') {
      stream.match(/^[xX][0-9a-fA-F]+/) || stream.match(/^0[0-7]+/)
    } else {
      stream.match(/^[0-9]*\.?[0-9]*([eE][\-+]?[0-9]+)?/)
    }
    return 'number'
  }

  if (/[\[\]{}(),;:.]/.test(ch)) {
    return null
  }

  if (ch === '/') {
    if (stream.eat('*')) {
      state.tokenize = tokenComment
      return tokenComment(stream, state)
    }
    if (stream.eat('/')) {
      stream.skipToEnd()
      return 'comment'
    }
  }

  stream.eatWhile(/[\w$_\xa1-\uffff\-><]/)
  var cur = stream.current()

  if (keywords.propertyIsEnumerable(cur)) return 'keyword'
  if (atoms.propertyIsEnumerable(cur)) return 'atom'
  if (builtIn.propertyIsEnumerable(cur)) return 'typeName.standard'
  if (cacheControl.test(cur)) return 'error'
  if (/\$[a-zA-Z]+|=\s*[a-zA-Z]+(\.[a-zA-Z]+)+/.test(cur)) return 'variable-2'

  return 'variable'
}

function tokenString(quote) {
  return function(stream, state) {
    var escaped = false, next, end = false
    while ((next = stream.next()) != null) {
      if (next === quote && !escaped) {
        end = true
        break
      }
      escaped = !escaped && quote !== '`' && next === '\\'
    }
    if (end || !(escaped || quote === '`'))
      state.tokenize = tokenBase
    return 'string'
  }
}

function tokenComment(stream, state) {
  let maybeEnd = false, ch
  while (ch = stream.next()) {
    if (ch === '/' && maybeEnd) {
      state.tokenize = tokenBase
      break
    }
    maybeEnd = (ch === '*')
  }
  return 'comment'
}

// Interface

const restQLGrammar = {
  name: 'restQL',
  startState: function() {
    return {
      tokenize: null,
    }
  },

  token: function(stream, state) {
    if (stream.eatSpace()) return null
    return tokenBase(stream, state)
  },

  languageData: {
    commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
  },
}

export function restQL() {
  return StreamLanguage.define(restQLGrammar)
}