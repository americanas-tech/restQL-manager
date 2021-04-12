import CodeMirror from 'codemirror'
import 'codemirror/addon/mode/simple'

CodeMirror.defineSimpleMode('restql', {
  // The start state contains the rules that are intially used
  start: [
    { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: 'string' },
    {
      regex: /(?:use|from|to|into|update|delete|as|headers|depends-on|with|only|json|no-multiplex|timeout|hidden|ignore-errors)/,
      token: ['keyword'],
    },
    { regex: /->/, token: 'keyword' },
    { regex: /\/\/.*/, token: 'comment' },
    {
      regex: /(?:json|no-multiplex|flatten|base64|no-explode|as-body|as-query)/,
      token: ['builtin'],
    },
    { regex: /cache-control/, token: 'error' },
    { regex: /true|false|null|undefined/, token: 'atom' },
    {
      regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
      token: 'number',
    },
    { regex: /\$[a-zA-Z]+|=\s*[a-zA-Z]+(\.[a-zA-Z]+)+/, token: 'variable-3' },
    { regex: /[-+/*=<>!]+/, token: 'operator' },
  ],
})
