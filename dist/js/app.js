(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\base64-js\\lib\\b64.js","/..\\..\\node_modules\\base64-js\\lib")
},{"buffer":2,"e/U+97":6}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\buffer\\index.js","/..\\..\\node_modules\\buffer")
},{"base64-js":1,"buffer":2,"e/U+97":6,"ieee754":3}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\ieee754\\index.js","/..\\..\\node_modules\\ieee754")
},{"buffer":2,"e/U+97":6}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*=============================================================================
	Author:			Eric M. Barnard - @ericmbarnard								
	License:		MIT (http://opensource.org/licenses/mit-license.php)		
																				
	Description:	Validation Library for KnockoutJS							
	Version:		2.0.3											
===============================================================================
*/
/*globals require: false, exports: false, define: false, ko: false */

(function (factory) {
	// Module systems magic dance.

	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		// CommonJS or Node: hard-coded dependency on "knockout"
		factory(require("knockout"), exports);
	} else if (typeof define === "function" && define["amd"]) {
		// AMD anonymous module with hard-coded dependency on "knockout"
		define(["knockout", "exports"], factory);
	} else {
		// <script> tag: use the global `ko` object, attaching a `mapping` property
		factory(ko, ko.validation = {});
	}
}(function ( ko, exports ) {

	if (typeof (ko) === 'undefined') {
		throw new Error('Knockout is required, please ensure it is loaded before loading this validation plug-in');
	}

	// create our namespace object
	ko.validation = exports;

	var kv = ko.validation,
		koUtils = ko.utils,
		unwrap = koUtils.unwrapObservable,
		forEach = koUtils.arrayForEach,
		extend = koUtils.extend;
;/*global ko: false*/

var defaults = {
	registerExtenders: true,
	messagesOnModified: true,
	errorsAsTitle: true,            // enables/disables showing of errors as title attribute of the target element.
	errorsAsTitleOnModified: false, // shows the error when hovering the input field (decorateElement must be true)
	messageTemplate: null,
	insertMessages: true,           // automatically inserts validation messages as <span></span>
	parseInputAttributes: false,    // parses the HTML5 validation attribute from a form element and adds that to the object
	writeInputAttributes: false,    // adds HTML5 input validation attributes to form elements that ko observable's are bound to
	decorateInputElement: false,         // false to keep backward compatibility
	decorateElementOnModified: true,// true to keep backward compatibility
	errorClass: null,               // single class for error message and element
	errorElementClass: 'validationElement',  // class to decorate error element
	errorMessageClass: 'validationMessage',  // class to decorate error message
	allowHtmlMessages: false,		// allows HTML in validation messages
	grouping: {
		deep: false,        //by default grouping is shallow
		observable: true,   //and using observables
		live: false		    //react to changes to observableArrays if observable === true
	},
	validate: {
		// throttle: 10
	}
};

// make a copy  so we can use 'reset' later
var configuration = extend({}, defaults);

configuration.html5Attributes = ['required', 'pattern', 'min', 'max', 'step'];
configuration.html5InputTypes = ['email', 'number', 'date'];

configuration.reset = function () {
	extend(configuration, defaults);
};

kv.configuration = configuration;
;kv.utils = (function () {
	var seedId = new Date().getTime();

	var domData = {}; //hash of data objects that we reference from dom elements
	var domDataKey = '__ko_validation__';

	return {
		isArray: function (o) {
			return o.isArray || Object.prototype.toString.call(o) === '[object Array]';
		},
		isObject: function (o) {
			return o !== null && typeof o === 'object';
		},
		isNumber: function(o) {
			return !isNaN(o);	
		},
		isObservableArray: function(instance) {
			return !!instance &&
					typeof instance["remove"] === "function" &&
					typeof instance["removeAll"] === "function" &&
					typeof instance["destroy"] === "function" &&
					typeof instance["destroyAll"] === "function" &&
					typeof instance["indexOf"] === "function" &&
					typeof instance["replace"] === "function";
		},
		values: function (o) {
			var r = [];
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					r.push(o[i]);
				}
			}
			return r;
		},
		getValue: function (o) {
			return (typeof o === 'function' ? o() : o);
		},
		hasAttribute: function (node, attr) {
			return node.getAttribute(attr) !== null;
		},
		getAttribute: function (element, attr) {
			return element.getAttribute(attr);
		},
		setAttribute: function (element, attr, value) {
			return element.setAttribute(attr, value);
		},
		isValidatable: function (o) {
			return !!(o && o.rules && o.isValid && o.isModified);
		},
		insertAfter: function (node, newNode) {
			node.parentNode.insertBefore(newNode, node.nextSibling);
		},
		newId: function () {
			return seedId += 1;
		},
		getConfigOptions: function (element) {
			var options = kv.utils.contextFor(element);

			return options || kv.configuration;
		},
		setDomData: function (node, data) {
			var key = node[domDataKey];

			if (!key) {
				node[domDataKey] = key = kv.utils.newId();
			}

			domData[key] = data;
		},
		getDomData: function (node) {
			var key = node[domDataKey];

			if (!key) {
				return undefined;
			}

			return domData[key];
		},
		contextFor: function (node) {
			switch (node.nodeType) {
				case 1:
				case 8:
					var context = kv.utils.getDomData(node);
					if (context) { return context; }
					if (node.parentNode) { return kv.utils.contextFor(node.parentNode); }
					break;
			}
			return undefined;
		},
		isEmptyVal: function (val) {
			if (val === undefined) {
				return true;
			}
			if (val === null) {
				return true;
			}
			if (val === "") {
				return true;
			}
		},
		getOriginalElementTitle: function (element) {
			var savedOriginalTitle = kv.utils.getAttribute(element, 'data-orig-title'),
				currentTitle = element.title,
				hasSavedOriginalTitle = kv.utils.hasAttribute(element, 'data-orig-title');

			return hasSavedOriginalTitle ?
				savedOriginalTitle : currentTitle;
		},
		async: function (expr) {
			if (window.setImmediate) { window.setImmediate(expr); }
			else { window.setTimeout(expr, 0); }
		},
		forEach: function (object, callback) {
			if (kv.utils.isArray(object)) {
				return forEach(object, callback);
			}
			for (var prop in object) {
				if (object.hasOwnProperty(prop)) {
					callback(object[prop], prop);
				}
			}
		}
	};
}());;var api = (function () {

	var isInitialized = 0,
		configuration = kv.configuration,
		utils = kv.utils;

	function cleanUpSubscriptions(context) {
		forEach(context.subscriptions, function (subscription) {
			subscription.dispose();
		});
		context.subscriptions = [];
	}

	function dispose(context) {
		if (context.options.deep) {
			forEach(context.flagged, function (obj) {
				delete obj.__kv_traversed;
			});
			context.flagged.length = 0;
		}

		if (!context.options.live) {
			cleanUpSubscriptions(context);
		}
	}

	function runTraversal(obj, context) {
		context.validatables = [];
		cleanUpSubscriptions(context);
		traverseGraph(obj, context);
		dispose(context);
	}

	function traverseGraph(obj, context, level) {
		var objValues = [],
			val = obj.peek ? obj.peek() : obj;

		if (obj.__kv_traversed === true) {
			return;
		}

		if (context.options.deep) {
			obj.__kv_traversed = true;
			context.flagged.push(obj);
		}

		//default level value depends on deep option.
		level = (level !== undefined ? level : context.options.deep ? 1 : -1);

		// if object is observable then add it to the list
		if (ko.isObservable(obj)) {
			// ensure it's validatable but don't extend validatedObservable because it
			// would overwrite isValid property.
			if (!obj.errors && !utils.isValidatable(obj)) {
				obj.extend({ validatable: true });
			}
			context.validatables.push(obj);

			if (context.options.live && utils.isObservableArray(obj)) {
				context.subscriptions.push(obj.subscribe(function () {
					context.graphMonitor.valueHasMutated();
				}));
			}
		}

		//get list of values either from array or object but ignore non-objects
		// and destroyed objects
		if (val && !val._destroy) {
			if (utils.isArray(val)) {
				objValues = val;
			}
			else if (utils.isObject(val)) {
				objValues = utils.values(val);
			}
		}

		//process recursively if it is deep grouping
		if (level !== 0) {
			utils.forEach(objValues, function (observable) {
				//but not falsy things and not HTML Elements
				if (observable && !observable.nodeType && (!ko.isComputed(observable) || observable.rules)) {
					traverseGraph(observable, context, level + 1);
				}
			});
		}
	}

	function collectErrors(array) {
		var errors = [];
		forEach(array, function (observable) {
			// Do not collect validatedObservable errors
			if (utils.isValidatable(observable) && !observable.isValid()) {
				// Use peek because we don't want a dependency for 'error' property because it
				// changes before 'isValid' does. (Issue #99)
				errors.push(observable.error.peek());
			}
		});
		return errors;
	}

	return {
		//Call this on startup
		//any config can be overridden with the passed in options
		init: function (options, force) {
			//done run this multiple times if we don't really want to
			if (isInitialized > 0 && !force) {
				return;
			}

			//because we will be accessing options properties it has to be an object at least
			options = options || {};
			//if specific error classes are not provided then apply generic errorClass
			//it has to be done on option so that options.errorClass can override default
			//errorElementClass and errorMessage class but not those provided in options
			options.errorElementClass = options.errorElementClass || options.errorClass || configuration.errorElementClass;
			options.errorMessageClass = options.errorMessageClass || options.errorClass || configuration.errorMessageClass;

			extend(configuration, options);

			if (configuration.registerExtenders) {
				kv.registerExtenders();
			}

			isInitialized = 1;
		},

		// resets the config back to its original state
		reset: kv.configuration.reset,

		// recursively walks a viewModel and creates an object that
		// provides validation information for the entire viewModel
		// obj -> the viewModel to walk
		// options -> {
		//	  deep: false, // if true, will walk past the first level of viewModel properties
		//	  observable: false // if true, returns a computed observable indicating if the viewModel is valid
		// }
		group: function group(obj, options) { // array of observables or viewModel
			options = extend(extend({}, configuration.grouping), options);

			var context = {
				options: options,
				graphMonitor: ko.observable(),
				flagged: [],
				subscriptions: [],
				validatables: []
			};

			var result = null;

			//if using observables then traverse structure once and add observables
			if (options.observable) {
				result = ko.computed(function () {
					context.graphMonitor(); //register dependency
					runTraversal(obj, context);
					return collectErrors(context.validatables);
				});
			}
			else { //if not using observables then every call to error() should traverse the structure
				result = function () {
					runTraversal(obj, context);
					return collectErrors(context.validatables);
				};
			}

			result.showAllMessages = function (show) { // thanks @heliosPortal
				if (show === undefined) {//default to true
					show = true;
				}

				result.forEach(function (observable) {
					if (utils.isValidatable(observable)) {
						observable.isModified(show);
					}
				});
			};

			result.isAnyMessageShown = function () {
				var invalidAndModifiedPresent;

				invalidAndModifiedPresent = !!result.find(function (observable) {
					return utils.isValidatable(observable) && !observable.isValid() && observable.isModified();
				});
				return invalidAndModifiedPresent;
			};

			result.filter = function(predicate) {
				predicate = predicate || function () { return true; };
				// ensure we have latest changes
				result();

				return koUtils.arrayFilter(context.validatables, predicate);
			};

			result.find = function(predicate) {
				predicate = predicate || function () { return true; };
				// ensure we have latest changes
				result();

				return koUtils.arrayFirst(context.validatables, predicate);
			};

			result.forEach = function(callback) {
				callback = callback || function () { };
				// ensure we have latest changes
				result();

				forEach(context.validatables, callback);
			};

			result.map = function(mapping) {
				mapping = mapping || function (item) { return item; };
				// ensure we have latest changes
				result();

				return koUtils.arrayMap(context.validatables, mapping);
			};

			/**
			 * @private You should not rely on this method being here.
			 * It's a private method and it may change in the future.
			 *
			 * @description Updates the validated object and collects errors from it.
			 */
			result._updateState = function(newValue) {
				if (!utils.isObject(newValue)) {
					throw new Error('An object is required.');
				}
				obj = newValue;
				if (options.observable) {
					context.graphMonitor.valueHasMutated();
				}
				else {
					runTraversal(newValue, context);
					return collectErrors(context.validatables);
				}
			};
			return result;
		},

		formatMessage: function (message, params, observable) {
			if (utils.isObject(params) && params.typeAttr) {
				params = params.value;
			}
			if (typeof message === 'function') {
				return message(params, observable);
			}
			var replacements = unwrap(params);
            if (replacements == null) {
                replacements = [];
            }
			if (!utils.isArray(replacements)) {
				replacements = [replacements];
			}
			return message.replace(/{(\d+)}/gi, function(match, index) {
				if (typeof replacements[index] !== 'undefined') {
					return replacements[index];
				}
				return match;
			});
		},

		// addRule:
		// This takes in a ko.observable and a Rule Context - which is just a rule name and params to supply to the validator
		// ie: kv.addRule(myObservable, {
		//		  rule: 'required',
		//		  params: true
		//	  });
		//
		addRule: function (observable, rule) {
			observable.extend({ validatable: true });

			var hasRule = !!koUtils.arrayFirst(observable.rules(), function(item) {
				return item.rule && item.rule === rule.rule;
			});

			if (!hasRule) {
				//push a Rule Context to the observables local array of Rule Contexts
				observable.rules.push(rule);
			}
			return observable;
		},

		// addAnonymousRule:
		// Anonymous Rules essentially have all the properties of a Rule, but are only specific for a certain property
		// and developers typically are wanting to add them on the fly or not register a rule with the 'kv.rules' object
		//
		// Example:
		// var test = ko.observable('something').extend{(
		//	  validation: {
		//		  validator: function(val, someOtherVal){
		//			  return true;
		//		  },
		//		  message: "Something must be really wrong!',
		//		  params: true
		//	  }
		//  )};
		addAnonymousRule: function (observable, ruleObj) {
			if (ruleObj['message'] === undefined) {
				ruleObj['message'] = 'Error';
			}

			//make sure onlyIf is honoured
			if (ruleObj.onlyIf) {
				ruleObj.condition = ruleObj.onlyIf;
			}

			//add the anonymous rule to the observable
			kv.addRule(observable, ruleObj);
		},

		addExtender: function (ruleName) {
			ko.extenders[ruleName] = function (observable, params) {
				//params can come in a few flavors
				// 1. Just the params to be passed to the validator
				// 2. An object containing the Message to be used and the Params to pass to the validator
				// 3. A condition when the validation rule to be applied
				//
				// Example:
				// var test = ko.observable(3).extend({
				//	  max: {
				//		  message: 'This special field has a Max of {0}',
				//		  params: 2,
				//		  onlyIf: function() {
				//					  return specialField.IsVisible();
				//				  }
				//	  }
				//  )};
				//
				if (params && (params.message || params.onlyIf)) { //if it has a message or condition object, then its an object literal to use
					return kv.addRule(observable, {
						rule: ruleName,
						message: params.message,
						params: utils.isEmptyVal(params.params) ? true : params.params,
						condition: params.onlyIf
					});
				} else {
					return kv.addRule(observable, {
						rule: ruleName,
						params: params
					});
				}
			};
		},

		// loops through all kv.rules and adds them as extenders to
		// ko.extenders
		registerExtenders: function () { // root extenders optional, use 'validation' extender if would cause conflicts
			if (configuration.registerExtenders) {
				for (var ruleName in kv.rules) {
					if (kv.rules.hasOwnProperty(ruleName)) {
						if (!ko.extenders[ruleName]) {
							kv.addExtender(ruleName);
						}
					}
				}
			}
		},

		//creates a span next to the @element with the specified error class
		insertValidationMessage: function (element) {
			var span = document.createElement('SPAN');
			span.className = utils.getConfigOptions(element).errorMessageClass;
			utils.insertAfter(element, span);
			return span;
		},

		// if html-5 validation attributes have been specified, this parses
		// the attributes on @element
		parseInputValidationAttributes: function (element, valueAccessor) {
			forEach(kv.configuration.html5Attributes, function (attr) {
				if (utils.hasAttribute(element, attr)) {

					var params = element.getAttribute(attr) || true;

					if (attr === 'min' || attr === 'max')
					{
						// If we're validating based on the min and max attributes, we'll
						// need to know what the 'type' attribute is set to
						var typeAttr = element.getAttribute('type');
						if (typeof typeAttr === "undefined" || !typeAttr)
						{
							// From http://www.w3.org/TR/html-markup/input:
							//   An input element with no type attribute specified represents the
							//   same thing as an input element with its type attribute set to "text".
							typeAttr = "text";
						}
						params = {typeAttr: typeAttr, value: params};
					}

					kv.addRule(valueAccessor(), {
						rule: attr,
						params: params
					});
				}
			});

			var currentType = element.getAttribute('type');
			forEach(kv.configuration.html5InputTypes, function (type) {
				if (type === currentType) {
					kv.addRule(valueAccessor(), {
						rule: (type === 'date') ? 'dateISO' : type,
						params: true
					});
				}
			});
		},

		// writes html5 validation attributes on the element passed in
		writeInputValidationAttributes: function (element, valueAccessor) {
			var observable = valueAccessor();

			if (!observable || !observable.rules) {
				return;
			}

			var contexts = observable.rules(); // observable array

			// loop through the attributes and add the information needed
			forEach(kv.configuration.html5Attributes, function (attr) {
				var ctx = koUtils.arrayFirst(contexts, function (ctx) {
					return ctx.rule && ctx.rule.toLowerCase() === attr.toLowerCase();
				});

				if (!ctx) {
					return;
				}

				// we have a rule matching a validation attribute at this point
				// so lets add it to the element along with the params
				ko.computed({
					read: function() {
						var params = ko.unwrap(ctx.params);

						// we have to do some special things for the pattern validation
						if (ctx.rule === "pattern" && params instanceof RegExp) {
							// we need the pure string representation of the RegExpr without the //gi stuff
							params = params.source;
						}

						element.setAttribute(attr, params);
					},
					disposeWhenNodeIsRemoved: element
				});
			});

			contexts = null;
		},

		//take an existing binding handler and make it cause automatic validations
		makeBindingHandlerValidatable: function (handlerName) {
			var init = ko.bindingHandlers[handlerName].init;

			ko.bindingHandlers[handlerName].init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

				init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

				return ko.bindingHandlers['validationCore'].init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
			};
		},

		// visit an objects properties and apply validation rules from a definition
		setRules: function (target, definition) {
			var setRules = function (target, definition) {
				if (!target || !definition) { return; }

				for (var prop in definition) {
					if (!definition.hasOwnProperty(prop)) { continue; }
					var ruleDefinitions = definition[prop];

					//check the target property exists and has a value
					if (!target[prop]) { continue; }
					var targetValue = target[prop],
						unwrappedTargetValue = unwrap(targetValue),
						rules = {},
						nonRules = {};

					for (var rule in ruleDefinitions) {
						if (!ruleDefinitions.hasOwnProperty(rule)) { continue; }
						if (kv.rules[rule]) {
							rules[rule] = ruleDefinitions[rule];
						} else {
							nonRules[rule] = ruleDefinitions[rule];
						}
					}

					//apply rules
					if (ko.isObservable(targetValue)) {
						targetValue.extend(rules);
					}

					//then apply child rules
					//if it's an array, apply rules to all children
					if (unwrappedTargetValue && utils.isArray(unwrappedTargetValue)) {
						for (var i = 0; i < unwrappedTargetValue.length; i++) {
							setRules(unwrappedTargetValue[i], nonRules);
						}
						//otherwise, just apply to this property
					} else {
						setRules(unwrappedTargetValue, nonRules);
					}
				}
			};
			setRules(target, definition);
		}
	};

}());

// expose api publicly
extend(ko.validation, api);
;//Validation Rules:
// You can view and override messages or rules via:
// kv.rules[ruleName]
//
// To implement a custom Rule, simply use this template:
// kv.rules['<custom rule name>'] = {
//      validator: function (val, param) {
//          <custom logic>
//          return <true or false>;
//      },
//      message: '<custom validation message>' //optionally you can also use a '{0}' to denote a placeholder that will be replaced with your 'param'
// };
//
// Example:
// kv.rules['mustEqual'] = {
//      validator: function( val, mustEqualVal ){
//          return val === mustEqualVal;
//      },
//      message: 'This field must equal {0}'
// };
//
kv.rules = {};
kv.rules['required'] = {
	validator: function (val, required) {
		var testVal;

		if (val === undefined || val === null) {
			return !required;
		}

		testVal = val;
		if (typeof (val) === 'string') {
			if (String.prototype.trim) {
				testVal = val.trim();
			}
			else {
				testVal = val.replace(/^\s+|\s+$/g, '');
			}
		}

		if (!required) {// if they passed: { required: false }, then don't require this
			return true;
		}

		return ((testVal + '').length > 0);
	},
	message: 'This field is required.'
};

function minMaxValidatorFactory(validatorName) {
    var isMaxValidation = validatorName === "max";

    return function (val, options) {
        if (kv.utils.isEmptyVal(val)) {
            return true;
        }

        var comparisonValue, type;
        if (options.typeAttr === undefined) {
            // This validator is being called from javascript rather than
            // being bound from markup
            type = "text";
            comparisonValue = options;
        } else {
            type = options.typeAttr;
            comparisonValue = options.value;
        }

        // From http://www.w3.org/TR/2012/WD-html5-20121025/common-input-element-attributes.html#attr-input-min,
        // if the value is parseable to a number, then the minimum should be numeric
        if (!isNaN(comparisonValue) && !(comparisonValue instanceof Date)) {
            type = "number";
        }

        var regex, valMatches, comparisonValueMatches;
        switch (type.toLowerCase()) {
            case "week":
                regex = /^(\d{4})-W(\d{2})$/;
                valMatches = val.match(regex);
                if (valMatches === null) {
                    throw new Error("Invalid value for " + validatorName + " attribute for week input.  Should look like " +
                        "'2000-W33' http://www.w3.org/TR/html-markup/input.week.html#input.week.attrs.min");
                }
                comparisonValueMatches = comparisonValue.match(regex);
                // If no regex matches were found, validation fails
                if (!comparisonValueMatches) {
                    return false;
                }

                if (isMaxValidation) {
                    return (valMatches[1] < comparisonValueMatches[1]) || // older year
                        // same year, older week
                        ((valMatches[1] === comparisonValueMatches[1]) && (valMatches[2] <= comparisonValueMatches[2]));
                } else {
                    return (valMatches[1] > comparisonValueMatches[1]) || // newer year
                        // same year, newer week
                        ((valMatches[1] === comparisonValueMatches[1]) && (valMatches[2] >= comparisonValueMatches[2]));
                }
                break;

            case "month":
                regex = /^(\d{4})-(\d{2})$/;
                valMatches = val.match(regex);
                if (valMatches === null) {
                    throw new Error("Invalid value for " + validatorName + " attribute for month input.  Should look like " +
                        "'2000-03' http://www.w3.org/TR/html-markup/input.month.html#input.month.attrs.min");
                }
                comparisonValueMatches = comparisonValue.match(regex);
                // If no regex matches were found, validation fails
                if (!comparisonValueMatches) {
                    return false;
                }

                if (isMaxValidation) {
                    return ((valMatches[1] < comparisonValueMatches[1]) || // older year
                        // same year, older month
                        ((valMatches[1] === comparisonValueMatches[1]) && (valMatches[2] <= comparisonValueMatches[2])));
                } else {
                    return (valMatches[1] > comparisonValueMatches[1]) || // newer year
                        // same year, newer month
                        ((valMatches[1] === comparisonValueMatches[1]) && (valMatches[2] >= comparisonValueMatches[2]));
                }
                break;

            case "number":
            case "range":
                if (isMaxValidation) {
                    return (!isNaN(val) && parseFloat(val) <= parseFloat(comparisonValue));
                } else {
                    return (!isNaN(val) && parseFloat(val) >= parseFloat(comparisonValue));
                }
                break;

            default:
                if (isMaxValidation) {
                    return val <= comparisonValue;
                } else {
                    return val >= comparisonValue;
                }
        }
    };
}

kv.rules['min'] = {
	validator: minMaxValidatorFactory("min"),
	message: 'Please enter a value greater than or equal to {0}.'
};

kv.rules['max'] = {
	validator: minMaxValidatorFactory("max"),
	message: 'Please enter a value less than or equal to {0}.'
};

kv.rules['minLength'] = {
	validator: function (val, minLength) {
		if(kv.utils.isEmptyVal(val)) { return true; }
		var normalizedVal = kv.utils.isNumber(val) ? ('' + val) : val;
		return normalizedVal.length >= minLength;
	},
	message: 'Please enter at least {0} characters.'
};

kv.rules['maxLength'] = {
	validator: function (val, maxLength) {
		if(kv.utils.isEmptyVal(val)) { return true; }
		var normalizedVal = kv.utils.isNumber(val) ? ('' + val) : val;
		return normalizedVal.length <= maxLength;
	},
	message: 'Please enter no more than {0} characters.'
};

kv.rules['pattern'] = {
	validator: function (val, regex) {
		return kv.utils.isEmptyVal(val) || val.toString().match(regex) !== null;
	},
	message: 'Please check this value.'
};

kv.rules['step'] = {
	validator: function (val, step) {

		// in order to handle steps of .1 & .01 etc.. Modulus won't work
		// if the value is a decimal, so we have to correct for that
		if (kv.utils.isEmptyVal(val) || step === 'any') { return true; }
		var dif = (val * 100) % (step * 100);
		return Math.abs(dif) < 0.00001 || Math.abs(1 - dif) < 0.00001;
	},
	message: 'The value must increment by {0}.'
};

kv.rules['email'] = {
	validator: function (val, validate) {
		if (!validate) { return true; }

		//I think an empty email address is also a valid entry
		//if one want's to enforce entry it should be done with 'required: true'
		return kv.utils.isEmptyVal(val) || (
			// jquery validate regex - thanks Scott Gonzalez
			validate && /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(val)
		);
	},
	message: 'Please enter a proper email address.'
};

kv.rules['date'] = {
	validator: function (value, validate) {
		if (!validate) { return true; }
		return kv.utils.isEmptyVal(value) || (validate && !/Invalid|NaN/.test(new Date(value)));
	},
	message: 'Please enter a proper date.'
};

kv.rules['dateISO'] = {
	validator: function (value, validate) {
		if (!validate) { return true; }
		return kv.utils.isEmptyVal(value) || (validate && /^\d{4}[-/](?:0?[1-9]|1[012])[-/](?:0?[1-9]|[12][0-9]|3[01])$/.test(value));
	},
	message: 'Please enter a proper date.'
};

kv.rules['number'] = {
	validator: function (value, validate) {
		if (!validate) { return true; }
		return kv.utils.isEmptyVal(value) || (validate && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value));
	},
	message: 'Please enter a number.'
};

kv.rules['digit'] = {
	validator: function (value, validate) {
		if (!validate) { return true; }
		return kv.utils.isEmptyVal(value) || (validate && /^\d+$/.test(value));
	},
	message: 'Please enter a digit.'
};

kv.rules['phoneUS'] = {
	validator: function (phoneNumber, validate) {
		if (!validate) { return true; }
		if (kv.utils.isEmptyVal(phoneNumber)) { return true; } // makes it optional, use 'required' rule if it should be required
		if (typeof (phoneNumber) !== 'string') { return false; }
		phoneNumber = phoneNumber.replace(/\s+/g, "");
		return validate && phoneNumber.length > 9 && phoneNumber.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
	},
	message: 'Please specify a valid phone number.'
};

kv.rules['equal'] = {
	validator: function (val, params) {
		var otherValue = params;
		return val === kv.utils.getValue(otherValue);
	},
	message: 'Values must equal.'
};

kv.rules['notEqual'] = {
	validator: function (val, params) {
		var otherValue = params;
		return val !== kv.utils.getValue(otherValue);
	},
	message: 'Please choose another value.'
};

//unique in collection
// options are:
//    collection: array or function returning (observable) array
//              in which the value has to be unique
//    valueAccessor: function that returns value from an object stored in collection
//              if it is null the value is compared directly
//    external: set to true when object you are validating is automatically updating collection
kv.rules['unique'] = {
	validator: function (val, options) {
		var c = kv.utils.getValue(options.collection),
			external = kv.utils.getValue(options.externalValue),
			counter = 0;

		if (!val || !c) { return true; }

		koUtils.arrayFilter(c, function (item) {
			if (val === (options.valueAccessor ? options.valueAccessor(item) : item)) { counter++; }
		});
		// if value is external even 1 same value in collection means the value is not unique
		return counter < (!!external ? 1 : 2);
	},
	message: 'Please make sure the value is unique.'
};


//now register all of these!
(function () {
	kv.registerExtenders();
}());
;// The core binding handler
// this allows us to setup any value binding that internally always
// performs the same functionality
ko.bindingHandlers['validationCore'] = (function () {

	return {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var config = kv.utils.getConfigOptions(element);
			var observable = valueAccessor();

			// parse html5 input validation attributes, optional feature
			if (config.parseInputAttributes) {
				kv.utils.async(function () { kv.parseInputValidationAttributes(element, valueAccessor); });
			}

			// if requested insert message element and apply bindings
			if (config.insertMessages && kv.utils.isValidatable(observable)) {

				// insert the <span></span>
				var validationMessageElement = kv.insertValidationMessage(element);

				// if we're told to use a template, make sure that gets rendered
				if (config.messageTemplate) {
					ko.renderTemplate(config.messageTemplate, { field: observable }, null, validationMessageElement, 'replaceNode');
				} else {
					ko.applyBindingsToNode(validationMessageElement, { validationMessage: observable });
				}
			}

			// write the html5 attributes if indicated by the config
			if (config.writeInputAttributes && kv.utils.isValidatable(observable)) {

				kv.writeInputValidationAttributes(element, valueAccessor);
			}

			// if requested, add binding to decorate element
			if (config.decorateInputElement && kv.utils.isValidatable(observable)) {
				ko.applyBindingsToNode(element, { validationElement: observable });
			}
		}
	};

}());

// override for KO's default 'value', 'checked', 'textInput' and selectedOptions bindings
kv.makeBindingHandlerValidatable("value");
kv.makeBindingHandlerValidatable("checked");
if (ko.bindingHandlers.textInput) {
	kv.makeBindingHandlerValidatable("textInput");
}
kv.makeBindingHandlerValidatable("selectedOptions");


ko.bindingHandlers['validationMessage'] = { // individual error message, if modified or post binding
	update: function (element, valueAccessor) {
		var obsv = valueAccessor(),
			config = kv.utils.getConfigOptions(element),
			val = unwrap(obsv),
			msg = null,
			isModified = false,
			isValid = false;

		if (obsv === null || typeof obsv === 'undefined') {
			throw new Error('Cannot bind validationMessage to undefined value. data-bind expression: ' +
				element.getAttribute('data-bind'));
		}

		isModified = obsv.isModified && obsv.isModified();
		isValid = obsv.isValid && obsv.isValid();

		var error = null;
		if (!config.messagesOnModified || isModified) {
			error = isValid ? null : obsv.error;
		}

		var isVisible = !config.messagesOnModified || isModified ? !isValid : false;
		var isCurrentlyVisible = element.style.display !== "none";

		if (config.allowHtmlMessages) {
			koUtils.setHtml(element, error);
		} else {
			ko.bindingHandlers.text.update(element, function () { return error; });
		}

		if (isCurrentlyVisible && !isVisible) {
			element.style.display = 'none';
		} else if (!isCurrentlyVisible && isVisible) {
			element.style.display = '';
		}
	}
};

ko.bindingHandlers['validationElement'] = {
	update: function (element, valueAccessor, allBindingsAccessor) {
		var obsv = valueAccessor(),
			config = kv.utils.getConfigOptions(element),
			val = unwrap(obsv),
			msg = null,
			isModified = false,
			isValid = false;

		if (obsv === null || typeof obsv === 'undefined') {
			throw new Error('Cannot bind validationElement to undefined value. data-bind expression: ' +
				element.getAttribute('data-bind'));
		}

		isModified = obsv.isModified && obsv.isModified();
		isValid = obsv.isValid && obsv.isValid();

		// create an evaluator function that will return something like:
		// css: { validationElement: true }
		var cssSettingsAccessor = function () {
			var css = {};

			var shouldShow = ((!config.decorateElementOnModified || isModified) ? !isValid : false);

			// css: { validationElement: false }
			css[config.errorElementClass] = shouldShow;

			return css;
		};

		//add or remove class on the element;
		ko.bindingHandlers.css.update(element, cssSettingsAccessor, allBindingsAccessor);
		if (!config.errorsAsTitle) { return; }

		ko.bindingHandlers.attr.update(element, function () {
			var
				hasModification = !config.errorsAsTitleOnModified || isModified,
				title = kv.utils.getOriginalElementTitle(element);

			if (hasModification && !isValid) {
				return { title: obsv.error, 'data-orig-title': title };
			} else if (!hasModification || isValid) {
				return { title: title, 'data-orig-title': null };
			}
		});
	}
};

// ValidationOptions:
// This binding handler allows you to override the initial config by setting any of the options for a specific element or context of elements
//
// Example:
// <div data-bind="validationOptions: { insertMessages: true, messageTemplate: 'customTemplate', errorMessageClass: 'mySpecialClass'}">
//      <input type="text" data-bind="value: someValue"/>
//      <input type="text" data-bind="value: someValue2"/>
// </div>
ko.bindingHandlers['validationOptions'] = (function () {
	return {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var options = unwrap(valueAccessor());
			if (options) {
				var newConfig = extend({}, kv.configuration);
				extend(newConfig, options);

				//store the validation options on the node so we can retrieve it later
				kv.utils.setDomData(element, newConfig);
			}
		}
	};
}());
;// Validation Extender:
// This is for creating custom validation logic on the fly
// Example:
// var test = ko.observable('something').extend{(
//      validation: {
//          validator: function(val, someOtherVal){
//              return true;
//          },
//          message: "Something must be really wrong!',
//          params: true
//      }
//  )};
ko.extenders['validation'] = function (observable, rules) { // allow single rule or array
	forEach(kv.utils.isArray(rules) ? rules : [rules], function (rule) {
		// the 'rule' being passed in here has no name to identify a core Rule,
		// so we add it as an anonymous rule
		// If the developer is wanting to use a core Rule, but use a different message see the 'addExtender' logic for examples
		kv.addAnonymousRule(observable, rule);
	});
	return observable;
};

//This is the extender that makes a Knockout Observable also 'Validatable'
//examples include:
// 1. var test = ko.observable('something').extend({validatable: true});
// this will ensure that the Observable object is setup properly to respond to rules
//
// 2. test.extend({validatable: false});
// this will remove the validation properties from the Observable object should you need to do that.
ko.extenders['validatable'] = function (observable, options) {
	if (!kv.utils.isObject(options)) {
		options = { enable: options };
	}

	if (!('enable' in options)) {
		options.enable = true;
	}

	if (options.enable && !kv.utils.isValidatable(observable)) {
		var config = kv.configuration.validate || {};
		var validationOptions = {
			throttleEvaluation : options.throttle || config.throttle
		};

		observable.error = ko.observable(null); // holds the error message, we only need one since we stop processing validators when one is invalid

		// observable.rules:
		// ObservableArray of Rule Contexts, where a Rule Context is simply the name of a rule and the params to supply to it
		//
		// Rule Context = { rule: '<rule name>', params: '<passed in params>', message: '<Override of default Message>' }
		observable.rules = ko.observableArray(); //holds the rule Contexts to use as part of validation

		//in case async validation is occurring
		observable.isValidating = ko.observable(false);

		//the true holder of whether the observable is valid or not
		observable.__valid__ = ko.observable(true);

		observable.isModified = ko.observable(false);

		// a semi-protected observable
		observable.isValid = ko.computed(observable.__valid__);

		//manually set error state
		observable.setError = function (error) {
			var previousError = observable.error.peek();
			var previousIsValid = observable.__valid__.peek();

			observable.error(error);
			observable.__valid__(false);

			if (previousError !== error && !previousIsValid) {
				// if the observable was not valid before then isValid will not mutate,
				// hence causing any grouping to not display the latest error.
				observable.isValid.notifySubscribers();
			}
		};

		//manually clear error state
		observable.clearError = function () {
			observable.error(null);
			observable.__valid__(true);
			return observable;
		};

		//subscribe to changes in the observable
		var h_change = observable.subscribe(function () {
			observable.isModified(true);
		});

		// we use a computed here to ensure that anytime a dependency changes, the
		// validation logic evaluates
		var h_obsValidationTrigger = ko.computed(extend({
			read: function () {
				var obs = observable(),
					ruleContexts = observable.rules();

				kv.validateObservable(observable);

				return true;
			}
		}, validationOptions));

		extend(h_obsValidationTrigger, validationOptions);

		observable._disposeValidation = function () {
			//first dispose of the subscriptions
			observable.isValid.dispose();
			observable.rules.removeAll();
			h_change.dispose();
			h_obsValidationTrigger.dispose();

			delete observable['rules'];
			delete observable['error'];
			delete observable['isValid'];
			delete observable['isValidating'];
			delete observable['__valid__'];
			delete observable['isModified'];
            delete observable['setError'];
            delete observable['clearError'];
            delete observable['_disposeValidation'];
		};
	} else if (options.enable === false && observable._disposeValidation) {
		observable._disposeValidation();
	}
	return observable;
};

function validateSync(observable, rule, ctx) {
	//Execute the validator and see if its valid
	if (!rule.validator(observable(), (ctx.params === undefined ? true : unwrap(ctx.params)))) { // default param is true, eg. required = true

		//not valid, so format the error message and stick it in the 'error' variable
		observable.setError(kv.formatMessage(
					ctx.message || rule.message,
					unwrap(ctx.params),
					observable));
		return false;
	} else {
		return true;
	}
}

function validateAsync(observable, rule, ctx) {
	observable.isValidating(true);

	var callBack = function (valObj) {
		var isValid = false,
			msg = '';

		if (!observable.__valid__()) {

			// since we're returning early, make sure we turn this off
			observable.isValidating(false);

			return; //if its already NOT valid, don't add to that
		}

		//we were handed back a complex object
		if (valObj['message']) {
			isValid = valObj.isValid;
			msg = valObj.message;
		} else {
			isValid = valObj;
		}

		if (!isValid) {
			//not valid, so format the error message and stick it in the 'error' variable
			observable.error(kv.formatMessage(
				msg || ctx.message || rule.message,
				unwrap(ctx.params),
				observable));
			observable.__valid__(isValid);
		}

		// tell it that we're done
		observable.isValidating(false);
	};

	kv.utils.async(function() {
	    //fire the validator and hand it the callback
        rule.validator(observable(), ctx.params === undefined ? true : unwrap(ctx.params), callBack);
	});
}

kv.validateObservable = function (observable) {
	var i = 0,
		rule, // the rule validator to execute
		ctx, // the current Rule Context for the loop
		ruleContexts = observable.rules(), //cache for iterator
		len = ruleContexts.length; //cache for iterator

	for (; i < len; i++) {

		//get the Rule Context info to give to the core Rule
		ctx = ruleContexts[i];

		// checks an 'onlyIf' condition
		if (ctx.condition && !ctx.condition()) {
			continue;
		}

		//get the core Rule to use for validation
		rule = ctx.rule ? kv.rules[ctx.rule] : ctx;

		if (rule['async'] || ctx['async']) {
			//run async validation
			validateAsync(observable, rule, ctx);

		} else {
			//run normal sync validation
			if (!validateSync(observable, rule, ctx)) {
				return false; //break out of the loop
			}
		}
	}
	//finally if we got this far, make the observable valid again!
	observable.clearError();
	return true;
};
;
var _locales = {};
var _currentLocale;

kv.defineLocale = function(name, values) {
	if (name && values) {
		_locales[name.toLowerCase()] = values;
		return values;
	}
	return null;
};

kv.locale = function(name) {
	if (name) {
		name = name.toLowerCase();

		if (_locales.hasOwnProperty(name)) {
			kv.localize(_locales[name]);
			_currentLocale = name;
		}
		else {
			throw new Error('Localization ' + name + ' has not been loaded.');
		}
	}
	return _currentLocale;
};

//quick function to override rule messages
kv.localize = function (msgTranslations) {
	var rules = kv.rules;

	//loop the properties in the object and assign the msg to the rule
	for (var ruleName in msgTranslations) {
		if (rules.hasOwnProperty(ruleName)) {
			rules[ruleName].message = msgTranslations[ruleName];
		}
	}
};

// Populate default locale (this will make en-US.js somewhat redundant)
(function() {
	var localeData = {};
	var rules = kv.rules;

	for (var ruleName in rules) {
		if (rules.hasOwnProperty(ruleName)) {
			localeData[ruleName] = rules[ruleName].message;
		}
	}
	kv.defineLocale('en-us', localeData);
})();

// No need to invoke locale because the messages are already defined along with the rules for en-US
_currentLocale = 'en-us';
;/**
 * Possible invocations:
 * 		applyBindingsWithValidation(viewModel)
 * 		applyBindingsWithValidation(viewModel, options)
 * 		applyBindingsWithValidation(viewModel, rootNode)
 *		applyBindingsWithValidation(viewModel, rootNode, options)
 */
ko.applyBindingsWithValidation = function (viewModel, rootNode, options) {
	var node = document.body,
		config;

	if (rootNode && rootNode.nodeType) {
		node = rootNode;
		config = options;
	}
	else {
		config = rootNode;
	}

	kv.init();

	if (config) {
		config = extend(extend({}, kv.configuration), config);
		kv.utils.setDomData(node, config);
	}

	ko.applyBindings(viewModel, node);
};

//override the original applyBindings so that we can ensure all new rules and what not are correctly registered
var origApplyBindings = ko.applyBindings;
ko.applyBindings = function (viewModel, rootNode) {

	kv.init();

	origApplyBindings(viewModel, rootNode);
};

ko.validatedObservable = function (initialValue, options) {
	if (!options && !kv.utils.isObject(initialValue)) {
		return ko.observable(initialValue).extend({ validatable: true });
	}

	var obsv = ko.observable(initialValue);
	obsv.errors = kv.group(kv.utils.isObject(initialValue) ? initialValue : {}, options);
	obsv.isValid = ko.observable(obsv.errors().length === 0);

	if (ko.isObservable(obsv.errors)) {
		obsv.errors.subscribe(function(errors) {
			obsv.isValid(errors.length === 0);
		});
	}
	else {
		ko.computed(obsv.errors).subscribe(function (errors) {
			obsv.isValid(errors.length === 0);
		});
	}

	obsv.subscribe(function(newValue) {
		if (!kv.utils.isObject(newValue)) {
			/*
			 * The validation group works on objects.
			 * Since the new value is a primitive (scalar, null or undefined) we need
			 * to create an empty object to pass along.
			 */
			newValue = {};
		}
		// Force the group to refresh
		obsv.errors._updateState(newValue);
		obsv.isValid(obsv.errors().length === 0);
	});

	return obsv;
};
;}));
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\knockout.validation\\dist\\knockout.validation.js","/..\\..\\node_modules\\knockout.validation\\dist")
},{"buffer":2,"e/U+97":6,"knockout":5}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * Knockout JavaScript library v3.5.0
 * (c) The Knockout.js team - http://knockoutjs.com/
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

(function() {(function(p){var z=this||(0,eval)("this"),w=z.document,R=z.navigator,v=z.jQuery,H=z.JSON;v||"undefined"===typeof jQuery||(v=jQuery);(function(p){"function"===typeof define&&define.amd?define(["exports","require"],p):"object"===typeof exports&&"object"===typeof module?p(module.exports||exports):p(z.ko={})})(function(S,T){function K(a,c){return null===a||typeof a in W?a===c:!1}function X(b,c){var d;return function(){d||(d=a.a.setTimeout(function(){d=p;b()},c))}}function Y(b,c){var d;return function(){clearTimeout(d);
d=a.a.setTimeout(b,c)}}function Z(a,c){c&&"change"!==c?"beforeChange"===c?this.oc(a):this.bb(a,c):this.pc(a)}function aa(a,c){null!==c&&c.s&&c.s()}function ba(a,c){var d=this.pd,e=d[t];e.qa||(this.Pb&&this.kb[c]?(d.tc(c,a,this.kb[c]),this.kb[c]=null,--this.Pb):e.F[c]||d.tc(c,a,e.G?{da:a}:d.Zc(a)),a.Ka&&a.fd())}var a="undefined"!==typeof S?S:{};a.b=function(b,c){for(var d=b.split("."),e=a,f=0;f<d.length-1;f++)e=e[d[f]];e[d[d.length-1]]=c};a.J=function(a,c,d){a[c]=d};a.version="3.5.0";a.b("version",
a.version);a.options={deferUpdates:!1,useOnlyNativeEvents:!1,foreachHidesDestroyed:!1};a.a=function(){function b(a,b){for(var c in a)f.call(a,c)&&b(c,a[c])}function c(a,b){if(b)for(var c in b)f.call(b,c)&&(a[c]=b[c]);return a}function d(a,b){a.__proto__=b;return a}function e(b,c,d,e){var k=b[c].match(n)||[];a.a.C(d.match(n),function(b){a.a.Oa(k,b,e)});b[c]=k.join(" ")}var f=Object.prototype.hasOwnProperty,g={__proto__:[]}instanceof Array,h="function"===typeof Symbol,m={},l={};m[R&&/Firefox\/2/i.test(R.userAgent)?
"KeyboardEvent":"UIEvents"]=["keyup","keydown","keypress"];m.MouseEvents="click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave".split(" ");b(m,function(a,b){if(b.length)for(var c=0,d=b.length;c<d;c++)l[b[c]]=a});var k={propertychange:!0},q=w&&function(){for(var a=3,b=w.createElement("div"),c=b.getElementsByTagName("i");b.innerHTML="\x3c!--[if gt IE "+ ++a+"]><i></i><![endif]--\x3e",c[0];);return 4<a?a:p}(),n=/\S+/g,r;return{Ic:["authenticity_token",/^__RequestVerificationToken(_.*)?$/],
C:function(a,b,c){for(var d=0,e=a.length;d<e;d++)b.call(c,a[d],d,a)},A:"function"==typeof Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b)}:function(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c]===b)return c;return-1},Lb:function(a,b,c){for(var d=0,e=a.length;d<e;d++)if(b.call(c,a[d],d,a))return a[d];return p},hb:function(b,c){var d=a.a.A(b,c);0<d?b.splice(d,1):0===d&&b.shift()},vc:function(b){var c=[];b&&a.a.C(b,function(b){0>a.a.A(c,b)&&c.push(b)});return c},Mb:function(a,
b,c){var d=[];if(a)for(var e=0,k=a.length;e<k;e++)d.push(b.call(c,a[e],e));return d},fb:function(a,b,c){var d=[];if(a)for(var e=0,k=a.length;e<k;e++)b.call(c,a[e],e)&&d.push(a[e]);return d},gb:function(a,b){if(b instanceof Array)a.push.apply(a,b);else for(var c=0,d=b.length;c<d;c++)a.push(b[c]);return a},Oa:function(b,c,d){var e=a.a.A(a.a.$b(b),c);0>e?d&&b.push(c):d||b.splice(e,1)},Ba:g,extend:c,setPrototypeOf:d,zb:g?d:c,O:b,Ha:function(a,b,c){if(!a)return a;var d={},e;for(e in a)f.call(a,e)&&(d[e]=
b.call(c,a[e],e,a));return d},Sb:function(b){for(;b.firstChild;)a.removeNode(b.firstChild)},Xb:function(b){b=a.a.la(b);for(var c=(b[0]&&b[0].ownerDocument||w).createElement("div"),d=0,e=b.length;d<e;d++)c.appendChild(a.na(b[d]));return c},Ca:function(b,c){for(var d=0,e=b.length,k=[];d<e;d++){var f=b[d].cloneNode(!0);k.push(c?a.na(f):f)}return k},ua:function(b,c){a.a.Sb(b);if(c)for(var d=0,e=c.length;d<e;d++)b.appendChild(c[d])},Wc:function(b,c){var d=b.nodeType?[b]:b;if(0<d.length){for(var e=d[0],
k=e.parentNode,f=0,l=c.length;f<l;f++)k.insertBefore(c[f],e);f=0;for(l=d.length;f<l;f++)a.removeNode(d[f])}},Ua:function(a,b){if(a.length){for(b=8===b.nodeType&&b.parentNode||b;a.length&&a[0].parentNode!==b;)a.splice(0,1);for(;1<a.length&&a[a.length-1].parentNode!==b;)a.length--;if(1<a.length){var c=a[0],d=a[a.length-1];for(a.length=0;c!==d;)a.push(c),c=c.nextSibling;a.push(d)}}return a},Yc:function(a,b){7>q?a.setAttribute("selected",b):a.selected=b},Cb:function(a){return null===a||a===p?"":a.trim?
a.trim():a.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")},Td:function(a,b){a=a||"";return b.length>a.length?!1:a.substring(0,b.length)===b},ud:function(a,b){if(a===b)return!0;if(11===a.nodeType)return!1;if(b.contains)return b.contains(1!==a.nodeType?a.parentNode:a);if(b.compareDocumentPosition)return 16==(b.compareDocumentPosition(a)&16);for(;a&&a!=b;)a=a.parentNode;return!!a},Rb:function(b){return a.a.ud(b,b.ownerDocument.documentElement)},jd:function(b){return!!a.a.Lb(b,a.a.Rb)},P:function(a){return a&&
a.tagName&&a.tagName.toLowerCase()},zc:function(b){return a.onError?function(){try{return b.apply(this,arguments)}catch(c){throw a.onError&&a.onError(c),c;}}:b},setTimeout:function(b,c){return setTimeout(a.a.zc(b),c)},Fc:function(b){setTimeout(function(){a.onError&&a.onError(b);throw b;},0)},H:function(b,c,d){var e=a.a.zc(d);d=k[c];if(a.options.useOnlyNativeEvents||d||!v)if(d||"function"!=typeof b.addEventListener)if("undefined"!=typeof b.attachEvent){var f=function(a){e.call(b,a)},l="on"+c;b.attachEvent(l,
f);a.a.I.za(b,function(){b.detachEvent(l,f)})}else throw Error("Browser doesn't support addEventListener or attachEvent");else b.addEventListener(c,e,!1);else r||(r="function"==typeof v(b).on?"on":"bind"),v(b)[r](c,e)},Fb:function(b,c){if(!b||!b.nodeType)throw Error("element must be a DOM node when calling triggerEvent");var d;"input"===a.a.P(b)&&b.type&&"click"==c.toLowerCase()?(d=b.type,d="checkbox"==d||"radio"==d):d=!1;if(a.options.useOnlyNativeEvents||!v||d)if("function"==typeof w.createEvent)if("function"==
typeof b.dispatchEvent)d=w.createEvent(l[c]||"HTMLEvents"),d.initEvent(c,!0,!0,z,0,0,0,0,0,!1,!1,!1,!1,0,b),b.dispatchEvent(d);else throw Error("The supplied element doesn't support dispatchEvent");else if(d&&b.click)b.click();else if("undefined"!=typeof b.fireEvent)b.fireEvent("on"+c);else throw Error("Browser doesn't support triggering events");else v(b).trigger(c)},c:function(b){return a.N(b)?b():b},$b:function(b){return a.N(b)?b.w():b},Eb:function(b,c,d){var k;c&&("object"===typeof b.classList?
(k=b.classList[d?"add":"remove"],a.a.C(c.match(n),function(a){k.call(b.classList,a)})):"string"===typeof b.className.baseVal?e(b.className,"baseVal",c,d):e(b,"className",c,d))},Ab:function(b,c){var d=a.a.c(c);if(null===d||d===p)d="";var e=a.h.firstChild(b);!e||3!=e.nodeType||a.h.nextSibling(e)?a.h.ua(b,[b.ownerDocument.createTextNode(d)]):e.data=d;a.a.zd(b)},Xc:function(a,b){a.name=b;if(7>=q)try{var c=a.name.replace(/[&<>'"]/g,function(a){return"&#"+a.charCodeAt(0)+";"});a.mergeAttributes(w.createElement("<input name='"+
c+"'/>"),!1)}catch(d){}},zd:function(a){9<=q&&(a=1==a.nodeType?a:a.parentNode,a.style&&(a.style.zoom=a.style.zoom))},vd:function(a){if(q){var b=a.style.width;a.style.width=0;a.style.width=b}},Od:function(b,c){b=a.a.c(b);c=a.a.c(c);for(var d=[],e=b;e<=c;e++)d.push(e);return d},la:function(a){for(var b=[],c=0,d=a.length;c<d;c++)b.push(a[c]);return b},Da:function(a){return h?Symbol(a):a},Xd:6===q,Yd:7===q,W:q,Kc:function(b,c){for(var d=a.a.la(b.getElementsByTagName("input")).concat(a.a.la(b.getElementsByTagName("textarea"))),
e="string"==typeof c?function(a){return a.name===c}:function(a){return c.test(a.name)},k=[],f=d.length-1;0<=f;f--)e(d[f])&&k.push(d[f]);return k},Md:function(b){return"string"==typeof b&&(b=a.a.Cb(b))?H&&H.parse?H.parse(b):(new Function("return "+b))():null},fc:function(b,c,d){if(!H||!H.stringify)throw Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
return H.stringify(a.a.c(b),c,d)},Nd:function(c,d,e){e=e||{};var k=e.params||{},f=e.includeFields||this.Ic,l=c;if("object"==typeof c&&"form"===a.a.P(c))for(var l=c.action,h=f.length-1;0<=h;h--)for(var g=a.a.Kc(c,f[h]),m=g.length-1;0<=m;m--)k[g[m].name]=g[m].value;d=a.a.c(d);var n=w.createElement("form");n.style.display="none";n.action=l;n.method="post";for(var q in d)c=w.createElement("input"),c.type="hidden",c.name=q,c.value=a.a.fc(a.a.c(d[q])),n.appendChild(c);b(k,function(a,b){var c=w.createElement("input");
c.type="hidden";c.name=a;c.value=b;n.appendChild(c)});w.body.appendChild(n);e.submitter?e.submitter(n):n.submit();setTimeout(function(){n.parentNode.removeChild(n)},0)}}}();a.b("utils",a.a);a.b("utils.arrayForEach",a.a.C);a.b("utils.arrayFirst",a.a.Lb);a.b("utils.arrayFilter",a.a.fb);a.b("utils.arrayGetDistinctValues",a.a.vc);a.b("utils.arrayIndexOf",a.a.A);a.b("utils.arrayMap",a.a.Mb);a.b("utils.arrayPushAll",a.a.gb);a.b("utils.arrayRemoveItem",a.a.hb);a.b("utils.cloneNodes",a.a.Ca);a.b("utils.createSymbolOrString",
a.a.Da);a.b("utils.extend",a.a.extend);a.b("utils.fieldsIncludedWithJsonPost",a.a.Ic);a.b("utils.getFormFields",a.a.Kc);a.b("utils.objectMap",a.a.Ha);a.b("utils.peekObservable",a.a.$b);a.b("utils.postJson",a.a.Nd);a.b("utils.parseJson",a.a.Md);a.b("utils.registerEventHandler",a.a.H);a.b("utils.stringifyJson",a.a.fc);a.b("utils.range",a.a.Od);a.b("utils.toggleDomNodeCssClass",a.a.Eb);a.b("utils.triggerEvent",a.a.Fb);a.b("utils.unwrapObservable",a.a.c);a.b("utils.objectForEach",a.a.O);a.b("utils.addOrRemoveItem",
a.a.Oa);a.b("utils.setTextContent",a.a.Ab);a.b("unwrap",a.a.c);Function.prototype.bind||(Function.prototype.bind=function(a){var c=this;if(1===arguments.length)return function(){return c.apply(a,arguments)};var d=Array.prototype.slice.call(arguments,1);return function(){var e=d.slice(0);e.push.apply(e,arguments);return c.apply(a,e)}});a.a.g=new function(){var b=0,c="__ko__"+(new Date).getTime(),d={},e,f;a.a.W?(e=function(a,e){var f=a[c];if(!f||"null"===f||!d[f]){if(!e)return p;f=a[c]="ko"+b++;d[f]=
{}}return d[f]},f=function(a){var b=a[c];return b?(delete d[b],a[c]=null,!0):!1}):(e=function(a,b){var d=a[c];!d&&b&&(d=a[c]={});return d},f=function(a){return a[c]?(delete a[c],!0):!1});return{get:function(a,b){var c=e(a,!1);return c&&c[b]},set:function(a,b,c){(a=e(a,c!==p))&&(a[b]=c)},Tb:function(a,b,c){a=e(a,!0);return a[b]||(a[b]=c)},clear:f,Z:function(){return b++ +c}}};a.b("utils.domData",a.a.g);a.b("utils.domData.clear",a.a.g.clear);a.a.I=new function(){function b(b,c){var d=a.a.g.get(b,e);
d===p&&c&&(d=[],a.a.g.set(b,e,d));return d}function c(c){var e=b(c,!1);if(e)for(var e=e.slice(0),f=0;f<e.length;f++)e[f](c);a.a.g.clear(c);a.a.I.cleanExternalData(c);g[c.nodeType]&&d(c.childNodes,!0)}function d(b,d){for(var e=[],k,f=0;f<b.length;f++)if(!d||8===b[f].nodeType)if(c(e[e.length]=k=b[f]),b[f]!==k)for(;f--&&-1==a.a.A(e,b[f]););}var e=a.a.g.Z(),f={1:!0,8:!0,9:!0},g={1:!0,9:!0};return{za:function(a,c){if("function"!=typeof c)throw Error("Callback must be a function");b(a,!0).push(c)},xb:function(c,
d){var f=b(c,!1);f&&(a.a.hb(f,d),0==f.length&&a.a.g.set(c,e,p))},na:function(a){f[a.nodeType]&&(c(a),g[a.nodeType]&&d(a.getElementsByTagName("*")));return a},removeNode:function(b){a.na(b);b.parentNode&&b.parentNode.removeChild(b)},cleanExternalData:function(a){v&&"function"==typeof v.cleanData&&v.cleanData([a])}}};a.na=a.a.I.na;a.removeNode=a.a.I.removeNode;a.b("cleanNode",a.na);a.b("removeNode",a.removeNode);a.b("utils.domNodeDisposal",a.a.I);a.b("utils.domNodeDisposal.addDisposeCallback",a.a.I.za);
a.b("utils.domNodeDisposal.removeDisposeCallback",a.a.I.xb);(function(){var b=[0,"",""],c=[1,"<table>","</table>"],d=[3,"<table><tbody><tr>","</tr></tbody></table>"],e=[1,"<select multiple='multiple'>","</select>"],f={thead:c,tbody:c,tfoot:c,tr:[2,"<table><tbody>","</tbody></table>"],td:d,th:d,option:e,optgroup:e},g=8>=a.a.W;a.a.ta=function(c,d){var e;if(v)if(v.parseHTML)e=v.parseHTML(c,d)||[];else{if((e=v.clean([c],d))&&e[0]){for(var k=e[0];k.parentNode&&11!==k.parentNode.nodeType;)k=k.parentNode;
k.parentNode&&k.parentNode.removeChild(k)}}else{(e=d)||(e=w);var k=e.parentWindow||e.defaultView||z,q=a.a.Cb(c).toLowerCase(),n=e.createElement("div"),r;r=(q=q.match(/^(?:\x3c!--.*?--\x3e\s*?)*?<([a-z]+)[\s>]/))&&f[q[1]]||b;q=r[0];r="ignored<div>"+r[1]+c+r[2]+"</div>";"function"==typeof k.innerShiv?n.appendChild(k.innerShiv(r)):(g&&e.body.appendChild(n),n.innerHTML=r,g&&n.parentNode.removeChild(n));for(;q--;)n=n.lastChild;e=a.a.la(n.lastChild.childNodes)}return e};a.a.Ld=function(b,c){var d=a.a.ta(b,
c);return d.length&&d[0].parentElement||a.a.Xb(d)};a.a.dc=function(b,c){a.a.Sb(b);c=a.a.c(c);if(null!==c&&c!==p)if("string"!=typeof c&&(c=c.toString()),v)v(b).html(c);else for(var d=a.a.ta(c,b.ownerDocument),e=0;e<d.length;e++)b.appendChild(d[e])}})();a.b("utils.parseHtmlFragment",a.a.ta);a.b("utils.setHtml",a.a.dc);a.aa=function(){function b(c,e){if(c)if(8==c.nodeType){var f=a.aa.Tc(c.nodeValue);null!=f&&e.push({sd:c,Jd:f})}else if(1==c.nodeType)for(var f=0,g=c.childNodes,h=g.length;f<h;f++)b(g[f],
e)}var c={};return{Wb:function(a){if("function"!=typeof a)throw Error("You can only pass a function to ko.memoization.memoize()");var b=(4294967296*(1+Math.random())|0).toString(16).substring(1)+(4294967296*(1+Math.random())|0).toString(16).substring(1);c[b]=a;return"\x3c!--[ko_memo:"+b+"]--\x3e"},ad:function(a,b){var f=c[a];if(f===p)throw Error("Couldn't find any memo with ID "+a+". Perhaps it's already been unmemoized.");try{return f.apply(null,b||[]),!0}finally{delete c[a]}},bd:function(c,e){var f=
[];b(c,f);for(var g=0,h=f.length;g<h;g++){var m=f[g].sd,l=[m];e&&a.a.gb(l,e);a.aa.ad(f[g].Jd,l);m.nodeValue="";m.parentNode&&m.parentNode.removeChild(m)}},Tc:function(a){return(a=a.match(/^\[ko_memo\:(.*?)\]$/))?a[1]:null}}}();a.b("memoization",a.aa);a.b("memoization.memoize",a.aa.Wb);a.b("memoization.unmemoize",a.aa.ad);a.b("memoization.parseMemoText",a.aa.Tc);a.b("memoization.unmemoizeDomNodeAndDescendants",a.aa.bd);a.ma=function(){function b(){if(f)for(var b=f,c=0,d;h<f;)if(d=e[h++]){if(h>b){if(5E3<=
++c){h=f;a.a.Fc(Error("'Too much recursion' after processing "+c+" task groups."));break}b=f}try{d()}catch(g){a.a.Fc(g)}}}function c(){b();h=f=e.length=0}var d,e=[],f=0,g=1,h=0;z.MutationObserver?d=function(a){var b=w.createElement("div");(new MutationObserver(a)).observe(b,{attributes:!0});return function(){b.classList.toggle("foo")}}(c):d=w&&"onreadystatechange"in w.createElement("script")?function(a){var b=w.createElement("script");b.onreadystatechange=function(){b.onreadystatechange=null;w.documentElement.removeChild(b);
b=null;a()};w.documentElement.appendChild(b)}:function(a){setTimeout(a,0)};return{scheduler:d,yb:function(b){f||a.ma.scheduler(c);e[f++]=b;return g++},cancel:function(a){a=a-(g-f);a>=h&&a<f&&(e[a]=null)},resetForTesting:function(){var a=f-h;h=f=e.length=0;return a},Rd:b}}();a.b("tasks",a.ma);a.b("tasks.schedule",a.ma.yb);a.b("tasks.runEarly",a.ma.Rd);a.Ta={throttle:function(b,c){b.throttleEvaluation=c;var d=null;return a.$({read:b,write:function(e){clearTimeout(d);d=a.a.setTimeout(function(){b(e)},
c)}})},rateLimit:function(a,c){var d,e,f;"number"==typeof c?d=c:(d=c.timeout,e=c.method);a.Hb=!1;f="function"==typeof e?e:"notifyWhenChangesStop"==e?Y:X;a.tb(function(a){return f(a,d,c)})},deferred:function(b,c){if(!0!==c)throw Error("The 'deferred' extender only accepts the value 'true', because it is not supported to turn deferral off once enabled.");b.Hb||(b.Hb=!0,b.tb(function(c){var e,f=!1;return function(){if(!f){a.ma.cancel(e);e=a.ma.yb(c);try{f=!0,b.notifySubscribers(p,"dirty")}finally{f=
!1}}}}))},notify:function(a,c){a.equalityComparer="always"==c?null:K}};var W={undefined:1,"boolean":1,number:1,string:1};a.b("extenders",a.Ta);a.gc=function(b,c,d){this.da=b;this.kc=c;this.lc=d;this.Ib=!1;this.ab=this.Jb=null;a.J(this,"dispose",this.s);a.J(this,"disposeWhenNodeIsRemoved",this.l)};a.gc.prototype.s=function(){this.Ib||(this.ab&&a.a.I.xb(this.Jb,this.ab),this.Ib=!0,this.lc(),this.da=this.kc=this.lc=this.Jb=this.ab=null)};a.gc.prototype.l=function(b){this.Jb=b;a.a.I.za(b,this.ab=this.s.bind(this))};
a.R=function(){a.a.zb(this,D);D.ob(this)};var D={ob:function(a){a.S={change:[]};a.rc=1},subscribe:function(b,c,d){var e=this;d=d||"change";var f=new a.gc(e,c?b.bind(c):b,function(){a.a.hb(e.S[d],f);e.cb&&e.cb(d)});e.Qa&&e.Qa(d);e.S[d]||(e.S[d]=[]);e.S[d].push(f);return f},notifySubscribers:function(b,c){c=c||"change";"change"===c&&this.Gb();if(this.Wa(c)){var d="change"===c&&this.dd||this.S[c].slice(0);try{a.v.wc();for(var e=0,f;f=d[e];++e)f.Ib||f.kc(b)}finally{a.v.end()}}},mb:function(){return this.rc},
Cd:function(a){return this.mb()!==a},Gb:function(){++this.rc},tb:function(b){var c=this,d=a.N(c),e,f,g,h,m;c.bb||(c.bb=c.notifySubscribers,c.notifySubscribers=Z);var l=b(function(){c.Ka=!1;d&&h===c&&(h=c.mc?c.mc():c());var a=f||m&&c.qb(g,h);m=f=e=!1;a&&c.bb(g=h)});c.pc=function(a,b){b&&c.Ka||(m=!b);c.dd=c.S.change.slice(0);c.Ka=e=!0;h=a;l()};c.oc=function(a){e||(g=a,c.bb(a,"beforeChange"))};c.qc=function(){m=!0};c.fd=function(){c.qb(g,c.w(!0))&&(f=!0)}},Wa:function(a){return this.S[a]&&this.S[a].length},
Ad:function(b){if(b)return this.S[b]&&this.S[b].length||0;var c=0;a.a.O(this.S,function(a,b){"dirty"!==a&&(c+=b.length)});return c},qb:function(a,c){return!this.equalityComparer||!this.equalityComparer(a,c)},toString:function(){return"[object Object]"},extend:function(b){var c=this;b&&a.a.O(b,function(b,e){var f=a.Ta[b];"function"==typeof f&&(c=f(c,e)||c)});return c}};a.J(D,"init",D.ob);a.J(D,"subscribe",D.subscribe);a.J(D,"extend",D.extend);a.J(D,"getSubscriptionsCount",D.Ad);a.a.Ba&&a.a.setPrototypeOf(D,
Function.prototype);a.R.fn=D;a.Pc=function(a){return null!=a&&"function"==typeof a.subscribe&&"function"==typeof a.notifySubscribers};a.b("subscribable",a.R);a.b("isSubscribable",a.Pc);a.U=a.v=function(){function b(a){d.push(e);e=a}function c(){e=d.pop()}var d=[],e,f=0;return{wc:b,end:c,ac:function(b){if(e){if(!a.Pc(b))throw Error("Only subscribable things can act as dependencies");e.nd.call(e.od,b,b.ed||(b.ed=++f))}},K:function(a,d,e){try{return b(),a.apply(d,e||[])}finally{c()}},pa:function(){if(e)return e.o.pa()},
Va:function(){if(e)return e.o.Va()},rb:function(){if(e)return e.rb},o:function(){if(e)return e.o}}}();a.b("computedContext",a.U);a.b("computedContext.getDependenciesCount",a.U.pa);a.b("computedContext.getDependencies",a.U.Va);a.b("computedContext.isInitial",a.U.rb);a.b("computedContext.registerDependency",a.U.ac);a.b("ignoreDependencies",a.Wd=a.v.K);var I=a.a.Da("_latestValue");a.sa=function(b){function c(){if(0<arguments.length)return c.qb(c[I],arguments[0])&&(c.xa(),c[I]=arguments[0],c.wa()),this;
a.v.ac(c);return c[I]}c[I]=b;a.a.Ba||a.a.extend(c,a.R.fn);a.R.fn.ob(c);a.a.zb(c,F);a.options.deferUpdates&&a.Ta.deferred(c,!0);return c};var F={equalityComparer:K,w:function(){return this[I]},wa:function(){this.notifySubscribers(this[I],"spectate");this.notifySubscribers(this[I])},xa:function(){this.notifySubscribers(this[I],"beforeChange")}};a.a.Ba&&a.a.setPrototypeOf(F,a.R.fn);var G=a.sa.Na="__ko_proto__";F[G]=a.sa;a.N=function(b){if((b="function"==typeof b&&b[G])&&b!==F[G]&&b!==a.o.fn[G])throw Error("Invalid object that looks like an observable; possibly from another Knockout instance");
return!!b};a.Ya=function(b){return"function"==typeof b&&(b[G]===F[G]||b[G]===a.o.fn[G]&&b.Mc)};a.b("observable",a.sa);a.b("isObservable",a.N);a.b("isWriteableObservable",a.Ya);a.b("isWritableObservable",a.Ya);a.b("observable.fn",F);a.J(F,"peek",F.w);a.J(F,"valueHasMutated",F.wa);a.J(F,"valueWillMutate",F.xa);a.Ia=function(b){b=b||[];if("object"!=typeof b||!("length"in b))throw Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");b=a.sa(b);a.a.zb(b,
a.Ia.fn);return b.extend({trackArrayChanges:!0})};a.Ia.fn={remove:function(b){for(var c=this.w(),d=[],e="function"!=typeof b||a.N(b)?function(a){return a===b}:b,f=0;f<c.length;f++){var g=c[f];if(e(g)){0===d.length&&this.xa();if(c[f]!==g)throw Error("Array modified during remove; cannot remove item");d.push(g);c.splice(f,1);f--}}d.length&&this.wa();return d},removeAll:function(b){if(b===p){var c=this.w(),d=c.slice(0);this.xa();c.splice(0,c.length);this.wa();return d}return b?this.remove(function(c){return 0<=
a.a.A(b,c)}):[]},destroy:function(b){var c=this.w(),d="function"!=typeof b||a.N(b)?function(a){return a===b}:b;this.xa();for(var e=c.length-1;0<=e;e--){var f=c[e];d(f)&&(f._destroy=!0)}this.wa()},destroyAll:function(b){return b===p?this.destroy(function(){return!0}):b?this.destroy(function(c){return 0<=a.a.A(b,c)}):[]},indexOf:function(b){var c=this();return a.a.A(c,b)},replace:function(a,c){var d=this.indexOf(a);0<=d&&(this.xa(),this.w()[d]=c,this.wa())},sorted:function(a){var c=this().slice(0);
return a?c.sort(a):c.sort()},reversed:function(){return this().slice(0).reverse()}};a.a.Ba&&a.a.setPrototypeOf(a.Ia.fn,a.sa.fn);a.a.C("pop push reverse shift sort splice unshift".split(" "),function(b){a.Ia.fn[b]=function(){var a=this.w();this.xa();this.yc(a,b,arguments);var d=a[b].apply(a,arguments);this.wa();return d===a?this:d}});a.a.C(["slice"],function(b){a.Ia.fn[b]=function(){var a=this();return a[b].apply(a,arguments)}});a.Oc=function(b){return a.N(b)&&"function"==typeof b.remove&&"function"==
typeof b.push};a.b("observableArray",a.Ia);a.b("isObservableArray",a.Oc);a.Ta.trackArrayChanges=function(b,c){function d(){function c(){if(h){var d=[].concat(b.w()||[]);if(b.Wa("arrayChange")){var e;if(!f||1<h)f=a.a.Ob(m,d,b.Nb);e=f}m=d;f=null;h=0;e&&e.length&&b.notifySubscribers(e,"arrayChange")}}e?c():(e=!0,l=b.notifySubscribers,b.notifySubscribers=function(a,b){b&&"change"!==b||++h;return l.apply(this,arguments)},m=[].concat(b.w()||[]),f=null,g=b.subscribe(c))}b.Nb={};c&&"object"==typeof c&&a.a.extend(b.Nb,
c);b.Nb.sparse=!0;if(!b.yc){var e=!1,f=null,g,h=0,m,l,k=b.Qa,q=b.cb;b.Qa=function(a){k&&k.call(b,a);"arrayChange"===a&&d()};b.cb=function(a){q&&q.call(b,a);"arrayChange"!==a||b.Wa("arrayChange")||(l&&(b.notifySubscribers=l,l=p),g&&g.s(),g=null,e=!1,m=p)};b.yc=function(b,c,d){function k(a,b,c){return l[l.length]={status:a,value:b,index:c}}if(e&&!h){var l=[],g=b.length,q=d.length,m=0;switch(c){case "push":m=g;case "unshift":for(c=0;c<q;c++)k("added",d[c],m+c);break;case "pop":m=g-1;case "shift":g&&
k("deleted",b[m],m);break;case "splice":c=Math.min(Math.max(0,0>d[0]?g+d[0]:d[0]),g);for(var g=1===q?g:Math.min(c+(d[1]||0),g),q=c+q-2,m=Math.max(g,q),U=[],L=[],p=2;c<m;++c,++p)c<g&&L.push(k("deleted",b[c],c)),c<q&&U.push(k("added",d[p],c));a.a.Jc(L,U);break;default:return}f=l}}}};var t=a.a.Da("_state");a.o=a.$=function(b,c,d){function e(){if(0<arguments.length){if("function"===typeof f)f.apply(g.lb,arguments);else throw Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
return this}g.qa||a.v.ac(e);(g.ka||g.G&&e.Xa())&&e.ha();return g.X}"object"===typeof b?d=b:(d=d||{},b&&(d.read=b));if("function"!=typeof d.read)throw Error("Pass a function that returns the value of the ko.computed");var f=d.write,g={X:p,ra:!0,ka:!0,pb:!1,hc:!1,qa:!1,vb:!1,G:!1,Vc:d.read,lb:c||d.owner,l:d.disposeWhenNodeIsRemoved||d.l||null,Sa:d.disposeWhen||d.Sa,Qb:null,F:{},V:0,Hc:null};e[t]=g;e.Mc="function"===typeof f;a.a.Ba||a.a.extend(e,a.R.fn);a.R.fn.ob(e);a.a.zb(e,C);d.pure?(g.vb=!0,g.G=!0,
a.a.extend(e,da)):d.deferEvaluation&&a.a.extend(e,ea);a.options.deferUpdates&&a.Ta.deferred(e,!0);g.l&&(g.hc=!0,g.l.nodeType||(g.l=null));g.G||d.deferEvaluation||e.ha();g.l&&e.ja()&&a.a.I.za(g.l,g.Qb=function(){e.s()});return e};var C={equalityComparer:K,pa:function(){return this[t].V},Va:function(){var b=[];a.a.O(this[t].F,function(a,d){b[d.La]=d.da});return b},Ub:function(b){if(!this[t].V)return!1;var c=this.Va();return-1!==a.a.A(c,b)?!0:!!a.a.Lb(c,function(a){return a.Ub&&a.Ub(b)})},tc:function(a,
c,d){if(this[t].vb&&c===this)throw Error("A 'pure' computed must not be called recursively");this[t].F[a]=d;d.La=this[t].V++;d.Ma=c.mb()},Xa:function(){var a,c,d=this[t].F;for(a in d)if(Object.prototype.hasOwnProperty.call(d,a)&&(c=d[a],this.Ja&&c.da.Ka||c.da.Cd(c.Ma)))return!0},Id:function(){this.Ja&&!this[t].pb&&this.Ja(!1)},ja:function(){var a=this[t];return a.ka||0<a.V},Qd:function(){this.Ka?this[t].ka&&(this[t].ra=!0):this.Gc()},Zc:function(a){if(a.Hb){var c=a.subscribe(this.Id,this,"dirty"),
d=a.subscribe(this.Qd,this);return{da:a,s:function(){c.s();d.s()}}}return a.subscribe(this.Gc,this)},Gc:function(){var b=this,c=b.throttleEvaluation;c&&0<=c?(clearTimeout(this[t].Hc),this[t].Hc=a.a.setTimeout(function(){b.ha(!0)},c)):b.Ja?b.Ja(!0):b.ha(!0)},ha:function(b){var c=this[t],d=c.Sa,e=!1;if(!c.pb&&!c.qa){if(c.l&&!a.a.Rb(c.l)||d&&d()){if(!c.hc){this.s();return}}else c.hc=!1;c.pb=!0;try{e=this.yd(b)}finally{c.pb=!1}return e}},yd:function(b){var c=this[t],d=!1,e=c.vb?p:!c.V,d={pd:this,kb:c.F,
Pb:c.V};a.v.wc({od:d,nd:ba,o:this,rb:e});c.F={};c.V=0;var f=this.xd(c,d);c.V?d=this.qb(c.X,f):(this.s(),d=!0);d&&(c.G?this.Gb():this.notifySubscribers(c.X,"beforeChange"),c.X=f,this.notifySubscribers(c.X,"spectate"),!c.G&&b&&this.notifySubscribers(c.X),this.qc&&this.qc());e&&this.notifySubscribers(c.X,"awake");return d},xd:function(b,c){try{var d=b.Vc;return b.lb?d.call(b.lb):d()}finally{a.v.end(),c.Pb&&!b.G&&a.a.O(c.kb,aa),b.ra=b.ka=!1}},w:function(a){var c=this[t];(c.ka&&(a||!c.V)||c.G&&this.Xa())&&
this.ha();return c.X},tb:function(b){a.R.fn.tb.call(this,b);this.mc=function(){this[t].G||(this[t].ra?this.ha():this[t].ka=!1);return this[t].X};this.Ja=function(a){this.oc(this[t].X);this[t].ka=!0;a&&(this[t].ra=!0);this.pc(this,!a)}},s:function(){var b=this[t];!b.G&&b.F&&a.a.O(b.F,function(a,b){b.s&&b.s()});b.l&&b.Qb&&a.a.I.xb(b.l,b.Qb);b.F=p;b.V=0;b.qa=!0;b.ra=!1;b.ka=!1;b.G=!1;b.l=p;b.Sa=p;b.Vc=p;this.Mc||(b.lb=p)}},da={Qa:function(b){var c=this,d=c[t];if(!d.qa&&d.G&&"change"==b){d.G=!1;if(d.ra||
c.Xa())d.F=null,d.V=0,c.ha()&&c.Gb();else{var e=[];a.a.O(d.F,function(a,b){e[b.La]=a});a.a.C(e,function(a,b){var e=d.F[a],m=c.Zc(e.da);m.La=b;m.Ma=e.Ma;d.F[a]=m});c.Xa()&&c.ha()&&c.Gb()}d.qa||c.notifySubscribers(d.X,"awake")}},cb:function(b){var c=this[t];c.qa||"change"!=b||this.Wa("change")||(a.a.O(c.F,function(a,b){b.s&&(c.F[a]={da:b.da,La:b.La,Ma:b.Ma},b.s())}),c.G=!0,this.notifySubscribers(p,"asleep"))},mb:function(){var b=this[t];b.G&&(b.ra||this.Xa())&&this.ha();return a.R.fn.mb.call(this)}},
ea={Qa:function(a){"change"!=a&&"beforeChange"!=a||this.w()}};a.a.Ba&&a.a.setPrototypeOf(C,a.R.fn);var N=a.sa.Na;C[N]=a.o;a.Nc=function(a){return"function"==typeof a&&a[N]===C[N]};a.Ed=function(b){return a.Nc(b)&&b[t]&&b[t].vb};a.b("computed",a.o);a.b("dependentObservable",a.o);a.b("isComputed",a.Nc);a.b("isPureComputed",a.Ed);a.b("computed.fn",C);a.J(C,"peek",C.w);a.J(C,"dispose",C.s);a.J(C,"isActive",C.ja);a.J(C,"getDependenciesCount",C.pa);a.J(C,"getDependencies",C.Va);a.wb=function(b,c){if("function"===
typeof b)return a.o(b,c,{pure:!0});b=a.a.extend({},b);b.pure=!0;return a.o(b,c)};a.b("pureComputed",a.wb);(function(){function b(a,f,g){g=g||new d;a=f(a);if("object"!=typeof a||null===a||a===p||a instanceof RegExp||a instanceof Date||a instanceof String||a instanceof Number||a instanceof Boolean)return a;var h=a instanceof Array?[]:{};g.save(a,h);c(a,function(c){var d=f(a[c]);switch(typeof d){case "boolean":case "number":case "string":case "function":h[c]=d;break;case "object":case "undefined":var k=
g.get(d);h[c]=k!==p?k:b(d,f,g)}});return h}function c(a,b){if(a instanceof Array){for(var c=0;c<a.length;c++)b(c);"function"==typeof a.toJSON&&b("toJSON")}else for(c in a)b(c)}function d(){this.keys=[];this.values=[]}a.$c=function(c){if(0==arguments.length)throw Error("When calling ko.toJS, pass the object you want to convert.");return b(c,function(b){for(var c=0;a.N(b)&&10>c;c++)b=b();return b})};a.toJSON=function(b,c,d){b=a.$c(b);return a.a.fc(b,c,d)};d.prototype={constructor:d,save:function(b,
c){var d=a.a.A(this.keys,b);0<=d?this.values[d]=c:(this.keys.push(b),this.values.push(c))},get:function(b){b=a.a.A(this.keys,b);return 0<=b?this.values[b]:p}}})();a.b("toJS",a.$c);a.b("toJSON",a.toJSON);a.Vd=function(b,c,d){function e(c){var e=a.wb(b,d).extend({Ga:"always"}),h=e.subscribe(function(a){a&&(h.s(),c(a))});e.notifySubscribers(e.w());return h}return"function"!==typeof Promise||c?e(c.bind(d)):new Promise(e)};a.b("when",a.Vd);(function(){a.u={L:function(b){switch(a.a.P(b)){case "option":return!0===
b.__ko__hasDomDataOptionValue__?a.a.g.get(b,a.f.options.Yb):7>=a.a.W?b.getAttributeNode("value")&&b.getAttributeNode("value").specified?b.value:b.text:b.value;case "select":return 0<=b.selectedIndex?a.u.L(b.options[b.selectedIndex]):p;default:return b.value}},ya:function(b,c,d){switch(a.a.P(b)){case "option":"string"===typeof c?(a.a.g.set(b,a.f.options.Yb,p),"__ko__hasDomDataOptionValue__"in b&&delete b.__ko__hasDomDataOptionValue__,b.value=c):(a.a.g.set(b,a.f.options.Yb,c),b.__ko__hasDomDataOptionValue__=
!0,b.value="number"===typeof c?c:"");break;case "select":if(""===c||null===c)c=p;for(var e=-1,f=0,g=b.options.length,h;f<g;++f)if(h=a.u.L(b.options[f]),h==c||""===h&&c===p){e=f;break}if(d||0<=e||c===p&&1<b.size)b.selectedIndex=e,6===a.a.W&&a.a.setTimeout(function(){b.selectedIndex=e},0);break;default:if(null===c||c===p)c="";b.value=c}}}})();a.b("selectExtensions",a.u);a.b("selectExtensions.readValue",a.u.L);a.b("selectExtensions.writeValue",a.u.ya);a.m=function(){function b(b){b=a.a.Cb(b);123===b.charCodeAt(0)&&
(b=b.slice(1,-1));b+="\n,";var c=[],d=b.match(e),q,n=[],h=0;if(1<d.length){for(var y=0,A;A=d[y];++y){var u=A.charCodeAt(0);if(44===u){if(0>=h){c.push(q&&n.length?{key:q,value:n.join("")}:{unknown:q||n.join("")});q=h=0;n=[];continue}}else if(58===u){if(!h&&!q&&1===n.length){q=n.pop();continue}}else if(47===u&&1<A.length&&(47===A.charCodeAt(1)||42===A.charCodeAt(1)))continue;else 47===u&&y&&1<A.length?(u=d[y-1].match(f))&&!g[u[0]]&&(b=b.substr(b.indexOf(A)+1),d=b.match(e),y=-1,A="/"):40===u||123===
u||91===u?++h:41===u||125===u||93===u?--h:q||n.length||34!==u&&39!==u||(A=A.slice(1,-1));n.push(A)}if(0<h)throw Error("Unbalanced parentheses, braces, or brackets");}return c}var c=["true","false","null","undefined"],d=/^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i,e=RegExp("\"(?:\\\\.|[^\"])*\"|'(?:\\\\.|[^'])*'|`(?:\\\\.|[^`])*`|/\\*(?:[^*]|\\*+[^*/])*\\*+/|//.*\n|/(?:\\\\.|[^/])+/w*|[^\\s:,/][^,\"'`{}()/:[\\]]*[^\\s,\"'`{}()/:[\\]]|[^\\s]","g"),f=/[\])"'A-Za-z0-9_$]+$/,g={"in":1,"return":1,
"typeof":1},h={};return{Ra:[],va:h,Zb:b,ub:function(e,f){function k(b,e){var f;if(!y){var l=a.getBindingHandler(b);if(l&&l.preprocess&&!(e=l.preprocess(e,b,k)))return;if(l=h[b])f=e,0<=a.a.A(c,f)?f=!1:(l=f.match(d),f=null===l?!1:l[1]?"Object("+l[1]+")"+l[2]:f),l=f;l&&n.push("'"+("string"==typeof h[b]?h[b]:b)+"':function(_z){"+f+"=_z}")}g&&(e="function(){return "+e+" }");q.push("'"+b+"':"+e)}f=f||{};var q=[],n=[],g=f.valueAccessors,y=f.bindingParams,A="string"===typeof e?b(e):e;a.a.C(A,function(a){k(a.key||
a.unknown,a.value)});n.length&&k("_ko_property_writers","{"+n.join(",")+" }");return q.join(",")},Hd:function(a,b){for(var c=0;c<a.length;c++)if(a[c].key==b)return!0;return!1},$a:function(b,c,d,e,f){if(b&&a.N(b))!a.Ya(b)||f&&b.w()===e||b(e);else if((b=c.get("_ko_property_writers"))&&b[d])b[d](e)}}}();a.b("expressionRewriting",a.m);a.b("expressionRewriting.bindingRewriteValidators",a.m.Ra);a.b("expressionRewriting.parseObjectLiteral",a.m.Zb);a.b("expressionRewriting.preProcessBindings",a.m.ub);a.b("expressionRewriting._twoWayBindings",
a.m.va);a.b("jsonExpressionRewriting",a.m);a.b("jsonExpressionRewriting.insertPropertyAccessorsIntoJson",a.m.ub);(function(){function b(a){return 8==a.nodeType&&g.test(f?a.text:a.nodeValue)}function c(a){return 8==a.nodeType&&h.test(f?a.text:a.nodeValue)}function d(d,e){for(var f=d,g=1,h=[];f=f.nextSibling;){if(c(f)&&(a.a.g.set(f,l,!0),g--,0===g))return h;h.push(f);b(f)&&g++}if(!e)throw Error("Cannot find closing comment tag to match: "+d.nodeValue);return null}function e(a,b){var c=d(a,b);return c?
0<c.length?c[c.length-1].nextSibling:a.nextSibling:null}var f=w&&"\x3c!--test--\x3e"===w.createComment("test").text,g=f?/^\x3c!--\s*ko(?:\s+([\s\S]+))?\s*--\x3e$/:/^\s*ko(?:\s+([\s\S]+))?\s*$/,h=f?/^\x3c!--\s*\/ko\s*--\x3e$/:/^\s*\/ko\s*$/,m={ul:!0,ol:!0},l="__ko_matchedEndComment__";a.h={ea:{},childNodes:function(a){return b(a)?d(a):a.childNodes},Ea:function(c){if(b(c)){c=a.h.childNodes(c);for(var d=0,e=c.length;d<e;d++)a.removeNode(c[d])}else a.a.Sb(c)},ua:function(c,d){if(b(c)){a.h.Ea(c);for(var e=
c.nextSibling,f=0,l=d.length;f<l;f++)e.parentNode.insertBefore(d[f],e)}else a.a.ua(c,d)},Uc:function(a,c){b(a)?a.parentNode.insertBefore(c,a.nextSibling):a.firstChild?a.insertBefore(c,a.firstChild):a.appendChild(c)},Vb:function(c,d,e){e?b(c)?c.parentNode.insertBefore(d,e.nextSibling):e.nextSibling?c.insertBefore(d,e.nextSibling):c.appendChild(d):a.h.Uc(c,d)},firstChild:function(a){if(b(a))return!a.nextSibling||c(a.nextSibling)?null:a.nextSibling;if(a.firstChild&&c(a.firstChild))throw Error("Found invalid end comment, as the first child of "+
a);return a.firstChild},nextSibling:function(d){b(d)&&(d=e(d));if(d.nextSibling&&c(d.nextSibling)){var f=d.nextSibling;if(c(f)&&!a.a.g.get(f,l))throw Error("Found end comment without a matching opening comment, as child of "+d);return null}return d.nextSibling},Bd:b,Ud:function(a){return(a=(f?a.text:a.nodeValue).match(g))?a[1]:null},Rc:function(d){if(m[a.a.P(d)]){var f=d.firstChild;if(f){do if(1===f.nodeType){var l;l=f.firstChild;var g=null;if(l){do if(g)g.push(l);else if(b(l)){var h=e(l,!0);h?l=
h:g=[l]}else c(l)&&(g=[l]);while(l=l.nextSibling)}if(l=g)for(g=f.nextSibling,h=0;h<l.length;h++)g?d.insertBefore(l[h],g):d.appendChild(l[h])}while(f=f.nextSibling)}}}}})();a.b("virtualElements",a.h);a.b("virtualElements.allowedBindings",a.h.ea);a.b("virtualElements.emptyNode",a.h.Ea);a.b("virtualElements.insertAfter",a.h.Vb);a.b("virtualElements.prepend",a.h.Uc);a.b("virtualElements.setDomNodeChildren",a.h.ua);(function(){a.ga=function(){this.md={}};a.a.extend(a.ga.prototype,{nodeHasBindings:function(b){switch(b.nodeType){case 1:return null!=
b.getAttribute("data-bind")||a.i.getComponentNameForNode(b);case 8:return a.h.Bd(b);default:return!1}},getBindings:function(b,c){var d=this.getBindingsString(b,c),d=d?this.parseBindingsString(d,c,b):null;return a.i.sc(d,b,c,!1)},getBindingAccessors:function(b,c){var d=this.getBindingsString(b,c),d=d?this.parseBindingsString(d,c,b,{valueAccessors:!0}):null;return a.i.sc(d,b,c,!0)},getBindingsString:function(b){switch(b.nodeType){case 1:return b.getAttribute("data-bind");case 8:return a.h.Ud(b);default:return null}},
parseBindingsString:function(b,c,d,e){try{var f=this.md,g=b+(e&&e.valueAccessors||""),h;if(!(h=f[g])){var m,l="with($context){with($data||{}){return{"+a.m.ub(b,e)+"}}}";m=new Function("$context","$element",l);h=f[g]=m}return h(c,d)}catch(k){throw k.message="Unable to parse bindings.\nBindings value: "+b+"\nMessage: "+k.message,k;}}});a.ga.instance=new a.ga})();a.b("bindingProvider",a.ga);(function(){function b(b){var c=(b=a.a.g.get(b,B))&&b.M;c&&(b.M=null,c.Sc())}function c(c,d,e){this.node=c;this.xc=
d;this.ib=[];this.T=!1;d.M||a.a.I.za(c,b);e&&e.M&&(e.M.ib.push(c),this.Kb=e)}function d(a){return function(){return a}}function e(a){return a()}function f(b){return a.a.Ha(a.v.K(b),function(a,c){return function(){return b()[c]}})}function g(b,c,e){return"function"===typeof b?f(b.bind(null,c,e)):a.a.Ha(b,d)}function h(a,b){return f(this.getBindings.bind(this,a,b))}function m(b,c){var d=a.h.firstChild(c);if(d){var e,f=a.ga.instance,k=f.preprocessNode;if(k){for(;e=d;)d=a.h.nextSibling(e),k.call(f,e);
d=a.h.firstChild(c)}for(;e=d;)d=a.h.nextSibling(e),l(b,e)}a.j.Ga(c,a.j.T)}function l(b,c){var d=b,e=1===c.nodeType;e&&a.h.Rc(c);if(e||a.ga.instance.nodeHasBindings(c))d=q(c,null,b).bindingContextForDescendants;d&&!u[a.a.P(c)]&&m(d,c)}function k(b){var c=[],d={},e=[];a.a.O(b,function ca(f){if(!d[f]){var l=a.getBindingHandler(f);l&&(l.after&&(e.push(f),a.a.C(l.after,function(c){if(b[c]){if(-1!==a.a.A(e,c))throw Error("Cannot combine the following bindings, because they have a cyclic dependency: "+e.join(", "));
ca(c)}}),e.length--),c.push({key:f,Lc:l}));d[f]=!0}});return c}function q(b,c,d){var f=a.a.g.Tb(b,B,{}),l=f.gd;if(!c){if(l)throw Error("You cannot apply bindings multiple times to the same element.");f.gd=!0}l||(f.context=d);var g;if(c&&"function"!==typeof c)g=c;else{var q=a.ga.instance,n=q.getBindingAccessors||h,m=a.$(function(){if(g=c?c(d,b):n.call(q,b,d)){if(d[r])d[r]();if(d[A])d[A]()}return g},null,{l:b});g&&m.ja()||(m=null)}var y=d,u;if(g){var J=function(){return a.a.Ha(m?m():g,e)},t=m?function(a){return function(){return e(m()[a])}}:
function(a){return g[a]};J.get=function(a){return g[a]&&e(t(a))};J.has=function(a){return a in g};a.j.T in g&&a.j.subscribe(b,a.j.T,function(){var c=(0,g[a.j.T])();if(c){var d=a.h.childNodes(b);d.length&&c(d,a.Dc(d[0]))}});a.j.oa in g&&(y=a.j.Bb(b,d),a.j.subscribe(b,a.j.oa,function(){var c=(0,g[a.j.oa])();c&&a.h.firstChild(b)&&c(b)}));f=k(g);a.a.C(f,function(c){var d=c.Lc.init,e=c.Lc.update,f=c.key;if(8===b.nodeType&&!a.h.ea[f])throw Error("The binding '"+f+"' cannot be used with virtual elements");
try{"function"==typeof d&&a.v.K(function(){var a=d(b,t(f),J,y.$data,y);if(a&&a.controlsDescendantBindings){if(u!==p)throw Error("Multiple bindings ("+u+" and "+f+") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");u=f}}),"function"==typeof e&&a.$(function(){e(b,t(f),J,y.$data,y)},null,{l:b})}catch(l){throw l.message='Unable to process binding "'+f+": "+g[f]+'"\nMessage: '+l.message,l;}})}f=u===p;return{shouldBindDescendants:f,
bindingContextForDescendants:f&&y}}function n(b,c){return b&&b instanceof a.fa?b:new a.fa(b,p,p,c)}var r=a.a.Da("_subscribable"),y=a.a.Da("_ancestorBindingInfo"),A=a.a.Da("_dataDependency");a.f={};var u={script:!0,textarea:!0,template:!0};a.getBindingHandler=function(b){return a.f[b]};var J={};a.fa=function(b,c,d,e,f){function l(){var b=q?h():h,f=a.a.c(b);c?(a.a.extend(k,c),y in c&&(k[y]=c[y])):(k.$parents=[],k.$root=f,k.ko=a);k[r]=n;g?f=k.$data:(k.$rawData=b,k.$data=f);d&&(k[d]=f);e&&e(k,c,f);if(c&&
c[r]&&!a.U.o().Ub(c[r]))c[r]();m&&(k[A]=m);return k.$data}var k=this,g=b===J,h=g?p:b,q="function"==typeof h&&!a.N(h),n,m=f&&f.dataDependency;f&&f.exportDependencies?l():(n=a.wb(l),n.w(),n.ja()?n.equalityComparer=null:k[r]=p)};a.fa.prototype.createChildContext=function(b,c,d,e){!e&&c&&"object"==typeof c&&(e=c,c=e.as,d=e.extend);if(c&&e&&e.noChildContext){var f="function"==typeof b&&!a.N(b);return new a.fa(J,this,null,function(a){d&&d(a);a[c]=f?b():b},e)}return new a.fa(b,this,c,function(a,b){a.$parentContext=
b;a.$parent=b.$data;a.$parents=(b.$parents||[]).slice(0);a.$parents.unshift(a.$parent);d&&d(a)},e)};a.fa.prototype.extend=function(b,c){return new a.fa(J,this,null,function(c){a.a.extend(c,"function"==typeof b?b(c):b)},c)};var B=a.a.g.Z();c.prototype.Sc=function(){this.Kb&&this.Kb.M&&this.Kb.M.rd(this.node)};c.prototype.rd=function(b){a.a.hb(this.ib,b);!this.ib.length&&this.T&&this.Bc()};c.prototype.Bc=function(){this.T=!0;this.xc.M&&!this.ib.length&&(this.xc.M=null,a.a.I.xb(this.node,b),a.j.Ga(this.node,
a.j.oa),this.Sc())};a.j={T:"childrenComplete",oa:"descendantsComplete",subscribe:function(b,c,d,e){b=a.a.g.Tb(b,B,{});b.Fa||(b.Fa=new a.R);return b.Fa.subscribe(d,e,c)},Ga:function(b,c){var d=a.a.g.get(b,B);if(d&&(d.Fa&&d.Fa.notifySubscribers(b,c),c==a.j.T))if(d.M)d.M.Bc();else if(d.M===p&&d.Fa&&d.Fa.Wa(a.j.oa))throw Error("descendantsComplete event not supported for bindings on this node");},Bb:function(b,d){var e=a.a.g.Tb(b,B,{});e.M||(e.M=new c(b,e,d[y]));return d[y]==e?d:d.extend(function(a){a[y]=
e})}};a.Sd=function(b){return(b=a.a.g.get(b,B))&&b.context};a.eb=function(b,c,d){1===b.nodeType&&a.h.Rc(b);return q(b,c,n(d))};a.kd=function(b,c,d){d=n(d);return a.eb(b,g(c,d,b),d)};a.Pa=function(a,b){1!==b.nodeType&&8!==b.nodeType||m(n(a),b)};a.uc=function(a,b,c){!v&&z.jQuery&&(v=z.jQuery);if(2>arguments.length){if(b=w.body,!b)throw Error("ko.applyBindings: could not find document.body; has the document been loaded?");}else if(!b||1!==b.nodeType&&8!==b.nodeType)throw Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
l(n(a,c),b)};a.Cc=function(b){return!b||1!==b.nodeType&&8!==b.nodeType?p:a.Sd(b)};a.Dc=function(b){return(b=a.Cc(b))?b.$data:p};a.b("bindingHandlers",a.f);a.b("bindingEvent",a.j);a.b("bindingEvent.subscribe",a.j.subscribe);a.b("bindingEvent.startPossiblyAsyncContentBinding",a.j.Bb);a.b("applyBindings",a.uc);a.b("applyBindingsToDescendants",a.Pa);a.b("applyBindingAccessorsToNode",a.eb);a.b("applyBindingsToNode",a.kd);a.b("contextFor",a.Cc);a.b("dataFor",a.Dc)})();(function(b){function c(c,e){var l=
Object.prototype.hasOwnProperty.call(f,c)?f[c]:b,k;l?l.subscribe(e):(l=f[c]=new a.R,l.subscribe(e),d(c,function(b,d){var e=!(!d||!d.synchronous);g[c]={definition:b,Fd:e};delete f[c];k||e?l.notifySubscribers(b):a.ma.yb(function(){l.notifySubscribers(b)})}),k=!0)}function d(a,b){e("getConfig",[a],function(c){c?e("loadComponent",[a,c],function(a){b(a,c)}):b(null,null)})}function e(c,d,f,k){k||(k=a.i.loaders.slice(0));var g=k.shift();if(g){var n=g[c];if(n){var r=!1;if(n.apply(g,d.concat(function(a){r?
f(null):null!==a?f(a):e(c,d,f,k)}))!==b&&(r=!0,!g.suppressLoaderExceptions))throw Error("Component loaders must supply values by invoking the callback, not by returning values synchronously.");}else e(c,d,f,k)}else f(null)}var f={},g={};a.i={get:function(d,e){var f=Object.prototype.hasOwnProperty.call(g,d)?g[d]:b;f?f.Fd?a.v.K(function(){e(f.definition)}):a.ma.yb(function(){e(f.definition)}):c(d,e)},Ac:function(a){delete g[a]},nc:e};a.i.loaders=[];a.b("components",a.i);a.b("components.get",a.i.get);
a.b("components.clearCachedDefinition",a.i.Ac)})();(function(){function b(b,c,d,e){function g(){0===--A&&e(h)}var h={},A=2,u=d.template;d=d.viewModel;u?f(c,u,function(c){a.i.nc("loadTemplate",[b,c],function(a){h.template=a;g()})}):g();d?f(c,d,function(c){a.i.nc("loadViewModel",[b,c],function(a){h[m]=a;g()})}):g()}function c(a,b,d){if("function"===typeof b)d(function(a){return new b(a)});else if("function"===typeof b[m])d(b[m]);else if("instance"in b){var e=b.instance;d(function(){return e})}else"viewModel"in
b?c(a,b.viewModel,d):a("Unknown viewModel value: "+b)}function d(b){switch(a.a.P(b)){case "script":return a.a.ta(b.text);case "textarea":return a.a.ta(b.value);case "template":if(e(b.content))return a.a.Ca(b.content.childNodes)}return a.a.Ca(b.childNodes)}function e(a){return z.DocumentFragment?a instanceof DocumentFragment:a&&11===a.nodeType}function f(a,b,c){"string"===typeof b.require?T||z.require?(T||z.require)([b.require],c):a("Uses require, but no AMD loader is present"):c(b)}function g(a){return function(b){throw Error("Component '"+
a+"': "+b);}}var h={};a.i.register=function(b,c){if(!c)throw Error("Invalid configuration for "+b);if(a.i.sb(b))throw Error("Component "+b+" is already registered");h[b]=c};a.i.sb=function(a){return Object.prototype.hasOwnProperty.call(h,a)};a.i.unregister=function(b){delete h[b];a.i.Ac(b)};a.i.Ec={getConfig:function(b,c){c(a.i.sb(b)?h[b]:null)},loadComponent:function(a,c,d){var e=g(a);f(e,c,function(c){b(a,e,c,d)})},loadTemplate:function(b,c,f){b=g(b);if("string"===typeof c)f(a.a.ta(c));else if(c instanceof
Array)f(c);else if(e(c))f(a.a.la(c.childNodes));else if(c.element)if(c=c.element,z.HTMLElement?c instanceof HTMLElement:c&&c.tagName&&1===c.nodeType)f(d(c));else if("string"===typeof c){var h=w.getElementById(c);h?f(d(h)):b("Cannot find element with ID "+c)}else b("Unknown element type: "+c);else b("Unknown template value: "+c)},loadViewModel:function(a,b,d){c(g(a),b,d)}};var m="createViewModel";a.b("components.register",a.i.register);a.b("components.isRegistered",a.i.sb);a.b("components.unregister",
a.i.unregister);a.b("components.defaultLoader",a.i.Ec);a.i.loaders.push(a.i.Ec);a.i.cd=h})();(function(){function b(b,e){var f=b.getAttribute("params");if(f){var f=c.parseBindingsString(f,e,b,{valueAccessors:!0,bindingParams:!0}),f=a.a.Ha(f,function(c){return a.o(c,null,{l:b})}),g=a.a.Ha(f,function(c){var e=c.w();return c.ja()?a.o({read:function(){return a.a.c(c())},write:a.Ya(e)&&function(a){c()(a)},l:b}):e});Object.prototype.hasOwnProperty.call(g,"$raw")||(g.$raw=f);return g}return{$raw:{}}}a.i.getComponentNameForNode=
function(b){var c=a.a.P(b);if(a.i.sb(c)&&(-1!=c.indexOf("-")||"[object HTMLUnknownElement]"==""+b||8>=a.a.W&&b.tagName===c))return c};a.i.sc=function(c,e,f,g){if(1===e.nodeType){var h=a.i.getComponentNameForNode(e);if(h){c=c||{};if(c.component)throw Error('Cannot use the "component" binding on a custom element matching a component');var m={name:h,params:b(e,f)};c.component=g?function(){return m}:m}}return c};var c=new a.ga;9>a.a.W&&(a.i.register=function(a){return function(b){return a.apply(this,
arguments)}}(a.i.register),w.createDocumentFragment=function(b){return function(){var c=b(),f=a.i.cd,g;for(g in f);return c}}(w.createDocumentFragment))})();(function(){function b(b,c,d){c=c.template;if(!c)throw Error("Component '"+b+"' has no template");b=a.a.Ca(c);a.h.ua(d,b)}function c(a,b,c){var d=a.createViewModel;return d?d.call(a,b,c):b}var d=0;a.f.component={init:function(e,f,g,h,m){function l(){var a=k&&k.dispose;"function"===typeof a&&a.call(k);n&&n.s();q=k=n=null}var k,q,n,r=a.a.la(a.h.childNodes(e));
a.h.Ea(e);a.a.I.za(e,l);a.o(function(){var g=a.a.c(f()),h,u;"string"===typeof g?h=g:(h=a.a.c(g.name),u=a.a.c(g.params));if(!h)throw Error("No component name specified");var p=a.j.Bb(e,m),B=q=++d;a.i.get(h,function(d){if(q===B){l();if(!d)throw Error("Unknown component '"+h+"'");b(h,d,e);var f=c(d,u,{element:e,templateNodes:r});d=p.createChildContext(f,{extend:function(a){a.$component=f;a.$componentTemplateNodes=r}});f&&f.koDescendantsComplete&&(n=a.j.subscribe(e,a.j.oa,f.koDescendantsComplete,f));
k=f;a.Pa(d,e)}})},null,{l:e});return{controlsDescendantBindings:!0}}};a.h.ea.component=!0})();var V={"class":"className","for":"htmlFor"};a.f.attr={update:function(b,c){var d=a.a.c(c())||{};a.a.O(d,function(c,d){d=a.a.c(d);var g=c.indexOf(":"),g="lookupNamespaceURI"in b&&0<g&&b.lookupNamespaceURI(c.substr(0,g)),h=!1===d||null===d||d===p;h?g?b.removeAttributeNS(g,c):b.removeAttribute(c):d=d.toString();8>=a.a.W&&c in V?(c=V[c],h?b.removeAttribute(c):b[c]=d):h||(g?b.setAttributeNS(g,c,d):b.setAttribute(c,
d));"name"===c&&a.a.Xc(b,h?"":d)})}};(function(){a.f.checked={after:["value","attr"],init:function(b,c,d){function e(){var e=b.checked,f=g();if(!a.U.rb()&&(e||!m&&!a.U.pa())){var l=a.v.K(c);if(k){var n=q?l.w():l,B=r;r=f;B!==f?e&&(a.a.Oa(n,f,!0),a.a.Oa(n,B,!1)):a.a.Oa(n,f,e);q&&a.Ya(l)&&l(n)}else h&&(f===p?f=e:e||(f=p)),a.m.$a(l,d,"checked",f,!0)}}function f(){var d=a.a.c(c()),e=g();k?(b.checked=0<=a.a.A(d,e),r=e):b.checked=h&&e===p?!!d:g()===d}var g=a.wb(function(){if(d.has("checkedValue"))return a.a.c(d.get("checkedValue"));
if(n)return d.has("value")?a.a.c(d.get("value")):b.value}),h="checkbox"==b.type,m="radio"==b.type;if(h||m){var l=c(),k=h&&a.a.c(l)instanceof Array,q=!(k&&l.push&&l.splice),n=m||k,r=k?g():p;m&&!b.name&&a.f.uniqueName.init(b,function(){return!0});a.o(e,null,{l:b});a.a.H(b,"click",e);a.o(f,null,{l:b});l=p}}};a.m.va.checked=!0;a.f.checkedValue={update:function(b,c){b.value=a.a.c(c())}}})();a.f["class"]={update:function(b,c){var d=a.a.Cb(a.a.c(c()));a.a.Eb(b,b.__ko__cssValue,!1);b.__ko__cssValue=d;a.a.Eb(b,
d,!0)}};a.f.css={update:function(b,c){var d=a.a.c(c());null!==d&&"object"==typeof d?a.a.O(d,function(c,d){d=a.a.c(d);a.a.Eb(b,c,d)}):a.f["class"].update(b,c)}};a.f.enable={update:function(b,c){var d=a.a.c(c());d&&b.disabled?b.removeAttribute("disabled"):d||b.disabled||(b.disabled=!0)}};a.f.disable={update:function(b,c){a.f.enable.update(b,function(){return!a.a.c(c())})}};a.f.event={init:function(b,c,d,e,f){var g=c()||{};a.a.O(g,function(g){"string"==typeof g&&a.a.H(b,g,function(b){var l,k=c()[g];
if(k){try{var q=a.a.la(arguments);e=f.$data;q.unshift(e);l=k.apply(e,q)}finally{!0!==l&&(b.preventDefault?b.preventDefault():b.returnValue=!1)}!1===d.get(g+"Bubble")&&(b.cancelBubble=!0,b.stopPropagation&&b.stopPropagation())}})})}};a.f.foreach={Qc:function(b){return function(){var c=b(),d=a.a.$b(c);if(!d||"number"==typeof d.length)return{foreach:c,templateEngine:a.ba.Na};a.a.c(c);return{foreach:d.data,as:d.as,noChildContext:d.noChildContext,includeDestroyed:d.includeDestroyed,afterAdd:d.afterAdd,
beforeRemove:d.beforeRemove,afterRender:d.afterRender,beforeMove:d.beforeMove,afterMove:d.afterMove,templateEngine:a.ba.Na}}},init:function(b,c){return a.f.template.init(b,a.f.foreach.Qc(c))},update:function(b,c,d,e,f){return a.f.template.update(b,a.f.foreach.Qc(c),d,e,f)}};a.m.Ra.foreach=!1;a.h.ea.foreach=!0;a.f.hasfocus={init:function(b,c,d){function e(e){b.__ko_hasfocusUpdating=!0;var f=b.ownerDocument;if("activeElement"in f){var g;try{g=f.activeElement}catch(k){g=f.body}e=g===b}f=c();a.m.$a(f,
d,"hasfocus",e,!0);b.__ko_hasfocusLastValue=e;b.__ko_hasfocusUpdating=!1}var f=e.bind(null,!0),g=e.bind(null,!1);a.a.H(b,"focus",f);a.a.H(b,"focusin",f);a.a.H(b,"blur",g);a.a.H(b,"focusout",g);b.__ko_hasfocusLastValue=!1},update:function(b,c){var d=!!a.a.c(c());b.__ko_hasfocusUpdating||b.__ko_hasfocusLastValue===d||(d?b.focus():b.blur(),!d&&b.__ko_hasfocusLastValue&&b.ownerDocument.body.focus(),a.v.K(a.a.Fb,null,[b,d?"focusin":"focusout"]))}};a.m.va.hasfocus=!0;a.f.hasFocus=a.f.hasfocus;a.m.va.hasFocus=
"hasfocus";a.f.html={init:function(){return{controlsDescendantBindings:!0}},update:function(b,c){a.a.dc(b,c())}};(function(){function b(b,d,e){a.f[b]={init:function(b,c,h,m,l){var k,q,n={},r,p,A;if(d){m=h.get("as");var u=h.get("noChildContext");A=!(m&&u);n={as:m,noChildContext:u,exportDependencies:A}}p=(r="render"==h.get("completeOn"))||h.has(a.j.oa);a.o(function(){var h=a.a.c(c()),m=!e!==!h,u=!q,t;if(A||m!==k){p&&(l=a.j.Bb(b,l));if(m){if(!d||A)n.dataDependency=a.U.o();t=d?l.createChildContext("function"==
typeof h?h:c,n):a.U.pa()?l.extend(null,n):l}u&&a.U.pa()&&(q=a.a.Ca(a.h.childNodes(b),!0));m?(u||a.h.ua(b,a.a.Ca(q)),a.Pa(t,b)):(a.h.Ea(b),r||a.j.Ga(b,a.j.T));k=m}},null,{l:b});return{controlsDescendantBindings:!0}}};a.m.Ra[b]=!1;a.h.ea[b]=!0}b("if");b("ifnot",!1,!0);b("with",!0)})();a.f.let={init:function(b,c,d,e,f){c=f.extend(c);a.Pa(c,b);return{controlsDescendantBindings:!0}}};a.h.ea.let=!0;var Q={};a.f.options={init:function(b){if("select"!==a.a.P(b))throw Error("options binding applies only to SELECT elements");
for(;0<b.length;)b.remove(0);return{controlsDescendantBindings:!0}},update:function(b,c,d){function e(){return a.a.fb(b.options,function(a){return a.selected})}function f(a,b,c){var d=typeof b;return"function"==d?b(a):"string"==d?a[b]:c}function g(c,e){if(y&&k)a.u.ya(b,a.a.c(d.get("value")),!0);else if(r.length){var f=0<=a.a.A(r,a.u.L(e[0]));a.a.Yc(e[0],f);y&&!f&&a.v.K(a.a.Fb,null,[b,"change"])}}var h=b.multiple,m=0!=b.length&&h?b.scrollTop:null,l=a.a.c(c()),k=d.get("valueAllowUnset")&&d.has("value"),
q=d.get("optionsIncludeDestroyed");c={};var n,r=[];k||(h?r=a.a.Mb(e(),a.u.L):0<=b.selectedIndex&&r.push(a.u.L(b.options[b.selectedIndex])));l&&("undefined"==typeof l.length&&(l=[l]),n=a.a.fb(l,function(b){return q||b===p||null===b||!a.a.c(b._destroy)}),d.has("optionsCaption")&&(l=a.a.c(d.get("optionsCaption")),null!==l&&l!==p&&n.unshift(Q)));var y=!1;c.beforeRemove=function(a){b.removeChild(a)};l=g;d.has("optionsAfterRender")&&"function"==typeof d.get("optionsAfterRender")&&(l=function(b,c){g(0,c);
a.v.K(d.get("optionsAfterRender"),null,[c[0],b!==Q?b:p])});a.a.cc(b,n,function(c,e,g){g.length&&(r=!k&&g[0].selected?[a.u.L(g[0])]:[],y=!0);e=b.ownerDocument.createElement("option");c===Q?(a.a.Ab(e,d.get("optionsCaption")),a.u.ya(e,p)):(g=f(c,d.get("optionsValue"),c),a.u.ya(e,a.a.c(g)),c=f(c,d.get("optionsText"),g),a.a.Ab(e,c));return[e]},c,l);a.v.K(function(){if(k)a.u.ya(b,a.a.c(d.get("value")),!0);else{var c;h?c=r.length&&e().length<r.length:c=r.length&&0<=b.selectedIndex?a.u.L(b.options[b.selectedIndex])!==
r[0]:r.length||0<=b.selectedIndex;c&&a.a.Fb(b,"change")}});a.a.vd(b);m&&20<Math.abs(m-b.scrollTop)&&(b.scrollTop=m)}};a.f.options.Yb=a.a.g.Z();a.f.selectedOptions={after:["options","foreach"],init:function(b,c,d){a.a.H(b,"change",function(){var e=c(),f=[];a.a.C(b.getElementsByTagName("option"),function(b){b.selected&&f.push(a.u.L(b))});a.m.$a(e,d,"selectedOptions",f)})},update:function(b,c){if("select"!=a.a.P(b))throw Error("values binding applies only to SELECT elements");var d=a.a.c(c()),e=b.scrollTop;
d&&"number"==typeof d.length&&a.a.C(b.getElementsByTagName("option"),function(b){var c=0<=a.a.A(d,a.u.L(b));b.selected!=c&&a.a.Yc(b,c)});b.scrollTop=e}};a.m.va.selectedOptions=!0;a.f.style={update:function(b,c){var d=a.a.c(c()||{});a.a.O(d,function(c,d){d=a.a.c(d);if(null===d||d===p||!1===d)d="";if(v)v(b).css(c,d);else if(/^--/.test(c))b.style.setProperty(c,d);else{c=c.replace(/-(\w)/g,function(a,b){return b.toUpperCase()});var g=b.style[c];b.style[c]=d;d===g||b.style[c]!=g||isNaN(d)||(b.style[c]=
d+"px")}})}};a.f.submit={init:function(b,c,d,e,f){if("function"!=typeof c())throw Error("The value for a submit binding must be a function");a.a.H(b,"submit",function(a){var d,e=c();try{d=e.call(f.$data,b)}finally{!0!==d&&(a.preventDefault?a.preventDefault():a.returnValue=!1)}})}};a.f.text={init:function(){return{controlsDescendantBindings:!0}},update:function(b,c){a.a.Ab(b,c())}};a.h.ea.text=!0;(function(){if(z&&z.navigator){var b=function(a){if(a)return parseFloat(a[1])},c=z.navigator.userAgent,
d,e,f,g,h;(d=z.opera&&z.opera.version&&parseInt(z.opera.version()))||(h=b(c.match(/Edge\/([^ ]+)$/)))||b(c.match(/Chrome\/([^ ]+)/))||(e=b(c.match(/Version\/([^ ]+) Safari/)))||(f=b(c.match(/Firefox\/([^ ]+)/)))||(g=a.a.W||b(c.match(/MSIE ([^ ]+)/)))||(g=b(c.match(/rv:([^ )]+)/)))}if(8<=g&&10>g)var m=a.a.g.Z(),l=a.a.g.Z(),k=function(b){var c=this.activeElement;(c=c&&a.a.g.get(c,l))&&c(b)},q=function(b,c){var d=b.ownerDocument;a.a.g.get(d,m)||(a.a.g.set(d,m,!0),a.a.H(d,"selectionchange",k));a.a.g.set(b,
l,c)};a.f.textInput={init:function(b,c,l){function k(c,d){a.a.H(b,c,d)}function m(){var d=a.a.c(c());if(null===d||d===p)d="";L!==p&&d===L?a.a.setTimeout(m,4):b.value!==d&&(x=!0,b.value=d,x=!1,v=b.value)}function t(){w||(L=b.value,w=a.a.setTimeout(B,4))}function B(){clearTimeout(w);L=w=p;var d=b.value;v!==d&&(v=d,a.m.$a(c(),l,"textInput",d))}var v=b.value,w,L,z=9==a.a.W?t:B,x=!1;g&&k("keypress",B);11>g&&k("propertychange",function(a){x||"value"!==a.propertyName||z(a)});8==g&&(k("keyup",B),k("keydown",
B));q&&(q(b,z),k("dragend",t));(!g||9<=g)&&k("input",z);5>e&&"textarea"===a.a.P(b)?(k("keydown",t),k("paste",t),k("cut",t)):11>d?k("keydown",t):4>f?(k("DOMAutoComplete",B),k("dragdrop",B),k("drop",B)):h&&"number"===b.type&&k("keydown",t);k("change",B);k("blur",B);a.o(m,null,{l:b})}};a.m.va.textInput=!0;a.f.textinput={preprocess:function(a,b,c){c("textInput",a)}}})();a.f.uniqueName={init:function(b,c){if(c()){var d="ko_unique_"+ ++a.f.uniqueName.qd;a.a.Xc(b,d)}}};a.f.uniqueName.qd=0;a.f.using={init:function(b,
c,d,e,f){var g;d.has("as")&&(g={as:d.get("as"),noChildContext:d.get("noChildContext")});c=f.createChildContext(c,g);a.Pa(c,b);return{controlsDescendantBindings:!0}}};a.h.ea.using=!0;a.f.value={after:["options","foreach"],init:function(b,c,d){var e=a.a.P(b),f="input"==e;if(!f||"checkbox"!=b.type&&"radio"!=b.type){var g=["change"],h=d.get("valueUpdate"),m=!1,l=null;h&&("string"==typeof h&&(h=[h]),a.a.gb(g,h),g=a.a.vc(g));var k=function(){l=null;m=!1;var e=c(),f=a.u.L(b);a.m.$a(e,d,"value",f)};!a.a.W||
!f||"text"!=b.type||"off"==b.autocomplete||b.form&&"off"==b.form.autocomplete||-1!=a.a.A(g,"propertychange")||(a.a.H(b,"propertychange",function(){m=!0}),a.a.H(b,"focus",function(){m=!1}),a.a.H(b,"blur",function(){m&&k()}));a.a.C(g,function(c){var d=k;a.a.Td(c,"after")&&(d=function(){l=a.u.L(b);a.a.setTimeout(k,0)},c=c.substring(5));a.a.H(b,c,d)});var q;q=f&&"file"==b.type?function(){var d=a.a.c(c());null===d||d===p||""===d?b.value="":a.v.K(k)}:function(){var f=a.a.c(c()),g=a.u.L(b);if(null!==l&&
f===l)a.a.setTimeout(q,0);else if(f!==g||g===p)"select"===e?(g=d.get("valueAllowUnset"),a.u.ya(b,f,g),g||f===a.u.L(b)||a.v.K(k)):a.u.ya(b,f)};a.o(q,null,{l:b})}else a.eb(b,{checkedValue:c})},update:function(){}};a.m.va.value=!0;a.f.visible={update:function(b,c){var d=a.a.c(c()),e="none"!=b.style.display;d&&!e?b.style.display="":!d&&e&&(b.style.display="none")}};a.f.hidden={update:function(b,c){a.f.visible.update(b,function(){return!a.a.c(c())})}};(function(b){a.f[b]={init:function(c,d,e,f,g){return a.f.event.init.call(this,
c,function(){var a={};a[b]=d();return a},e,f,g)}}})("click");a.ca=function(){};a.ca.prototype.renderTemplateSource=function(){throw Error("Override renderTemplateSource");};a.ca.prototype.createJavaScriptEvaluatorBlock=function(){throw Error("Override createJavaScriptEvaluatorBlock");};a.ca.prototype.makeTemplateSource=function(b,c){if("string"==typeof b){c=c||w;var d=c.getElementById(b);if(!d)throw Error("Cannot find template with ID "+b);return new a.B.D(d)}if(1==b.nodeType||8==b.nodeType)return new a.B.ia(b);
throw Error("Unknown template type: "+b);};a.ca.prototype.renderTemplate=function(a,c,d,e){a=this.makeTemplateSource(a,e);return this.renderTemplateSource(a,c,d,e)};a.ca.prototype.isTemplateRewritten=function(a,c){return!1===this.allowTemplateRewriting?!0:this.makeTemplateSource(a,c).data("isRewritten")};a.ca.prototype.rewriteTemplate=function(a,c,d){a=this.makeTemplateSource(a,d);c=c(a.text());a.text(c);a.data("isRewritten",!0)};a.b("templateEngine",a.ca);a.ic=function(){function b(b,c,d,h){b=a.m.Zb(b);
for(var m=a.m.Ra,l=0;l<b.length;l++){var k=b[l].key;if(Object.prototype.hasOwnProperty.call(m,k)){var q=m[k];if("function"===typeof q){if(k=q(b[l].value))throw Error(k);}else if(!q)throw Error("This template engine does not support the '"+k+"' binding within its templates");}}d="ko.__tr_ambtns(function($context,$element){return(function(){return{ "+a.m.ub(b,{valueAccessors:!0})+" } })()},'"+d.toLowerCase()+"')";return h.createJavaScriptEvaluatorBlock(d)+c}var c=/(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi,
d=/\x3c!--\s*ko\b\s*([\s\S]*?)\s*--\x3e/g;return{wd:function(b,c,d){c.isTemplateRewritten(b,d)||c.rewriteTemplate(b,function(b){return a.ic.Kd(b,c)},d)},Kd:function(a,f){return a.replace(c,function(a,c,d,e,k){return b(k,c,d,f)}).replace(d,function(a,c){return b(c,"\x3c!-- ko --\x3e","#comment",f)})},ld:function(b,c){return a.aa.Wb(function(d,h){var m=d.nextSibling;m&&m.nodeName.toLowerCase()===c&&a.eb(m,b,h)})}}}();a.b("__tr_ambtns",a.ic.ld);(function(){a.B={};a.B.D=function(b){if(this.D=b){var c=
a.a.P(b);this.Db="script"===c?1:"textarea"===c?2:"template"==c&&b.content&&11===b.content.nodeType?3:4}};a.B.D.prototype.text=function(){var b=1===this.Db?"text":2===this.Db?"value":"innerHTML";if(0==arguments.length)return this.D[b];var c=arguments[0];"innerHTML"===b?a.a.dc(this.D,c):this.D[b]=c};var b=a.a.g.Z()+"_";a.B.D.prototype.data=function(c){if(1===arguments.length)return a.a.g.get(this.D,b+c);a.a.g.set(this.D,b+c,arguments[1])};var c=a.a.g.Z();a.B.D.prototype.nodes=function(){var b=this.D;
if(0==arguments.length){var e=a.a.g.get(b,c)||{},f=e.jb||(3===this.Db?b.content:4===this.Db?b:p);if(!f||e.hd)if(e=this.text())f=a.a.Ld(e,b.ownerDocument),this.text(""),a.a.g.set(b,c,{jb:f,hd:!0});return f}a.a.g.set(b,c,{jb:arguments[0]})};a.B.ia=function(a){this.D=a};a.B.ia.prototype=new a.B.D;a.B.ia.prototype.constructor=a.B.ia;a.B.ia.prototype.text=function(){if(0==arguments.length){var b=a.a.g.get(this.D,c)||{};b.jc===p&&b.jb&&(b.jc=b.jb.innerHTML);return b.jc}a.a.g.set(this.D,c,{jc:arguments[0]})};
a.b("templateSources",a.B);a.b("templateSources.domElement",a.B.D);a.b("templateSources.anonymousTemplate",a.B.ia)})();(function(){function b(b,c,d){var e;for(c=a.h.nextSibling(c);b&&(e=b)!==c;)b=a.h.nextSibling(e),d(e,b)}function c(c,d){if(c.length){var e=c[0],f=c[c.length-1],g=e.parentNode,h=a.ga.instance,m=h.preprocessNode;if(m){b(e,f,function(a,b){var c=a.previousSibling,d=m.call(h,a);d&&(a===e&&(e=d[0]||b),a===f&&(f=d[d.length-1]||c))});c.length=0;if(!e)return;e===f?c.push(e):(c.push(e,f),a.a.Ua(c,
g))}b(e,f,function(b){1!==b.nodeType&&8!==b.nodeType||a.uc(d,b)});b(e,f,function(b){1!==b.nodeType&&8!==b.nodeType||a.aa.bd(b,[d])});a.a.Ua(c,g)}}function d(a){return a.nodeType?a:0<a.length?a[0]:null}function e(b,e,f,h,m){m=m||{};var p=(b&&d(b)||f||{}).ownerDocument,A=m.templateEngine||g;a.ic.wd(f,A,p);f=A.renderTemplate(f,h,m,p);if("number"!=typeof f.length||0<f.length&&"number"!=typeof f[0].nodeType)throw Error("Template engine must return an array of DOM nodes");p=!1;switch(e){case "replaceChildren":a.h.ua(b,
f);p=!0;break;case "replaceNode":a.a.Wc(b,f);p=!0;break;case "ignoreTargetNode":break;default:throw Error("Unknown renderMode: "+e);}p&&(c(f,h),m.afterRender&&a.v.K(m.afterRender,null,[f,h[m.as||"$data"]]),"replaceChildren"==e&&a.j.Ga(b,a.j.T));return f}function f(b,c,d){return a.N(b)?b():"function"===typeof b?b(c,d):b}var g;a.ec=function(b){if(b!=p&&!(b instanceof a.ca))throw Error("templateEngine must inherit from ko.templateEngine");g=b};a.bc=function(b,c,h,m,r){h=h||{};if((h.templateEngine||g)==
p)throw Error("Set a template engine before calling renderTemplate");r=r||"replaceChildren";if(m){var y=d(m);return a.$(function(){var g=c&&c instanceof a.fa?c:new a.fa(c,null,null,null,{exportDependencies:!0}),p=f(b,g.$data,g),g=e(m,r,p,g,h);"replaceNode"==r&&(m=g,y=d(m))},null,{Sa:function(){return!y||!a.a.Rb(y)},l:y&&"replaceNode"==r?y.parentNode:y})}return a.aa.Wb(function(d){a.bc(b,c,h,d,"replaceNode")})};a.Pd=function(b,d,g,h,m){function y(b,c){a.v.K(a.a.cc,null,[h,b,u,g,t,c]);a.j.Ga(h,a.j.T)}
function t(a,b){c(b,v);g.afterRender&&g.afterRender(b,a);v=null}function u(a,c){v=m.createChildContext(a,{as:B,noChildContext:g.noChildContext,extend:function(a){a.$index=c;B&&(a[B+"Index"]=c)}});var d=f(b,a,v);return e(h,"ignoreTargetNode",d,v,g)}var v,B=g.as,w=!1===g.includeDestroyed||a.options.foreachHidesDestroyed&&!g.includeDestroyed;if(w||g.beforeRemove||!a.Oc(d))return a.$(function(){var b=a.a.c(d)||[];"undefined"==typeof b.length&&(b=[b]);w&&(b=a.a.fb(b,function(b){return b===p||null===b||
!a.a.c(b._destroy)}));y(b)},null,{l:h});y(d.w());var z=d.subscribe(function(a){y(d(),a)},null,"arrayChange");z.l(h);return z};var h=a.a.g.Z(),m=a.a.g.Z();a.f.template={init:function(b,c){var d=a.a.c(c());if("string"==typeof d||d.name)a.h.Ea(b);else if("nodes"in d){d=d.nodes||[];if(a.N(d))throw Error('The "nodes" option must be a plain, non-observable array.');var e=d[0]&&d[0].parentNode;e&&a.a.g.get(e,m)||(e=a.a.Xb(d),a.a.g.set(e,m,!0));(new a.B.ia(b)).nodes(e)}else if(d=a.h.childNodes(b),0<d.length)e=
a.a.Xb(d),(new a.B.ia(b)).nodes(e);else throw Error("Anonymous template defined, but no template content was provided");return{controlsDescendantBindings:!0}},update:function(b,c,d,e,f){var g=c();c=a.a.c(g);d=!0;e=null;"string"==typeof c?c={}:(g=c.name,"if"in c&&(d=a.a.c(c["if"])),d&&"ifnot"in c&&(d=!a.a.c(c.ifnot)));"foreach"in c?e=a.Pd(g||b,d&&c.foreach||[],c,b,f):d?(d=f,"data"in c&&(d=f.createChildContext(c.data,{as:c.as,noChildContext:c.noChildContext,exportDependencies:!0})),e=a.bc(g||b,d,c,
b)):a.h.Ea(b);f=e;(c=a.a.g.get(b,h))&&"function"==typeof c.s&&c.s();a.a.g.set(b,h,!f||f.ja&&!f.ja()?p:f)}};a.m.Ra.template=function(b){b=a.m.Zb(b);return 1==b.length&&b[0].unknown||a.m.Hd(b,"name")?null:"This template engine does not support anonymous templates nested within its templates"};a.h.ea.template=!0})();a.b("setTemplateEngine",a.ec);a.b("renderTemplate",a.bc);a.a.Jc=function(a,c,d){if(a.length&&c.length){var e,f,g,h,m;for(e=f=0;(!d||e<d)&&(h=a[f]);++f){for(g=0;m=c[g];++g)if(h.value===m.value){h.moved=
m.index;m.moved=h.index;c.splice(g,1);e=g=0;break}e+=g}}};a.a.Ob=function(){function b(b,d,e,f,g){var h=Math.min,m=Math.max,l=[],k,p=b.length,n,r=d.length,t=r-p||1,A=p+r+1,u,v,w;for(k=0;k<=p;k++)for(v=u,l.push(u=[]),w=h(r,k+t),n=m(0,k-1);n<=w;n++)u[n]=n?k?b[k-1]===d[n-1]?v[n-1]:h(v[n]||A,u[n-1]||A)+1:n+1:k+1;h=[];m=[];t=[];k=p;for(n=r;k||n;)r=l[k][n]-1,n&&r===l[k][n-1]?m.push(h[h.length]={status:e,value:d[--n],index:n}):k&&r===l[k-1][n]?t.push(h[h.length]={status:f,value:b[--k],index:k}):(--n,--k,
g.sparse||h.push({status:"retained",value:d[n]}));a.a.Jc(t,m,!g.dontLimitMoves&&10*p);return h.reverse()}return function(a,d,e){e="boolean"===typeof e?{dontLimitMoves:e}:e||{};a=a||[];d=d||[];return a.length<d.length?b(a,d,"added","deleted",e):b(d,a,"deleted","added",e)}}();a.b("utils.compareArrays",a.a.Ob);(function(){function b(b,c,d,h,m){var l=[],k=a.$(function(){var k=c(d,m,a.a.Ua(l,b))||[];0<l.length&&(a.a.Wc(l,k),h&&a.v.K(h,null,[d,k,m]));l.length=0;a.a.gb(l,k)},null,{l:b,Sa:function(){return!a.a.jd(l)}});
return{Y:l,$:k.ja()?k:p}}var c=a.a.g.Z(),d=a.a.g.Z();a.a.cc=function(e,f,g,h,m,l){function k(b){x={Aa:b,nb:a.sa(w++)};v.push(x);t||F.push(x)}function q(b){x=r[b];w!==x.nb.w()&&D.push(x);x.nb(w++);a.a.Ua(x.Y,e);v.push(x)}function n(b,c){if(b)for(var d=0,e=c.length;d<e;d++)a.a.C(c[d].Y,function(a){b(a,d,c[d].Aa)})}f=f||[];"undefined"==typeof f.length&&(f=[f]);h=h||{};var r=a.a.g.get(e,c),t=!r,v=[],u=0,w=0,B=[],z=[],C=[],D=[],F=[],x,I=0;if(t)a.a.C(f,k);else{if(!l||r&&r._countWaitingForRemove){var E=
a.a.Mb(r,function(a){return a.Aa});l=a.a.Ob(E,f,{dontLimitMoves:h.dontLimitMoves,sparse:!0})}for(var E=0,G,H,K;G=l[E];E++)switch(H=G.moved,K=G.index,G.status){case "deleted":for(;u<K;)q(u++);H===p&&(x=r[u],x.$&&(x.$.s(),x.$=p),a.a.Ua(x.Y,e).length&&(h.beforeRemove&&(v.push(x),I++,x.Aa===d?x=null:C.push(x)),x&&B.push.apply(B,x.Y)));u++;break;case "added":for(;w<K;)q(u++);H!==p?(z.push(v.length),q(H)):k(G.value)}for(;w<f.length;)q(u++);v._countWaitingForRemove=I}a.a.g.set(e,c,v);n(h.beforeMove,D);a.a.C(B,
h.beforeRemove?a.na:a.removeNode);var M,O,P;try{P=e.ownerDocument.activeElement}catch(N){}if(z.length)for(;(E=z.shift())!=p;){x=v[E];for(M=p;E;)if((O=v[--E].Y)&&O.length){M=O[O.length-1];break}for(f=0;u=x.Y[f];M=u,f++)a.h.Vb(e,u,M)}E=0;for(z=a.h.firstChild(e);x=v[E];E++){x.Y||a.a.extend(x,b(e,g,x.Aa,m,x.nb));for(f=0;u=x.Y[f];z=u.nextSibling,M=u,f++)u!==z&&a.h.Vb(e,u,M);!x.Dd&&m&&(m(x.Aa,x.Y,x.nb),x.Dd=!0,M=x.Y[x.Y.length-1])}P&&e.ownerDocument.activeElement!=P&&P.focus();n(h.beforeRemove,C);for(E=
0;E<C.length;++E)C[E].Aa=d;n(h.afterMove,D);n(h.afterAdd,F)}})();a.b("utils.setDomNodeChildrenFromArrayMapping",a.a.cc);a.ba=function(){this.allowTemplateRewriting=!1};a.ba.prototype=new a.ca;a.ba.prototype.constructor=a.ba;a.ba.prototype.renderTemplateSource=function(b,c,d,e){if(c=(9>a.a.W?0:b.nodes)?b.nodes():null)return a.a.la(c.cloneNode(!0).childNodes);b=b.text();return a.a.ta(b,e)};a.ba.Na=new a.ba;a.ec(a.ba.Na);a.b("nativeTemplateEngine",a.ba);(function(){a.Za=function(){var a=this.Gd=function(){if(!v||
!v.tmpl)return 0;try{if(0<=v.tmpl.tag.tmpl.open.toString().indexOf("__"))return 2}catch(a){}return 1}();this.renderTemplateSource=function(b,e,f,g){g=g||w;f=f||{};if(2>a)throw Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");var h=b.data("precompiled");h||(h=b.text()||"",h=v.template(null,"{{ko_with $item.koBindingContext}}"+h+"{{/ko_with}}"),b.data("precompiled",h));b=[e.$data];e=v.extend({koBindingContext:e},f.templateOptions);e=v.tmpl(h,b,e);e.appendTo(g.createElement("div"));
v.fragments={};return e};this.createJavaScriptEvaluatorBlock=function(a){return"{{ko_code ((function() { return "+a+" })()) }}"};this.addTemplate=function(a,b){w.write("<script type='text/html' id='"+a+"'>"+b+"\x3c/script>")};0<a&&(v.tmpl.tag.ko_code={open:"__.push($1 || '');"},v.tmpl.tag.ko_with={open:"with($1) {",close:"} "})};a.Za.prototype=new a.ca;a.Za.prototype.constructor=a.Za;var b=new a.Za;0<b.Gd&&a.ec(b);a.b("jqueryTmplTemplateEngine",a.Za)})()})})();})();

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\knockout\\build\\output\\knockout-latest.js","/..\\..\\node_modules\\knockout\\build\\output")
},{"buffer":2,"e/U+97":6}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\process\\browser.js","/..\\..\\node_modules\\process")
},{"buffer":2,"e/U+97":6}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
module.exports = function createUser(user) {
    return new Promise(resolve => {
      setTimeout(function() {
        resolve({ user, token: "test.token" });
      }, 1000);
    });
  }
}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\sdk\\index.js","/..\\..\\node_modules\\sdk")
},{"buffer":2,"e/U+97":6}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
const ko = require("knockout");
require("knockout.validation");

const createUser = require("sdk");

ko.validation.rules.pattern.message = "Invalid.";

// ko.validation.configure({
//     registerExtenders: true,
//     messagesOnModified: true,
//     insertMessages: true,
//     parseInputAttributes: true,
//     messageTemplate: null
// });

function fieldViewModel(
  stepId,
  name,
  label,
  value,
  template,
  validation,
  props
) {
  //if (!validate)
  //let validate = () => {};
  let self = {
    name,
    stepId,
    val: ko.observable(value).extend(validation),
    template: ko.observable(template),
    label: ko.observable(label),
    visible: ko.observable(true),
    props
  };
  self.__isValid = function() {
    //return true;
    return self.val.isModified() ? self.val.isValid() : true;
  };
  return self;
}

var viewModel = {
  currentStepId: ko.observable(0),
  fields: ko.observableArray([
    fieldViewModel(
      0,
      "name",
      "Name",
      "",
      "inputTemplate",
      {
        required: true,
        minLength: 3
      },
      {
        placeholder: ko.observable("eg: John Smith"),
        type: ko.observable("string")
      }
    ),
    fieldViewModel(
      0,
      "age",
      "Age",
      18,
      "inputTemplate",
      {
        min: 18,
        required: true
      },
      {
        placeholder: ko.observable("Your age"),
        type: ko.observable("number")
      }
    ),
    fieldViewModel(
      1,
      "email",
      "Email",
      "",
      "inputTemplate",
      {
        required: true,
        email: true
      },
      {
        placeholder: ko.observable("eg: JohnSmith@gmail.com"),
        type: ko.observable("email")
      }
    ),
    fieldViewModel(
      1,
      "newsletter",
      "Newsletter",
      "daily",
      "selectTemplate",
      {
        required: true
      },
      {
        optionsCaption: ko.observable("Choose a period"),
        options: ko.observableArray(["daily", "weekly", "monthly"])
      }
    )
  ]),
  completed: ko.observable(false),
  handleSubmit: () => {
    const stepId = viewModel.currentStepId();
    const filteredViewModel = {};
    viewModel
      .steps()
      [stepId].fields()
      .map(field => {
        filteredViewModel[field.name] = field.val;
      });
    const formViewModel = ko.validatedObservable(filteredViewModel);
    if (!formViewModel.isValid()) {
      alert("Please complete the form");
      return false;
    }
    if (stepId + 1 < viewModel.steps().length) {
      viewModel.currentStepId(stepId + 1);
    } else {
      //completed all steps
      const user = {};
      viewModel.fields().map(field => {
        user[field.name] = field.val();
      });
      console.log("user :", user);

      createUser(user)
        .then(function() {
          viewModel.completed(true);
        })
        .catch(function() {
          alert("somthing went wrong please try again in a moment");
        });
    }
  },
  prev: () => {
    viewModel.currentStepId(viewModel.currentStepId() - 1);
  }
};

//const vViewModel = kov.validatedObservable(viewModel)
viewModel.steps = ko.observableArray([
  {
    btnText: ko.observable("Next"),
    fields: ko.observableArray(
      viewModel.fields().filter(field => field.stepId === 0)
    )
  },
  {
    btnText: ko.observable("Create"),
    fields: ko.observableArray(
      viewModel.fields().filter(field => field.stepId === 1)
    )
  }
]);

var appElement = document.getElementById("app");
ko.applyBindings(viewModel, appElement);

}).call(this,require("e/U+97"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/main.js","/")
},{"buffer":2,"e/U+97":6,"knockout":5,"knockout.validation":4,"sdk":7}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxzYXllZGlcXHNoZXlwb29yXFxnaXQtY2hhbGxlbmdlXFxmcm9udGVuZC1jaGFsbGVuZ2VcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkQ6L3NheWVkaS9zaGV5cG9vci9naXQtY2hhbGxlbmdlL2Zyb250ZW5kLWNoYWxsZW5nZS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJEOi9zYXllZGkvc2hleXBvb3IvZ2l0LWNoYWxsZW5nZS9mcm9udGVuZC1jaGFsbGVuZ2Uvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIkQ6L3NheWVkaS9zaGV5cG9vci9naXQtY2hhbGxlbmdlL2Zyb250ZW5kLWNoYWxsZW5nZS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkQ6L3NheWVkaS9zaGV5cG9vci9naXQtY2hhbGxlbmdlL2Zyb250ZW5kLWNoYWxsZW5nZS9ub2RlX21vZHVsZXMva25vY2tvdXQudmFsaWRhdGlvbi9kaXN0L2tub2Nrb3V0LnZhbGlkYXRpb24uanMiLCJEOi9zYXllZGkvc2hleXBvb3IvZ2l0LWNoYWxsZW5nZS9mcm9udGVuZC1jaGFsbGVuZ2Uvbm9kZV9tb2R1bGVzL2tub2Nrb3V0L2J1aWxkL291dHB1dC9rbm9ja291dC1sYXRlc3QuanMiLCJEOi9zYXllZGkvc2hleXBvb3IvZ2l0LWNoYWxsZW5nZS9mcm9udGVuZC1jaGFsbGVuZ2Uvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIkQ6L3NheWVkaS9zaGV5cG9vci9naXQtY2hhbGxlbmdlL2Zyb250ZW5kLWNoYWxsZW5nZS9ub2RlX21vZHVsZXMvc2RrL2luZGV4LmpzIiwiRDovc2F5ZWRpL3NoZXlwb29yL2dpdC1jaGFsbGVuZ2UvZnJvbnRlbmQtY2hhbGxlbmdlL3NyYy9qcy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3grQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcXFxcYjY0LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSAoZSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSAobSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICgodmFsdWUgKiBjKSAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImUvVSs5N1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdEF1dGhvcjpcdFx0XHRFcmljIE0uIEJhcm5hcmQgLSBAZXJpY21iYXJuYXJkXHRcdFx0XHRcdFx0XHRcdFxuXHRMaWNlbnNlOlx0XHRNSVQgKGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHApXHRcdFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFxuXHREZXNjcmlwdGlvbjpcdFZhbGlkYXRpb24gTGlicmFyeSBmb3IgS25vY2tvdXRKU1x0XHRcdFx0XHRcdFx0XG5cdFZlcnNpb246XHRcdDIuMC4zXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuKi9cbi8qZ2xvYmFscyByZXF1aXJlOiBmYWxzZSwgZXhwb3J0czogZmFsc2UsIGRlZmluZTogZmFsc2UsIGtvOiBmYWxzZSAqL1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0Ly8gTW9kdWxlIHN5c3RlbXMgbWFnaWMgZGFuY2UuXG5cblx0aWYgKHR5cGVvZiByZXF1aXJlID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdC8vIENvbW1vbkpTIG9yIE5vZGU6IGhhcmQtY29kZWQgZGVwZW5kZW5jeSBvbiBcImtub2Nrb3V0XCJcblx0XHRmYWN0b3J5KHJlcXVpcmUoXCJrbm9ja291dFwiKSwgZXhwb3J0cyk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZVtcImFtZFwiXSkge1xuXHRcdC8vIEFNRCBhbm9ueW1vdXMgbW9kdWxlIHdpdGggaGFyZC1jb2RlZCBkZXBlbmRlbmN5IG9uIFwia25vY2tvdXRcIlxuXHRcdGRlZmluZShbXCJrbm9ja291dFwiLCBcImV4cG9ydHNcIl0sIGZhY3RvcnkpO1xuXHR9IGVsc2Uge1xuXHRcdC8vIDxzY3JpcHQ+IHRhZzogdXNlIHRoZSBnbG9iYWwgYGtvYCBvYmplY3QsIGF0dGFjaGluZyBhIGBtYXBwaW5nYCBwcm9wZXJ0eVxuXHRcdGZhY3Rvcnkoa28sIGtvLnZhbGlkYXRpb24gPSB7fSk7XG5cdH1cbn0oZnVuY3Rpb24gKCBrbywgZXhwb3J0cyApIHtcblxuXHRpZiAodHlwZW9mIChrbykgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdLbm9ja291dCBpcyByZXF1aXJlZCwgcGxlYXNlIGVuc3VyZSBpdCBpcyBsb2FkZWQgYmVmb3JlIGxvYWRpbmcgdGhpcyB2YWxpZGF0aW9uIHBsdWctaW4nKTtcblx0fVxuXG5cdC8vIGNyZWF0ZSBvdXIgbmFtZXNwYWNlIG9iamVjdFxuXHRrby52YWxpZGF0aW9uID0gZXhwb3J0cztcblxuXHR2YXIga3YgPSBrby52YWxpZGF0aW9uLFxuXHRcdGtvVXRpbHMgPSBrby51dGlscyxcblx0XHR1bndyYXAgPSBrb1V0aWxzLnVud3JhcE9ic2VydmFibGUsXG5cdFx0Zm9yRWFjaCA9IGtvVXRpbHMuYXJyYXlGb3JFYWNoLFxuXHRcdGV4dGVuZCA9IGtvVXRpbHMuZXh0ZW5kO1xuOy8qZ2xvYmFsIGtvOiBmYWxzZSovXG5cbnZhciBkZWZhdWx0cyA9IHtcblx0cmVnaXN0ZXJFeHRlbmRlcnM6IHRydWUsXG5cdG1lc3NhZ2VzT25Nb2RpZmllZDogdHJ1ZSxcblx0ZXJyb3JzQXNUaXRsZTogdHJ1ZSwgICAgICAgICAgICAvLyBlbmFibGVzL2Rpc2FibGVzIHNob3dpbmcgb2YgZXJyb3JzIGFzIHRpdGxlIGF0dHJpYnV0ZSBvZiB0aGUgdGFyZ2V0IGVsZW1lbnQuXG5cdGVycm9yc0FzVGl0bGVPbk1vZGlmaWVkOiBmYWxzZSwgLy8gc2hvd3MgdGhlIGVycm9yIHdoZW4gaG92ZXJpbmcgdGhlIGlucHV0IGZpZWxkIChkZWNvcmF0ZUVsZW1lbnQgbXVzdCBiZSB0cnVlKVxuXHRtZXNzYWdlVGVtcGxhdGU6IG51bGwsXG5cdGluc2VydE1lc3NhZ2VzOiB0cnVlLCAgICAgICAgICAgLy8gYXV0b21hdGljYWxseSBpbnNlcnRzIHZhbGlkYXRpb24gbWVzc2FnZXMgYXMgPHNwYW4+PC9zcGFuPlxuXHRwYXJzZUlucHV0QXR0cmlidXRlczogZmFsc2UsICAgIC8vIHBhcnNlcyB0aGUgSFRNTDUgdmFsaWRhdGlvbiBhdHRyaWJ1dGUgZnJvbSBhIGZvcm0gZWxlbWVudCBhbmQgYWRkcyB0aGF0IHRvIHRoZSBvYmplY3Rcblx0d3JpdGVJbnB1dEF0dHJpYnV0ZXM6IGZhbHNlLCAgICAvLyBhZGRzIEhUTUw1IGlucHV0IHZhbGlkYXRpb24gYXR0cmlidXRlcyB0byBmb3JtIGVsZW1lbnRzIHRoYXQga28gb2JzZXJ2YWJsZSdzIGFyZSBib3VuZCB0b1xuXHRkZWNvcmF0ZUlucHV0RWxlbWVudDogZmFsc2UsICAgICAgICAgLy8gZmFsc2UgdG8ga2VlcCBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG5cdGRlY29yYXRlRWxlbWVudE9uTW9kaWZpZWQ6IHRydWUsLy8gdHJ1ZSB0byBrZWVwIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcblx0ZXJyb3JDbGFzczogbnVsbCwgICAgICAgICAgICAgICAvLyBzaW5nbGUgY2xhc3MgZm9yIGVycm9yIG1lc3NhZ2UgYW5kIGVsZW1lbnRcblx0ZXJyb3JFbGVtZW50Q2xhc3M6ICd2YWxpZGF0aW9uRWxlbWVudCcsICAvLyBjbGFzcyB0byBkZWNvcmF0ZSBlcnJvciBlbGVtZW50XG5cdGVycm9yTWVzc2FnZUNsYXNzOiAndmFsaWRhdGlvbk1lc3NhZ2UnLCAgLy8gY2xhc3MgdG8gZGVjb3JhdGUgZXJyb3IgbWVzc2FnZVxuXHRhbGxvd0h0bWxNZXNzYWdlczogZmFsc2UsXHRcdC8vIGFsbG93cyBIVE1MIGluIHZhbGlkYXRpb24gbWVzc2FnZXNcblx0Z3JvdXBpbmc6IHtcblx0XHRkZWVwOiBmYWxzZSwgICAgICAgIC8vYnkgZGVmYXVsdCBncm91cGluZyBpcyBzaGFsbG93XG5cdFx0b2JzZXJ2YWJsZTogdHJ1ZSwgICAvL2FuZCB1c2luZyBvYnNlcnZhYmxlc1xuXHRcdGxpdmU6IGZhbHNlXHRcdCAgICAvL3JlYWN0IHRvIGNoYW5nZXMgdG8gb2JzZXJ2YWJsZUFycmF5cyBpZiBvYnNlcnZhYmxlID09PSB0cnVlXG5cdH0sXG5cdHZhbGlkYXRlOiB7XG5cdFx0Ly8gdGhyb3R0bGU6IDEwXG5cdH1cbn07XG5cbi8vIG1ha2UgYSBjb3B5ICBzbyB3ZSBjYW4gdXNlICdyZXNldCcgbGF0ZXJcbnZhciBjb25maWd1cmF0aW9uID0gZXh0ZW5kKHt9LCBkZWZhdWx0cyk7XG5cbmNvbmZpZ3VyYXRpb24uaHRtbDVBdHRyaWJ1dGVzID0gWydyZXF1aXJlZCcsICdwYXR0ZXJuJywgJ21pbicsICdtYXgnLCAnc3RlcCddO1xuY29uZmlndXJhdGlvbi5odG1sNUlucHV0VHlwZXMgPSBbJ2VtYWlsJywgJ251bWJlcicsICdkYXRlJ107XG5cbmNvbmZpZ3VyYXRpb24ucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdGV4dGVuZChjb25maWd1cmF0aW9uLCBkZWZhdWx0cyk7XG59O1xuXG5rdi5jb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbjtcbjtrdi51dGlscyA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciBzZWVkSWQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuXHR2YXIgZG9tRGF0YSA9IHt9OyAvL2hhc2ggb2YgZGF0YSBvYmplY3RzIHRoYXQgd2UgcmVmZXJlbmNlIGZyb20gZG9tIGVsZW1lbnRzXG5cdHZhciBkb21EYXRhS2V5ID0gJ19fa29fdmFsaWRhdGlvbl9fJztcblxuXHRyZXR1cm4ge1xuXHRcdGlzQXJyYXk6IGZ1bmN0aW9uIChvKSB7XG5cdFx0XHRyZXR1cm4gby5pc0FycmF5IHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0XHR9LFxuXHRcdGlzT2JqZWN0OiBmdW5jdGlvbiAobykge1xuXHRcdFx0cmV0dXJuIG8gIT09IG51bGwgJiYgdHlwZW9mIG8gPT09ICdvYmplY3QnO1xuXHRcdH0sXG5cdFx0aXNOdW1iZXI6IGZ1bmN0aW9uKG8pIHtcblx0XHRcdHJldHVybiAhaXNOYU4obyk7XHRcblx0XHR9LFxuXHRcdGlzT2JzZXJ2YWJsZUFycmF5OiBmdW5jdGlvbihpbnN0YW5jZSkge1xuXHRcdFx0cmV0dXJuICEhaW5zdGFuY2UgJiZcblx0XHRcdFx0XHR0eXBlb2YgaW5zdGFuY2VbXCJyZW1vdmVcIl0gPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdFx0XHRcdHR5cGVvZiBpbnN0YW5jZVtcInJlbW92ZUFsbFwiXSA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0XHRcdFx0dHlwZW9mIGluc3RhbmNlW1wiZGVzdHJveVwiXSA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0XHRcdFx0dHlwZW9mIGluc3RhbmNlW1wiZGVzdHJveUFsbFwiXSA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0XHRcdFx0dHlwZW9mIGluc3RhbmNlW1wiaW5kZXhPZlwiXSA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0XHRcdFx0dHlwZW9mIGluc3RhbmNlW1wicmVwbGFjZVwiXSA9PT0gXCJmdW5jdGlvblwiO1xuXHRcdH0sXG5cdFx0dmFsdWVzOiBmdW5jdGlvbiAobykge1xuXHRcdFx0dmFyIHIgPSBbXTtcblx0XHRcdGZvciAodmFyIGkgaW4gbykge1xuXHRcdFx0XHRpZiAoby5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0XHRcdHIucHVzaChvW2ldKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fSxcblx0XHRnZXRWYWx1ZTogZnVuY3Rpb24gKG8pIHtcblx0XHRcdHJldHVybiAodHlwZW9mIG8gPT09ICdmdW5jdGlvbicgPyBvKCkgOiBvKTtcblx0XHR9LFxuXHRcdGhhc0F0dHJpYnV0ZTogZnVuY3Rpb24gKG5vZGUsIGF0dHIpIHtcblx0XHRcdHJldHVybiBub2RlLmdldEF0dHJpYnV0ZShhdHRyKSAhPT0gbnVsbDtcblx0XHR9LFxuXHRcdGdldEF0dHJpYnV0ZTogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHIpIHtcblx0XHRcdHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKTtcblx0XHR9LFxuXHRcdHNldEF0dHJpYnV0ZTogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHIsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsdWUpO1xuXHRcdH0sXG5cdFx0aXNWYWxpZGF0YWJsZTogZnVuY3Rpb24gKG8pIHtcblx0XHRcdHJldHVybiAhIShvICYmIG8ucnVsZXMgJiYgby5pc1ZhbGlkICYmIG8uaXNNb2RpZmllZCk7XG5cdFx0fSxcblx0XHRpbnNlcnRBZnRlcjogZnVuY3Rpb24gKG5vZGUsIG5ld05vZGUpIHtcblx0XHRcdG5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3Tm9kZSwgbm9kZS5uZXh0U2libGluZyk7XG5cdFx0fSxcblx0XHRuZXdJZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHNlZWRJZCArPSAxO1xuXHRcdH0sXG5cdFx0Z2V0Q29uZmlnT3B0aW9uczogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHZhciBvcHRpb25zID0ga3YudXRpbHMuY29udGV4dEZvcihlbGVtZW50KTtcblxuXHRcdFx0cmV0dXJuIG9wdGlvbnMgfHwga3YuY29uZmlndXJhdGlvbjtcblx0XHR9LFxuXHRcdHNldERvbURhdGE6IGZ1bmN0aW9uIChub2RlLCBkYXRhKSB7XG5cdFx0XHR2YXIga2V5ID0gbm9kZVtkb21EYXRhS2V5XTtcblxuXHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0bm9kZVtkb21EYXRhS2V5XSA9IGtleSA9IGt2LnV0aWxzLm5ld0lkKCk7XG5cdFx0XHR9XG5cblx0XHRcdGRvbURhdGFba2V5XSA9IGRhdGE7XG5cdFx0fSxcblx0XHRnZXREb21EYXRhOiBmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0dmFyIGtleSA9IG5vZGVbZG9tRGF0YUtleV07XG5cblx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBkb21EYXRhW2tleV07XG5cdFx0fSxcblx0XHRjb250ZXh0Rm9yOiBmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0c3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0Y2FzZSA4OlxuXHRcdFx0XHRcdHZhciBjb250ZXh0ID0ga3YudXRpbHMuZ2V0RG9tRGF0YShub2RlKTtcblx0XHRcdFx0XHRpZiAoY29udGV4dCkgeyByZXR1cm4gY29udGV4dDsgfVxuXHRcdFx0XHRcdGlmIChub2RlLnBhcmVudE5vZGUpIHsgcmV0dXJuIGt2LnV0aWxzLmNvbnRleHRGb3Iobm9kZS5wYXJlbnROb2RlKTsgfVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9LFxuXHRcdGlzRW1wdHlWYWw6IGZ1bmN0aW9uICh2YWwpIHtcblx0XHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmICh2YWwgPT09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAodmFsID09PSBcIlwiKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Z2V0T3JpZ2luYWxFbGVtZW50VGl0bGU6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHR2YXIgc2F2ZWRPcmlnaW5hbFRpdGxlID0ga3YudXRpbHMuZ2V0QXR0cmlidXRlKGVsZW1lbnQsICdkYXRhLW9yaWctdGl0bGUnKSxcblx0XHRcdFx0Y3VycmVudFRpdGxlID0gZWxlbWVudC50aXRsZSxcblx0XHRcdFx0aGFzU2F2ZWRPcmlnaW5hbFRpdGxlID0ga3YudXRpbHMuaGFzQXR0cmlidXRlKGVsZW1lbnQsICdkYXRhLW9yaWctdGl0bGUnKTtcblxuXHRcdFx0cmV0dXJuIGhhc1NhdmVkT3JpZ2luYWxUaXRsZSA/XG5cdFx0XHRcdHNhdmVkT3JpZ2luYWxUaXRsZSA6IGN1cnJlbnRUaXRsZTtcblx0XHR9LFxuXHRcdGFzeW5jOiBmdW5jdGlvbiAoZXhwcikge1xuXHRcdFx0aWYgKHdpbmRvdy5zZXRJbW1lZGlhdGUpIHsgd2luZG93LnNldEltbWVkaWF0ZShleHByKTsgfVxuXHRcdFx0ZWxzZSB7IHdpbmRvdy5zZXRUaW1lb3V0KGV4cHIsIDApOyB9XG5cdFx0fSxcblx0XHRmb3JFYWNoOiBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKGt2LnV0aWxzLmlzQXJyYXkob2JqZWN0KSkge1xuXHRcdFx0XHRyZXR1cm4gZm9yRWFjaChvYmplY3QsIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIHByb3AgaW4gb2JqZWN0KSB7XG5cdFx0XHRcdGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcblx0XHRcdFx0XHRjYWxsYmFjayhvYmplY3RbcHJvcF0sIHByb3ApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufSgpKTs7dmFyIGFwaSA9IChmdW5jdGlvbiAoKSB7XG5cblx0dmFyIGlzSW5pdGlhbGl6ZWQgPSAwLFxuXHRcdGNvbmZpZ3VyYXRpb24gPSBrdi5jb25maWd1cmF0aW9uLFxuXHRcdHV0aWxzID0ga3YudXRpbHM7XG5cblx0ZnVuY3Rpb24gY2xlYW5VcFN1YnNjcmlwdGlvbnMoY29udGV4dCkge1xuXHRcdGZvckVhY2goY29udGV4dC5zdWJzY3JpcHRpb25zLCBmdW5jdGlvbiAoc3Vic2NyaXB0aW9uKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuXHRcdH0pO1xuXHRcdGNvbnRleHQuc3Vic2NyaXB0aW9ucyA9IFtdO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcG9zZShjb250ZXh0KSB7XG5cdFx0aWYgKGNvbnRleHQub3B0aW9ucy5kZWVwKSB7XG5cdFx0XHRmb3JFYWNoKGNvbnRleHQuZmxhZ2dlZCwgZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0XHRkZWxldGUgb2JqLl9fa3ZfdHJhdmVyc2VkO1xuXHRcdFx0fSk7XG5cdFx0XHRjb250ZXh0LmZsYWdnZWQubGVuZ3RoID0gMDtcblx0XHR9XG5cblx0XHRpZiAoIWNvbnRleHQub3B0aW9ucy5saXZlKSB7XG5cdFx0XHRjbGVhblVwU3Vic2NyaXB0aW9ucyhjb250ZXh0KTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBydW5UcmF2ZXJzYWwob2JqLCBjb250ZXh0KSB7XG5cdFx0Y29udGV4dC52YWxpZGF0YWJsZXMgPSBbXTtcblx0XHRjbGVhblVwU3Vic2NyaXB0aW9ucyhjb250ZXh0KTtcblx0XHR0cmF2ZXJzZUdyYXBoKG9iaiwgY29udGV4dCk7XG5cdFx0ZGlzcG9zZShjb250ZXh0KTtcblx0fVxuXG5cdGZ1bmN0aW9uIHRyYXZlcnNlR3JhcGgob2JqLCBjb250ZXh0LCBsZXZlbCkge1xuXHRcdHZhciBvYmpWYWx1ZXMgPSBbXSxcblx0XHRcdHZhbCA9IG9iai5wZWVrID8gb2JqLnBlZWsoKSA6IG9iajtcblxuXHRcdGlmIChvYmouX19rdl90cmF2ZXJzZWQgPT09IHRydWUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoY29udGV4dC5vcHRpb25zLmRlZXApIHtcblx0XHRcdG9iai5fX2t2X3RyYXZlcnNlZCA9IHRydWU7XG5cdFx0XHRjb250ZXh0LmZsYWdnZWQucHVzaChvYmopO1xuXHRcdH1cblxuXHRcdC8vZGVmYXVsdCBsZXZlbCB2YWx1ZSBkZXBlbmRzIG9uIGRlZXAgb3B0aW9uLlxuXHRcdGxldmVsID0gKGxldmVsICE9PSB1bmRlZmluZWQgPyBsZXZlbCA6IGNvbnRleHQub3B0aW9ucy5kZWVwID8gMSA6IC0xKTtcblxuXHRcdC8vIGlmIG9iamVjdCBpcyBvYnNlcnZhYmxlIHRoZW4gYWRkIGl0IHRvIHRoZSBsaXN0XG5cdFx0aWYgKGtvLmlzT2JzZXJ2YWJsZShvYmopKSB7XG5cdFx0XHQvLyBlbnN1cmUgaXQncyB2YWxpZGF0YWJsZSBidXQgZG9uJ3QgZXh0ZW5kIHZhbGlkYXRlZE9ic2VydmFibGUgYmVjYXVzZSBpdFxuXHRcdFx0Ly8gd291bGQgb3ZlcndyaXRlIGlzVmFsaWQgcHJvcGVydHkuXG5cdFx0XHRpZiAoIW9iai5lcnJvcnMgJiYgIXV0aWxzLmlzVmFsaWRhdGFibGUob2JqKSkge1xuXHRcdFx0XHRvYmouZXh0ZW5kKHsgdmFsaWRhdGFibGU6IHRydWUgfSk7XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LnZhbGlkYXRhYmxlcy5wdXNoKG9iaik7XG5cblx0XHRcdGlmIChjb250ZXh0Lm9wdGlvbnMubGl2ZSAmJiB1dGlscy5pc09ic2VydmFibGVBcnJheShvYmopKSB7XG5cdFx0XHRcdGNvbnRleHQuc3Vic2NyaXB0aW9ucy5wdXNoKG9iai5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNvbnRleHQuZ3JhcGhNb25pdG9yLnZhbHVlSGFzTXV0YXRlZCgpO1xuXHRcdFx0XHR9KSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9nZXQgbGlzdCBvZiB2YWx1ZXMgZWl0aGVyIGZyb20gYXJyYXkgb3Igb2JqZWN0IGJ1dCBpZ25vcmUgbm9uLW9iamVjdHNcblx0XHQvLyBhbmQgZGVzdHJveWVkIG9iamVjdHNcblx0XHRpZiAodmFsICYmICF2YWwuX2Rlc3Ryb3kpIHtcblx0XHRcdGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcblx0XHRcdFx0b2JqVmFsdWVzID0gdmFsO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodmFsKSkge1xuXHRcdFx0XHRvYmpWYWx1ZXMgPSB1dGlscy52YWx1ZXModmFsKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL3Byb2Nlc3MgcmVjdXJzaXZlbHkgaWYgaXQgaXMgZGVlcCBncm91cGluZ1xuXHRcdGlmIChsZXZlbCAhPT0gMCkge1xuXHRcdFx0dXRpbHMuZm9yRWFjaChvYmpWYWx1ZXMsIGZ1bmN0aW9uIChvYnNlcnZhYmxlKSB7XG5cdFx0XHRcdC8vYnV0IG5vdCBmYWxzeSB0aGluZ3MgYW5kIG5vdCBIVE1MIEVsZW1lbnRzXG5cdFx0XHRcdGlmIChvYnNlcnZhYmxlICYmICFvYnNlcnZhYmxlLm5vZGVUeXBlICYmICgha28uaXNDb21wdXRlZChvYnNlcnZhYmxlKSB8fCBvYnNlcnZhYmxlLnJ1bGVzKSkge1xuXHRcdFx0XHRcdHRyYXZlcnNlR3JhcGgob2JzZXJ2YWJsZSwgY29udGV4dCwgbGV2ZWwgKyAxKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY29sbGVjdEVycm9ycyhhcnJheSkge1xuXHRcdHZhciBlcnJvcnMgPSBbXTtcblx0XHRmb3JFYWNoKGFycmF5LCBmdW5jdGlvbiAob2JzZXJ2YWJsZSkge1xuXHRcdFx0Ly8gRG8gbm90IGNvbGxlY3QgdmFsaWRhdGVkT2JzZXJ2YWJsZSBlcnJvcnNcblx0XHRcdGlmICh1dGlscy5pc1ZhbGlkYXRhYmxlKG9ic2VydmFibGUpICYmICFvYnNlcnZhYmxlLmlzVmFsaWQoKSkge1xuXHRcdFx0XHQvLyBVc2UgcGVlayBiZWNhdXNlIHdlIGRvbid0IHdhbnQgYSBkZXBlbmRlbmN5IGZvciAnZXJyb3InIHByb3BlcnR5IGJlY2F1c2UgaXRcblx0XHRcdFx0Ly8gY2hhbmdlcyBiZWZvcmUgJ2lzVmFsaWQnIGRvZXMuIChJc3N1ZSAjOTkpXG5cdFx0XHRcdGVycm9ycy5wdXNoKG9ic2VydmFibGUuZXJyb3IucGVlaygpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gZXJyb3JzO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHQvL0NhbGwgdGhpcyBvbiBzdGFydHVwXG5cdFx0Ly9hbnkgY29uZmlnIGNhbiBiZSBvdmVycmlkZGVuIHdpdGggdGhlIHBhc3NlZCBpbiBvcHRpb25zXG5cdFx0aW5pdDogZnVuY3Rpb24gKG9wdGlvbnMsIGZvcmNlKSB7XG5cdFx0XHQvL2RvbmUgcnVuIHRoaXMgbXVsdGlwbGUgdGltZXMgaWYgd2UgZG9uJ3QgcmVhbGx5IHdhbnQgdG9cblx0XHRcdGlmIChpc0luaXRpYWxpemVkID4gMCAmJiAhZm9yY2UpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvL2JlY2F1c2Ugd2Ugd2lsbCBiZSBhY2Nlc3Npbmcgb3B0aW9ucyBwcm9wZXJ0aWVzIGl0IGhhcyB0byBiZSBhbiBvYmplY3QgYXQgbGVhc3Rcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdFx0Ly9pZiBzcGVjaWZpYyBlcnJvciBjbGFzc2VzIGFyZSBub3QgcHJvdmlkZWQgdGhlbiBhcHBseSBnZW5lcmljIGVycm9yQ2xhc3Ncblx0XHRcdC8vaXQgaGFzIHRvIGJlIGRvbmUgb24gb3B0aW9uIHNvIHRoYXQgb3B0aW9ucy5lcnJvckNsYXNzIGNhbiBvdmVycmlkZSBkZWZhdWx0XG5cdFx0XHQvL2Vycm9yRWxlbWVudENsYXNzIGFuZCBlcnJvck1lc3NhZ2UgY2xhc3MgYnV0IG5vdCB0aG9zZSBwcm92aWRlZCBpbiBvcHRpb25zXG5cdFx0XHRvcHRpb25zLmVycm9yRWxlbWVudENsYXNzID0gb3B0aW9ucy5lcnJvckVsZW1lbnRDbGFzcyB8fCBvcHRpb25zLmVycm9yQ2xhc3MgfHwgY29uZmlndXJhdGlvbi5lcnJvckVsZW1lbnRDbGFzcztcblx0XHRcdG9wdGlvbnMuZXJyb3JNZXNzYWdlQ2xhc3MgPSBvcHRpb25zLmVycm9yTWVzc2FnZUNsYXNzIHx8IG9wdGlvbnMuZXJyb3JDbGFzcyB8fCBjb25maWd1cmF0aW9uLmVycm9yTWVzc2FnZUNsYXNzO1xuXG5cdFx0XHRleHRlbmQoY29uZmlndXJhdGlvbiwgb3B0aW9ucyk7XG5cblx0XHRcdGlmIChjb25maWd1cmF0aW9uLnJlZ2lzdGVyRXh0ZW5kZXJzKSB7XG5cdFx0XHRcdGt2LnJlZ2lzdGVyRXh0ZW5kZXJzKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlzSW5pdGlhbGl6ZWQgPSAxO1xuXHRcdH0sXG5cblx0XHQvLyByZXNldHMgdGhlIGNvbmZpZyBiYWNrIHRvIGl0cyBvcmlnaW5hbCBzdGF0ZVxuXHRcdHJlc2V0OiBrdi5jb25maWd1cmF0aW9uLnJlc2V0LFxuXG5cdFx0Ly8gcmVjdXJzaXZlbHkgd2Fsa3MgYSB2aWV3TW9kZWwgYW5kIGNyZWF0ZXMgYW4gb2JqZWN0IHRoYXRcblx0XHQvLyBwcm92aWRlcyB2YWxpZGF0aW9uIGluZm9ybWF0aW9uIGZvciB0aGUgZW50aXJlIHZpZXdNb2RlbFxuXHRcdC8vIG9iaiAtPiB0aGUgdmlld01vZGVsIHRvIHdhbGtcblx0XHQvLyBvcHRpb25zIC0+IHtcblx0XHQvL1x0ICBkZWVwOiBmYWxzZSwgLy8gaWYgdHJ1ZSwgd2lsbCB3YWxrIHBhc3QgdGhlIGZpcnN0IGxldmVsIG9mIHZpZXdNb2RlbCBwcm9wZXJ0aWVzXG5cdFx0Ly9cdCAgb2JzZXJ2YWJsZTogZmFsc2UgLy8gaWYgdHJ1ZSwgcmV0dXJucyBhIGNvbXB1dGVkIG9ic2VydmFibGUgaW5kaWNhdGluZyBpZiB0aGUgdmlld01vZGVsIGlzIHZhbGlkXG5cdFx0Ly8gfVxuXHRcdGdyb3VwOiBmdW5jdGlvbiBncm91cChvYmosIG9wdGlvbnMpIHsgLy8gYXJyYXkgb2Ygb2JzZXJ2YWJsZXMgb3Igdmlld01vZGVsXG5cdFx0XHRvcHRpb25zID0gZXh0ZW5kKGV4dGVuZCh7fSwgY29uZmlndXJhdGlvbi5ncm91cGluZyksIG9wdGlvbnMpO1xuXG5cdFx0XHR2YXIgY29udGV4dCA9IHtcblx0XHRcdFx0b3B0aW9uczogb3B0aW9ucyxcblx0XHRcdFx0Z3JhcGhNb25pdG9yOiBrby5vYnNlcnZhYmxlKCksXG5cdFx0XHRcdGZsYWdnZWQ6IFtdLFxuXHRcdFx0XHRzdWJzY3JpcHRpb25zOiBbXSxcblx0XHRcdFx0dmFsaWRhdGFibGVzOiBbXVxuXHRcdFx0fTtcblxuXHRcdFx0dmFyIHJlc3VsdCA9IG51bGw7XG5cblx0XHRcdC8vaWYgdXNpbmcgb2JzZXJ2YWJsZXMgdGhlbiB0cmF2ZXJzZSBzdHJ1Y3R1cmUgb25jZSBhbmQgYWRkIG9ic2VydmFibGVzXG5cdFx0XHRpZiAob3B0aW9ucy5vYnNlcnZhYmxlKSB7XG5cdFx0XHRcdHJlc3VsdCA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjb250ZXh0LmdyYXBoTW9uaXRvcigpOyAvL3JlZ2lzdGVyIGRlcGVuZGVuY3lcblx0XHRcdFx0XHRydW5UcmF2ZXJzYWwob2JqLCBjb250ZXh0KTtcblx0XHRcdFx0XHRyZXR1cm4gY29sbGVjdEVycm9ycyhjb250ZXh0LnZhbGlkYXRhYmxlcyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7IC8vaWYgbm90IHVzaW5nIG9ic2VydmFibGVzIHRoZW4gZXZlcnkgY2FsbCB0byBlcnJvcigpIHNob3VsZCB0cmF2ZXJzZSB0aGUgc3RydWN0dXJlXG5cdFx0XHRcdHJlc3VsdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRydW5UcmF2ZXJzYWwob2JqLCBjb250ZXh0KTtcblx0XHRcdFx0XHRyZXR1cm4gY29sbGVjdEVycm9ycyhjb250ZXh0LnZhbGlkYXRhYmxlcyk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdHJlc3VsdC5zaG93QWxsTWVzc2FnZXMgPSBmdW5jdGlvbiAoc2hvdykgeyAvLyB0aGFua3MgQGhlbGlvc1BvcnRhbFxuXHRcdFx0XHRpZiAoc2hvdyA9PT0gdW5kZWZpbmVkKSB7Ly9kZWZhdWx0IHRvIHRydWVcblx0XHRcdFx0XHRzaG93ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJlc3VsdC5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnZhYmxlKSB7XG5cdFx0XHRcdFx0aWYgKHV0aWxzLmlzVmFsaWRhdGFibGUob2JzZXJ2YWJsZSkpIHtcblx0XHRcdFx0XHRcdG9ic2VydmFibGUuaXNNb2RpZmllZChzaG93KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblxuXHRcdFx0cmVzdWx0LmlzQW55TWVzc2FnZVNob3duID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgaW52YWxpZEFuZE1vZGlmaWVkUHJlc2VudDtcblxuXHRcdFx0XHRpbnZhbGlkQW5kTW9kaWZpZWRQcmVzZW50ID0gISFyZXN1bHQuZmluZChmdW5jdGlvbiAob2JzZXJ2YWJsZSkge1xuXHRcdFx0XHRcdHJldHVybiB1dGlscy5pc1ZhbGlkYXRhYmxlKG9ic2VydmFibGUpICYmICFvYnNlcnZhYmxlLmlzVmFsaWQoKSAmJiBvYnNlcnZhYmxlLmlzTW9kaWZpZWQoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBpbnZhbGlkQW5kTW9kaWZpZWRQcmVzZW50O1xuXHRcdFx0fTtcblxuXHRcdFx0cmVzdWx0LmZpbHRlciA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuXHRcdFx0XHRwcmVkaWNhdGUgPSBwcmVkaWNhdGUgfHwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdHJ1ZTsgfTtcblx0XHRcdFx0Ly8gZW5zdXJlIHdlIGhhdmUgbGF0ZXN0IGNoYW5nZXNcblx0XHRcdFx0cmVzdWx0KCk7XG5cblx0XHRcdFx0cmV0dXJuIGtvVXRpbHMuYXJyYXlGaWx0ZXIoY29udGV4dC52YWxpZGF0YWJsZXMsIHByZWRpY2F0ZSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXN1bHQuZmluZCA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuXHRcdFx0XHRwcmVkaWNhdGUgPSBwcmVkaWNhdGUgfHwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdHJ1ZTsgfTtcblx0XHRcdFx0Ly8gZW5zdXJlIHdlIGhhdmUgbGF0ZXN0IGNoYW5nZXNcblx0XHRcdFx0cmVzdWx0KCk7XG5cblx0XHRcdFx0cmV0dXJuIGtvVXRpbHMuYXJyYXlGaXJzdChjb250ZXh0LnZhbGlkYXRhYmxlcywgcHJlZGljYXRlKTtcblx0XHRcdH07XG5cblx0XHRcdHJlc3VsdC5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHRcdFx0Y2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7IH07XG5cdFx0XHRcdC8vIGVuc3VyZSB3ZSBoYXZlIGxhdGVzdCBjaGFuZ2VzXG5cdFx0XHRcdHJlc3VsdCgpO1xuXG5cdFx0XHRcdGZvckVhY2goY29udGV4dC52YWxpZGF0YWJsZXMsIGNhbGxiYWNrKTtcblx0XHRcdH07XG5cblx0XHRcdHJlc3VsdC5tYXAgPSBmdW5jdGlvbihtYXBwaW5nKSB7XG5cdFx0XHRcdG1hcHBpbmcgPSBtYXBwaW5nIHx8IGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBpdGVtOyB9O1xuXHRcdFx0XHQvLyBlbnN1cmUgd2UgaGF2ZSBsYXRlc3QgY2hhbmdlc1xuXHRcdFx0XHRyZXN1bHQoKTtcblxuXHRcdFx0XHRyZXR1cm4ga29VdGlscy5hcnJheU1hcChjb250ZXh0LnZhbGlkYXRhYmxlcywgbWFwcGluZyk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEBwcml2YXRlIFlvdSBzaG91bGQgbm90IHJlbHkgb24gdGhpcyBtZXRob2QgYmVpbmcgaGVyZS5cblx0XHRcdCAqIEl0J3MgYSBwcml2YXRlIG1ldGhvZCBhbmQgaXQgbWF5IGNoYW5nZSBpbiB0aGUgZnV0dXJlLlxuXHRcdFx0ICpcblx0XHRcdCAqIEBkZXNjcmlwdGlvbiBVcGRhdGVzIHRoZSB2YWxpZGF0ZWQgb2JqZWN0IGFuZCBjb2xsZWN0cyBlcnJvcnMgZnJvbSBpdC5cblx0XHRcdCAqL1xuXHRcdFx0cmVzdWx0Ll91cGRhdGVTdGF0ZSA9IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG5cdFx0XHRcdGlmICghdXRpbHMuaXNPYmplY3QobmV3VmFsdWUpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdBbiBvYmplY3QgaXMgcmVxdWlyZWQuJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b2JqID0gbmV3VmFsdWU7XG5cdFx0XHRcdGlmIChvcHRpb25zLm9ic2VydmFibGUpIHtcblx0XHRcdFx0XHRjb250ZXh0LmdyYXBoTW9uaXRvci52YWx1ZUhhc011dGF0ZWQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRydW5UcmF2ZXJzYWwobmV3VmFsdWUsIGNvbnRleHQpO1xuXHRcdFx0XHRcdHJldHVybiBjb2xsZWN0RXJyb3JzKGNvbnRleHQudmFsaWRhdGFibGVzKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblxuXHRcdGZvcm1hdE1lc3NhZ2U6IGZ1bmN0aW9uIChtZXNzYWdlLCBwYXJhbXMsIG9ic2VydmFibGUpIHtcblx0XHRcdGlmICh1dGlscy5pc09iamVjdChwYXJhbXMpICYmIHBhcmFtcy50eXBlQXR0cikge1xuXHRcdFx0XHRwYXJhbXMgPSBwYXJhbXMudmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UocGFyYW1zLCBvYnNlcnZhYmxlKTtcblx0XHRcdH1cblx0XHRcdHZhciByZXBsYWNlbWVudHMgPSB1bndyYXAocGFyYW1zKTtcbiAgICAgICAgICAgIGlmIChyZXBsYWNlbWVudHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50cyA9IFtdO1xuICAgICAgICAgICAgfVxuXHRcdFx0aWYgKCF1dGlscy5pc0FycmF5KHJlcGxhY2VtZW50cykpIHtcblx0XHRcdFx0cmVwbGFjZW1lbnRzID0gW3JlcGxhY2VtZW50c107XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbWVzc2FnZS5yZXBsYWNlKC97KFxcZCspfS9naSwgZnVuY3Rpb24obWF0Y2gsIGluZGV4KSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgcmVwbGFjZW1lbnRzW2luZGV4XSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVwbGFjZW1lbnRzW2luZGV4XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbWF0Y2g7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0Ly8gYWRkUnVsZTpcblx0XHQvLyBUaGlzIHRha2VzIGluIGEga28ub2JzZXJ2YWJsZSBhbmQgYSBSdWxlIENvbnRleHQgLSB3aGljaCBpcyBqdXN0IGEgcnVsZSBuYW1lIGFuZCBwYXJhbXMgdG8gc3VwcGx5IHRvIHRoZSB2YWxpZGF0b3Jcblx0XHQvLyBpZToga3YuYWRkUnVsZShteU9ic2VydmFibGUsIHtcblx0XHQvL1x0XHQgIHJ1bGU6ICdyZXF1aXJlZCcsXG5cdFx0Ly9cdFx0ICBwYXJhbXM6IHRydWVcblx0XHQvL1x0ICB9KTtcblx0XHQvL1xuXHRcdGFkZFJ1bGU6IGZ1bmN0aW9uIChvYnNlcnZhYmxlLCBydWxlKSB7XG5cdFx0XHRvYnNlcnZhYmxlLmV4dGVuZCh7IHZhbGlkYXRhYmxlOiB0cnVlIH0pO1xuXG5cdFx0XHR2YXIgaGFzUnVsZSA9ICEha29VdGlscy5hcnJheUZpcnN0KG9ic2VydmFibGUucnVsZXMoKSwgZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0XHRyZXR1cm4gaXRlbS5ydWxlICYmIGl0ZW0ucnVsZSA9PT0gcnVsZS5ydWxlO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghaGFzUnVsZSkge1xuXHRcdFx0XHQvL3B1c2ggYSBSdWxlIENvbnRleHQgdG8gdGhlIG9ic2VydmFibGVzIGxvY2FsIGFycmF5IG9mIFJ1bGUgQ29udGV4dHNcblx0XHRcdFx0b2JzZXJ2YWJsZS5ydWxlcy5wdXNoKHJ1bGUpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9ic2VydmFibGU7XG5cdFx0fSxcblxuXHRcdC8vIGFkZEFub255bW91c1J1bGU6XG5cdFx0Ly8gQW5vbnltb3VzIFJ1bGVzIGVzc2VudGlhbGx5IGhhdmUgYWxsIHRoZSBwcm9wZXJ0aWVzIG9mIGEgUnVsZSwgYnV0IGFyZSBvbmx5IHNwZWNpZmljIGZvciBhIGNlcnRhaW4gcHJvcGVydHlcblx0XHQvLyBhbmQgZGV2ZWxvcGVycyB0eXBpY2FsbHkgYXJlIHdhbnRpbmcgdG8gYWRkIHRoZW0gb24gdGhlIGZseSBvciBub3QgcmVnaXN0ZXIgYSBydWxlIHdpdGggdGhlICdrdi5ydWxlcycgb2JqZWN0XG5cdFx0Ly9cblx0XHQvLyBFeGFtcGxlOlxuXHRcdC8vIHZhciB0ZXN0ID0ga28ub2JzZXJ2YWJsZSgnc29tZXRoaW5nJykuZXh0ZW5keyhcblx0XHQvL1x0ICB2YWxpZGF0aW9uOiB7XG5cdFx0Ly9cdFx0ICB2YWxpZGF0b3I6IGZ1bmN0aW9uKHZhbCwgc29tZU90aGVyVmFsKXtcblx0XHQvL1x0XHRcdCAgcmV0dXJuIHRydWU7XG5cdFx0Ly9cdFx0ICB9LFxuXHRcdC8vXHRcdCAgbWVzc2FnZTogXCJTb21ldGhpbmcgbXVzdCBiZSByZWFsbHkgd3JvbmchJyxcblx0XHQvL1x0XHQgIHBhcmFtczogdHJ1ZVxuXHRcdC8vXHQgIH1cblx0XHQvLyAgKX07XG5cdFx0YWRkQW5vbnltb3VzUnVsZTogZnVuY3Rpb24gKG9ic2VydmFibGUsIHJ1bGVPYmopIHtcblx0XHRcdGlmIChydWxlT2JqWydtZXNzYWdlJ10gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRydWxlT2JqWydtZXNzYWdlJ10gPSAnRXJyb3InO1xuXHRcdFx0fVxuXG5cdFx0XHQvL21ha2Ugc3VyZSBvbmx5SWYgaXMgaG9ub3VyZWRcblx0XHRcdGlmIChydWxlT2JqLm9ubHlJZikge1xuXHRcdFx0XHRydWxlT2JqLmNvbmRpdGlvbiA9IHJ1bGVPYmoub25seUlmO1xuXHRcdFx0fVxuXG5cdFx0XHQvL2FkZCB0aGUgYW5vbnltb3VzIHJ1bGUgdG8gdGhlIG9ic2VydmFibGVcblx0XHRcdGt2LmFkZFJ1bGUob2JzZXJ2YWJsZSwgcnVsZU9iaik7XG5cdFx0fSxcblxuXHRcdGFkZEV4dGVuZGVyOiBmdW5jdGlvbiAocnVsZU5hbWUpIHtcblx0XHRcdGtvLmV4dGVuZGVyc1tydWxlTmFtZV0gPSBmdW5jdGlvbiAob2JzZXJ2YWJsZSwgcGFyYW1zKSB7XG5cdFx0XHRcdC8vcGFyYW1zIGNhbiBjb21lIGluIGEgZmV3IGZsYXZvcnNcblx0XHRcdFx0Ly8gMS4gSnVzdCB0aGUgcGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgdmFsaWRhdG9yXG5cdFx0XHRcdC8vIDIuIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBNZXNzYWdlIHRvIGJlIHVzZWQgYW5kIHRoZSBQYXJhbXMgdG8gcGFzcyB0byB0aGUgdmFsaWRhdG9yXG5cdFx0XHRcdC8vIDMuIEEgY29uZGl0aW9uIHdoZW4gdGhlIHZhbGlkYXRpb24gcnVsZSB0byBiZSBhcHBsaWVkXG5cdFx0XHRcdC8vXG5cdFx0XHRcdC8vIEV4YW1wbGU6XG5cdFx0XHRcdC8vIHZhciB0ZXN0ID0ga28ub2JzZXJ2YWJsZSgzKS5leHRlbmQoe1xuXHRcdFx0XHQvL1x0ICBtYXg6IHtcblx0XHRcdFx0Ly9cdFx0ICBtZXNzYWdlOiAnVGhpcyBzcGVjaWFsIGZpZWxkIGhhcyBhIE1heCBvZiB7MH0nLFxuXHRcdFx0XHQvL1x0XHQgIHBhcmFtczogMixcblx0XHRcdFx0Ly9cdFx0ICBvbmx5SWY6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvL1x0XHRcdFx0XHQgIHJldHVybiBzcGVjaWFsRmllbGQuSXNWaXNpYmxlKCk7XG5cdFx0XHRcdC8vXHRcdFx0XHQgIH1cblx0XHRcdFx0Ly9cdCAgfVxuXHRcdFx0XHQvLyAgKX07XG5cdFx0XHRcdC8vXG5cdFx0XHRcdGlmIChwYXJhbXMgJiYgKHBhcmFtcy5tZXNzYWdlIHx8IHBhcmFtcy5vbmx5SWYpKSB7IC8vaWYgaXQgaGFzIGEgbWVzc2FnZSBvciBjb25kaXRpb24gb2JqZWN0LCB0aGVuIGl0cyBhbiBvYmplY3QgbGl0ZXJhbCB0byB1c2Vcblx0XHRcdFx0XHRyZXR1cm4ga3YuYWRkUnVsZShvYnNlcnZhYmxlLCB7XG5cdFx0XHRcdFx0XHRydWxlOiBydWxlTmFtZSxcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IHBhcmFtcy5tZXNzYWdlLFxuXHRcdFx0XHRcdFx0cGFyYW1zOiB1dGlscy5pc0VtcHR5VmFsKHBhcmFtcy5wYXJhbXMpID8gdHJ1ZSA6IHBhcmFtcy5wYXJhbXMsXG5cdFx0XHRcdFx0XHRjb25kaXRpb246IHBhcmFtcy5vbmx5SWZcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4ga3YuYWRkUnVsZShvYnNlcnZhYmxlLCB7XG5cdFx0XHRcdFx0XHRydWxlOiBydWxlTmFtZSxcblx0XHRcdFx0XHRcdHBhcmFtczogcGFyYW1zXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdC8vIGxvb3BzIHRocm91Z2ggYWxsIGt2LnJ1bGVzIGFuZCBhZGRzIHRoZW0gYXMgZXh0ZW5kZXJzIHRvXG5cdFx0Ly8ga28uZXh0ZW5kZXJzXG5cdFx0cmVnaXN0ZXJFeHRlbmRlcnM6IGZ1bmN0aW9uICgpIHsgLy8gcm9vdCBleHRlbmRlcnMgb3B0aW9uYWwsIHVzZSAndmFsaWRhdGlvbicgZXh0ZW5kZXIgaWYgd291bGQgY2F1c2UgY29uZmxpY3RzXG5cdFx0XHRpZiAoY29uZmlndXJhdGlvbi5yZWdpc3RlckV4dGVuZGVycykge1xuXHRcdFx0XHRmb3IgKHZhciBydWxlTmFtZSBpbiBrdi5ydWxlcykge1xuXHRcdFx0XHRcdGlmIChrdi5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcblx0XHRcdFx0XHRcdGlmICgha28uZXh0ZW5kZXJzW3J1bGVOYW1lXSkge1xuXHRcdFx0XHRcdFx0XHRrdi5hZGRFeHRlbmRlcihydWxlTmFtZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vY3JlYXRlcyBhIHNwYW4gbmV4dCB0byB0aGUgQGVsZW1lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGVycm9yIGNsYXNzXG5cdFx0aW5zZXJ0VmFsaWRhdGlvbk1lc3NhZ2U6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHR2YXIgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ1NQQU4nKTtcblx0XHRcdHNwYW4uY2xhc3NOYW1lID0gdXRpbHMuZ2V0Q29uZmlnT3B0aW9ucyhlbGVtZW50KS5lcnJvck1lc3NhZ2VDbGFzcztcblx0XHRcdHV0aWxzLmluc2VydEFmdGVyKGVsZW1lbnQsIHNwYW4pO1xuXHRcdFx0cmV0dXJuIHNwYW47XG5cdFx0fSxcblxuXHRcdC8vIGlmIGh0bWwtNSB2YWxpZGF0aW9uIGF0dHJpYnV0ZXMgaGF2ZSBiZWVuIHNwZWNpZmllZCwgdGhpcyBwYXJzZXNcblx0XHQvLyB0aGUgYXR0cmlidXRlcyBvbiBAZWxlbWVudFxuXHRcdHBhcnNlSW5wdXRWYWxpZGF0aW9uQXR0cmlidXRlczogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcblx0XHRcdGZvckVhY2goa3YuY29uZmlndXJhdGlvbi5odG1sNUF0dHJpYnV0ZXMsIGZ1bmN0aW9uIChhdHRyKSB7XG5cdFx0XHRcdGlmICh1dGlscy5oYXNBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cikpIHtcblxuXHRcdFx0XHRcdHZhciBwYXJhbXMgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKSB8fCB0cnVlO1xuXG5cdFx0XHRcdFx0aWYgKGF0dHIgPT09ICdtaW4nIHx8IGF0dHIgPT09ICdtYXgnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIElmIHdlJ3JlIHZhbGlkYXRpbmcgYmFzZWQgb24gdGhlIG1pbiBhbmQgbWF4IGF0dHJpYnV0ZXMsIHdlJ2xsXG5cdFx0XHRcdFx0XHQvLyBuZWVkIHRvIGtub3cgd2hhdCB0aGUgJ3R5cGUnIGF0dHJpYnV0ZSBpcyBzZXQgdG9cblx0XHRcdFx0XHRcdHZhciB0eXBlQXR0ciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHR5cGVBdHRyID09PSBcInVuZGVmaW5lZFwiIHx8ICF0eXBlQXR0cilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gRnJvbSBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sLW1hcmt1cC9pbnB1dDpcblx0XHRcdFx0XHRcdFx0Ly8gICBBbiBpbnB1dCBlbGVtZW50IHdpdGggbm8gdHlwZSBhdHRyaWJ1dGUgc3BlY2lmaWVkIHJlcHJlc2VudHMgdGhlXG5cdFx0XHRcdFx0XHRcdC8vICAgc2FtZSB0aGluZyBhcyBhbiBpbnB1dCBlbGVtZW50IHdpdGggaXRzIHR5cGUgYXR0cmlidXRlIHNldCB0byBcInRleHRcIi5cblx0XHRcdFx0XHRcdFx0dHlwZUF0dHIgPSBcInRleHRcIjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHBhcmFtcyA9IHt0eXBlQXR0cjogdHlwZUF0dHIsIHZhbHVlOiBwYXJhbXN9O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGt2LmFkZFJ1bGUodmFsdWVBY2Nlc3NvcigpLCB7XG5cdFx0XHRcdFx0XHRydWxlOiBhdHRyLFxuXHRcdFx0XHRcdFx0cGFyYW1zOiBwYXJhbXNcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHZhciBjdXJyZW50VHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG5cdFx0XHRmb3JFYWNoKGt2LmNvbmZpZ3VyYXRpb24uaHRtbDVJbnB1dFR5cGVzLCBmdW5jdGlvbiAodHlwZSkge1xuXHRcdFx0XHRpZiAodHlwZSA9PT0gY3VycmVudFR5cGUpIHtcblx0XHRcdFx0XHRrdi5hZGRSdWxlKHZhbHVlQWNjZXNzb3IoKSwge1xuXHRcdFx0XHRcdFx0cnVsZTogKHR5cGUgPT09ICdkYXRlJykgPyAnZGF0ZUlTTycgOiB0eXBlLFxuXHRcdFx0XHRcdFx0cGFyYW1zOiB0cnVlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLyB3cml0ZXMgaHRtbDUgdmFsaWRhdGlvbiBhdHRyaWJ1dGVzIG9uIHRoZSBlbGVtZW50IHBhc3NlZCBpblxuXHRcdHdyaXRlSW5wdXRWYWxpZGF0aW9uQXR0cmlidXRlczogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcblx0XHRcdHZhciBvYnNlcnZhYmxlID0gdmFsdWVBY2Nlc3NvcigpO1xuXG5cdFx0XHRpZiAoIW9ic2VydmFibGUgfHwgIW9ic2VydmFibGUucnVsZXMpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgY29udGV4dHMgPSBvYnNlcnZhYmxlLnJ1bGVzKCk7IC8vIG9ic2VydmFibGUgYXJyYXlcblxuXHRcdFx0Ly8gbG9vcCB0aHJvdWdoIHRoZSBhdHRyaWJ1dGVzIGFuZCBhZGQgdGhlIGluZm9ybWF0aW9uIG5lZWRlZFxuXHRcdFx0Zm9yRWFjaChrdi5jb25maWd1cmF0aW9uLmh0bWw1QXR0cmlidXRlcywgZnVuY3Rpb24gKGF0dHIpIHtcblx0XHRcdFx0dmFyIGN0eCA9IGtvVXRpbHMuYXJyYXlGaXJzdChjb250ZXh0cywgZnVuY3Rpb24gKGN0eCkge1xuXHRcdFx0XHRcdHJldHVybiBjdHgucnVsZSAmJiBjdHgucnVsZS50b0xvd2VyQ2FzZSgpID09PSBhdHRyLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmICghY3R4KSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gd2UgaGF2ZSBhIHJ1bGUgbWF0Y2hpbmcgYSB2YWxpZGF0aW9uIGF0dHJpYnV0ZSBhdCB0aGlzIHBvaW50XG5cdFx0XHRcdC8vIHNvIGxldHMgYWRkIGl0IHRvIHRoZSBlbGVtZW50IGFsb25nIHdpdGggdGhlIHBhcmFtc1xuXHRcdFx0XHRrby5jb21wdXRlZCh7XG5cdFx0XHRcdFx0cmVhZDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgcGFyYW1zID0ga28udW53cmFwKGN0eC5wYXJhbXMpO1xuXG5cdFx0XHRcdFx0XHQvLyB3ZSBoYXZlIHRvIGRvIHNvbWUgc3BlY2lhbCB0aGluZ3MgZm9yIHRoZSBwYXR0ZXJuIHZhbGlkYXRpb25cblx0XHRcdFx0XHRcdGlmIChjdHgucnVsZSA9PT0gXCJwYXR0ZXJuXCIgJiYgcGFyYW1zIGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRcdFx0XHRcdC8vIHdlIG5lZWQgdGhlIHB1cmUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBSZWdFeHByIHdpdGhvdXQgdGhlIC8vZ2kgc3R1ZmZcblx0XHRcdFx0XHRcdFx0cGFyYW1zID0gcGFyYW1zLnNvdXJjZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ciwgcGFyYW1zKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogZWxlbWVudFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRjb250ZXh0cyA9IG51bGw7XG5cdFx0fSxcblxuXHRcdC8vdGFrZSBhbiBleGlzdGluZyBiaW5kaW5nIGhhbmRsZXIgYW5kIG1ha2UgaXQgY2F1c2UgYXV0b21hdGljIHZhbGlkYXRpb25zXG5cdFx0bWFrZUJpbmRpbmdIYW5kbGVyVmFsaWRhdGFibGU6IGZ1bmN0aW9uIChoYW5kbGVyTmFtZSkge1xuXHRcdFx0dmFyIGluaXQgPSBrby5iaW5kaW5nSGFuZGxlcnNbaGFuZGxlck5hbWVdLmluaXQ7XG5cblx0XHRcdGtvLmJpbmRpbmdIYW5kbGVyc1toYW5kbGVyTmFtZV0uaW5pdCA9IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5nc0FjY2Vzc29yLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG5cblx0XHRcdFx0aW5pdChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5nc0FjY2Vzc29yLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KTtcblxuXHRcdFx0XHRyZXR1cm4ga28uYmluZGluZ0hhbmRsZXJzWyd2YWxpZGF0aW9uQ29yZSddLmluaXQoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3NBY2Nlc3Nvciwgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCk7XG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHQvLyB2aXNpdCBhbiBvYmplY3RzIHByb3BlcnRpZXMgYW5kIGFwcGx5IHZhbGlkYXRpb24gcnVsZXMgZnJvbSBhIGRlZmluaXRpb25cblx0XHRzZXRSdWxlczogZnVuY3Rpb24gKHRhcmdldCwgZGVmaW5pdGlvbikge1xuXHRcdFx0dmFyIHNldFJ1bGVzID0gZnVuY3Rpb24gKHRhcmdldCwgZGVmaW5pdGlvbikge1xuXHRcdFx0XHRpZiAoIXRhcmdldCB8fCAhZGVmaW5pdGlvbikgeyByZXR1cm47IH1cblxuXHRcdFx0XHRmb3IgKHZhciBwcm9wIGluIGRlZmluaXRpb24pIHtcblx0XHRcdFx0XHRpZiAoIWRlZmluaXRpb24uaGFzT3duUHJvcGVydHkocHJvcCkpIHsgY29udGludWU7IH1cblx0XHRcdFx0XHR2YXIgcnVsZURlZmluaXRpb25zID0gZGVmaW5pdGlvbltwcm9wXTtcblxuXHRcdFx0XHRcdC8vY2hlY2sgdGhlIHRhcmdldCBwcm9wZXJ0eSBleGlzdHMgYW5kIGhhcyBhIHZhbHVlXG5cdFx0XHRcdFx0aWYgKCF0YXJnZXRbcHJvcF0pIHsgY29udGludWU7IH1cblx0XHRcdFx0XHR2YXIgdGFyZ2V0VmFsdWUgPSB0YXJnZXRbcHJvcF0sXG5cdFx0XHRcdFx0XHR1bndyYXBwZWRUYXJnZXRWYWx1ZSA9IHVud3JhcCh0YXJnZXRWYWx1ZSksXG5cdFx0XHRcdFx0XHRydWxlcyA9IHt9LFxuXHRcdFx0XHRcdFx0bm9uUnVsZXMgPSB7fTtcblxuXHRcdFx0XHRcdGZvciAodmFyIHJ1bGUgaW4gcnVsZURlZmluaXRpb25zKSB7XG5cdFx0XHRcdFx0XHRpZiAoIXJ1bGVEZWZpbml0aW9ucy5oYXNPd25Qcm9wZXJ0eShydWxlKSkgeyBjb250aW51ZTsgfVxuXHRcdFx0XHRcdFx0aWYgKGt2LnJ1bGVzW3J1bGVdKSB7XG5cdFx0XHRcdFx0XHRcdHJ1bGVzW3J1bGVdID0gcnVsZURlZmluaXRpb25zW3J1bGVdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0bm9uUnVsZXNbcnVsZV0gPSBydWxlRGVmaW5pdGlvbnNbcnVsZV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9hcHBseSBydWxlc1xuXHRcdFx0XHRcdGlmIChrby5pc09ic2VydmFibGUodGFyZ2V0VmFsdWUpKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRWYWx1ZS5leHRlbmQocnVsZXMpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vdGhlbiBhcHBseSBjaGlsZCBydWxlc1xuXHRcdFx0XHRcdC8vaWYgaXQncyBhbiBhcnJheSwgYXBwbHkgcnVsZXMgdG8gYWxsIGNoaWxkcmVuXG5cdFx0XHRcdFx0aWYgKHVud3JhcHBlZFRhcmdldFZhbHVlICYmIHV0aWxzLmlzQXJyYXkodW53cmFwcGVkVGFyZ2V0VmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHVud3JhcHBlZFRhcmdldFZhbHVlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdHNldFJ1bGVzKHVud3JhcHBlZFRhcmdldFZhbHVlW2ldLCBub25SdWxlcyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvL290aGVyd2lzZSwganVzdCBhcHBseSB0byB0aGlzIHByb3BlcnR5XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNldFJ1bGVzKHVud3JhcHBlZFRhcmdldFZhbHVlLCBub25SdWxlcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0c2V0UnVsZXModGFyZ2V0LCBkZWZpbml0aW9uKTtcblx0XHR9XG5cdH07XG5cbn0oKSk7XG5cbi8vIGV4cG9zZSBhcGkgcHVibGljbHlcbmV4dGVuZChrby52YWxpZGF0aW9uLCBhcGkpO1xuOy8vVmFsaWRhdGlvbiBSdWxlczpcbi8vIFlvdSBjYW4gdmlldyBhbmQgb3ZlcnJpZGUgbWVzc2FnZXMgb3IgcnVsZXMgdmlhOlxuLy8ga3YucnVsZXNbcnVsZU5hbWVdXG4vL1xuLy8gVG8gaW1wbGVtZW50IGEgY3VzdG9tIFJ1bGUsIHNpbXBseSB1c2UgdGhpcyB0ZW1wbGF0ZTpcbi8vIGt2LnJ1bGVzWyc8Y3VzdG9tIHJ1bGUgbmFtZT4nXSA9IHtcbi8vICAgICAgdmFsaWRhdG9yOiBmdW5jdGlvbiAodmFsLCBwYXJhbSkge1xuLy8gICAgICAgICAgPGN1c3RvbSBsb2dpYz5cbi8vICAgICAgICAgIHJldHVybiA8dHJ1ZSBvciBmYWxzZT47XG4vLyAgICAgIH0sXG4vLyAgICAgIG1lc3NhZ2U6ICc8Y3VzdG9tIHZhbGlkYXRpb24gbWVzc2FnZT4nIC8vb3B0aW9uYWxseSB5b3UgY2FuIGFsc28gdXNlIGEgJ3swfScgdG8gZGVub3RlIGEgcGxhY2Vob2xkZXIgdGhhdCB3aWxsIGJlIHJlcGxhY2VkIHdpdGggeW91ciAncGFyYW0nXG4vLyB9O1xuLy9cbi8vIEV4YW1wbGU6XG4vLyBrdi5ydWxlc1snbXVzdEVxdWFsJ10gPSB7XG4vLyAgICAgIHZhbGlkYXRvcjogZnVuY3Rpb24oIHZhbCwgbXVzdEVxdWFsVmFsICl7XG4vLyAgICAgICAgICByZXR1cm4gdmFsID09PSBtdXN0RXF1YWxWYWw7XG4vLyAgICAgIH0sXG4vLyAgICAgIG1lc3NhZ2U6ICdUaGlzIGZpZWxkIG11c3QgZXF1YWwgezB9J1xuLy8gfTtcbi8vXG5rdi5ydWxlcyA9IHt9O1xua3YucnVsZXNbJ3JlcXVpcmVkJ10gPSB7XG5cdHZhbGlkYXRvcjogZnVuY3Rpb24gKHZhbCwgcmVxdWlyZWQpIHtcblx0XHR2YXIgdGVzdFZhbDtcblxuXHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCB8fCB2YWwgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiAhcmVxdWlyZWQ7XG5cdFx0fVxuXG5cdFx0dGVzdFZhbCA9IHZhbDtcblx0XHRpZiAodHlwZW9mICh2YWwpID09PSAnc3RyaW5nJykge1xuXHRcdFx0aWYgKFN0cmluZy5wcm90b3R5cGUudHJpbSkge1xuXHRcdFx0XHR0ZXN0VmFsID0gdmFsLnRyaW0oKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0ZXN0VmFsID0gdmFsLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIXJlcXVpcmVkKSB7Ly8gaWYgdGhleSBwYXNzZWQ6IHsgcmVxdWlyZWQ6IGZhbHNlIH0sIHRoZW4gZG9uJ3QgcmVxdWlyZSB0aGlzXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKCh0ZXN0VmFsICsgJycpLmxlbmd0aCA+IDApO1xuXHR9LFxuXHRtZXNzYWdlOiAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZC4nXG59O1xuXG5mdW5jdGlvbiBtaW5NYXhWYWxpZGF0b3JGYWN0b3J5KHZhbGlkYXRvck5hbWUpIHtcbiAgICB2YXIgaXNNYXhWYWxpZGF0aW9uID0gdmFsaWRhdG9yTmFtZSA9PT0gXCJtYXhcIjtcblxuICAgIHJldHVybiBmdW5jdGlvbiAodmFsLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChrdi51dGlscy5pc0VtcHR5VmFsKHZhbCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbXBhcmlzb25WYWx1ZSwgdHlwZTtcbiAgICAgICAgaWYgKG9wdGlvbnMudHlwZUF0dHIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gVGhpcyB2YWxpZGF0b3IgaXMgYmVpbmcgY2FsbGVkIGZyb20gamF2YXNjcmlwdCByYXRoZXIgdGhhblxuICAgICAgICAgICAgLy8gYmVpbmcgYm91bmQgZnJvbSBtYXJrdXBcbiAgICAgICAgICAgIHR5cGUgPSBcInRleHRcIjtcbiAgICAgICAgICAgIGNvbXBhcmlzb25WYWx1ZSA9IG9wdGlvbnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0eXBlID0gb3B0aW9ucy50eXBlQXR0cjtcbiAgICAgICAgICAgIGNvbXBhcmlzb25WYWx1ZSA9IG9wdGlvbnMudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGcm9tIGh0dHA6Ly93d3cudzMub3JnL1RSLzIwMTIvV0QtaHRtbDUtMjAxMjEwMjUvY29tbW9uLWlucHV0LWVsZW1lbnQtYXR0cmlidXRlcy5odG1sI2F0dHItaW5wdXQtbWluLFxuICAgICAgICAvLyBpZiB0aGUgdmFsdWUgaXMgcGFyc2VhYmxlIHRvIGEgbnVtYmVyLCB0aGVuIHRoZSBtaW5pbXVtIHNob3VsZCBiZSBudW1lcmljXG4gICAgICAgIGlmICghaXNOYU4oY29tcGFyaXNvblZhbHVlKSAmJiAhKGNvbXBhcmlzb25WYWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgICAgICB0eXBlID0gXCJudW1iZXJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZWdleCwgdmFsTWF0Y2hlcywgY29tcGFyaXNvblZhbHVlTWF0Y2hlcztcbiAgICAgICAgc3dpdGNoICh0eXBlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ3ZWVrXCI6XG4gICAgICAgICAgICAgICAgcmVnZXggPSAvXihcXGR7NH0pLVcoXFxkezJ9KSQvO1xuICAgICAgICAgICAgICAgIHZhbE1hdGNoZXMgPSB2YWwubWF0Y2gocmVnZXgpO1xuICAgICAgICAgICAgICAgIGlmICh2YWxNYXRjaGVzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdmFsdWUgZm9yIFwiICsgdmFsaWRhdG9yTmFtZSArIFwiIGF0dHJpYnV0ZSBmb3Igd2VlayBpbnB1dC4gIFNob3VsZCBsb29rIGxpa2UgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCInMjAwMC1XMzMnIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWwtbWFya3VwL2lucHV0LndlZWsuaHRtbCNpbnB1dC53ZWVrLmF0dHJzLm1pblwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29tcGFyaXNvblZhbHVlTWF0Y2hlcyA9IGNvbXBhcmlzb25WYWx1ZS5tYXRjaChyZWdleCk7XG4gICAgICAgICAgICAgICAgLy8gSWYgbm8gcmVnZXggbWF0Y2hlcyB3ZXJlIGZvdW5kLCB2YWxpZGF0aW9uIGZhaWxzXG4gICAgICAgICAgICAgICAgaWYgKCFjb21wYXJpc29uVmFsdWVNYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNNYXhWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAodmFsTWF0Y2hlc1sxXSA8IGNvbXBhcmlzb25WYWx1ZU1hdGNoZXNbMV0pIHx8IC8vIG9sZGVyIHllYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNhbWUgeWVhciwgb2xkZXIgd2Vla1xuICAgICAgICAgICAgICAgICAgICAgICAgKCh2YWxNYXRjaGVzWzFdID09PSBjb21wYXJpc29uVmFsdWVNYXRjaGVzWzFdKSAmJiAodmFsTWF0Y2hlc1syXSA8PSBjb21wYXJpc29uVmFsdWVNYXRjaGVzWzJdKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh2YWxNYXRjaGVzWzFdID4gY29tcGFyaXNvblZhbHVlTWF0Y2hlc1sxXSkgfHwgLy8gbmV3ZXIgeWVhclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2FtZSB5ZWFyLCBuZXdlciB3ZWVrXG4gICAgICAgICAgICAgICAgICAgICAgICAoKHZhbE1hdGNoZXNbMV0gPT09IGNvbXBhcmlzb25WYWx1ZU1hdGNoZXNbMV0pICYmICh2YWxNYXRjaGVzWzJdID49IGNvbXBhcmlzb25WYWx1ZU1hdGNoZXNbMl0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJtb250aFwiOlxuICAgICAgICAgICAgICAgIHJlZ2V4ID0gL14oXFxkezR9KS0oXFxkezJ9KSQvO1xuICAgICAgICAgICAgICAgIHZhbE1hdGNoZXMgPSB2YWwubWF0Y2gocmVnZXgpO1xuICAgICAgICAgICAgICAgIGlmICh2YWxNYXRjaGVzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdmFsdWUgZm9yIFwiICsgdmFsaWRhdG9yTmFtZSArIFwiIGF0dHJpYnV0ZSBmb3IgbW9udGggaW5wdXQuICBTaG91bGQgbG9vayBsaWtlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiJzIwMDAtMDMnIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWwtbWFya3VwL2lucHV0Lm1vbnRoLmh0bWwjaW5wdXQubW9udGguYXR0cnMubWluXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb21wYXJpc29uVmFsdWVNYXRjaGVzID0gY29tcGFyaXNvblZhbHVlLm1hdGNoKHJlZ2V4KTtcbiAgICAgICAgICAgICAgICAvLyBJZiBubyByZWdleCBtYXRjaGVzIHdlcmUgZm91bmQsIHZhbGlkYXRpb24gZmFpbHNcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBhcmlzb25WYWx1ZU1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpc01heFZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgodmFsTWF0Y2hlc1sxXSA8IGNvbXBhcmlzb25WYWx1ZU1hdGNoZXNbMV0pIHx8IC8vIG9sZGVyIHllYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNhbWUgeWVhciwgb2xkZXIgbW9udGhcbiAgICAgICAgICAgICAgICAgICAgICAgICgodmFsTWF0Y2hlc1sxXSA9PT0gY29tcGFyaXNvblZhbHVlTWF0Y2hlc1sxXSkgJiYgKHZhbE1hdGNoZXNbMl0gPD0gY29tcGFyaXNvblZhbHVlTWF0Y2hlc1syXSkpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHZhbE1hdGNoZXNbMV0gPiBjb21wYXJpc29uVmFsdWVNYXRjaGVzWzFdKSB8fCAvLyBuZXdlciB5ZWFyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzYW1lIHllYXIsIG5ld2VyIG1vbnRoXG4gICAgICAgICAgICAgICAgICAgICAgICAoKHZhbE1hdGNoZXNbMV0gPT09IGNvbXBhcmlzb25WYWx1ZU1hdGNoZXNbMV0pICYmICh2YWxNYXRjaGVzWzJdID49IGNvbXBhcmlzb25WYWx1ZU1hdGNoZXNbMl0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIGNhc2UgXCJyYW5nZVwiOlxuICAgICAgICAgICAgICAgIGlmIChpc01heFZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICghaXNOYU4odmFsKSAmJiBwYXJzZUZsb2F0KHZhbCkgPD0gcGFyc2VGbG9hdChjb21wYXJpc29uVmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCFpc05hTih2YWwpICYmIHBhcnNlRmxvYXQodmFsKSA+PSBwYXJzZUZsb2F0KGNvbXBhcmlzb25WYWx1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBpZiAoaXNNYXhWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWwgPD0gY29tcGFyaXNvblZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWwgPj0gY29tcGFyaXNvblZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5cbmt2LnJ1bGVzWydtaW4nXSA9IHtcblx0dmFsaWRhdG9yOiBtaW5NYXhWYWxpZGF0b3JGYWN0b3J5KFwibWluXCIpLFxuXHRtZXNzYWdlOiAnUGxlYXNlIGVudGVyIGEgdmFsdWUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHswfS4nXG59O1xuXG5rdi5ydWxlc1snbWF4J10gPSB7XG5cdHZhbGlkYXRvcjogbWluTWF4VmFsaWRhdG9yRmFjdG9yeShcIm1heFwiKSxcblx0bWVzc2FnZTogJ1BsZWFzZSBlbnRlciBhIHZhbHVlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB7MH0uJ1xufTtcblxua3YucnVsZXNbJ21pbkxlbmd0aCddID0ge1xuXHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWwsIG1pbkxlbmd0aCkge1xuXHRcdGlmKGt2LnV0aWxzLmlzRW1wdHlWYWwodmFsKSkgeyByZXR1cm4gdHJ1ZTsgfVxuXHRcdHZhciBub3JtYWxpemVkVmFsID0ga3YudXRpbHMuaXNOdW1iZXIodmFsKSA/ICgnJyArIHZhbCkgOiB2YWw7XG5cdFx0cmV0dXJuIG5vcm1hbGl6ZWRWYWwubGVuZ3RoID49IG1pbkxlbmd0aDtcblx0fSxcblx0bWVzc2FnZTogJ1BsZWFzZSBlbnRlciBhdCBsZWFzdCB7MH0gY2hhcmFjdGVycy4nXG59O1xuXG5rdi5ydWxlc1snbWF4TGVuZ3RoJ10gPSB7XG5cdHZhbGlkYXRvcjogZnVuY3Rpb24gKHZhbCwgbWF4TGVuZ3RoKSB7XG5cdFx0aWYoa3YudXRpbHMuaXNFbXB0eVZhbCh2YWwpKSB7IHJldHVybiB0cnVlOyB9XG5cdFx0dmFyIG5vcm1hbGl6ZWRWYWwgPSBrdi51dGlscy5pc051bWJlcih2YWwpID8gKCcnICsgdmFsKSA6IHZhbDtcblx0XHRyZXR1cm4gbm9ybWFsaXplZFZhbC5sZW5ndGggPD0gbWF4TGVuZ3RoO1xuXHR9LFxuXHRtZXNzYWdlOiAnUGxlYXNlIGVudGVyIG5vIG1vcmUgdGhhbiB7MH0gY2hhcmFjdGVycy4nXG59O1xuXG5rdi5ydWxlc1sncGF0dGVybiddID0ge1xuXHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWwsIHJlZ2V4KSB7XG5cdFx0cmV0dXJuIGt2LnV0aWxzLmlzRW1wdHlWYWwodmFsKSB8fCB2YWwudG9TdHJpbmcoKS5tYXRjaChyZWdleCkgIT09IG51bGw7XG5cdH0sXG5cdG1lc3NhZ2U6ICdQbGVhc2UgY2hlY2sgdGhpcyB2YWx1ZS4nXG59O1xuXG5rdi5ydWxlc1snc3RlcCddID0ge1xuXHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWwsIHN0ZXApIHtcblxuXHRcdC8vIGluIG9yZGVyIHRvIGhhbmRsZSBzdGVwcyBvZiAuMSAmIC4wMSBldGMuLiBNb2R1bHVzIHdvbid0IHdvcmtcblx0XHQvLyBpZiB0aGUgdmFsdWUgaXMgYSBkZWNpbWFsLCBzbyB3ZSBoYXZlIHRvIGNvcnJlY3QgZm9yIHRoYXRcblx0XHRpZiAoa3YudXRpbHMuaXNFbXB0eVZhbCh2YWwpIHx8IHN0ZXAgPT09ICdhbnknKSB7IHJldHVybiB0cnVlOyB9XG5cdFx0dmFyIGRpZiA9ICh2YWwgKiAxMDApICUgKHN0ZXAgKiAxMDApO1xuXHRcdHJldHVybiBNYXRoLmFicyhkaWYpIDwgMC4wMDAwMSB8fCBNYXRoLmFicygxIC0gZGlmKSA8IDAuMDAwMDE7XG5cdH0sXG5cdG1lc3NhZ2U6ICdUaGUgdmFsdWUgbXVzdCBpbmNyZW1lbnQgYnkgezB9Lidcbn07XG5cbmt2LnJ1bGVzWydlbWFpbCddID0ge1xuXHR2YWxpZGF0b3I6IGZ1bmN0aW9uICh2YWwsIHZhbGlkYXRlKSB7XG5cdFx0aWYgKCF2YWxpZGF0ZSkgeyByZXR1cm4gdHJ1ZTsgfVxuXG5cdFx0Ly9JIHRoaW5rIGFuIGVtcHR5IGVtYWlsIGFkZHJlc3MgaXMgYWxzbyBhIHZhbGlkIGVudHJ5XG5cdFx0Ly9pZiBvbmUgd2FudCdzIHRvIGVuZm9yY2UgZW50cnkgaXQgc2hvdWxkIGJlIGRvbmUgd2l0aCAncmVxdWlyZWQ6IHRydWUnXG5cdFx0cmV0dXJuIGt2LnV0aWxzLmlzRW1wdHlWYWwodmFsKSB8fCAoXG5cdFx0XHQvLyBqcXVlcnkgdmFsaWRhdGUgcmVnZXggLSB0aGFua3MgU2NvdHQgR29uemFsZXpcblx0XHRcdHZhbGlkYXRlICYmIC9eKCgoW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKyhcXC4oW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKykqKXwoKFxceDIyKSgoKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KChbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHg3Zl18XFx4MjF8W1xceDIzLVxceDViXXxbXFx4NWQtXFx4N2VdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoXFxcXChbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpKSooKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KFxceDIyKSkpQCgoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pKygoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKSQvaS50ZXN0KHZhbClcblx0XHQpO1xuXHR9LFxuXHRtZXNzYWdlOiAnUGxlYXNlIGVudGVyIGEgcHJvcGVyIGVtYWlsIGFkZHJlc3MuJ1xufTtcblxua3YucnVsZXNbJ2RhdGUnXSA9IHtcblx0dmFsaWRhdG9yOiBmdW5jdGlvbiAodmFsdWUsIHZhbGlkYXRlKSB7XG5cdFx0aWYgKCF2YWxpZGF0ZSkgeyByZXR1cm4gdHJ1ZTsgfVxuXHRcdHJldHVybiBrdi51dGlscy5pc0VtcHR5VmFsKHZhbHVlKSB8fCAodmFsaWRhdGUgJiYgIS9JbnZhbGlkfE5hTi8udGVzdChuZXcgRGF0ZSh2YWx1ZSkpKTtcblx0fSxcblx0bWVzc2FnZTogJ1BsZWFzZSBlbnRlciBhIHByb3BlciBkYXRlLidcbn07XG5cbmt2LnJ1bGVzWydkYXRlSVNPJ10gPSB7XG5cdHZhbGlkYXRvcjogZnVuY3Rpb24gKHZhbHVlLCB2YWxpZGF0ZSkge1xuXHRcdGlmICghdmFsaWRhdGUpIHsgcmV0dXJuIHRydWU7IH1cblx0XHRyZXR1cm4ga3YudXRpbHMuaXNFbXB0eVZhbCh2YWx1ZSkgfHwgKHZhbGlkYXRlICYmIC9eXFxkezR9Wy0vXSg/OjA/WzEtOV18MVswMTJdKVstL10oPzowP1sxLTldfFsxMl1bMC05XXwzWzAxXSkkLy50ZXN0KHZhbHVlKSk7XG5cdH0sXG5cdG1lc3NhZ2U6ICdQbGVhc2UgZW50ZXIgYSBwcm9wZXIgZGF0ZS4nXG59O1xuXG5rdi5ydWxlc1snbnVtYmVyJ10gPSB7XG5cdHZhbGlkYXRvcjogZnVuY3Rpb24gKHZhbHVlLCB2YWxpZGF0ZSkge1xuXHRcdGlmICghdmFsaWRhdGUpIHsgcmV0dXJuIHRydWU7IH1cblx0XHRyZXR1cm4ga3YudXRpbHMuaXNFbXB0eVZhbCh2YWx1ZSkgfHwgKHZhbGlkYXRlICYmIC9eLT8oPzpcXGQrfFxcZHsxLDN9KD86LFxcZHszfSkrKT8oPzpcXC5cXGQrKT8kLy50ZXN0KHZhbHVlKSk7XG5cdH0sXG5cdG1lc3NhZ2U6ICdQbGVhc2UgZW50ZXIgYSBudW1iZXIuJ1xufTtcblxua3YucnVsZXNbJ2RpZ2l0J10gPSB7XG5cdHZhbGlkYXRvcjogZnVuY3Rpb24gKHZhbHVlLCB2YWxpZGF0ZSkge1xuXHRcdGlmICghdmFsaWRhdGUpIHsgcmV0dXJuIHRydWU7IH1cblx0XHRyZXR1cm4ga3YudXRpbHMuaXNFbXB0eVZhbCh2YWx1ZSkgfHwgKHZhbGlkYXRlICYmIC9eXFxkKyQvLnRlc3QodmFsdWUpKTtcblx0fSxcblx0bWVzc2FnZTogJ1BsZWFzZSBlbnRlciBhIGRpZ2l0Lidcbn07XG5cbmt2LnJ1bGVzWydwaG9uZVVTJ10gPSB7XG5cdHZhbGlkYXRvcjogZnVuY3Rpb24gKHBob25lTnVtYmVyLCB2YWxpZGF0ZSkge1xuXHRcdGlmICghdmFsaWRhdGUpIHsgcmV0dXJuIHRydWU7IH1cblx0XHRpZiAoa3YudXRpbHMuaXNFbXB0eVZhbChwaG9uZU51bWJlcikpIHsgcmV0dXJuIHRydWU7IH0gLy8gbWFrZXMgaXQgb3B0aW9uYWwsIHVzZSAncmVxdWlyZWQnIHJ1bGUgaWYgaXQgc2hvdWxkIGJlIHJlcXVpcmVkXG5cdFx0aWYgKHR5cGVvZiAocGhvbmVOdW1iZXIpICE9PSAnc3RyaW5nJykgeyByZXR1cm4gZmFsc2U7IH1cblx0XHRwaG9uZU51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2UoL1xccysvZywgXCJcIik7XG5cdFx0cmV0dXJuIHZhbGlkYXRlICYmIHBob25lTnVtYmVyLmxlbmd0aCA+IDkgJiYgcGhvbmVOdW1iZXIubWF0Y2goL14oMS0/KT8oXFwoWzItOV1cXGR7Mn1cXCl8WzItOV1cXGR7Mn0pLT9bMi05XVxcZHsyfS0/XFxkezR9JC8pO1xuXHR9LFxuXHRtZXNzYWdlOiAnUGxlYXNlIHNwZWNpZnkgYSB2YWxpZCBwaG9uZSBudW1iZXIuJ1xufTtcblxua3YucnVsZXNbJ2VxdWFsJ10gPSB7XG5cdHZhbGlkYXRvcjogZnVuY3Rpb24gKHZhbCwgcGFyYW1zKSB7XG5cdFx0dmFyIG90aGVyVmFsdWUgPSBwYXJhbXM7XG5cdFx0cmV0dXJuIHZhbCA9PT0ga3YudXRpbHMuZ2V0VmFsdWUob3RoZXJWYWx1ZSk7XG5cdH0sXG5cdG1lc3NhZ2U6ICdWYWx1ZXMgbXVzdCBlcXVhbC4nXG59O1xuXG5rdi5ydWxlc1snbm90RXF1YWwnXSA9IHtcblx0dmFsaWRhdG9yOiBmdW5jdGlvbiAodmFsLCBwYXJhbXMpIHtcblx0XHR2YXIgb3RoZXJWYWx1ZSA9IHBhcmFtcztcblx0XHRyZXR1cm4gdmFsICE9PSBrdi51dGlscy5nZXRWYWx1ZShvdGhlclZhbHVlKTtcblx0fSxcblx0bWVzc2FnZTogJ1BsZWFzZSBjaG9vc2UgYW5vdGhlciB2YWx1ZS4nXG59O1xuXG4vL3VuaXF1ZSBpbiBjb2xsZWN0aW9uXG4vLyBvcHRpb25zIGFyZTpcbi8vICAgIGNvbGxlY3Rpb246IGFycmF5IG9yIGZ1bmN0aW9uIHJldHVybmluZyAob2JzZXJ2YWJsZSkgYXJyYXlcbi8vICAgICAgICAgICAgICBpbiB3aGljaCB0aGUgdmFsdWUgaGFzIHRvIGJlIHVuaXF1ZVxuLy8gICAgdmFsdWVBY2Nlc3NvcjogZnVuY3Rpb24gdGhhdCByZXR1cm5zIHZhbHVlIGZyb20gYW4gb2JqZWN0IHN0b3JlZCBpbiBjb2xsZWN0aW9uXG4vLyAgICAgICAgICAgICAgaWYgaXQgaXMgbnVsbCB0aGUgdmFsdWUgaXMgY29tcGFyZWQgZGlyZWN0bHlcbi8vICAgIGV4dGVybmFsOiBzZXQgdG8gdHJ1ZSB3aGVuIG9iamVjdCB5b3UgYXJlIHZhbGlkYXRpbmcgaXMgYXV0b21hdGljYWxseSB1cGRhdGluZyBjb2xsZWN0aW9uXG5rdi5ydWxlc1sndW5pcXVlJ10gPSB7XG5cdHZhbGlkYXRvcjogZnVuY3Rpb24gKHZhbCwgb3B0aW9ucykge1xuXHRcdHZhciBjID0ga3YudXRpbHMuZ2V0VmFsdWUob3B0aW9ucy5jb2xsZWN0aW9uKSxcblx0XHRcdGV4dGVybmFsID0ga3YudXRpbHMuZ2V0VmFsdWUob3B0aW9ucy5leHRlcm5hbFZhbHVlKSxcblx0XHRcdGNvdW50ZXIgPSAwO1xuXG5cdFx0aWYgKCF2YWwgfHwgIWMpIHsgcmV0dXJuIHRydWU7IH1cblxuXHRcdGtvVXRpbHMuYXJyYXlGaWx0ZXIoYywgZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdGlmICh2YWwgPT09IChvcHRpb25zLnZhbHVlQWNjZXNzb3IgPyBvcHRpb25zLnZhbHVlQWNjZXNzb3IoaXRlbSkgOiBpdGVtKSkgeyBjb3VudGVyKys7IH1cblx0XHR9KTtcblx0XHQvLyBpZiB2YWx1ZSBpcyBleHRlcm5hbCBldmVuIDEgc2FtZSB2YWx1ZSBpbiBjb2xsZWN0aW9uIG1lYW5zIHRoZSB2YWx1ZSBpcyBub3QgdW5pcXVlXG5cdFx0cmV0dXJuIGNvdW50ZXIgPCAoISFleHRlcm5hbCA/IDEgOiAyKTtcblx0fSxcblx0bWVzc2FnZTogJ1BsZWFzZSBtYWtlIHN1cmUgdGhlIHZhbHVlIGlzIHVuaXF1ZS4nXG59O1xuXG5cbi8vbm93IHJlZ2lzdGVyIGFsbCBvZiB0aGVzZSFcbihmdW5jdGlvbiAoKSB7XG5cdGt2LnJlZ2lzdGVyRXh0ZW5kZXJzKCk7XG59KCkpO1xuOy8vIFRoZSBjb3JlIGJpbmRpbmcgaGFuZGxlclxuLy8gdGhpcyBhbGxvd3MgdXMgdG8gc2V0dXAgYW55IHZhbHVlIGJpbmRpbmcgdGhhdCBpbnRlcm5hbGx5IGFsd2F5c1xuLy8gcGVyZm9ybXMgdGhlIHNhbWUgZnVuY3Rpb25hbGl0eVxua28uYmluZGluZ0hhbmRsZXJzWyd2YWxpZGF0aW9uQ29yZSddID0gKGZ1bmN0aW9uICgpIHtcblxuXHRyZXR1cm4ge1xuXHRcdGluaXQ6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5nc0FjY2Vzc29yLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHR2YXIgY29uZmlnID0ga3YudXRpbHMuZ2V0Q29uZmlnT3B0aW9ucyhlbGVtZW50KTtcblx0XHRcdHZhciBvYnNlcnZhYmxlID0gdmFsdWVBY2Nlc3NvcigpO1xuXG5cdFx0XHQvLyBwYXJzZSBodG1sNSBpbnB1dCB2YWxpZGF0aW9uIGF0dHJpYnV0ZXMsIG9wdGlvbmFsIGZlYXR1cmVcblx0XHRcdGlmIChjb25maWcucGFyc2VJbnB1dEF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0a3YudXRpbHMuYXN5bmMoZnVuY3Rpb24gKCkgeyBrdi5wYXJzZUlucHV0VmFsaWRhdGlvbkF0dHJpYnV0ZXMoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcik7IH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpZiByZXF1ZXN0ZWQgaW5zZXJ0IG1lc3NhZ2UgZWxlbWVudCBhbmQgYXBwbHkgYmluZGluZ3Ncblx0XHRcdGlmIChjb25maWcuaW5zZXJ0TWVzc2FnZXMgJiYga3YudXRpbHMuaXNWYWxpZGF0YWJsZShvYnNlcnZhYmxlKSkge1xuXG5cdFx0XHRcdC8vIGluc2VydCB0aGUgPHNwYW4+PC9zcGFuPlxuXHRcdFx0XHR2YXIgdmFsaWRhdGlvbk1lc3NhZ2VFbGVtZW50ID0ga3YuaW5zZXJ0VmFsaWRhdGlvbk1lc3NhZ2UoZWxlbWVudCk7XG5cblx0XHRcdFx0Ly8gaWYgd2UncmUgdG9sZCB0byB1c2UgYSB0ZW1wbGF0ZSwgbWFrZSBzdXJlIHRoYXQgZ2V0cyByZW5kZXJlZFxuXHRcdFx0XHRpZiAoY29uZmlnLm1lc3NhZ2VUZW1wbGF0ZSkge1xuXHRcdFx0XHRcdGtvLnJlbmRlclRlbXBsYXRlKGNvbmZpZy5tZXNzYWdlVGVtcGxhdGUsIHsgZmllbGQ6IG9ic2VydmFibGUgfSwgbnVsbCwgdmFsaWRhdGlvbk1lc3NhZ2VFbGVtZW50LCAncmVwbGFjZU5vZGUnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRrby5hcHBseUJpbmRpbmdzVG9Ob2RlKHZhbGlkYXRpb25NZXNzYWdlRWxlbWVudCwgeyB2YWxpZGF0aW9uTWVzc2FnZTogb2JzZXJ2YWJsZSB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyB3cml0ZSB0aGUgaHRtbDUgYXR0cmlidXRlcyBpZiBpbmRpY2F0ZWQgYnkgdGhlIGNvbmZpZ1xuXHRcdFx0aWYgKGNvbmZpZy53cml0ZUlucHV0QXR0cmlidXRlcyAmJiBrdi51dGlscy5pc1ZhbGlkYXRhYmxlKG9ic2VydmFibGUpKSB7XG5cblx0XHRcdFx0a3Yud3JpdGVJbnB1dFZhbGlkYXRpb25BdHRyaWJ1dGVzKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpZiByZXF1ZXN0ZWQsIGFkZCBiaW5kaW5nIHRvIGRlY29yYXRlIGVsZW1lbnRcblx0XHRcdGlmIChjb25maWcuZGVjb3JhdGVJbnB1dEVsZW1lbnQgJiYga3YudXRpbHMuaXNWYWxpZGF0YWJsZShvYnNlcnZhYmxlKSkge1xuXHRcdFx0XHRrby5hcHBseUJpbmRpbmdzVG9Ob2RlKGVsZW1lbnQsIHsgdmFsaWRhdGlvbkVsZW1lbnQ6IG9ic2VydmFibGUgfSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG59KCkpO1xuXG4vLyBvdmVycmlkZSBmb3IgS08ncyBkZWZhdWx0ICd2YWx1ZScsICdjaGVja2VkJywgJ3RleHRJbnB1dCcgYW5kIHNlbGVjdGVkT3B0aW9ucyBiaW5kaW5nc1xua3YubWFrZUJpbmRpbmdIYW5kbGVyVmFsaWRhdGFibGUoXCJ2YWx1ZVwiKTtcbmt2Lm1ha2VCaW5kaW5nSGFuZGxlclZhbGlkYXRhYmxlKFwiY2hlY2tlZFwiKTtcbmlmIChrby5iaW5kaW5nSGFuZGxlcnMudGV4dElucHV0KSB7XG5cdGt2Lm1ha2VCaW5kaW5nSGFuZGxlclZhbGlkYXRhYmxlKFwidGV4dElucHV0XCIpO1xufVxua3YubWFrZUJpbmRpbmdIYW5kbGVyVmFsaWRhdGFibGUoXCJzZWxlY3RlZE9wdGlvbnNcIik7XG5cblxua28uYmluZGluZ0hhbmRsZXJzWyd2YWxpZGF0aW9uTWVzc2FnZSddID0geyAvLyBpbmRpdmlkdWFsIGVycm9yIG1lc3NhZ2UsIGlmIG1vZGlmaWVkIG9yIHBvc3QgYmluZGluZ1xuXHR1cGRhdGU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG5cdFx0dmFyIG9ic3YgPSB2YWx1ZUFjY2Vzc29yKCksXG5cdFx0XHRjb25maWcgPSBrdi51dGlscy5nZXRDb25maWdPcHRpb25zKGVsZW1lbnQpLFxuXHRcdFx0dmFsID0gdW53cmFwKG9ic3YpLFxuXHRcdFx0bXNnID0gbnVsbCxcblx0XHRcdGlzTW9kaWZpZWQgPSBmYWxzZSxcblx0XHRcdGlzVmFsaWQgPSBmYWxzZTtcblxuXHRcdGlmIChvYnN2ID09PSBudWxsIHx8IHR5cGVvZiBvYnN2ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgYmluZCB2YWxpZGF0aW9uTWVzc2FnZSB0byB1bmRlZmluZWQgdmFsdWUuIGRhdGEtYmluZCBleHByZXNzaW9uOiAnICtcblx0XHRcdFx0ZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmluZCcpKTtcblx0XHR9XG5cblx0XHRpc01vZGlmaWVkID0gb2Jzdi5pc01vZGlmaWVkICYmIG9ic3YuaXNNb2RpZmllZCgpO1xuXHRcdGlzVmFsaWQgPSBvYnN2LmlzVmFsaWQgJiYgb2Jzdi5pc1ZhbGlkKCk7XG5cblx0XHR2YXIgZXJyb3IgPSBudWxsO1xuXHRcdGlmICghY29uZmlnLm1lc3NhZ2VzT25Nb2RpZmllZCB8fCBpc01vZGlmaWVkKSB7XG5cdFx0XHRlcnJvciA9IGlzVmFsaWQgPyBudWxsIDogb2Jzdi5lcnJvcjtcblx0XHR9XG5cblx0XHR2YXIgaXNWaXNpYmxlID0gIWNvbmZpZy5tZXNzYWdlc09uTW9kaWZpZWQgfHwgaXNNb2RpZmllZCA/ICFpc1ZhbGlkIDogZmFsc2U7XG5cdFx0dmFyIGlzQ3VycmVudGx5VmlzaWJsZSA9IGVsZW1lbnQuc3R5bGUuZGlzcGxheSAhPT0gXCJub25lXCI7XG5cblx0XHRpZiAoY29uZmlnLmFsbG93SHRtbE1lc3NhZ2VzKSB7XG5cdFx0XHRrb1V0aWxzLnNldEh0bWwoZWxlbWVudCwgZXJyb3IpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRrby5iaW5kaW5nSGFuZGxlcnMudGV4dC51cGRhdGUoZWxlbWVudCwgZnVuY3Rpb24gKCkgeyByZXR1cm4gZXJyb3I7IH0pO1xuXHRcdH1cblxuXHRcdGlmIChpc0N1cnJlbnRseVZpc2libGUgJiYgIWlzVmlzaWJsZSkge1xuXHRcdFx0ZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdH0gZWxzZSBpZiAoIWlzQ3VycmVudGx5VmlzaWJsZSAmJiBpc1Zpc2libGUpIHtcblx0XHRcdGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xuXHRcdH1cblx0fVxufTtcblxua28uYmluZGluZ0hhbmRsZXJzWyd2YWxpZGF0aW9uRWxlbWVudCddID0ge1xuXHR1cGRhdGU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5nc0FjY2Vzc29yKSB7XG5cdFx0dmFyIG9ic3YgPSB2YWx1ZUFjY2Vzc29yKCksXG5cdFx0XHRjb25maWcgPSBrdi51dGlscy5nZXRDb25maWdPcHRpb25zKGVsZW1lbnQpLFxuXHRcdFx0dmFsID0gdW53cmFwKG9ic3YpLFxuXHRcdFx0bXNnID0gbnVsbCxcblx0XHRcdGlzTW9kaWZpZWQgPSBmYWxzZSxcblx0XHRcdGlzVmFsaWQgPSBmYWxzZTtcblxuXHRcdGlmIChvYnN2ID09PSBudWxsIHx8IHR5cGVvZiBvYnN2ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgYmluZCB2YWxpZGF0aW9uRWxlbWVudCB0byB1bmRlZmluZWQgdmFsdWUuIGRhdGEtYmluZCBleHByZXNzaW9uOiAnICtcblx0XHRcdFx0ZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmluZCcpKTtcblx0XHR9XG5cblx0XHRpc01vZGlmaWVkID0gb2Jzdi5pc01vZGlmaWVkICYmIG9ic3YuaXNNb2RpZmllZCgpO1xuXHRcdGlzVmFsaWQgPSBvYnN2LmlzVmFsaWQgJiYgb2Jzdi5pc1ZhbGlkKCk7XG5cblx0XHQvLyBjcmVhdGUgYW4gZXZhbHVhdG9yIGZ1bmN0aW9uIHRoYXQgd2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2U6XG5cdFx0Ly8gY3NzOiB7IHZhbGlkYXRpb25FbGVtZW50OiB0cnVlIH1cblx0XHR2YXIgY3NzU2V0dGluZ3NBY2Nlc3NvciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBjc3MgPSB7fTtcblxuXHRcdFx0dmFyIHNob3VsZFNob3cgPSAoKCFjb25maWcuZGVjb3JhdGVFbGVtZW50T25Nb2RpZmllZCB8fCBpc01vZGlmaWVkKSA/ICFpc1ZhbGlkIDogZmFsc2UpO1xuXG5cdFx0XHQvLyBjc3M6IHsgdmFsaWRhdGlvbkVsZW1lbnQ6IGZhbHNlIH1cblx0XHRcdGNzc1tjb25maWcuZXJyb3JFbGVtZW50Q2xhc3NdID0gc2hvdWxkU2hvdztcblxuXHRcdFx0cmV0dXJuIGNzcztcblx0XHR9O1xuXG5cdFx0Ly9hZGQgb3IgcmVtb3ZlIGNsYXNzIG9uIHRoZSBlbGVtZW50O1xuXHRcdGtvLmJpbmRpbmdIYW5kbGVycy5jc3MudXBkYXRlKGVsZW1lbnQsIGNzc1NldHRpbmdzQWNjZXNzb3IsIGFsbEJpbmRpbmdzQWNjZXNzb3IpO1xuXHRcdGlmICghY29uZmlnLmVycm9yc0FzVGl0bGUpIHsgcmV0dXJuOyB9XG5cblx0XHRrby5iaW5kaW5nSGFuZGxlcnMuYXR0ci51cGRhdGUoZWxlbWVudCwgZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyXG5cdFx0XHRcdGhhc01vZGlmaWNhdGlvbiA9ICFjb25maWcuZXJyb3JzQXNUaXRsZU9uTW9kaWZpZWQgfHwgaXNNb2RpZmllZCxcblx0XHRcdFx0dGl0bGUgPSBrdi51dGlscy5nZXRPcmlnaW5hbEVsZW1lbnRUaXRsZShlbGVtZW50KTtcblxuXHRcdFx0aWYgKGhhc01vZGlmaWNhdGlvbiAmJiAhaXNWYWxpZCkge1xuXHRcdFx0XHRyZXR1cm4geyB0aXRsZTogb2Jzdi5lcnJvciwgJ2RhdGEtb3JpZy10aXRsZSc6IHRpdGxlIH07XG5cdFx0XHR9IGVsc2UgaWYgKCFoYXNNb2RpZmljYXRpb24gfHwgaXNWYWxpZCkge1xuXHRcdFx0XHRyZXR1cm4geyB0aXRsZTogdGl0bGUsICdkYXRhLW9yaWctdGl0bGUnOiBudWxsIH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn07XG5cbi8vIFZhbGlkYXRpb25PcHRpb25zOlxuLy8gVGhpcyBiaW5kaW5nIGhhbmRsZXIgYWxsb3dzIHlvdSB0byBvdmVycmlkZSB0aGUgaW5pdGlhbCBjb25maWcgYnkgc2V0dGluZyBhbnkgb2YgdGhlIG9wdGlvbnMgZm9yIGEgc3BlY2lmaWMgZWxlbWVudCBvciBjb250ZXh0IG9mIGVsZW1lbnRzXG4vL1xuLy8gRXhhbXBsZTpcbi8vIDxkaXYgZGF0YS1iaW5kPVwidmFsaWRhdGlvbk9wdGlvbnM6IHsgaW5zZXJ0TWVzc2FnZXM6IHRydWUsIG1lc3NhZ2VUZW1wbGF0ZTogJ2N1c3RvbVRlbXBsYXRlJywgZXJyb3JNZXNzYWdlQ2xhc3M6ICdteVNwZWNpYWxDbGFzcyd9XCI+XG4vLyAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGRhdGEtYmluZD1cInZhbHVlOiBzb21lVmFsdWVcIi8+XG4vLyAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGRhdGEtYmluZD1cInZhbHVlOiBzb21lVmFsdWUyXCIvPlxuLy8gPC9kaXY+XG5rby5iaW5kaW5nSGFuZGxlcnNbJ3ZhbGlkYXRpb25PcHRpb25zJ10gPSAoZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4ge1xuXHRcdGluaXQ6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5nc0FjY2Vzc29yLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHR2YXIgb3B0aW9ucyA9IHVud3JhcCh2YWx1ZUFjY2Vzc29yKCkpO1xuXHRcdFx0aWYgKG9wdGlvbnMpIHtcblx0XHRcdFx0dmFyIG5ld0NvbmZpZyA9IGV4dGVuZCh7fSwga3YuY29uZmlndXJhdGlvbik7XG5cdFx0XHRcdGV4dGVuZChuZXdDb25maWcsIG9wdGlvbnMpO1xuXG5cdFx0XHRcdC8vc3RvcmUgdGhlIHZhbGlkYXRpb24gb3B0aW9ucyBvbiB0aGUgbm9kZSBzbyB3ZSBjYW4gcmV0cmlldmUgaXQgbGF0ZXJcblx0XHRcdFx0a3YudXRpbHMuc2V0RG9tRGF0YShlbGVtZW50LCBuZXdDb25maWcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn0oKSk7XG47Ly8gVmFsaWRhdGlvbiBFeHRlbmRlcjpcbi8vIFRoaXMgaXMgZm9yIGNyZWF0aW5nIGN1c3RvbSB2YWxpZGF0aW9uIGxvZ2ljIG9uIHRoZSBmbHlcbi8vIEV4YW1wbGU6XG4vLyB2YXIgdGVzdCA9IGtvLm9ic2VydmFibGUoJ3NvbWV0aGluZycpLmV4dGVuZHsoXG4vLyAgICAgIHZhbGlkYXRpb246IHtcbi8vICAgICAgICAgIHZhbGlkYXRvcjogZnVuY3Rpb24odmFsLCBzb21lT3RoZXJWYWwpe1xuLy8gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuLy8gICAgICAgICAgfSxcbi8vICAgICAgICAgIG1lc3NhZ2U6IFwiU29tZXRoaW5nIG11c3QgYmUgcmVhbGx5IHdyb25nIScsXG4vLyAgICAgICAgICBwYXJhbXM6IHRydWVcbi8vICAgICAgfVxuLy8gICl9O1xua28uZXh0ZW5kZXJzWyd2YWxpZGF0aW9uJ10gPSBmdW5jdGlvbiAob2JzZXJ2YWJsZSwgcnVsZXMpIHsgLy8gYWxsb3cgc2luZ2xlIHJ1bGUgb3IgYXJyYXlcblx0Zm9yRWFjaChrdi51dGlscy5pc0FycmF5KHJ1bGVzKSA/IHJ1bGVzIDogW3J1bGVzXSwgZnVuY3Rpb24gKHJ1bGUpIHtcblx0XHQvLyB0aGUgJ3J1bGUnIGJlaW5nIHBhc3NlZCBpbiBoZXJlIGhhcyBubyBuYW1lIHRvIGlkZW50aWZ5IGEgY29yZSBSdWxlLFxuXHRcdC8vIHNvIHdlIGFkZCBpdCBhcyBhbiBhbm9ueW1vdXMgcnVsZVxuXHRcdC8vIElmIHRoZSBkZXZlbG9wZXIgaXMgd2FudGluZyB0byB1c2UgYSBjb3JlIFJ1bGUsIGJ1dCB1c2UgYSBkaWZmZXJlbnQgbWVzc2FnZSBzZWUgdGhlICdhZGRFeHRlbmRlcicgbG9naWMgZm9yIGV4YW1wbGVzXG5cdFx0a3YuYWRkQW5vbnltb3VzUnVsZShvYnNlcnZhYmxlLCBydWxlKTtcblx0fSk7XG5cdHJldHVybiBvYnNlcnZhYmxlO1xufTtcblxuLy9UaGlzIGlzIHRoZSBleHRlbmRlciB0aGF0IG1ha2VzIGEgS25vY2tvdXQgT2JzZXJ2YWJsZSBhbHNvICdWYWxpZGF0YWJsZSdcbi8vZXhhbXBsZXMgaW5jbHVkZTpcbi8vIDEuIHZhciB0ZXN0ID0ga28ub2JzZXJ2YWJsZSgnc29tZXRoaW5nJykuZXh0ZW5kKHt2YWxpZGF0YWJsZTogdHJ1ZX0pO1xuLy8gdGhpcyB3aWxsIGVuc3VyZSB0aGF0IHRoZSBPYnNlcnZhYmxlIG9iamVjdCBpcyBzZXR1cCBwcm9wZXJseSB0byByZXNwb25kIHRvIHJ1bGVzXG4vL1xuLy8gMi4gdGVzdC5leHRlbmQoe3ZhbGlkYXRhYmxlOiBmYWxzZX0pO1xuLy8gdGhpcyB3aWxsIHJlbW92ZSB0aGUgdmFsaWRhdGlvbiBwcm9wZXJ0aWVzIGZyb20gdGhlIE9ic2VydmFibGUgb2JqZWN0IHNob3VsZCB5b3UgbmVlZCB0byBkbyB0aGF0Llxua28uZXh0ZW5kZXJzWyd2YWxpZGF0YWJsZSddID0gZnVuY3Rpb24gKG9ic2VydmFibGUsIG9wdGlvbnMpIHtcblx0aWYgKCFrdi51dGlscy5pc09iamVjdChvcHRpb25zKSkge1xuXHRcdG9wdGlvbnMgPSB7IGVuYWJsZTogb3B0aW9ucyB9O1xuXHR9XG5cblx0aWYgKCEoJ2VuYWJsZScgaW4gb3B0aW9ucykpIHtcblx0XHRvcHRpb25zLmVuYWJsZSA9IHRydWU7XG5cdH1cblxuXHRpZiAob3B0aW9ucy5lbmFibGUgJiYgIWt2LnV0aWxzLmlzVmFsaWRhdGFibGUob2JzZXJ2YWJsZSkpIHtcblx0XHR2YXIgY29uZmlnID0ga3YuY29uZmlndXJhdGlvbi52YWxpZGF0ZSB8fCB7fTtcblx0XHR2YXIgdmFsaWRhdGlvbk9wdGlvbnMgPSB7XG5cdFx0XHR0aHJvdHRsZUV2YWx1YXRpb24gOiBvcHRpb25zLnRocm90dGxlIHx8IGNvbmZpZy50aHJvdHRsZVxuXHRcdH07XG5cblx0XHRvYnNlcnZhYmxlLmVycm9yID0ga28ub2JzZXJ2YWJsZShudWxsKTsgLy8gaG9sZHMgdGhlIGVycm9yIG1lc3NhZ2UsIHdlIG9ubHkgbmVlZCBvbmUgc2luY2Ugd2Ugc3RvcCBwcm9jZXNzaW5nIHZhbGlkYXRvcnMgd2hlbiBvbmUgaXMgaW52YWxpZFxuXG5cdFx0Ly8gb2JzZXJ2YWJsZS5ydWxlczpcblx0XHQvLyBPYnNlcnZhYmxlQXJyYXkgb2YgUnVsZSBDb250ZXh0cywgd2hlcmUgYSBSdWxlIENvbnRleHQgaXMgc2ltcGx5IHRoZSBuYW1lIG9mIGEgcnVsZSBhbmQgdGhlIHBhcmFtcyB0byBzdXBwbHkgdG8gaXRcblx0XHQvL1xuXHRcdC8vIFJ1bGUgQ29udGV4dCA9IHsgcnVsZTogJzxydWxlIG5hbWU+JywgcGFyYW1zOiAnPHBhc3NlZCBpbiBwYXJhbXM+JywgbWVzc2FnZTogJzxPdmVycmlkZSBvZiBkZWZhdWx0IE1lc3NhZ2U+JyB9XG5cdFx0b2JzZXJ2YWJsZS5ydWxlcyA9IGtvLm9ic2VydmFibGVBcnJheSgpOyAvL2hvbGRzIHRoZSBydWxlIENvbnRleHRzIHRvIHVzZSBhcyBwYXJ0IG9mIHZhbGlkYXRpb25cblxuXHRcdC8vaW4gY2FzZSBhc3luYyB2YWxpZGF0aW9uIGlzIG9jY3VycmluZ1xuXHRcdG9ic2VydmFibGUuaXNWYWxpZGF0aW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0XHQvL3RoZSB0cnVlIGhvbGRlciBvZiB3aGV0aGVyIHRoZSBvYnNlcnZhYmxlIGlzIHZhbGlkIG9yIG5vdFxuXHRcdG9ic2VydmFibGUuX192YWxpZF9fID0ga28ub2JzZXJ2YWJsZSh0cnVlKTtcblxuXHRcdG9ic2VydmFibGUuaXNNb2RpZmllZCA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdFx0Ly8gYSBzZW1pLXByb3RlY3RlZCBvYnNlcnZhYmxlXG5cdFx0b2JzZXJ2YWJsZS5pc1ZhbGlkID0ga28uY29tcHV0ZWQob2JzZXJ2YWJsZS5fX3ZhbGlkX18pO1xuXG5cdFx0Ly9tYW51YWxseSBzZXQgZXJyb3Igc3RhdGVcblx0XHRvYnNlcnZhYmxlLnNldEVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG5cdFx0XHR2YXIgcHJldmlvdXNFcnJvciA9IG9ic2VydmFibGUuZXJyb3IucGVlaygpO1xuXHRcdFx0dmFyIHByZXZpb3VzSXNWYWxpZCA9IG9ic2VydmFibGUuX192YWxpZF9fLnBlZWsoKTtcblxuXHRcdFx0b2JzZXJ2YWJsZS5lcnJvcihlcnJvcik7XG5cdFx0XHRvYnNlcnZhYmxlLl9fdmFsaWRfXyhmYWxzZSk7XG5cblx0XHRcdGlmIChwcmV2aW91c0Vycm9yICE9PSBlcnJvciAmJiAhcHJldmlvdXNJc1ZhbGlkKSB7XG5cdFx0XHRcdC8vIGlmIHRoZSBvYnNlcnZhYmxlIHdhcyBub3QgdmFsaWQgYmVmb3JlIHRoZW4gaXNWYWxpZCB3aWxsIG5vdCBtdXRhdGUsXG5cdFx0XHRcdC8vIGhlbmNlIGNhdXNpbmcgYW55IGdyb3VwaW5nIHRvIG5vdCBkaXNwbGF5IHRoZSBsYXRlc3QgZXJyb3IuXG5cdFx0XHRcdG9ic2VydmFibGUuaXNWYWxpZC5ub3RpZnlTdWJzY3JpYmVycygpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvL21hbnVhbGx5IGNsZWFyIGVycm9yIHN0YXRlXG5cdFx0b2JzZXJ2YWJsZS5jbGVhckVycm9yID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0b2JzZXJ2YWJsZS5lcnJvcihudWxsKTtcblx0XHRcdG9ic2VydmFibGUuX192YWxpZF9fKHRydWUpO1xuXHRcdFx0cmV0dXJuIG9ic2VydmFibGU7XG5cdFx0fTtcblxuXHRcdC8vc3Vic2NyaWJlIHRvIGNoYW5nZXMgaW4gdGhlIG9ic2VydmFibGVcblx0XHR2YXIgaF9jaGFuZ2UgPSBvYnNlcnZhYmxlLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRvYnNlcnZhYmxlLmlzTW9kaWZpZWQodHJ1ZSk7XG5cdFx0fSk7XG5cblx0XHQvLyB3ZSB1c2UgYSBjb21wdXRlZCBoZXJlIHRvIGVuc3VyZSB0aGF0IGFueXRpbWUgYSBkZXBlbmRlbmN5IGNoYW5nZXMsIHRoZVxuXHRcdC8vIHZhbGlkYXRpb24gbG9naWMgZXZhbHVhdGVzXG5cdFx0dmFyIGhfb2JzVmFsaWRhdGlvblRyaWdnZXIgPSBrby5jb21wdXRlZChleHRlbmQoe1xuXHRcdFx0cmVhZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgb2JzID0gb2JzZXJ2YWJsZSgpLFxuXHRcdFx0XHRcdHJ1bGVDb250ZXh0cyA9IG9ic2VydmFibGUucnVsZXMoKTtcblxuXHRcdFx0XHRrdi52YWxpZGF0ZU9ic2VydmFibGUob2JzZXJ2YWJsZSk7XG5cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSwgdmFsaWRhdGlvbk9wdGlvbnMpKTtcblxuXHRcdGV4dGVuZChoX29ic1ZhbGlkYXRpb25UcmlnZ2VyLCB2YWxpZGF0aW9uT3B0aW9ucyk7XG5cblx0XHRvYnNlcnZhYmxlLl9kaXNwb3NlVmFsaWRhdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vZmlyc3QgZGlzcG9zZSBvZiB0aGUgc3Vic2NyaXB0aW9uc1xuXHRcdFx0b2JzZXJ2YWJsZS5pc1ZhbGlkLmRpc3Bvc2UoKTtcblx0XHRcdG9ic2VydmFibGUucnVsZXMucmVtb3ZlQWxsKCk7XG5cdFx0XHRoX2NoYW5nZS5kaXNwb3NlKCk7XG5cdFx0XHRoX29ic1ZhbGlkYXRpb25UcmlnZ2VyLmRpc3Bvc2UoKTtcblxuXHRcdFx0ZGVsZXRlIG9ic2VydmFibGVbJ3J1bGVzJ107XG5cdFx0XHRkZWxldGUgb2JzZXJ2YWJsZVsnZXJyb3InXTtcblx0XHRcdGRlbGV0ZSBvYnNlcnZhYmxlWydpc1ZhbGlkJ107XG5cdFx0XHRkZWxldGUgb2JzZXJ2YWJsZVsnaXNWYWxpZGF0aW5nJ107XG5cdFx0XHRkZWxldGUgb2JzZXJ2YWJsZVsnX192YWxpZF9fJ107XG5cdFx0XHRkZWxldGUgb2JzZXJ2YWJsZVsnaXNNb2RpZmllZCddO1xuICAgICAgICAgICAgZGVsZXRlIG9ic2VydmFibGVbJ3NldEVycm9yJ107XG4gICAgICAgICAgICBkZWxldGUgb2JzZXJ2YWJsZVsnY2xlYXJFcnJvciddO1xuICAgICAgICAgICAgZGVsZXRlIG9ic2VydmFibGVbJ19kaXNwb3NlVmFsaWRhdGlvbiddO1xuXHRcdH07XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5lbmFibGUgPT09IGZhbHNlICYmIG9ic2VydmFibGUuX2Rpc3Bvc2VWYWxpZGF0aW9uKSB7XG5cdFx0b2JzZXJ2YWJsZS5fZGlzcG9zZVZhbGlkYXRpb24oKTtcblx0fVxuXHRyZXR1cm4gb2JzZXJ2YWJsZTtcbn07XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU3luYyhvYnNlcnZhYmxlLCBydWxlLCBjdHgpIHtcblx0Ly9FeGVjdXRlIHRoZSB2YWxpZGF0b3IgYW5kIHNlZSBpZiBpdHMgdmFsaWRcblx0aWYgKCFydWxlLnZhbGlkYXRvcihvYnNlcnZhYmxlKCksIChjdHgucGFyYW1zID09PSB1bmRlZmluZWQgPyB0cnVlIDogdW53cmFwKGN0eC5wYXJhbXMpKSkpIHsgLy8gZGVmYXVsdCBwYXJhbSBpcyB0cnVlLCBlZy4gcmVxdWlyZWQgPSB0cnVlXG5cblx0XHQvL25vdCB2YWxpZCwgc28gZm9ybWF0IHRoZSBlcnJvciBtZXNzYWdlIGFuZCBzdGljayBpdCBpbiB0aGUgJ2Vycm9yJyB2YXJpYWJsZVxuXHRcdG9ic2VydmFibGUuc2V0RXJyb3Ioa3YuZm9ybWF0TWVzc2FnZShcblx0XHRcdFx0XHRjdHgubWVzc2FnZSB8fCBydWxlLm1lc3NhZ2UsXG5cdFx0XHRcdFx0dW53cmFwKGN0eC5wYXJhbXMpLFxuXHRcdFx0XHRcdG9ic2VydmFibGUpKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBc3luYyhvYnNlcnZhYmxlLCBydWxlLCBjdHgpIHtcblx0b2JzZXJ2YWJsZS5pc1ZhbGlkYXRpbmcodHJ1ZSk7XG5cblx0dmFyIGNhbGxCYWNrID0gZnVuY3Rpb24gKHZhbE9iaikge1xuXHRcdHZhciBpc1ZhbGlkID0gZmFsc2UsXG5cdFx0XHRtc2cgPSAnJztcblxuXHRcdGlmICghb2JzZXJ2YWJsZS5fX3ZhbGlkX18oKSkge1xuXG5cdFx0XHQvLyBzaW5jZSB3ZSdyZSByZXR1cm5pbmcgZWFybHksIG1ha2Ugc3VyZSB3ZSB0dXJuIHRoaXMgb2ZmXG5cdFx0XHRvYnNlcnZhYmxlLmlzVmFsaWRhdGluZyhmYWxzZSk7XG5cblx0XHRcdHJldHVybjsgLy9pZiBpdHMgYWxyZWFkeSBOT1QgdmFsaWQsIGRvbid0IGFkZCB0byB0aGF0XG5cdFx0fVxuXG5cdFx0Ly93ZSB3ZXJlIGhhbmRlZCBiYWNrIGEgY29tcGxleCBvYmplY3Rcblx0XHRpZiAodmFsT2JqWydtZXNzYWdlJ10pIHtcblx0XHRcdGlzVmFsaWQgPSB2YWxPYmouaXNWYWxpZDtcblx0XHRcdG1zZyA9IHZhbE9iai5tZXNzYWdlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpc1ZhbGlkID0gdmFsT2JqO1xuXHRcdH1cblxuXHRcdGlmICghaXNWYWxpZCkge1xuXHRcdFx0Ly9ub3QgdmFsaWQsIHNvIGZvcm1hdCB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgc3RpY2sgaXQgaW4gdGhlICdlcnJvcicgdmFyaWFibGVcblx0XHRcdG9ic2VydmFibGUuZXJyb3Ioa3YuZm9ybWF0TWVzc2FnZShcblx0XHRcdFx0bXNnIHx8IGN0eC5tZXNzYWdlIHx8IHJ1bGUubWVzc2FnZSxcblx0XHRcdFx0dW53cmFwKGN0eC5wYXJhbXMpLFxuXHRcdFx0XHRvYnNlcnZhYmxlKSk7XG5cdFx0XHRvYnNlcnZhYmxlLl9fdmFsaWRfXyhpc1ZhbGlkKTtcblx0XHR9XG5cblx0XHQvLyB0ZWxsIGl0IHRoYXQgd2UncmUgZG9uZVxuXHRcdG9ic2VydmFibGUuaXNWYWxpZGF0aW5nKGZhbHNlKTtcblx0fTtcblxuXHRrdi51dGlscy5hc3luYyhmdW5jdGlvbigpIHtcblx0ICAgIC8vZmlyZSB0aGUgdmFsaWRhdG9yIGFuZCBoYW5kIGl0IHRoZSBjYWxsYmFja1xuICAgICAgICBydWxlLnZhbGlkYXRvcihvYnNlcnZhYmxlKCksIGN0eC5wYXJhbXMgPT09IHVuZGVmaW5lZCA/IHRydWUgOiB1bndyYXAoY3R4LnBhcmFtcyksIGNhbGxCYWNrKTtcblx0fSk7XG59XG5cbmt2LnZhbGlkYXRlT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChvYnNlcnZhYmxlKSB7XG5cdHZhciBpID0gMCxcblx0XHRydWxlLCAvLyB0aGUgcnVsZSB2YWxpZGF0b3IgdG8gZXhlY3V0ZVxuXHRcdGN0eCwgLy8gdGhlIGN1cnJlbnQgUnVsZSBDb250ZXh0IGZvciB0aGUgbG9vcFxuXHRcdHJ1bGVDb250ZXh0cyA9IG9ic2VydmFibGUucnVsZXMoKSwgLy9jYWNoZSBmb3IgaXRlcmF0b3Jcblx0XHRsZW4gPSBydWxlQ29udGV4dHMubGVuZ3RoOyAvL2NhY2hlIGZvciBpdGVyYXRvclxuXG5cdGZvciAoOyBpIDwgbGVuOyBpKyspIHtcblxuXHRcdC8vZ2V0IHRoZSBSdWxlIENvbnRleHQgaW5mbyB0byBnaXZlIHRvIHRoZSBjb3JlIFJ1bGVcblx0XHRjdHggPSBydWxlQ29udGV4dHNbaV07XG5cblx0XHQvLyBjaGVja3MgYW4gJ29ubHlJZicgY29uZGl0aW9uXG5cdFx0aWYgKGN0eC5jb25kaXRpb24gJiYgIWN0eC5jb25kaXRpb24oKSkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Ly9nZXQgdGhlIGNvcmUgUnVsZSB0byB1c2UgZm9yIHZhbGlkYXRpb25cblx0XHRydWxlID0gY3R4LnJ1bGUgPyBrdi5ydWxlc1tjdHgucnVsZV0gOiBjdHg7XG5cblx0XHRpZiAocnVsZVsnYXN5bmMnXSB8fCBjdHhbJ2FzeW5jJ10pIHtcblx0XHRcdC8vcnVuIGFzeW5jIHZhbGlkYXRpb25cblx0XHRcdHZhbGlkYXRlQXN5bmMob2JzZXJ2YWJsZSwgcnVsZSwgY3R4KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL3J1biBub3JtYWwgc3luYyB2YWxpZGF0aW9uXG5cdFx0XHRpZiAoIXZhbGlkYXRlU3luYyhvYnNlcnZhYmxlLCBydWxlLCBjdHgpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTsgLy9icmVhayBvdXQgb2YgdGhlIGxvb3Bcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Ly9maW5hbGx5IGlmIHdlIGdvdCB0aGlzIGZhciwgbWFrZSB0aGUgb2JzZXJ2YWJsZSB2YWxpZCBhZ2FpbiFcblx0b2JzZXJ2YWJsZS5jbGVhckVycm9yKCk7XG5cdHJldHVybiB0cnVlO1xufTtcbjtcbnZhciBfbG9jYWxlcyA9IHt9O1xudmFyIF9jdXJyZW50TG9jYWxlO1xuXG5rdi5kZWZpbmVMb2NhbGUgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZXMpIHtcblx0aWYgKG5hbWUgJiYgdmFsdWVzKSB7XG5cdFx0X2xvY2FsZXNbbmFtZS50b0xvd2VyQ2FzZSgpXSA9IHZhbHVlcztcblx0XHRyZXR1cm4gdmFsdWVzO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxua3YubG9jYWxlID0gZnVuY3Rpb24obmFtZSkge1xuXHRpZiAobmFtZSkge1xuXHRcdG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRpZiAoX2xvY2FsZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcblx0XHRcdGt2LmxvY2FsaXplKF9sb2NhbGVzW25hbWVdKTtcblx0XHRcdF9jdXJyZW50TG9jYWxlID0gbmFtZTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsaXphdGlvbiAnICsgbmFtZSArICcgaGFzIG5vdCBiZWVuIGxvYWRlZC4nKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIF9jdXJyZW50TG9jYWxlO1xufTtcblxuLy9xdWljayBmdW5jdGlvbiB0byBvdmVycmlkZSBydWxlIG1lc3NhZ2VzXG5rdi5sb2NhbGl6ZSA9IGZ1bmN0aW9uIChtc2dUcmFuc2xhdGlvbnMpIHtcblx0dmFyIHJ1bGVzID0ga3YucnVsZXM7XG5cblx0Ly9sb29wIHRoZSBwcm9wZXJ0aWVzIGluIHRoZSBvYmplY3QgYW5kIGFzc2lnbiB0aGUgbXNnIHRvIHRoZSBydWxlXG5cdGZvciAodmFyIHJ1bGVOYW1lIGluIG1zZ1RyYW5zbGF0aW9ucykge1xuXHRcdGlmIChydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcblx0XHRcdHJ1bGVzW3J1bGVOYW1lXS5tZXNzYWdlID0gbXNnVHJhbnNsYXRpb25zW3J1bGVOYW1lXTtcblx0XHR9XG5cdH1cbn07XG5cbi8vIFBvcHVsYXRlIGRlZmF1bHQgbG9jYWxlICh0aGlzIHdpbGwgbWFrZSBlbi1VUy5qcyBzb21ld2hhdCByZWR1bmRhbnQpXG4oZnVuY3Rpb24oKSB7XG5cdHZhciBsb2NhbGVEYXRhID0ge307XG5cdHZhciBydWxlcyA9IGt2LnJ1bGVzO1xuXG5cdGZvciAodmFyIHJ1bGVOYW1lIGluIHJ1bGVzKSB7XG5cdFx0aWYgKHJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xuXHRcdFx0bG9jYWxlRGF0YVtydWxlTmFtZV0gPSBydWxlc1tydWxlTmFtZV0ubWVzc2FnZTtcblx0XHR9XG5cdH1cblx0a3YuZGVmaW5lTG9jYWxlKCdlbi11cycsIGxvY2FsZURhdGEpO1xufSkoKTtcblxuLy8gTm8gbmVlZCB0byBpbnZva2UgbG9jYWxlIGJlY2F1c2UgdGhlIG1lc3NhZ2VzIGFyZSBhbHJlYWR5IGRlZmluZWQgYWxvbmcgd2l0aCB0aGUgcnVsZXMgZm9yIGVuLVVTXG5fY3VycmVudExvY2FsZSA9ICdlbi11cyc7XG47LyoqXG4gKiBQb3NzaWJsZSBpbnZvY2F0aW9uczpcbiAqIFx0XHRhcHBseUJpbmRpbmdzV2l0aFZhbGlkYXRpb24odmlld01vZGVsKVxuICogXHRcdGFwcGx5QmluZGluZ3NXaXRoVmFsaWRhdGlvbih2aWV3TW9kZWwsIG9wdGlvbnMpXG4gKiBcdFx0YXBwbHlCaW5kaW5nc1dpdGhWYWxpZGF0aW9uKHZpZXdNb2RlbCwgcm9vdE5vZGUpXG4gKlx0XHRhcHBseUJpbmRpbmdzV2l0aFZhbGlkYXRpb24odmlld01vZGVsLCByb290Tm9kZSwgb3B0aW9ucylcbiAqL1xua28uYXBwbHlCaW5kaW5nc1dpdGhWYWxpZGF0aW9uID0gZnVuY3Rpb24gKHZpZXdNb2RlbCwgcm9vdE5vZGUsIG9wdGlvbnMpIHtcblx0dmFyIG5vZGUgPSBkb2N1bWVudC5ib2R5LFxuXHRcdGNvbmZpZztcblxuXHRpZiAocm9vdE5vZGUgJiYgcm9vdE5vZGUubm9kZVR5cGUpIHtcblx0XHRub2RlID0gcm9vdE5vZGU7XG5cdFx0Y29uZmlnID0gb3B0aW9ucztcblx0fVxuXHRlbHNlIHtcblx0XHRjb25maWcgPSByb290Tm9kZTtcblx0fVxuXG5cdGt2LmluaXQoKTtcblxuXHRpZiAoY29uZmlnKSB7XG5cdFx0Y29uZmlnID0gZXh0ZW5kKGV4dGVuZCh7fSwga3YuY29uZmlndXJhdGlvbiksIGNvbmZpZyk7XG5cdFx0a3YudXRpbHMuc2V0RG9tRGF0YShub2RlLCBjb25maWcpO1xuXHR9XG5cblx0a28uYXBwbHlCaW5kaW5ncyh2aWV3TW9kZWwsIG5vZGUpO1xufTtcblxuLy9vdmVycmlkZSB0aGUgb3JpZ2luYWwgYXBwbHlCaW5kaW5ncyBzbyB0aGF0IHdlIGNhbiBlbnN1cmUgYWxsIG5ldyBydWxlcyBhbmQgd2hhdCBub3QgYXJlIGNvcnJlY3RseSByZWdpc3RlcmVkXG52YXIgb3JpZ0FwcGx5QmluZGluZ3MgPSBrby5hcHBseUJpbmRpbmdzO1xua28uYXBwbHlCaW5kaW5ncyA9IGZ1bmN0aW9uICh2aWV3TW9kZWwsIHJvb3ROb2RlKSB7XG5cblx0a3YuaW5pdCgpO1xuXG5cdG9yaWdBcHBseUJpbmRpbmdzKHZpZXdNb2RlbCwgcm9vdE5vZGUpO1xufTtcblxua28udmFsaWRhdGVkT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChpbml0aWFsVmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKCFvcHRpb25zICYmICFrdi51dGlscy5pc09iamVjdChpbml0aWFsVmFsdWUpKSB7XG5cdFx0cmV0dXJuIGtvLm9ic2VydmFibGUoaW5pdGlhbFZhbHVlKS5leHRlbmQoeyB2YWxpZGF0YWJsZTogdHJ1ZSB9KTtcblx0fVxuXG5cdHZhciBvYnN2ID0ga28ub2JzZXJ2YWJsZShpbml0aWFsVmFsdWUpO1xuXHRvYnN2LmVycm9ycyA9IGt2Lmdyb3VwKGt2LnV0aWxzLmlzT2JqZWN0KGluaXRpYWxWYWx1ZSkgPyBpbml0aWFsVmFsdWUgOiB7fSwgb3B0aW9ucyk7XG5cdG9ic3YuaXNWYWxpZCA9IGtvLm9ic2VydmFibGUob2Jzdi5lcnJvcnMoKS5sZW5ndGggPT09IDApO1xuXG5cdGlmIChrby5pc09ic2VydmFibGUob2Jzdi5lcnJvcnMpKSB7XG5cdFx0b2Jzdi5lcnJvcnMuc3Vic2NyaWJlKGZ1bmN0aW9uKGVycm9ycykge1xuXHRcdFx0b2Jzdi5pc1ZhbGlkKGVycm9ycy5sZW5ndGggPT09IDApO1xuXHRcdH0pO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGtvLmNvbXB1dGVkKG9ic3YuZXJyb3JzKS5zdWJzY3JpYmUoZnVuY3Rpb24gKGVycm9ycykge1xuXHRcdFx0b2Jzdi5pc1ZhbGlkKGVycm9ycy5sZW5ndGggPT09IDApO1xuXHRcdH0pO1xuXHR9XG5cblx0b2Jzdi5zdWJzY3JpYmUoZnVuY3Rpb24obmV3VmFsdWUpIHtcblx0XHRpZiAoIWt2LnV0aWxzLmlzT2JqZWN0KG5ld1ZhbHVlKSkge1xuXHRcdFx0Lypcblx0XHRcdCAqIFRoZSB2YWxpZGF0aW9uIGdyb3VwIHdvcmtzIG9uIG9iamVjdHMuXG5cdFx0XHQgKiBTaW5jZSB0aGUgbmV3IHZhbHVlIGlzIGEgcHJpbWl0aXZlIChzY2FsYXIsIG51bGwgb3IgdW5kZWZpbmVkKSB3ZSBuZWVkXG5cdFx0XHQgKiB0byBjcmVhdGUgYW4gZW1wdHkgb2JqZWN0IHRvIHBhc3MgYWxvbmcuXG5cdFx0XHQgKi9cblx0XHRcdG5ld1ZhbHVlID0ge307XG5cdFx0fVxuXHRcdC8vIEZvcmNlIHRoZSBncm91cCB0byByZWZyZXNoXG5cdFx0b2Jzdi5lcnJvcnMuX3VwZGF0ZVN0YXRlKG5ld1ZhbHVlKTtcblx0XHRvYnN2LmlzVmFsaWQob2Jzdi5lcnJvcnMoKS5sZW5ndGggPT09IDApO1xuXHR9KTtcblxuXHRyZXR1cm4gb2Jzdjtcbn07XG47fSkpO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxca25vY2tvdXQudmFsaWRhdGlvblxcXFxkaXN0XFxcXGtub2Nrb3V0LnZhbGlkYXRpb24uanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxca25vY2tvdXQudmFsaWRhdGlvblxcXFxkaXN0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBLbm9ja291dCBKYXZhU2NyaXB0IGxpYnJhcnkgdjMuNS4wXG4gKiAoYykgVGhlIEtub2Nrb3V0LmpzIHRlYW0gLSBodHRwOi8va25vY2tvdXRqcy5jb20vXG4gKiBMaWNlbnNlOiBNSVQgKGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwKVxuICovXG5cbihmdW5jdGlvbigpIHsoZnVuY3Rpb24ocCl7dmFyIHo9dGhpc3x8KDAsZXZhbCkoXCJ0aGlzXCIpLHc9ei5kb2N1bWVudCxSPXoubmF2aWdhdG9yLHY9ei5qUXVlcnksSD16LkpTT047dnx8XCJ1bmRlZmluZWRcIj09PXR5cGVvZiBqUXVlcnl8fCh2PWpRdWVyeSk7KGZ1bmN0aW9uKHApe1wiZnVuY3Rpb25cIj09PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImV4cG9ydHNcIixcInJlcXVpcmVcIl0scCk6XCJvYmplY3RcIj09PXR5cGVvZiBleHBvcnRzJiZcIm9iamVjdFwiPT09dHlwZW9mIG1vZHVsZT9wKG1vZHVsZS5leHBvcnRzfHxleHBvcnRzKTpwKHoua289e30pfSkoZnVuY3Rpb24oUyxUKXtmdW5jdGlvbiBLKGEsYyl7cmV0dXJuIG51bGw9PT1hfHx0eXBlb2YgYSBpbiBXP2E9PT1jOiExfWZ1bmN0aW9uIFgoYixjKXt2YXIgZDtyZXR1cm4gZnVuY3Rpb24oKXtkfHwoZD1hLmEuc2V0VGltZW91dChmdW5jdGlvbigpe2Q9cDtiKCl9LGMpKX19ZnVuY3Rpb24gWShiLGMpe3ZhciBkO3JldHVybiBmdW5jdGlvbigpe2NsZWFyVGltZW91dChkKTtcbmQ9YS5hLnNldFRpbWVvdXQoYixjKX19ZnVuY3Rpb24gWihhLGMpe2MmJlwiY2hhbmdlXCIhPT1jP1wiYmVmb3JlQ2hhbmdlXCI9PT1jP3RoaXMub2MoYSk6dGhpcy5iYihhLGMpOnRoaXMucGMoYSl9ZnVuY3Rpb24gYWEoYSxjKXtudWxsIT09YyYmYy5zJiZjLnMoKX1mdW5jdGlvbiBiYShhLGMpe3ZhciBkPXRoaXMucGQsZT1kW3RdO2UucWF8fCh0aGlzLlBiJiZ0aGlzLmtiW2NdPyhkLnRjKGMsYSx0aGlzLmtiW2NdKSx0aGlzLmtiW2NdPW51bGwsLS10aGlzLlBiKTplLkZbY118fGQudGMoYyxhLGUuRz97ZGE6YX06ZC5aYyhhKSksYS5LYSYmYS5mZCgpKX12YXIgYT1cInVuZGVmaW5lZFwiIT09dHlwZW9mIFM/Uzp7fTthLmI9ZnVuY3Rpb24oYixjKXtmb3IodmFyIGQ9Yi5zcGxpdChcIi5cIiksZT1hLGY9MDtmPGQubGVuZ3RoLTE7ZisrKWU9ZVtkW2ZdXTtlW2RbZC5sZW5ndGgtMV1dPWN9O2EuSj1mdW5jdGlvbihhLGMsZCl7YVtjXT1kfTthLnZlcnNpb249XCIzLjUuMFwiO2EuYihcInZlcnNpb25cIixcbmEudmVyc2lvbik7YS5vcHRpb25zPXtkZWZlclVwZGF0ZXM6ITEsdXNlT25seU5hdGl2ZUV2ZW50czohMSxmb3JlYWNoSGlkZXNEZXN0cm95ZWQ6ITF9O2EuYT1mdW5jdGlvbigpe2Z1bmN0aW9uIGIoYSxiKXtmb3IodmFyIGMgaW4gYSlmLmNhbGwoYSxjKSYmYihjLGFbY10pfWZ1bmN0aW9uIGMoYSxiKXtpZihiKWZvcih2YXIgYyBpbiBiKWYuY2FsbChiLGMpJiYoYVtjXT1iW2NdKTtyZXR1cm4gYX1mdW5jdGlvbiBkKGEsYil7YS5fX3Byb3RvX189YjtyZXR1cm4gYX1mdW5jdGlvbiBlKGIsYyxkLGUpe3ZhciBrPWJbY10ubWF0Y2gobil8fFtdO2EuYS5DKGQubWF0Y2gobiksZnVuY3Rpb24oYil7YS5hLk9hKGssYixlKX0pO2JbY109ay5qb2luKFwiIFwiKX12YXIgZj1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LGc9e19fcHJvdG9fXzpbXX1pbnN0YW5jZW9mIEFycmF5LGg9XCJmdW5jdGlvblwiPT09dHlwZW9mIFN5bWJvbCxtPXt9LGw9e307bVtSJiYvRmlyZWZveFxcLzIvaS50ZXN0KFIudXNlckFnZW50KT9cblwiS2V5Ym9hcmRFdmVudFwiOlwiVUlFdmVudHNcIl09W1wia2V5dXBcIixcImtleWRvd25cIixcImtleXByZXNzXCJdO20uTW91c2VFdmVudHM9XCJjbGljayBkYmxjbGljayBtb3VzZWRvd24gbW91c2V1cCBtb3VzZW1vdmUgbW91c2VvdmVyIG1vdXNlb3V0IG1vdXNlZW50ZXIgbW91c2VsZWF2ZVwiLnNwbGl0KFwiIFwiKTtiKG0sZnVuY3Rpb24oYSxiKXtpZihiLmxlbmd0aClmb3IodmFyIGM9MCxkPWIubGVuZ3RoO2M8ZDtjKyspbFtiW2NdXT1hfSk7dmFyIGs9e3Byb3BlcnR5Y2hhbmdlOiEwfSxxPXcmJmZ1bmN0aW9uKCl7Zm9yKHZhciBhPTMsYj13LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksYz1iLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaVwiKTtiLmlubmVySFRNTD1cIlxceDNjIS0tW2lmIGd0IElFIFwiKyArK2ErXCJdPjxpPjwvaT48IVtlbmRpZl0tLVxceDNlXCIsY1swXTspO3JldHVybiA0PGE/YTpwfSgpLG49L1xcUysvZyxyO3JldHVybntJYzpbXCJhdXRoZW50aWNpdHlfdG9rZW5cIiwvXl9fUmVxdWVzdFZlcmlmaWNhdGlvblRva2VuKF8uKik/JC9dLFxuQzpmdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkPTAsZT1hLmxlbmd0aDtkPGU7ZCsrKWIuY2FsbChjLGFbZF0sZCxhKX0sQTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZj9mdW5jdGlvbihhLGIpe3JldHVybiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGEsYil9OmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPTAsZD1hLmxlbmd0aDtjPGQ7YysrKWlmKGFbY109PT1iKXJldHVybiBjO3JldHVybi0xfSxMYjpmdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkPTAsZT1hLmxlbmd0aDtkPGU7ZCsrKWlmKGIuY2FsbChjLGFbZF0sZCxhKSlyZXR1cm4gYVtkXTtyZXR1cm4gcH0saGI6ZnVuY3Rpb24oYixjKXt2YXIgZD1hLmEuQShiLGMpOzA8ZD9iLnNwbGljZShkLDEpOjA9PT1kJiZiLnNoaWZ0KCl9LHZjOmZ1bmN0aW9uKGIpe3ZhciBjPVtdO2ImJmEuYS5DKGIsZnVuY3Rpb24oYil7MD5hLmEuQShjLGIpJiZjLnB1c2goYil9KTtyZXR1cm4gY30sTWI6ZnVuY3Rpb24oYSxcbmIsYyl7dmFyIGQ9W107aWYoYSlmb3IodmFyIGU9MCxrPWEubGVuZ3RoO2U8aztlKyspZC5wdXNoKGIuY2FsbChjLGFbZV0sZSkpO3JldHVybiBkfSxmYjpmdW5jdGlvbihhLGIsYyl7dmFyIGQ9W107aWYoYSlmb3IodmFyIGU9MCxrPWEubGVuZ3RoO2U8aztlKyspYi5jYWxsKGMsYVtlXSxlKSYmZC5wdXNoKGFbZV0pO3JldHVybiBkfSxnYjpmdW5jdGlvbihhLGIpe2lmKGIgaW5zdGFuY2VvZiBBcnJheSlhLnB1c2guYXBwbHkoYSxiKTtlbHNlIGZvcih2YXIgYz0wLGQ9Yi5sZW5ndGg7YzxkO2MrKylhLnB1c2goYltjXSk7cmV0dXJuIGF9LE9hOmZ1bmN0aW9uKGIsYyxkKXt2YXIgZT1hLmEuQShhLmEuJGIoYiksYyk7MD5lP2QmJmIucHVzaChjKTpkfHxiLnNwbGljZShlLDEpfSxCYTpnLGV4dGVuZDpjLHNldFByb3RvdHlwZU9mOmQsemI6Zz9kOmMsTzpiLEhhOmZ1bmN0aW9uKGEsYixjKXtpZighYSlyZXR1cm4gYTt2YXIgZD17fSxlO2ZvcihlIGluIGEpZi5jYWxsKGEsZSkmJihkW2VdPVxuYi5jYWxsKGMsYVtlXSxlLGEpKTtyZXR1cm4gZH0sU2I6ZnVuY3Rpb24oYil7Zm9yKDtiLmZpcnN0Q2hpbGQ7KWEucmVtb3ZlTm9kZShiLmZpcnN0Q2hpbGQpfSxYYjpmdW5jdGlvbihiKXtiPWEuYS5sYShiKTtmb3IodmFyIGM9KGJbMF0mJmJbMF0ub3duZXJEb2N1bWVudHx8dykuY3JlYXRlRWxlbWVudChcImRpdlwiKSxkPTAsZT1iLmxlbmd0aDtkPGU7ZCsrKWMuYXBwZW5kQ2hpbGQoYS5uYShiW2RdKSk7cmV0dXJuIGN9LENhOmZ1bmN0aW9uKGIsYyl7Zm9yKHZhciBkPTAsZT1iLmxlbmd0aCxrPVtdO2Q8ZTtkKyspe3ZhciBmPWJbZF0uY2xvbmVOb2RlKCEwKTtrLnB1c2goYz9hLm5hKGYpOmYpfXJldHVybiBrfSx1YTpmdW5jdGlvbihiLGMpe2EuYS5TYihiKTtpZihjKWZvcih2YXIgZD0wLGU9Yy5sZW5ndGg7ZDxlO2QrKyliLmFwcGVuZENoaWxkKGNbZF0pfSxXYzpmdW5jdGlvbihiLGMpe3ZhciBkPWIubm9kZVR5cGU/W2JdOmI7aWYoMDxkLmxlbmd0aCl7Zm9yKHZhciBlPWRbMF0sXG5rPWUucGFyZW50Tm9kZSxmPTAsbD1jLmxlbmd0aDtmPGw7ZisrKWsuaW5zZXJ0QmVmb3JlKGNbZl0sZSk7Zj0wO2ZvcihsPWQubGVuZ3RoO2Y8bDtmKyspYS5yZW1vdmVOb2RlKGRbZl0pfX0sVWE6ZnVuY3Rpb24oYSxiKXtpZihhLmxlbmd0aCl7Zm9yKGI9OD09PWIubm9kZVR5cGUmJmIucGFyZW50Tm9kZXx8YjthLmxlbmd0aCYmYVswXS5wYXJlbnROb2RlIT09YjspYS5zcGxpY2UoMCwxKTtmb3IoOzE8YS5sZW5ndGgmJmFbYS5sZW5ndGgtMV0ucGFyZW50Tm9kZSE9PWI7KWEubGVuZ3RoLS07aWYoMTxhLmxlbmd0aCl7dmFyIGM9YVswXSxkPWFbYS5sZW5ndGgtMV07Zm9yKGEubGVuZ3RoPTA7YyE9PWQ7KWEucHVzaChjKSxjPWMubmV4dFNpYmxpbmc7YS5wdXNoKGQpfX1yZXR1cm4gYX0sWWM6ZnVuY3Rpb24oYSxiKXs3PnE/YS5zZXRBdHRyaWJ1dGUoXCJzZWxlY3RlZFwiLGIpOmEuc2VsZWN0ZWQ9Yn0sQ2I6ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGw9PT1hfHxhPT09cD9cIlwiOmEudHJpbT9cbmEudHJpbSgpOmEudG9TdHJpbmcoKS5yZXBsYWNlKC9eW1xcc1xceGEwXSt8W1xcc1xceGEwXSskL2csXCJcIil9LFRkOmZ1bmN0aW9uKGEsYil7YT1hfHxcIlwiO3JldHVybiBiLmxlbmd0aD5hLmxlbmd0aD8hMTphLnN1YnN0cmluZygwLGIubGVuZ3RoKT09PWJ9LHVkOmZ1bmN0aW9uKGEsYil7aWYoYT09PWIpcmV0dXJuITA7aWYoMTE9PT1hLm5vZGVUeXBlKXJldHVybiExO2lmKGIuY29udGFpbnMpcmV0dXJuIGIuY29udGFpbnMoMSE9PWEubm9kZVR5cGU/YS5wYXJlbnROb2RlOmEpO2lmKGIuY29tcGFyZURvY3VtZW50UG9zaXRpb24pcmV0dXJuIDE2PT0oYi5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihhKSYxNik7Zm9yKDthJiZhIT1iOylhPWEucGFyZW50Tm9kZTtyZXR1cm4hIWF9LFJiOmZ1bmN0aW9uKGIpe3JldHVybiBhLmEudWQoYixiLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KX0samQ6ZnVuY3Rpb24oYil7cmV0dXJuISFhLmEuTGIoYixhLmEuUmIpfSxQOmZ1bmN0aW9uKGEpe3JldHVybiBhJiZcbmEudGFnTmFtZSYmYS50YWdOYW1lLnRvTG93ZXJDYXNlKCl9LHpjOmZ1bmN0aW9uKGIpe3JldHVybiBhLm9uRXJyb3I/ZnVuY3Rpb24oKXt0cnl7cmV0dXJuIGIuYXBwbHkodGhpcyxhcmd1bWVudHMpfWNhdGNoKGMpe3Rocm93IGEub25FcnJvciYmYS5vbkVycm9yKGMpLGM7fX06Yn0sc2V0VGltZW91dDpmdW5jdGlvbihiLGMpe3JldHVybiBzZXRUaW1lb3V0KGEuYS56YyhiKSxjKX0sRmM6ZnVuY3Rpb24oYil7c2V0VGltZW91dChmdW5jdGlvbigpe2Eub25FcnJvciYmYS5vbkVycm9yKGIpO3Rocm93IGI7fSwwKX0sSDpmdW5jdGlvbihiLGMsZCl7dmFyIGU9YS5hLnpjKGQpO2Q9a1tjXTtpZihhLm9wdGlvbnMudXNlT25seU5hdGl2ZUV2ZW50c3x8ZHx8IXYpaWYoZHx8XCJmdW5jdGlvblwiIT10eXBlb2YgYi5hZGRFdmVudExpc3RlbmVyKWlmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBiLmF0dGFjaEV2ZW50KXt2YXIgZj1mdW5jdGlvbihhKXtlLmNhbGwoYixhKX0sbD1cIm9uXCIrYztiLmF0dGFjaEV2ZW50KGwsXG5mKTthLmEuSS56YShiLGZ1bmN0aW9uKCl7Yi5kZXRhY2hFdmVudChsLGYpfSl9ZWxzZSB0aHJvdyBFcnJvcihcIkJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnRcIik7ZWxzZSBiLmFkZEV2ZW50TGlzdGVuZXIoYyxlLCExKTtlbHNlIHJ8fChyPVwiZnVuY3Rpb25cIj09dHlwZW9mIHYoYikub24/XCJvblwiOlwiYmluZFwiKSx2KGIpW3JdKGMsZSl9LEZiOmZ1bmN0aW9uKGIsYyl7aWYoIWJ8fCFiLm5vZGVUeXBlKXRocm93IEVycm9yKFwiZWxlbWVudCBtdXN0IGJlIGEgRE9NIG5vZGUgd2hlbiBjYWxsaW5nIHRyaWdnZXJFdmVudFwiKTt2YXIgZDtcImlucHV0XCI9PT1hLmEuUChiKSYmYi50eXBlJiZcImNsaWNrXCI9PWMudG9Mb3dlckNhc2UoKT8oZD1iLnR5cGUsZD1cImNoZWNrYm94XCI9PWR8fFwicmFkaW9cIj09ZCk6ZD0hMTtpZihhLm9wdGlvbnMudXNlT25seU5hdGl2ZUV2ZW50c3x8IXZ8fGQpaWYoXCJmdW5jdGlvblwiPT10eXBlb2Ygdy5jcmVhdGVFdmVudClpZihcImZ1bmN0aW9uXCI9PVxudHlwZW9mIGIuZGlzcGF0Y2hFdmVudClkPXcuY3JlYXRlRXZlbnQobFtjXXx8XCJIVE1MRXZlbnRzXCIpLGQuaW5pdEV2ZW50KGMsITAsITAseiwwLDAsMCwwLDAsITEsITEsITEsITEsMCxiKSxiLmRpc3BhdGNoRXZlbnQoZCk7ZWxzZSB0aHJvdyBFcnJvcihcIlRoZSBzdXBwbGllZCBlbGVtZW50IGRvZXNuJ3Qgc3VwcG9ydCBkaXNwYXRjaEV2ZW50XCIpO2Vsc2UgaWYoZCYmYi5jbGljayliLmNsaWNrKCk7ZWxzZSBpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgYi5maXJlRXZlbnQpYi5maXJlRXZlbnQoXCJvblwiK2MpO2Vsc2UgdGhyb3cgRXJyb3IoXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0cmlnZ2VyaW5nIGV2ZW50c1wiKTtlbHNlIHYoYikudHJpZ2dlcihjKX0sYzpmdW5jdGlvbihiKXtyZXR1cm4gYS5OKGIpP2IoKTpifSwkYjpmdW5jdGlvbihiKXtyZXR1cm4gYS5OKGIpP2IudygpOmJ9LEViOmZ1bmN0aW9uKGIsYyxkKXt2YXIgaztjJiYoXCJvYmplY3RcIj09PXR5cGVvZiBiLmNsYXNzTGlzdD9cbihrPWIuY2xhc3NMaXN0W2Q/XCJhZGRcIjpcInJlbW92ZVwiXSxhLmEuQyhjLm1hdGNoKG4pLGZ1bmN0aW9uKGEpe2suY2FsbChiLmNsYXNzTGlzdCxhKX0pKTpcInN0cmluZ1wiPT09dHlwZW9mIGIuY2xhc3NOYW1lLmJhc2VWYWw/ZShiLmNsYXNzTmFtZSxcImJhc2VWYWxcIixjLGQpOmUoYixcImNsYXNzTmFtZVwiLGMsZCkpfSxBYjpmdW5jdGlvbihiLGMpe3ZhciBkPWEuYS5jKGMpO2lmKG51bGw9PT1kfHxkPT09cClkPVwiXCI7dmFyIGU9YS5oLmZpcnN0Q2hpbGQoYik7IWV8fDMhPWUubm9kZVR5cGV8fGEuaC5uZXh0U2libGluZyhlKT9hLmgudWEoYixbYi5vd25lckRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGQpXSk6ZS5kYXRhPWQ7YS5hLnpkKGIpfSxYYzpmdW5jdGlvbihhLGIpe2EubmFtZT1iO2lmKDc+PXEpdHJ5e3ZhciBjPWEubmFtZS5yZXBsYWNlKC9bJjw+J1wiXS9nLGZ1bmN0aW9uKGEpe3JldHVyblwiJiNcIithLmNoYXJDb2RlQXQoMCkrXCI7XCJ9KTthLm1lcmdlQXR0cmlidXRlcyh3LmNyZWF0ZUVsZW1lbnQoXCI8aW5wdXQgbmFtZT0nXCIrXG5jK1wiJy8+XCIpLCExKX1jYXRjaChkKXt9fSx6ZDpmdW5jdGlvbihhKXs5PD1xJiYoYT0xPT1hLm5vZGVUeXBlP2E6YS5wYXJlbnROb2RlLGEuc3R5bGUmJihhLnN0eWxlLnpvb209YS5zdHlsZS56b29tKSl9LHZkOmZ1bmN0aW9uKGEpe2lmKHEpe3ZhciBiPWEuc3R5bGUud2lkdGg7YS5zdHlsZS53aWR0aD0wO2Euc3R5bGUud2lkdGg9Yn19LE9kOmZ1bmN0aW9uKGIsYyl7Yj1hLmEuYyhiKTtjPWEuYS5jKGMpO2Zvcih2YXIgZD1bXSxlPWI7ZTw9YztlKyspZC5wdXNoKGUpO3JldHVybiBkfSxsYTpmdW5jdGlvbihhKXtmb3IodmFyIGI9W10sYz0wLGQ9YS5sZW5ndGg7YzxkO2MrKyliLnB1c2goYVtjXSk7cmV0dXJuIGJ9LERhOmZ1bmN0aW9uKGEpe3JldHVybiBoP1N5bWJvbChhKTphfSxYZDo2PT09cSxZZDo3PT09cSxXOnEsS2M6ZnVuY3Rpb24oYixjKXtmb3IodmFyIGQ9YS5hLmxhKGIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJpbnB1dFwiKSkuY29uY2F0KGEuYS5sYShiLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGV4dGFyZWFcIikpKSxcbmU9XCJzdHJpbmdcIj09dHlwZW9mIGM/ZnVuY3Rpb24oYSl7cmV0dXJuIGEubmFtZT09PWN9OmZ1bmN0aW9uKGEpe3JldHVybiBjLnRlc3QoYS5uYW1lKX0saz1bXSxmPWQubGVuZ3RoLTE7MDw9ZjtmLS0pZShkW2ZdKSYmay5wdXNoKGRbZl0pO3JldHVybiBrfSxNZDpmdW5jdGlvbihiKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgYiYmKGI9YS5hLkNiKGIpKT9IJiZILnBhcnNlP0gucGFyc2UoYik6KG5ldyBGdW5jdGlvbihcInJldHVybiBcIitiKSkoKTpudWxsfSxmYzpmdW5jdGlvbihiLGMsZCl7aWYoIUh8fCFILnN0cmluZ2lmeSl0aHJvdyBFcnJvcihcIkNhbm5vdCBmaW5kIEpTT04uc3RyaW5naWZ5KCkuIFNvbWUgYnJvd3NlcnMgKGUuZy4sIElFIDwgOCkgZG9uJ3Qgc3VwcG9ydCBpdCBuYXRpdmVseSwgYnV0IHlvdSBjYW4gb3ZlcmNvbWUgdGhpcyBieSBhZGRpbmcgYSBzY3JpcHQgcmVmZXJlbmNlIHRvIGpzb24yLmpzLCBkb3dubG9hZGFibGUgZnJvbSBodHRwOi8vd3d3Lmpzb24ub3JnL2pzb24yLmpzXCIpO1xucmV0dXJuIEguc3RyaW5naWZ5KGEuYS5jKGIpLGMsZCl9LE5kOmZ1bmN0aW9uKGMsZCxlKXtlPWV8fHt9O3ZhciBrPWUucGFyYW1zfHx7fSxmPWUuaW5jbHVkZUZpZWxkc3x8dGhpcy5JYyxsPWM7aWYoXCJvYmplY3RcIj09dHlwZW9mIGMmJlwiZm9ybVwiPT09YS5hLlAoYykpZm9yKHZhciBsPWMuYWN0aW9uLGg9Zi5sZW5ndGgtMTswPD1oO2gtLSlmb3IodmFyIGc9YS5hLktjKGMsZltoXSksbT1nLmxlbmd0aC0xOzA8PW07bS0tKWtbZ1ttXS5uYW1lXT1nW21dLnZhbHVlO2Q9YS5hLmMoZCk7dmFyIG49dy5jcmVhdGVFbGVtZW50KFwiZm9ybVwiKTtuLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7bi5hY3Rpb249bDtuLm1ldGhvZD1cInBvc3RcIjtmb3IodmFyIHEgaW4gZCljPXcuY3JlYXRlRWxlbWVudChcImlucHV0XCIpLGMudHlwZT1cImhpZGRlblwiLGMubmFtZT1xLGMudmFsdWU9YS5hLmZjKGEuYS5jKGRbcV0pKSxuLmFwcGVuZENoaWxkKGMpO2IoayxmdW5jdGlvbihhLGIpe3ZhciBjPXcuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuYy50eXBlPVwiaGlkZGVuXCI7Yy5uYW1lPWE7Yy52YWx1ZT1iO24uYXBwZW5kQ2hpbGQoYyl9KTt3LmJvZHkuYXBwZW5kQ2hpbGQobik7ZS5zdWJtaXR0ZXI/ZS5zdWJtaXR0ZXIobik6bi5zdWJtaXQoKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG4pfSwwKX19fSgpO2EuYihcInV0aWxzXCIsYS5hKTthLmIoXCJ1dGlscy5hcnJheUZvckVhY2hcIixhLmEuQyk7YS5iKFwidXRpbHMuYXJyYXlGaXJzdFwiLGEuYS5MYik7YS5iKFwidXRpbHMuYXJyYXlGaWx0ZXJcIixhLmEuZmIpO2EuYihcInV0aWxzLmFycmF5R2V0RGlzdGluY3RWYWx1ZXNcIixhLmEudmMpO2EuYihcInV0aWxzLmFycmF5SW5kZXhPZlwiLGEuYS5BKTthLmIoXCJ1dGlscy5hcnJheU1hcFwiLGEuYS5NYik7YS5iKFwidXRpbHMuYXJyYXlQdXNoQWxsXCIsYS5hLmdiKTthLmIoXCJ1dGlscy5hcnJheVJlbW92ZUl0ZW1cIixhLmEuaGIpO2EuYihcInV0aWxzLmNsb25lTm9kZXNcIixhLmEuQ2EpO2EuYihcInV0aWxzLmNyZWF0ZVN5bWJvbE9yU3RyaW5nXCIsXG5hLmEuRGEpO2EuYihcInV0aWxzLmV4dGVuZFwiLGEuYS5leHRlbmQpO2EuYihcInV0aWxzLmZpZWxkc0luY2x1ZGVkV2l0aEpzb25Qb3N0XCIsYS5hLkljKTthLmIoXCJ1dGlscy5nZXRGb3JtRmllbGRzXCIsYS5hLktjKTthLmIoXCJ1dGlscy5vYmplY3RNYXBcIixhLmEuSGEpO2EuYihcInV0aWxzLnBlZWtPYnNlcnZhYmxlXCIsYS5hLiRiKTthLmIoXCJ1dGlscy5wb3N0SnNvblwiLGEuYS5OZCk7YS5iKFwidXRpbHMucGFyc2VKc29uXCIsYS5hLk1kKTthLmIoXCJ1dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlclwiLGEuYS5IKTthLmIoXCJ1dGlscy5zdHJpbmdpZnlKc29uXCIsYS5hLmZjKTthLmIoXCJ1dGlscy5yYW5nZVwiLGEuYS5PZCk7YS5iKFwidXRpbHMudG9nZ2xlRG9tTm9kZUNzc0NsYXNzXCIsYS5hLkViKTthLmIoXCJ1dGlscy50cmlnZ2VyRXZlbnRcIixhLmEuRmIpO2EuYihcInV0aWxzLnVud3JhcE9ic2VydmFibGVcIixhLmEuYyk7YS5iKFwidXRpbHMub2JqZWN0Rm9yRWFjaFwiLGEuYS5PKTthLmIoXCJ1dGlscy5hZGRPclJlbW92ZUl0ZW1cIixcbmEuYS5PYSk7YS5iKFwidXRpbHMuc2V0VGV4dENvbnRlbnRcIixhLmEuQWIpO2EuYihcInVud3JhcFwiLGEuYS5jKTtGdW5jdGlvbi5wcm90b3R5cGUuYmluZHx8KEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKGEpe3ZhciBjPXRoaXM7aWYoMT09PWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGMuYXBwbHkoYSxhcmd1bWVudHMpfTt2YXIgZD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGU9ZC5zbGljZSgwKTtlLnB1c2guYXBwbHkoZSxhcmd1bWVudHMpO3JldHVybiBjLmFwcGx5KGEsZSl9fSk7YS5hLmc9bmV3IGZ1bmN0aW9uKCl7dmFyIGI9MCxjPVwiX19rb19fXCIrKG5ldyBEYXRlKS5nZXRUaW1lKCksZD17fSxlLGY7YS5hLlc/KGU9ZnVuY3Rpb24oYSxlKXt2YXIgZj1hW2NdO2lmKCFmfHxcIm51bGxcIj09PWZ8fCFkW2ZdKXtpZighZSlyZXR1cm4gcDtmPWFbY109XCJrb1wiK2IrKztkW2ZdPVxue319cmV0dXJuIGRbZl19LGY9ZnVuY3Rpb24oYSl7dmFyIGI9YVtjXTtyZXR1cm4gYj8oZGVsZXRlIGRbYl0sYVtjXT1udWxsLCEwKTohMX0pOihlPWZ1bmN0aW9uKGEsYil7dmFyIGQ9YVtjXTshZCYmYiYmKGQ9YVtjXT17fSk7cmV0dXJuIGR9LGY9ZnVuY3Rpb24oYSl7cmV0dXJuIGFbY10/KGRlbGV0ZSBhW2NdLCEwKTohMX0pO3JldHVybntnZXQ6ZnVuY3Rpb24oYSxiKXt2YXIgYz1lKGEsITEpO3JldHVybiBjJiZjW2JdfSxzZXQ6ZnVuY3Rpb24oYSxiLGMpeyhhPWUoYSxjIT09cCkpJiYoYVtiXT1jKX0sVGI6ZnVuY3Rpb24oYSxiLGMpe2E9ZShhLCEwKTtyZXR1cm4gYVtiXXx8KGFbYl09Yyl9LGNsZWFyOmYsWjpmdW5jdGlvbigpe3JldHVybiBiKysgK2N9fX07YS5iKFwidXRpbHMuZG9tRGF0YVwiLGEuYS5nKTthLmIoXCJ1dGlscy5kb21EYXRhLmNsZWFyXCIsYS5hLmcuY2xlYXIpO2EuYS5JPW5ldyBmdW5jdGlvbigpe2Z1bmN0aW9uIGIoYixjKXt2YXIgZD1hLmEuZy5nZXQoYixlKTtcbmQ9PT1wJiZjJiYoZD1bXSxhLmEuZy5zZXQoYixlLGQpKTtyZXR1cm4gZH1mdW5jdGlvbiBjKGMpe3ZhciBlPWIoYywhMSk7aWYoZSlmb3IodmFyIGU9ZS5zbGljZSgwKSxmPTA7ZjxlLmxlbmd0aDtmKyspZVtmXShjKTthLmEuZy5jbGVhcihjKTthLmEuSS5jbGVhbkV4dGVybmFsRGF0YShjKTtnW2Mubm9kZVR5cGVdJiZkKGMuY2hpbGROb2RlcywhMCl9ZnVuY3Rpb24gZChiLGQpe2Zvcih2YXIgZT1bXSxrLGY9MDtmPGIubGVuZ3RoO2YrKylpZighZHx8OD09PWJbZl0ubm9kZVR5cGUpaWYoYyhlW2UubGVuZ3RoXT1rPWJbZl0pLGJbZl0hPT1rKWZvcig7Zi0tJiYtMT09YS5hLkEoZSxiW2ZdKTspO312YXIgZT1hLmEuZy5aKCksZj17MTohMCw4OiEwLDk6ITB9LGc9ezE6ITAsOTohMH07cmV0dXJue3phOmZ1bmN0aW9uKGEsYyl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgYyl0aHJvdyBFcnJvcihcIkNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtiKGEsITApLnB1c2goYyl9LHhiOmZ1bmN0aW9uKGMsXG5kKXt2YXIgZj1iKGMsITEpO2YmJihhLmEuaGIoZixkKSwwPT1mLmxlbmd0aCYmYS5hLmcuc2V0KGMsZSxwKSl9LG5hOmZ1bmN0aW9uKGEpe2ZbYS5ub2RlVHlwZV0mJihjKGEpLGdbYS5ub2RlVHlwZV0mJmQoYS5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIikpKTtyZXR1cm4gYX0scmVtb3ZlTm9kZTpmdW5jdGlvbihiKXthLm5hKGIpO2IucGFyZW50Tm9kZSYmYi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGIpfSxjbGVhbkV4dGVybmFsRGF0YTpmdW5jdGlvbihhKXt2JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiB2LmNsZWFuRGF0YSYmdi5jbGVhbkRhdGEoW2FdKX19fTthLm5hPWEuYS5JLm5hO2EucmVtb3ZlTm9kZT1hLmEuSS5yZW1vdmVOb2RlO2EuYihcImNsZWFuTm9kZVwiLGEubmEpO2EuYihcInJlbW92ZU5vZGVcIixhLnJlbW92ZU5vZGUpO2EuYihcInV0aWxzLmRvbU5vZGVEaXNwb3NhbFwiLGEuYS5JKTthLmIoXCJ1dGlscy5kb21Ob2RlRGlzcG9zYWwuYWRkRGlzcG9zZUNhbGxiYWNrXCIsYS5hLkkuemEpO1xuYS5iKFwidXRpbHMuZG9tTm9kZURpc3Bvc2FsLnJlbW92ZURpc3Bvc2VDYWxsYmFja1wiLGEuYS5JLnhiKTsoZnVuY3Rpb24oKXt2YXIgYj1bMCxcIlwiLFwiXCJdLGM9WzEsXCI8dGFibGU+XCIsXCI8L3RhYmxlPlwiXSxkPVszLFwiPHRhYmxlPjx0Ym9keT48dHI+XCIsXCI8L3RyPjwvdGJvZHk+PC90YWJsZT5cIl0sZT1bMSxcIjxzZWxlY3QgbXVsdGlwbGU9J211bHRpcGxlJz5cIixcIjwvc2VsZWN0PlwiXSxmPXt0aGVhZDpjLHRib2R5OmMsdGZvb3Q6Yyx0cjpbMixcIjx0YWJsZT48dGJvZHk+XCIsXCI8L3Rib2R5PjwvdGFibGU+XCJdLHRkOmQsdGg6ZCxvcHRpb246ZSxvcHRncm91cDplfSxnPTg+PWEuYS5XO2EuYS50YT1mdW5jdGlvbihjLGQpe3ZhciBlO2lmKHYpaWYodi5wYXJzZUhUTUwpZT12LnBhcnNlSFRNTChjLGQpfHxbXTtlbHNle2lmKChlPXYuY2xlYW4oW2NdLGQpKSYmZVswXSl7Zm9yKHZhciBrPWVbMF07ay5wYXJlbnROb2RlJiYxMSE9PWsucGFyZW50Tm9kZS5ub2RlVHlwZTspaz1rLnBhcmVudE5vZGU7XG5rLnBhcmVudE5vZGUmJmsucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChrKX19ZWxzZXsoZT1kKXx8KGU9dyk7dmFyIGs9ZS5wYXJlbnRXaW5kb3d8fGUuZGVmYXVsdFZpZXd8fHoscT1hLmEuQ2IoYykudG9Mb3dlckNhc2UoKSxuPWUuY3JlYXRlRWxlbWVudChcImRpdlwiKSxyO3I9KHE9cS5tYXRjaCgvXig/OlxceDNjIS0tLio/LS1cXHgzZVxccyo/KSo/PChbYS16XSspW1xccz5dLykpJiZmW3FbMV1dfHxiO3E9clswXTtyPVwiaWdub3JlZDxkaXY+XCIrclsxXStjK3JbMl0rXCI8L2Rpdj5cIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBrLmlubmVyU2hpdj9uLmFwcGVuZENoaWxkKGsuaW5uZXJTaGl2KHIpKTooZyYmZS5ib2R5LmFwcGVuZENoaWxkKG4pLG4uaW5uZXJIVE1MPXIsZyYmbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG4pKTtmb3IoO3EtLTspbj1uLmxhc3RDaGlsZDtlPWEuYS5sYShuLmxhc3RDaGlsZC5jaGlsZE5vZGVzKX1yZXR1cm4gZX07YS5hLkxkPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5hLnRhKGIsXG5jKTtyZXR1cm4gZC5sZW5ndGgmJmRbMF0ucGFyZW50RWxlbWVudHx8YS5hLlhiKGQpfTthLmEuZGM9ZnVuY3Rpb24oYixjKXthLmEuU2IoYik7Yz1hLmEuYyhjKTtpZihudWxsIT09YyYmYyE9PXApaWYoXCJzdHJpbmdcIiE9dHlwZW9mIGMmJihjPWMudG9TdHJpbmcoKSksdil2KGIpLmh0bWwoYyk7ZWxzZSBmb3IodmFyIGQ9YS5hLnRhKGMsYi5vd25lckRvY3VtZW50KSxlPTA7ZTxkLmxlbmd0aDtlKyspYi5hcHBlbmRDaGlsZChkW2VdKX19KSgpO2EuYihcInV0aWxzLnBhcnNlSHRtbEZyYWdtZW50XCIsYS5hLnRhKTthLmIoXCJ1dGlscy5zZXRIdG1sXCIsYS5hLmRjKTthLmFhPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYihjLGUpe2lmKGMpaWYoOD09Yy5ub2RlVHlwZSl7dmFyIGY9YS5hYS5UYyhjLm5vZGVWYWx1ZSk7bnVsbCE9ZiYmZS5wdXNoKHtzZDpjLEpkOmZ9KX1lbHNlIGlmKDE9PWMubm9kZVR5cGUpZm9yKHZhciBmPTAsZz1jLmNoaWxkTm9kZXMsaD1nLmxlbmd0aDtmPGg7ZisrKWIoZ1tmXSxcbmUpfXZhciBjPXt9O3JldHVybntXYjpmdW5jdGlvbihhKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBhKXRocm93IEVycm9yKFwiWW91IGNhbiBvbmx5IHBhc3MgYSBmdW5jdGlvbiB0byBrby5tZW1vaXphdGlvbi5tZW1vaXplKClcIik7dmFyIGI9KDQyOTQ5NjcyOTYqKDErTWF0aC5yYW5kb20oKSl8MCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKSsoNDI5NDk2NzI5NiooMStNYXRoLnJhbmRvbSgpKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO2NbYl09YTtyZXR1cm5cIlxceDNjIS0tW2tvX21lbW86XCIrYitcIl0tLVxceDNlXCJ9LGFkOmZ1bmN0aW9uKGEsYil7dmFyIGY9Y1thXTtpZihmPT09cCl0aHJvdyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYW55IG1lbW8gd2l0aCBJRCBcIithK1wiLiBQZXJoYXBzIGl0J3MgYWxyZWFkeSBiZWVuIHVubWVtb2l6ZWQuXCIpO3RyeXtyZXR1cm4gZi5hcHBseShudWxsLGJ8fFtdKSwhMH1maW5hbGx5e2RlbGV0ZSBjW2FdfX0sYmQ6ZnVuY3Rpb24oYyxlKXt2YXIgZj1cbltdO2IoYyxmKTtmb3IodmFyIGc9MCxoPWYubGVuZ3RoO2c8aDtnKyspe3ZhciBtPWZbZ10uc2QsbD1bbV07ZSYmYS5hLmdiKGwsZSk7YS5hYS5hZChmW2ddLkpkLGwpO20ubm9kZVZhbHVlPVwiXCI7bS5wYXJlbnROb2RlJiZtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobSl9fSxUYzpmdW5jdGlvbihhKXtyZXR1cm4oYT1hLm1hdGNoKC9eXFxba29fbWVtb1xcOiguKj8pXFxdJC8pKT9hWzFdOm51bGx9fX0oKTthLmIoXCJtZW1vaXphdGlvblwiLGEuYWEpO2EuYihcIm1lbW9pemF0aW9uLm1lbW9pemVcIixhLmFhLldiKTthLmIoXCJtZW1vaXphdGlvbi51bm1lbW9pemVcIixhLmFhLmFkKTthLmIoXCJtZW1vaXphdGlvbi5wYXJzZU1lbW9UZXh0XCIsYS5hYS5UYyk7YS5iKFwibWVtb2l6YXRpb24udW5tZW1vaXplRG9tTm9kZUFuZERlc2NlbmRhbnRzXCIsYS5hYS5iZCk7YS5tYT1mdW5jdGlvbigpe2Z1bmN0aW9uIGIoKXtpZihmKWZvcih2YXIgYj1mLGM9MCxkO2g8ZjspaWYoZD1lW2grK10pe2lmKGg+Yil7aWYoNUUzPD1cbisrYyl7aD1mO2EuYS5GYyhFcnJvcihcIidUb28gbXVjaCByZWN1cnNpb24nIGFmdGVyIHByb2Nlc3NpbmcgXCIrYytcIiB0YXNrIGdyb3Vwcy5cIikpO2JyZWFrfWI9Zn10cnl7ZCgpfWNhdGNoKGcpe2EuYS5GYyhnKX19fWZ1bmN0aW9uIGMoKXtiKCk7aD1mPWUubGVuZ3RoPTB9dmFyIGQsZT1bXSxmPTAsZz0xLGg9MDt6Lk11dGF0aW9uT2JzZXJ2ZXI/ZD1mdW5jdGlvbihhKXt2YXIgYj13LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7KG5ldyBNdXRhdGlvbk9ic2VydmVyKGEpKS5vYnNlcnZlKGIse2F0dHJpYnV0ZXM6ITB9KTtyZXR1cm4gZnVuY3Rpb24oKXtiLmNsYXNzTGlzdC50b2dnbGUoXCJmb29cIil9fShjKTpkPXcmJlwib25yZWFkeXN0YXRlY2hhbmdlXCJpbiB3LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik/ZnVuY3Rpb24oYSl7dmFyIGI9dy5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO2Iub25yZWFkeXN0YXRlY2hhbmdlPWZ1bmN0aW9uKCl7Yi5vbnJlYWR5c3RhdGVjaGFuZ2U9bnVsbDt3LmRvY3VtZW50RWxlbWVudC5yZW1vdmVDaGlsZChiKTtcbmI9bnVsbDthKCl9O3cuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKGIpfTpmdW5jdGlvbihhKXtzZXRUaW1lb3V0KGEsMCl9O3JldHVybntzY2hlZHVsZXI6ZCx5YjpmdW5jdGlvbihiKXtmfHxhLm1hLnNjaGVkdWxlcihjKTtlW2YrK109YjtyZXR1cm4gZysrfSxjYW5jZWw6ZnVuY3Rpb24oYSl7YT1hLShnLWYpO2E+PWgmJmE8ZiYmKGVbYV09bnVsbCl9LHJlc2V0Rm9yVGVzdGluZzpmdW5jdGlvbigpe3ZhciBhPWYtaDtoPWY9ZS5sZW5ndGg9MDtyZXR1cm4gYX0sUmQ6Yn19KCk7YS5iKFwidGFza3NcIixhLm1hKTthLmIoXCJ0YXNrcy5zY2hlZHVsZVwiLGEubWEueWIpO2EuYihcInRhc2tzLnJ1bkVhcmx5XCIsYS5tYS5SZCk7YS5UYT17dGhyb3R0bGU6ZnVuY3Rpb24oYixjKXtiLnRocm90dGxlRXZhbHVhdGlvbj1jO3ZhciBkPW51bGw7cmV0dXJuIGEuJCh7cmVhZDpiLHdyaXRlOmZ1bmN0aW9uKGUpe2NsZWFyVGltZW91dChkKTtkPWEuYS5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YihlKX0sXG5jKX19KX0scmF0ZUxpbWl0OmZ1bmN0aW9uKGEsYyl7dmFyIGQsZSxmO1wibnVtYmVyXCI9PXR5cGVvZiBjP2Q9YzooZD1jLnRpbWVvdXQsZT1jLm1ldGhvZCk7YS5IYj0hMTtmPVwiZnVuY3Rpb25cIj09dHlwZW9mIGU/ZTpcIm5vdGlmeVdoZW5DaGFuZ2VzU3RvcFwiPT1lP1k6WDthLnRiKGZ1bmN0aW9uKGEpe3JldHVybiBmKGEsZCxjKX0pfSxkZWZlcnJlZDpmdW5jdGlvbihiLGMpe2lmKCEwIT09Yyl0aHJvdyBFcnJvcihcIlRoZSAnZGVmZXJyZWQnIGV4dGVuZGVyIG9ubHkgYWNjZXB0cyB0aGUgdmFsdWUgJ3RydWUnLCBiZWNhdXNlIGl0IGlzIG5vdCBzdXBwb3J0ZWQgdG8gdHVybiBkZWZlcnJhbCBvZmYgb25jZSBlbmFibGVkLlwiKTtiLkhifHwoYi5IYj0hMCxiLnRiKGZ1bmN0aW9uKGMpe3ZhciBlLGY9ITE7cmV0dXJuIGZ1bmN0aW9uKCl7aWYoIWYpe2EubWEuY2FuY2VsKGUpO2U9YS5tYS55YihjKTt0cnl7Zj0hMCxiLm5vdGlmeVN1YnNjcmliZXJzKHAsXCJkaXJ0eVwiKX1maW5hbGx5e2Y9XG4hMX19fX0pKX0sbm90aWZ5OmZ1bmN0aW9uKGEsYyl7YS5lcXVhbGl0eUNvbXBhcmVyPVwiYWx3YXlzXCI9PWM/bnVsbDpLfX07dmFyIFc9e3VuZGVmaW5lZDoxLFwiYm9vbGVhblwiOjEsbnVtYmVyOjEsc3RyaW5nOjF9O2EuYihcImV4dGVuZGVyc1wiLGEuVGEpO2EuZ2M9ZnVuY3Rpb24oYixjLGQpe3RoaXMuZGE9Yjt0aGlzLmtjPWM7dGhpcy5sYz1kO3RoaXMuSWI9ITE7dGhpcy5hYj10aGlzLkpiPW51bGw7YS5KKHRoaXMsXCJkaXNwb3NlXCIsdGhpcy5zKTthLkoodGhpcyxcImRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZFwiLHRoaXMubCl9O2EuZ2MucHJvdG90eXBlLnM9ZnVuY3Rpb24oKXt0aGlzLklifHwodGhpcy5hYiYmYS5hLkkueGIodGhpcy5KYix0aGlzLmFiKSx0aGlzLkliPSEwLHRoaXMubGMoKSx0aGlzLmRhPXRoaXMua2M9dGhpcy5sYz10aGlzLkpiPXRoaXMuYWI9bnVsbCl9O2EuZ2MucHJvdG90eXBlLmw9ZnVuY3Rpb24oYil7dGhpcy5KYj1iO2EuYS5JLnphKGIsdGhpcy5hYj10aGlzLnMuYmluZCh0aGlzKSl9O1xuYS5SPWZ1bmN0aW9uKCl7YS5hLnpiKHRoaXMsRCk7RC5vYih0aGlzKX07dmFyIEQ9e29iOmZ1bmN0aW9uKGEpe2EuUz17Y2hhbmdlOltdfTthLnJjPTF9LHN1YnNjcmliZTpmdW5jdGlvbihiLGMsZCl7dmFyIGU9dGhpcztkPWR8fFwiY2hhbmdlXCI7dmFyIGY9bmV3IGEuZ2MoZSxjP2IuYmluZChjKTpiLGZ1bmN0aW9uKCl7YS5hLmhiKGUuU1tkXSxmKTtlLmNiJiZlLmNiKGQpfSk7ZS5RYSYmZS5RYShkKTtlLlNbZF18fChlLlNbZF09W10pO2UuU1tkXS5wdXNoKGYpO3JldHVybiBmfSxub3RpZnlTdWJzY3JpYmVyczpmdW5jdGlvbihiLGMpe2M9Y3x8XCJjaGFuZ2VcIjtcImNoYW5nZVwiPT09YyYmdGhpcy5HYigpO2lmKHRoaXMuV2EoYykpe3ZhciBkPVwiY2hhbmdlXCI9PT1jJiZ0aGlzLmRkfHx0aGlzLlNbY10uc2xpY2UoMCk7dHJ5e2Eudi53YygpO2Zvcih2YXIgZT0wLGY7Zj1kW2VdOysrZSlmLklifHxmLmtjKGIpfWZpbmFsbHl7YS52LmVuZCgpfX19LG1iOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucmN9LFxuQ2Q6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMubWIoKSE9PWF9LEdiOmZ1bmN0aW9uKCl7Kyt0aGlzLnJjfSx0YjpmdW5jdGlvbihiKXt2YXIgYz10aGlzLGQ9YS5OKGMpLGUsZixnLGgsbTtjLmJifHwoYy5iYj1jLm5vdGlmeVN1YnNjcmliZXJzLGMubm90aWZ5U3Vic2NyaWJlcnM9Wik7dmFyIGw9YihmdW5jdGlvbigpe2MuS2E9ITE7ZCYmaD09PWMmJihoPWMubWM/Yy5tYygpOmMoKSk7dmFyIGE9Znx8bSYmYy5xYihnLGgpO209Zj1lPSExO2EmJmMuYmIoZz1oKX0pO2MucGM9ZnVuY3Rpb24oYSxiKXtiJiZjLkthfHwobT0hYik7Yy5kZD1jLlMuY2hhbmdlLnNsaWNlKDApO2MuS2E9ZT0hMDtoPWE7bCgpfTtjLm9jPWZ1bmN0aW9uKGEpe2V8fChnPWEsYy5iYihhLFwiYmVmb3JlQ2hhbmdlXCIpKX07Yy5xYz1mdW5jdGlvbigpe209ITB9O2MuZmQ9ZnVuY3Rpb24oKXtjLnFiKGcsYy53KCEwKSkmJihmPSEwKX19LFdhOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLlNbYV0mJnRoaXMuU1thXS5sZW5ndGh9LFxuQWQ6ZnVuY3Rpb24oYil7aWYoYilyZXR1cm4gdGhpcy5TW2JdJiZ0aGlzLlNbYl0ubGVuZ3RofHwwO3ZhciBjPTA7YS5hLk8odGhpcy5TLGZ1bmN0aW9uKGEsYil7XCJkaXJ0eVwiIT09YSYmKGMrPWIubGVuZ3RoKX0pO3JldHVybiBjfSxxYjpmdW5jdGlvbihhLGMpe3JldHVybiF0aGlzLmVxdWFsaXR5Q29tcGFyZXJ8fCF0aGlzLmVxdWFsaXR5Q29tcGFyZXIoYSxjKX0sdG9TdHJpbmc6ZnVuY3Rpb24oKXtyZXR1cm5cIltvYmplY3QgT2JqZWN0XVwifSxleHRlbmQ6ZnVuY3Rpb24oYil7dmFyIGM9dGhpcztiJiZhLmEuTyhiLGZ1bmN0aW9uKGIsZSl7dmFyIGY9YS5UYVtiXTtcImZ1bmN0aW9uXCI9PXR5cGVvZiBmJiYoYz1mKGMsZSl8fGMpfSk7cmV0dXJuIGN9fTthLkooRCxcImluaXRcIixELm9iKTthLkooRCxcInN1YnNjcmliZVwiLEQuc3Vic2NyaWJlKTthLkooRCxcImV4dGVuZFwiLEQuZXh0ZW5kKTthLkooRCxcImdldFN1YnNjcmlwdGlvbnNDb3VudFwiLEQuQWQpO2EuYS5CYSYmYS5hLnNldFByb3RvdHlwZU9mKEQsXG5GdW5jdGlvbi5wcm90b3R5cGUpO2EuUi5mbj1EO2EuUGM9ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPWEmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGEuc3Vic2NyaWJlJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBhLm5vdGlmeVN1YnNjcmliZXJzfTthLmIoXCJzdWJzY3JpYmFibGVcIixhLlIpO2EuYihcImlzU3Vic2NyaWJhYmxlXCIsYS5QYyk7YS5VPWEudj1mdW5jdGlvbigpe2Z1bmN0aW9uIGIoYSl7ZC5wdXNoKGUpO2U9YX1mdW5jdGlvbiBjKCl7ZT1kLnBvcCgpfXZhciBkPVtdLGUsZj0wO3JldHVybnt3YzpiLGVuZDpjLGFjOmZ1bmN0aW9uKGIpe2lmKGUpe2lmKCFhLlBjKGIpKXRocm93IEVycm9yKFwiT25seSBzdWJzY3JpYmFibGUgdGhpbmdzIGNhbiBhY3QgYXMgZGVwZW5kZW5jaWVzXCIpO2UubmQuY2FsbChlLm9kLGIsYi5lZHx8KGIuZWQ9KytmKSl9fSxLOmZ1bmN0aW9uKGEsZCxlKXt0cnl7cmV0dXJuIGIoKSxhLmFwcGx5KGQsZXx8W10pfWZpbmFsbHl7YygpfX0scGE6ZnVuY3Rpb24oKXtpZihlKXJldHVybiBlLm8ucGEoKX0sXG5WYTpmdW5jdGlvbigpe2lmKGUpcmV0dXJuIGUuby5WYSgpfSxyYjpmdW5jdGlvbigpe2lmKGUpcmV0dXJuIGUucmJ9LG86ZnVuY3Rpb24oKXtpZihlKXJldHVybiBlLm99fX0oKTthLmIoXCJjb21wdXRlZENvbnRleHRcIixhLlUpO2EuYihcImNvbXB1dGVkQ29udGV4dC5nZXREZXBlbmRlbmNpZXNDb3VudFwiLGEuVS5wYSk7YS5iKFwiY29tcHV0ZWRDb250ZXh0LmdldERlcGVuZGVuY2llc1wiLGEuVS5WYSk7YS5iKFwiY29tcHV0ZWRDb250ZXh0LmlzSW5pdGlhbFwiLGEuVS5yYik7YS5iKFwiY29tcHV0ZWRDb250ZXh0LnJlZ2lzdGVyRGVwZW5kZW5jeVwiLGEuVS5hYyk7YS5iKFwiaWdub3JlRGVwZW5kZW5jaWVzXCIsYS5XZD1hLnYuSyk7dmFyIEk9YS5hLkRhKFwiX2xhdGVzdFZhbHVlXCIpO2Euc2E9ZnVuY3Rpb24oYil7ZnVuY3Rpb24gYygpe2lmKDA8YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gYy5xYihjW0ldLGFyZ3VtZW50c1swXSkmJihjLnhhKCksY1tJXT1hcmd1bWVudHNbMF0sYy53YSgpKSx0aGlzO1xuYS52LmFjKGMpO3JldHVybiBjW0ldfWNbSV09YjthLmEuQmF8fGEuYS5leHRlbmQoYyxhLlIuZm4pO2EuUi5mbi5vYihjKTthLmEuemIoYyxGKTthLm9wdGlvbnMuZGVmZXJVcGRhdGVzJiZhLlRhLmRlZmVycmVkKGMsITApO3JldHVybiBjfTt2YXIgRj17ZXF1YWxpdHlDb21wYXJlcjpLLHc6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpc1tJXX0sd2E6ZnVuY3Rpb24oKXt0aGlzLm5vdGlmeVN1YnNjcmliZXJzKHRoaXNbSV0sXCJzcGVjdGF0ZVwiKTt0aGlzLm5vdGlmeVN1YnNjcmliZXJzKHRoaXNbSV0pfSx4YTpmdW5jdGlvbigpe3RoaXMubm90aWZ5U3Vic2NyaWJlcnModGhpc1tJXSxcImJlZm9yZUNoYW5nZVwiKX19O2EuYS5CYSYmYS5hLnNldFByb3RvdHlwZU9mKEYsYS5SLmZuKTt2YXIgRz1hLnNhLk5hPVwiX19rb19wcm90b19fXCI7RltHXT1hLnNhO2EuTj1mdW5jdGlvbihiKXtpZigoYj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBiJiZiW0ddKSYmYiE9PUZbR10mJmIhPT1hLm8uZm5bR10pdGhyb3cgRXJyb3IoXCJJbnZhbGlkIG9iamVjdCB0aGF0IGxvb2tzIGxpa2UgYW4gb2JzZXJ2YWJsZTsgcG9zc2libHkgZnJvbSBhbm90aGVyIEtub2Nrb3V0IGluc3RhbmNlXCIpO1xucmV0dXJuISFifTthLllhPWZ1bmN0aW9uKGIpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIGImJihiW0ddPT09RltHXXx8YltHXT09PWEuby5mbltHXSYmYi5NYyl9O2EuYihcIm9ic2VydmFibGVcIixhLnNhKTthLmIoXCJpc09ic2VydmFibGVcIixhLk4pO2EuYihcImlzV3JpdGVhYmxlT2JzZXJ2YWJsZVwiLGEuWWEpO2EuYihcImlzV3JpdGFibGVPYnNlcnZhYmxlXCIsYS5ZYSk7YS5iKFwib2JzZXJ2YWJsZS5mblwiLEYpO2EuSihGLFwicGVla1wiLEYudyk7YS5KKEYsXCJ2YWx1ZUhhc011dGF0ZWRcIixGLndhKTthLkooRixcInZhbHVlV2lsbE11dGF0ZVwiLEYueGEpO2EuSWE9ZnVuY3Rpb24oYil7Yj1ifHxbXTtpZihcIm9iamVjdFwiIT10eXBlb2YgYnx8IShcImxlbmd0aFwiaW4gYikpdGhyb3cgRXJyb3IoXCJUaGUgYXJndW1lbnQgcGFzc2VkIHdoZW4gaW5pdGlhbGl6aW5nIGFuIG9ic2VydmFibGUgYXJyYXkgbXVzdCBiZSBhbiBhcnJheSwgb3IgbnVsbCwgb3IgdW5kZWZpbmVkLlwiKTtiPWEuc2EoYik7YS5hLnpiKGIsXG5hLklhLmZuKTtyZXR1cm4gYi5leHRlbmQoe3RyYWNrQXJyYXlDaGFuZ2VzOiEwfSl9O2EuSWEuZm49e3JlbW92ZTpmdW5jdGlvbihiKXtmb3IodmFyIGM9dGhpcy53KCksZD1bXSxlPVwiZnVuY3Rpb25cIiE9dHlwZW9mIGJ8fGEuTihiKT9mdW5jdGlvbihhKXtyZXR1cm4gYT09PWJ9OmIsZj0wO2Y8Yy5sZW5ndGg7ZisrKXt2YXIgZz1jW2ZdO2lmKGUoZykpezA9PT1kLmxlbmd0aCYmdGhpcy54YSgpO2lmKGNbZl0hPT1nKXRocm93IEVycm9yKFwiQXJyYXkgbW9kaWZpZWQgZHVyaW5nIHJlbW92ZTsgY2Fubm90IHJlbW92ZSBpdGVtXCIpO2QucHVzaChnKTtjLnNwbGljZShmLDEpO2YtLX19ZC5sZW5ndGgmJnRoaXMud2EoKTtyZXR1cm4gZH0scmVtb3ZlQWxsOmZ1bmN0aW9uKGIpe2lmKGI9PT1wKXt2YXIgYz10aGlzLncoKSxkPWMuc2xpY2UoMCk7dGhpcy54YSgpO2Muc3BsaWNlKDAsYy5sZW5ndGgpO3RoaXMud2EoKTtyZXR1cm4gZH1yZXR1cm4gYj90aGlzLnJlbW92ZShmdW5jdGlvbihjKXtyZXR1cm4gMDw9XG5hLmEuQShiLGMpfSk6W119LGRlc3Ryb3k6ZnVuY3Rpb24oYil7dmFyIGM9dGhpcy53KCksZD1cImZ1bmN0aW9uXCIhPXR5cGVvZiBifHxhLk4oYik/ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1ifTpiO3RoaXMueGEoKTtmb3IodmFyIGU9Yy5sZW5ndGgtMTswPD1lO2UtLSl7dmFyIGY9Y1tlXTtkKGYpJiYoZi5fZGVzdHJveT0hMCl9dGhpcy53YSgpfSxkZXN0cm95QWxsOmZ1bmN0aW9uKGIpe3JldHVybiBiPT09cD90aGlzLmRlc3Ryb3koZnVuY3Rpb24oKXtyZXR1cm4hMH0pOmI/dGhpcy5kZXN0cm95KGZ1bmN0aW9uKGMpe3JldHVybiAwPD1hLmEuQShiLGMpfSk6W119LGluZGV4T2Y6ZnVuY3Rpb24oYil7dmFyIGM9dGhpcygpO3JldHVybiBhLmEuQShjLGIpfSxyZXBsYWNlOmZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcy5pbmRleE9mKGEpOzA8PWQmJih0aGlzLnhhKCksdGhpcy53KClbZF09Yyx0aGlzLndhKCkpfSxzb3J0ZWQ6ZnVuY3Rpb24oYSl7dmFyIGM9dGhpcygpLnNsaWNlKDApO1xucmV0dXJuIGE/Yy5zb3J0KGEpOmMuc29ydCgpfSxyZXZlcnNlZDpmdW5jdGlvbigpe3JldHVybiB0aGlzKCkuc2xpY2UoMCkucmV2ZXJzZSgpfX07YS5hLkJhJiZhLmEuc2V0UHJvdG90eXBlT2YoYS5JYS5mbixhLnNhLmZuKTthLmEuQyhcInBvcCBwdXNoIHJldmVyc2Ugc2hpZnQgc29ydCBzcGxpY2UgdW5zaGlmdFwiLnNwbGl0KFwiIFwiKSxmdW5jdGlvbihiKXthLklhLmZuW2JdPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy53KCk7dGhpcy54YSgpO3RoaXMueWMoYSxiLGFyZ3VtZW50cyk7dmFyIGQ9YVtiXS5hcHBseShhLGFyZ3VtZW50cyk7dGhpcy53YSgpO3JldHVybiBkPT09YT90aGlzOmR9fSk7YS5hLkMoW1wic2xpY2VcIl0sZnVuY3Rpb24oYil7YS5JYS5mbltiXT1mdW5jdGlvbigpe3ZhciBhPXRoaXMoKTtyZXR1cm4gYVtiXS5hcHBseShhLGFyZ3VtZW50cyl9fSk7YS5PYz1mdW5jdGlvbihiKXtyZXR1cm4gYS5OKGIpJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBiLnJlbW92ZSYmXCJmdW5jdGlvblwiPT1cbnR5cGVvZiBiLnB1c2h9O2EuYihcIm9ic2VydmFibGVBcnJheVwiLGEuSWEpO2EuYihcImlzT2JzZXJ2YWJsZUFycmF5XCIsYS5PYyk7YS5UYS50cmFja0FycmF5Q2hhbmdlcz1mdW5jdGlvbihiLGMpe2Z1bmN0aW9uIGQoKXtmdW5jdGlvbiBjKCl7aWYoaCl7dmFyIGQ9W10uY29uY2F0KGIudygpfHxbXSk7aWYoYi5XYShcImFycmF5Q2hhbmdlXCIpKXt2YXIgZTtpZighZnx8MTxoKWY9YS5hLk9iKG0sZCxiLk5iKTtlPWZ9bT1kO2Y9bnVsbDtoPTA7ZSYmZS5sZW5ndGgmJmIubm90aWZ5U3Vic2NyaWJlcnMoZSxcImFycmF5Q2hhbmdlXCIpfX1lP2MoKTooZT0hMCxsPWIubm90aWZ5U3Vic2NyaWJlcnMsYi5ub3RpZnlTdWJzY3JpYmVycz1mdW5jdGlvbihhLGIpe2ImJlwiY2hhbmdlXCIhPT1ifHwrK2g7cmV0dXJuIGwuYXBwbHkodGhpcyxhcmd1bWVudHMpfSxtPVtdLmNvbmNhdChiLncoKXx8W10pLGY9bnVsbCxnPWIuc3Vic2NyaWJlKGMpKX1iLk5iPXt9O2MmJlwib2JqZWN0XCI9PXR5cGVvZiBjJiZhLmEuZXh0ZW5kKGIuTmIsXG5jKTtiLk5iLnNwYXJzZT0hMDtpZighYi55Yyl7dmFyIGU9ITEsZj1udWxsLGcsaD0wLG0sbCxrPWIuUWEscT1iLmNiO2IuUWE9ZnVuY3Rpb24oYSl7ayYmay5jYWxsKGIsYSk7XCJhcnJheUNoYW5nZVwiPT09YSYmZCgpfTtiLmNiPWZ1bmN0aW9uKGEpe3EmJnEuY2FsbChiLGEpO1wiYXJyYXlDaGFuZ2VcIiE9PWF8fGIuV2EoXCJhcnJheUNoYW5nZVwiKXx8KGwmJihiLm5vdGlmeVN1YnNjcmliZXJzPWwsbD1wKSxnJiZnLnMoKSxnPW51bGwsZT0hMSxtPXApfTtiLnljPWZ1bmN0aW9uKGIsYyxkKXtmdW5jdGlvbiBrKGEsYixjKXtyZXR1cm4gbFtsLmxlbmd0aF09e3N0YXR1czphLHZhbHVlOmIsaW5kZXg6Y319aWYoZSYmIWgpe3ZhciBsPVtdLGc9Yi5sZW5ndGgscT1kLmxlbmd0aCxtPTA7c3dpdGNoKGMpe2Nhc2UgXCJwdXNoXCI6bT1nO2Nhc2UgXCJ1bnNoaWZ0XCI6Zm9yKGM9MDtjPHE7YysrKWsoXCJhZGRlZFwiLGRbY10sbStjKTticmVhaztjYXNlIFwicG9wXCI6bT1nLTE7Y2FzZSBcInNoaWZ0XCI6ZyYmXG5rKFwiZGVsZXRlZFwiLGJbbV0sbSk7YnJlYWs7Y2FzZSBcInNwbGljZVwiOmM9TWF0aC5taW4oTWF0aC5tYXgoMCwwPmRbMF0/ZytkWzBdOmRbMF0pLGcpO2Zvcih2YXIgZz0xPT09cT9nOk1hdGgubWluKGMrKGRbMV18fDApLGcpLHE9YytxLTIsbT1NYXRoLm1heChnLHEpLFU9W10sTD1bXSxwPTI7YzxtOysrYywrK3ApYzxnJiZMLnB1c2goayhcImRlbGV0ZWRcIixiW2NdLGMpKSxjPHEmJlUucHVzaChrKFwiYWRkZWRcIixkW3BdLGMpKTthLmEuSmMoTCxVKTticmVhaztkZWZhdWx0OnJldHVybn1mPWx9fX19O3ZhciB0PWEuYS5EYShcIl9zdGF0ZVwiKTthLm89YS4kPWZ1bmN0aW9uKGIsYyxkKXtmdW5jdGlvbiBlKCl7aWYoMDxhcmd1bWVudHMubGVuZ3RoKXtpZihcImZ1bmN0aW9uXCI9PT10eXBlb2YgZilmLmFwcGx5KGcubGIsYXJndW1lbnRzKTtlbHNlIHRocm93IEVycm9yKFwiQ2Fubm90IHdyaXRlIGEgdmFsdWUgdG8gYSBrby5jb21wdXRlZCB1bmxlc3MgeW91IHNwZWNpZnkgYSAnd3JpdGUnIG9wdGlvbi4gSWYgeW91IHdpc2ggdG8gcmVhZCB0aGUgY3VycmVudCB2YWx1ZSwgZG9uJ3QgcGFzcyBhbnkgcGFyYW1ldGVycy5cIik7XG5yZXR1cm4gdGhpc31nLnFhfHxhLnYuYWMoZSk7KGcua2F8fGcuRyYmZS5YYSgpKSYmZS5oYSgpO3JldHVybiBnLlh9XCJvYmplY3RcIj09PXR5cGVvZiBiP2Q9YjooZD1kfHx7fSxiJiYoZC5yZWFkPWIpKTtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBkLnJlYWQpdGhyb3cgRXJyb3IoXCJQYXNzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUga28uY29tcHV0ZWRcIik7dmFyIGY9ZC53cml0ZSxnPXtYOnAscmE6ITAsa2E6ITAscGI6ITEsaGM6ITEscWE6ITEsdmI6ITEsRzohMSxWYzpkLnJlYWQsbGI6Y3x8ZC5vd25lcixsOmQuZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkfHxkLmx8fG51bGwsU2E6ZC5kaXNwb3NlV2hlbnx8ZC5TYSxRYjpudWxsLEY6e30sVjowLEhjOm51bGx9O2VbdF09ZztlLk1jPVwiZnVuY3Rpb25cIj09PXR5cGVvZiBmO2EuYS5CYXx8YS5hLmV4dGVuZChlLGEuUi5mbik7YS5SLmZuLm9iKGUpO2EuYS56YihlLEMpO2QucHVyZT8oZy52Yj0hMCxnLkc9ITAsXG5hLmEuZXh0ZW5kKGUsZGEpKTpkLmRlZmVyRXZhbHVhdGlvbiYmYS5hLmV4dGVuZChlLGVhKTthLm9wdGlvbnMuZGVmZXJVcGRhdGVzJiZhLlRhLmRlZmVycmVkKGUsITApO2cubCYmKGcuaGM9ITAsZy5sLm5vZGVUeXBlfHwoZy5sPW51bGwpKTtnLkd8fGQuZGVmZXJFdmFsdWF0aW9ufHxlLmhhKCk7Zy5sJiZlLmphKCkmJmEuYS5JLnphKGcubCxnLlFiPWZ1bmN0aW9uKCl7ZS5zKCl9KTtyZXR1cm4gZX07dmFyIEM9e2VxdWFsaXR5Q29tcGFyZXI6SyxwYTpmdW5jdGlvbigpe3JldHVybiB0aGlzW3RdLlZ9LFZhOmZ1bmN0aW9uKCl7dmFyIGI9W107YS5hLk8odGhpc1t0XS5GLGZ1bmN0aW9uKGEsZCl7YltkLkxhXT1kLmRhfSk7cmV0dXJuIGJ9LFViOmZ1bmN0aW9uKGIpe2lmKCF0aGlzW3RdLlYpcmV0dXJuITE7dmFyIGM9dGhpcy5WYSgpO3JldHVybi0xIT09YS5hLkEoYyxiKT8hMDohIWEuYS5MYihjLGZ1bmN0aW9uKGEpe3JldHVybiBhLlViJiZhLlViKGIpfSl9LHRjOmZ1bmN0aW9uKGEsXG5jLGQpe2lmKHRoaXNbdF0udmImJmM9PT10aGlzKXRocm93IEVycm9yKFwiQSAncHVyZScgY29tcHV0ZWQgbXVzdCBub3QgYmUgY2FsbGVkIHJlY3Vyc2l2ZWx5XCIpO3RoaXNbdF0uRlthXT1kO2QuTGE9dGhpc1t0XS5WKys7ZC5NYT1jLm1iKCl9LFhhOmZ1bmN0aW9uKCl7dmFyIGEsYyxkPXRoaXNbdF0uRjtmb3IoYSBpbiBkKWlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkLGEpJiYoYz1kW2FdLHRoaXMuSmEmJmMuZGEuS2F8fGMuZGEuQ2QoYy5NYSkpKXJldHVybiEwfSxJZDpmdW5jdGlvbigpe3RoaXMuSmEmJiF0aGlzW3RdLnBiJiZ0aGlzLkphKCExKX0samE6ZnVuY3Rpb24oKXt2YXIgYT10aGlzW3RdO3JldHVybiBhLmthfHwwPGEuVn0sUWQ6ZnVuY3Rpb24oKXt0aGlzLkthP3RoaXNbdF0ua2EmJih0aGlzW3RdLnJhPSEwKTp0aGlzLkdjKCl9LFpjOmZ1bmN0aW9uKGEpe2lmKGEuSGIpe3ZhciBjPWEuc3Vic2NyaWJlKHRoaXMuSWQsdGhpcyxcImRpcnR5XCIpLFxuZD1hLnN1YnNjcmliZSh0aGlzLlFkLHRoaXMpO3JldHVybntkYTphLHM6ZnVuY3Rpb24oKXtjLnMoKTtkLnMoKX19fXJldHVybiBhLnN1YnNjcmliZSh0aGlzLkdjLHRoaXMpfSxHYzpmdW5jdGlvbigpe3ZhciBiPXRoaXMsYz1iLnRocm90dGxlRXZhbHVhdGlvbjtjJiYwPD1jPyhjbGVhclRpbWVvdXQodGhpc1t0XS5IYyksdGhpc1t0XS5IYz1hLmEuc2V0VGltZW91dChmdW5jdGlvbigpe2IuaGEoITApfSxjKSk6Yi5KYT9iLkphKCEwKTpiLmhhKCEwKX0saGE6ZnVuY3Rpb24oYil7dmFyIGM9dGhpc1t0XSxkPWMuU2EsZT0hMTtpZighYy5wYiYmIWMucWEpe2lmKGMubCYmIWEuYS5SYihjLmwpfHxkJiZkKCkpe2lmKCFjLmhjKXt0aGlzLnMoKTtyZXR1cm59fWVsc2UgYy5oYz0hMTtjLnBiPSEwO3RyeXtlPXRoaXMueWQoYil9ZmluYWxseXtjLnBiPSExfXJldHVybiBlfX0seWQ6ZnVuY3Rpb24oYil7dmFyIGM9dGhpc1t0XSxkPSExLGU9Yy52Yj9wOiFjLlYsZD17cGQ6dGhpcyxrYjpjLkYsXG5QYjpjLlZ9O2Eudi53Yyh7b2Q6ZCxuZDpiYSxvOnRoaXMscmI6ZX0pO2MuRj17fTtjLlY9MDt2YXIgZj10aGlzLnhkKGMsZCk7Yy5WP2Q9dGhpcy5xYihjLlgsZik6KHRoaXMucygpLGQ9ITApO2QmJihjLkc/dGhpcy5HYigpOnRoaXMubm90aWZ5U3Vic2NyaWJlcnMoYy5YLFwiYmVmb3JlQ2hhbmdlXCIpLGMuWD1mLHRoaXMubm90aWZ5U3Vic2NyaWJlcnMoYy5YLFwic3BlY3RhdGVcIiksIWMuRyYmYiYmdGhpcy5ub3RpZnlTdWJzY3JpYmVycyhjLlgpLHRoaXMucWMmJnRoaXMucWMoKSk7ZSYmdGhpcy5ub3RpZnlTdWJzY3JpYmVycyhjLlgsXCJhd2FrZVwiKTtyZXR1cm4gZH0seGQ6ZnVuY3Rpb24oYixjKXt0cnl7dmFyIGQ9Yi5WYztyZXR1cm4gYi5sYj9kLmNhbGwoYi5sYik6ZCgpfWZpbmFsbHl7YS52LmVuZCgpLGMuUGImJiFiLkcmJmEuYS5PKGMua2IsYWEpLGIucmE9Yi5rYT0hMX19LHc6ZnVuY3Rpb24oYSl7dmFyIGM9dGhpc1t0XTsoYy5rYSYmKGF8fCFjLlYpfHxjLkcmJnRoaXMuWGEoKSkmJlxudGhpcy5oYSgpO3JldHVybiBjLlh9LHRiOmZ1bmN0aW9uKGIpe2EuUi5mbi50Yi5jYWxsKHRoaXMsYik7dGhpcy5tYz1mdW5jdGlvbigpe3RoaXNbdF0uR3x8KHRoaXNbdF0ucmE/dGhpcy5oYSgpOnRoaXNbdF0ua2E9ITEpO3JldHVybiB0aGlzW3RdLlh9O3RoaXMuSmE9ZnVuY3Rpb24oYSl7dGhpcy5vYyh0aGlzW3RdLlgpO3RoaXNbdF0ua2E9ITA7YSYmKHRoaXNbdF0ucmE9ITApO3RoaXMucGModGhpcywhYSl9fSxzOmZ1bmN0aW9uKCl7dmFyIGI9dGhpc1t0XTshYi5HJiZiLkYmJmEuYS5PKGIuRixmdW5jdGlvbihhLGIpe2IucyYmYi5zKCl9KTtiLmwmJmIuUWImJmEuYS5JLnhiKGIubCxiLlFiKTtiLkY9cDtiLlY9MDtiLnFhPSEwO2IucmE9ITE7Yi5rYT0hMTtiLkc9ITE7Yi5sPXA7Yi5TYT1wO2IuVmM9cDt0aGlzLk1jfHwoYi5sYj1wKX19LGRhPXtRYTpmdW5jdGlvbihiKXt2YXIgYz10aGlzLGQ9Y1t0XTtpZighZC5xYSYmZC5HJiZcImNoYW5nZVwiPT1iKXtkLkc9ITE7aWYoZC5yYXx8XG5jLlhhKCkpZC5GPW51bGwsZC5WPTAsYy5oYSgpJiZjLkdiKCk7ZWxzZXt2YXIgZT1bXTthLmEuTyhkLkYsZnVuY3Rpb24oYSxiKXtlW2IuTGFdPWF9KTthLmEuQyhlLGZ1bmN0aW9uKGEsYil7dmFyIGU9ZC5GW2FdLG09Yy5aYyhlLmRhKTttLkxhPWI7bS5NYT1lLk1hO2QuRlthXT1tfSk7Yy5YYSgpJiZjLmhhKCkmJmMuR2IoKX1kLnFhfHxjLm5vdGlmeVN1YnNjcmliZXJzKGQuWCxcImF3YWtlXCIpfX0sY2I6ZnVuY3Rpb24oYil7dmFyIGM9dGhpc1t0XTtjLnFhfHxcImNoYW5nZVwiIT1ifHx0aGlzLldhKFwiY2hhbmdlXCIpfHwoYS5hLk8oYy5GLGZ1bmN0aW9uKGEsYil7Yi5zJiYoYy5GW2FdPXtkYTpiLmRhLExhOmIuTGEsTWE6Yi5NYX0sYi5zKCkpfSksYy5HPSEwLHRoaXMubm90aWZ5U3Vic2NyaWJlcnMocCxcImFzbGVlcFwiKSl9LG1iOmZ1bmN0aW9uKCl7dmFyIGI9dGhpc1t0XTtiLkcmJihiLnJhfHx0aGlzLlhhKCkpJiZ0aGlzLmhhKCk7cmV0dXJuIGEuUi5mbi5tYi5jYWxsKHRoaXMpfX0sXG5lYT17UWE6ZnVuY3Rpb24oYSl7XCJjaGFuZ2VcIiE9YSYmXCJiZWZvcmVDaGFuZ2VcIiE9YXx8dGhpcy53KCl9fTthLmEuQmEmJmEuYS5zZXRQcm90b3R5cGVPZihDLGEuUi5mbik7dmFyIE49YS5zYS5OYTtDW05dPWEubzthLk5jPWZ1bmN0aW9uKGEpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIGEmJmFbTl09PT1DW05dfTthLkVkPWZ1bmN0aW9uKGIpe3JldHVybiBhLk5jKGIpJiZiW3RdJiZiW3RdLnZifTthLmIoXCJjb21wdXRlZFwiLGEubyk7YS5iKFwiZGVwZW5kZW50T2JzZXJ2YWJsZVwiLGEubyk7YS5iKFwiaXNDb21wdXRlZFwiLGEuTmMpO2EuYihcImlzUHVyZUNvbXB1dGVkXCIsYS5FZCk7YS5iKFwiY29tcHV0ZWQuZm5cIixDKTthLkooQyxcInBlZWtcIixDLncpO2EuSihDLFwiZGlzcG9zZVwiLEMucyk7YS5KKEMsXCJpc0FjdGl2ZVwiLEMuamEpO2EuSihDLFwiZ2V0RGVwZW5kZW5jaWVzQ291bnRcIixDLnBhKTthLkooQyxcImdldERlcGVuZGVuY2llc1wiLEMuVmEpO2Eud2I9ZnVuY3Rpb24oYixjKXtpZihcImZ1bmN0aW9uXCI9PT1cbnR5cGVvZiBiKXJldHVybiBhLm8oYixjLHtwdXJlOiEwfSk7Yj1hLmEuZXh0ZW5kKHt9LGIpO2IucHVyZT0hMDtyZXR1cm4gYS5vKGIsYyl9O2EuYihcInB1cmVDb21wdXRlZFwiLGEud2IpOyhmdW5jdGlvbigpe2Z1bmN0aW9uIGIoYSxmLGcpe2c9Z3x8bmV3IGQ7YT1mKGEpO2lmKFwib2JqZWN0XCIhPXR5cGVvZiBhfHxudWxsPT09YXx8YT09PXB8fGEgaW5zdGFuY2VvZiBSZWdFeHB8fGEgaW5zdGFuY2VvZiBEYXRlfHxhIGluc3RhbmNlb2YgU3RyaW5nfHxhIGluc3RhbmNlb2YgTnVtYmVyfHxhIGluc3RhbmNlb2YgQm9vbGVhbilyZXR1cm4gYTt2YXIgaD1hIGluc3RhbmNlb2YgQXJyYXk/W106e307Zy5zYXZlKGEsaCk7YyhhLGZ1bmN0aW9uKGMpe3ZhciBkPWYoYVtjXSk7c3dpdGNoKHR5cGVvZiBkKXtjYXNlIFwiYm9vbGVhblwiOmNhc2UgXCJudW1iZXJcIjpjYXNlIFwic3RyaW5nXCI6Y2FzZSBcImZ1bmN0aW9uXCI6aFtjXT1kO2JyZWFrO2Nhc2UgXCJvYmplY3RcIjpjYXNlIFwidW5kZWZpbmVkXCI6dmFyIGs9XG5nLmdldChkKTtoW2NdPWshPT1wP2s6YihkLGYsZyl9fSk7cmV0dXJuIGh9ZnVuY3Rpb24gYyhhLGIpe2lmKGEgaW5zdGFuY2VvZiBBcnJheSl7Zm9yKHZhciBjPTA7YzxhLmxlbmd0aDtjKyspYihjKTtcImZ1bmN0aW9uXCI9PXR5cGVvZiBhLnRvSlNPTiYmYihcInRvSlNPTlwiKX1lbHNlIGZvcihjIGluIGEpYihjKX1mdW5jdGlvbiBkKCl7dGhpcy5rZXlzPVtdO3RoaXMudmFsdWVzPVtdfWEuJGM9ZnVuY3Rpb24oYyl7aWYoMD09YXJndW1lbnRzLmxlbmd0aCl0aHJvdyBFcnJvcihcIldoZW4gY2FsbGluZyBrby50b0pTLCBwYXNzIHRoZSBvYmplY3QgeW91IHdhbnQgdG8gY29udmVydC5cIik7cmV0dXJuIGIoYyxmdW5jdGlvbihiKXtmb3IodmFyIGM9MDthLk4oYikmJjEwPmM7YysrKWI9YigpO3JldHVybiBifSl9O2EudG9KU09OPWZ1bmN0aW9uKGIsYyxkKXtiPWEuJGMoYik7cmV0dXJuIGEuYS5mYyhiLGMsZCl9O2QucHJvdG90eXBlPXtjb25zdHJ1Y3RvcjpkLHNhdmU6ZnVuY3Rpb24oYixcbmMpe3ZhciBkPWEuYS5BKHRoaXMua2V5cyxiKTswPD1kP3RoaXMudmFsdWVzW2RdPWM6KHRoaXMua2V5cy5wdXNoKGIpLHRoaXMudmFsdWVzLnB1c2goYykpfSxnZXQ6ZnVuY3Rpb24oYil7Yj1hLmEuQSh0aGlzLmtleXMsYik7cmV0dXJuIDA8PWI/dGhpcy52YWx1ZXNbYl06cH19fSkoKTthLmIoXCJ0b0pTXCIsYS4kYyk7YS5iKFwidG9KU09OXCIsYS50b0pTT04pO2EuVmQ9ZnVuY3Rpb24oYixjLGQpe2Z1bmN0aW9uIGUoYyl7dmFyIGU9YS53YihiLGQpLmV4dGVuZCh7R2E6XCJhbHdheXNcIn0pLGg9ZS5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7YSYmKGgucygpLGMoYSkpfSk7ZS5ub3RpZnlTdWJzY3JpYmVycyhlLncoKSk7cmV0dXJuIGh9cmV0dXJuXCJmdW5jdGlvblwiIT09dHlwZW9mIFByb21pc2V8fGM/ZShjLmJpbmQoZCkpOm5ldyBQcm9taXNlKGUpfTthLmIoXCJ3aGVuXCIsYS5WZCk7KGZ1bmN0aW9uKCl7YS51PXtMOmZ1bmN0aW9uKGIpe3N3aXRjaChhLmEuUChiKSl7Y2FzZSBcIm9wdGlvblwiOnJldHVybiEwPT09XG5iLl9fa29fX2hhc0RvbURhdGFPcHRpb25WYWx1ZV9fP2EuYS5nLmdldChiLGEuZi5vcHRpb25zLlliKTo3Pj1hLmEuVz9iLmdldEF0dHJpYnV0ZU5vZGUoXCJ2YWx1ZVwiKSYmYi5nZXRBdHRyaWJ1dGVOb2RlKFwidmFsdWVcIikuc3BlY2lmaWVkP2IudmFsdWU6Yi50ZXh0OmIudmFsdWU7Y2FzZSBcInNlbGVjdFwiOnJldHVybiAwPD1iLnNlbGVjdGVkSW5kZXg/YS51LkwoYi5vcHRpb25zW2Iuc2VsZWN0ZWRJbmRleF0pOnA7ZGVmYXVsdDpyZXR1cm4gYi52YWx1ZX19LHlhOmZ1bmN0aW9uKGIsYyxkKXtzd2l0Y2goYS5hLlAoYikpe2Nhc2UgXCJvcHRpb25cIjpcInN0cmluZ1wiPT09dHlwZW9mIGM/KGEuYS5nLnNldChiLGEuZi5vcHRpb25zLlliLHApLFwiX19rb19faGFzRG9tRGF0YU9wdGlvblZhbHVlX19cImluIGImJmRlbGV0ZSBiLl9fa29fX2hhc0RvbURhdGFPcHRpb25WYWx1ZV9fLGIudmFsdWU9Yyk6KGEuYS5nLnNldChiLGEuZi5vcHRpb25zLlliLGMpLGIuX19rb19faGFzRG9tRGF0YU9wdGlvblZhbHVlX189XG4hMCxiLnZhbHVlPVwibnVtYmVyXCI9PT10eXBlb2YgYz9jOlwiXCIpO2JyZWFrO2Nhc2UgXCJzZWxlY3RcIjppZihcIlwiPT09Y3x8bnVsbD09PWMpYz1wO2Zvcih2YXIgZT0tMSxmPTAsZz1iLm9wdGlvbnMubGVuZ3RoLGg7ZjxnOysrZilpZihoPWEudS5MKGIub3B0aW9uc1tmXSksaD09Y3x8XCJcIj09PWgmJmM9PT1wKXtlPWY7YnJlYWt9aWYoZHx8MDw9ZXx8Yz09PXAmJjE8Yi5zaXplKWIuc2VsZWN0ZWRJbmRleD1lLDY9PT1hLmEuVyYmYS5hLnNldFRpbWVvdXQoZnVuY3Rpb24oKXtiLnNlbGVjdGVkSW5kZXg9ZX0sMCk7YnJlYWs7ZGVmYXVsdDppZihudWxsPT09Y3x8Yz09PXApYz1cIlwiO2IudmFsdWU9Y319fX0pKCk7YS5iKFwic2VsZWN0RXh0ZW5zaW9uc1wiLGEudSk7YS5iKFwic2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWVcIixhLnUuTCk7YS5iKFwic2VsZWN0RXh0ZW5zaW9ucy53cml0ZVZhbHVlXCIsYS51LnlhKTthLm09ZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGIpe2I9YS5hLkNiKGIpOzEyMz09PWIuY2hhckNvZGVBdCgwKSYmXG4oYj1iLnNsaWNlKDEsLTEpKTtiKz1cIlxcbixcIjt2YXIgYz1bXSxkPWIubWF0Y2goZSkscSxuPVtdLGg9MDtpZigxPGQubGVuZ3RoKXtmb3IodmFyIHk9MCxBO0E9ZFt5XTsrK3kpe3ZhciB1PUEuY2hhckNvZGVBdCgwKTtpZig0ND09PXUpe2lmKDA+PWgpe2MucHVzaChxJiZuLmxlbmd0aD97a2V5OnEsdmFsdWU6bi5qb2luKFwiXCIpfTp7dW5rbm93bjpxfHxuLmpvaW4oXCJcIil9KTtxPWg9MDtuPVtdO2NvbnRpbnVlfX1lbHNlIGlmKDU4PT09dSl7aWYoIWgmJiFxJiYxPT09bi5sZW5ndGgpe3E9bi5wb3AoKTtjb250aW51ZX19ZWxzZSBpZig0Nz09PXUmJjE8QS5sZW5ndGgmJig0Nz09PUEuY2hhckNvZGVBdCgxKXx8NDI9PT1BLmNoYXJDb2RlQXQoMSkpKWNvbnRpbnVlO2Vsc2UgNDc9PT11JiZ5JiYxPEEubGVuZ3RoPyh1PWRbeS0xXS5tYXRjaChmKSkmJiFnW3VbMF1dJiYoYj1iLnN1YnN0cihiLmluZGV4T2YoQSkrMSksZD1iLm1hdGNoKGUpLHk9LTEsQT1cIi9cIik6NDA9PT11fHwxMjM9PT1cbnV8fDkxPT09dT8rK2g6NDE9PT11fHwxMjU9PT11fHw5Mz09PXU/LS1oOnF8fG4ubGVuZ3RofHwzNCE9PXUmJjM5IT09dXx8KEE9QS5zbGljZSgxLC0xKSk7bi5wdXNoKEEpfWlmKDA8aCl0aHJvdyBFcnJvcihcIlVuYmFsYW5jZWQgcGFyZW50aGVzZXMsIGJyYWNlcywgb3IgYnJhY2tldHNcIik7fXJldHVybiBjfXZhciBjPVtcInRydWVcIixcImZhbHNlXCIsXCJudWxsXCIsXCJ1bmRlZmluZWRcIl0sZD0vXig/OlskX2Etel1bJFxcd10qfCguKykoXFwuXFxzKlskX2Etel1bJFxcd10qfFxcWy4rXFxdKSkkL2ksZT1SZWdFeHAoXCJcXFwiKD86XFxcXFxcXFwufFteXFxcIl0pKlxcXCJ8Jyg/OlxcXFxcXFxcLnxbXiddKSonfGAoPzpcXFxcXFxcXC58W15gXSkqYHwvXFxcXCooPzpbXipdfFxcXFwqK1teKi9dKSpcXFxcKisvfC8vLipcXG58Lyg/OlxcXFxcXFxcLnxbXi9dKSsvdyp8W15cXFxcczosL11bXixcXFwiJ2B7fSgpLzpbXFxcXF1dKlteXFxcXHMsXFxcIidge30oKS86W1xcXFxdXXxbXlxcXFxzXVwiLFwiZ1wiKSxmPS9bXFxdKVwiJ0EtWmEtejAtOV8kXSskLyxnPXtcImluXCI6MSxcInJldHVyblwiOjEsXG5cInR5cGVvZlwiOjF9LGg9e307cmV0dXJue1JhOltdLHZhOmgsWmI6Yix1YjpmdW5jdGlvbihlLGYpe2Z1bmN0aW9uIGsoYixlKXt2YXIgZjtpZigheSl7dmFyIGw9YS5nZXRCaW5kaW5nSGFuZGxlcihiKTtpZihsJiZsLnByZXByb2Nlc3MmJiEoZT1sLnByZXByb2Nlc3MoZSxiLGspKSlyZXR1cm47aWYobD1oW2JdKWY9ZSwwPD1hLmEuQShjLGYpP2Y9ITE6KGw9Zi5tYXRjaChkKSxmPW51bGw9PT1sPyExOmxbMV0/XCJPYmplY3QoXCIrbFsxXStcIilcIitsWzJdOmYpLGw9ZjtsJiZuLnB1c2goXCInXCIrKFwic3RyaW5nXCI9PXR5cGVvZiBoW2JdP2hbYl06YikrXCInOmZ1bmN0aW9uKF96KXtcIitmK1wiPV96fVwiKX1nJiYoZT1cImZ1bmN0aW9uKCl7cmV0dXJuIFwiK2UrXCIgfVwiKTtxLnB1c2goXCInXCIrYitcIic6XCIrZSl9Zj1mfHx7fTt2YXIgcT1bXSxuPVtdLGc9Zi52YWx1ZUFjY2Vzc29ycyx5PWYuYmluZGluZ1BhcmFtcyxBPVwic3RyaW5nXCI9PT10eXBlb2YgZT9iKGUpOmU7YS5hLkMoQSxmdW5jdGlvbihhKXtrKGEua2V5fHxcbmEudW5rbm93bixhLnZhbHVlKX0pO24ubGVuZ3RoJiZrKFwiX2tvX3Byb3BlcnR5X3dyaXRlcnNcIixcIntcIituLmpvaW4oXCIsXCIpK1wiIH1cIik7cmV0dXJuIHEuam9pbihcIixcIil9LEhkOmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPTA7YzxhLmxlbmd0aDtjKyspaWYoYVtjXS5rZXk9PWIpcmV0dXJuITA7cmV0dXJuITF9LCRhOmZ1bmN0aW9uKGIsYyxkLGUsZil7aWYoYiYmYS5OKGIpKSFhLllhKGIpfHxmJiZiLncoKT09PWV8fGIoZSk7ZWxzZSBpZigoYj1jLmdldChcIl9rb19wcm9wZXJ0eV93cml0ZXJzXCIpKSYmYltkXSliW2RdKGUpfX19KCk7YS5iKFwiZXhwcmVzc2lvblJld3JpdGluZ1wiLGEubSk7YS5iKFwiZXhwcmVzc2lvblJld3JpdGluZy5iaW5kaW5nUmV3cml0ZVZhbGlkYXRvcnNcIixhLm0uUmEpO2EuYihcImV4cHJlc3Npb25SZXdyaXRpbmcucGFyc2VPYmplY3RMaXRlcmFsXCIsYS5tLlpiKTthLmIoXCJleHByZXNzaW9uUmV3cml0aW5nLnByZVByb2Nlc3NCaW5kaW5nc1wiLGEubS51Yik7YS5iKFwiZXhwcmVzc2lvblJld3JpdGluZy5fdHdvV2F5QmluZGluZ3NcIixcbmEubS52YSk7YS5iKFwianNvbkV4cHJlc3Npb25SZXdyaXRpbmdcIixhLm0pO2EuYihcImpzb25FeHByZXNzaW9uUmV3cml0aW5nLmluc2VydFByb3BlcnR5QWNjZXNzb3JzSW50b0pzb25cIixhLm0udWIpOyhmdW5jdGlvbigpe2Z1bmN0aW9uIGIoYSl7cmV0dXJuIDg9PWEubm9kZVR5cGUmJmcudGVzdChmP2EudGV4dDphLm5vZGVWYWx1ZSl9ZnVuY3Rpb24gYyhhKXtyZXR1cm4gOD09YS5ub2RlVHlwZSYmaC50ZXN0KGY/YS50ZXh0OmEubm9kZVZhbHVlKX1mdW5jdGlvbiBkKGQsZSl7Zm9yKHZhciBmPWQsZz0xLGg9W107Zj1mLm5leHRTaWJsaW5nOyl7aWYoYyhmKSYmKGEuYS5nLnNldChmLGwsITApLGctLSwwPT09ZykpcmV0dXJuIGg7aC5wdXNoKGYpO2IoZikmJmcrK31pZighZSl0aHJvdyBFcnJvcihcIkNhbm5vdCBmaW5kIGNsb3NpbmcgY29tbWVudCB0YWcgdG8gbWF0Y2g6IFwiK2Qubm9kZVZhbHVlKTtyZXR1cm4gbnVsbH1mdW5jdGlvbiBlKGEsYil7dmFyIGM9ZChhLGIpO3JldHVybiBjP1xuMDxjLmxlbmd0aD9jW2MubGVuZ3RoLTFdLm5leHRTaWJsaW5nOmEubmV4dFNpYmxpbmc6bnVsbH12YXIgZj13JiZcIlxceDNjIS0tdGVzdC0tXFx4M2VcIj09PXcuY3JlYXRlQ29tbWVudChcInRlc3RcIikudGV4dCxnPWY/L15cXHgzYyEtLVxccyprbyg/OlxccysoW1xcc1xcU10rKSk/XFxzKi0tXFx4M2UkLzovXlxccyprbyg/OlxccysoW1xcc1xcU10rKSk/XFxzKiQvLGg9Zj8vXlxceDNjIS0tXFxzKlxcL2tvXFxzKi0tXFx4M2UkLzovXlxccypcXC9rb1xccyokLyxtPXt1bDohMCxvbDohMH0sbD1cIl9fa29fbWF0Y2hlZEVuZENvbW1lbnRfX1wiO2EuaD17ZWE6e30sY2hpbGROb2RlczpmdW5jdGlvbihhKXtyZXR1cm4gYihhKT9kKGEpOmEuY2hpbGROb2Rlc30sRWE6ZnVuY3Rpb24oYyl7aWYoYihjKSl7Yz1hLmguY2hpbGROb2RlcyhjKTtmb3IodmFyIGQ9MCxlPWMubGVuZ3RoO2Q8ZTtkKyspYS5yZW1vdmVOb2RlKGNbZF0pfWVsc2UgYS5hLlNiKGMpfSx1YTpmdW5jdGlvbihjLGQpe2lmKGIoYykpe2EuaC5FYShjKTtmb3IodmFyIGU9XG5jLm5leHRTaWJsaW5nLGY9MCxsPWQubGVuZ3RoO2Y8bDtmKyspZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkW2ZdLGUpfWVsc2UgYS5hLnVhKGMsZCl9LFVjOmZ1bmN0aW9uKGEsYyl7YihhKT9hLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGMsYS5uZXh0U2libGluZyk6YS5maXJzdENoaWxkP2EuaW5zZXJ0QmVmb3JlKGMsYS5maXJzdENoaWxkKTphLmFwcGVuZENoaWxkKGMpfSxWYjpmdW5jdGlvbihjLGQsZSl7ZT9iKGMpP2MucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZCxlLm5leHRTaWJsaW5nKTplLm5leHRTaWJsaW5nP2MuaW5zZXJ0QmVmb3JlKGQsZS5uZXh0U2libGluZyk6Yy5hcHBlbmRDaGlsZChkKTphLmguVWMoYyxkKX0sZmlyc3RDaGlsZDpmdW5jdGlvbihhKXtpZihiKGEpKXJldHVybiFhLm5leHRTaWJsaW5nfHxjKGEubmV4dFNpYmxpbmcpP251bGw6YS5uZXh0U2libGluZztpZihhLmZpcnN0Q2hpbGQmJmMoYS5maXJzdENoaWxkKSl0aHJvdyBFcnJvcihcIkZvdW5kIGludmFsaWQgZW5kIGNvbW1lbnQsIGFzIHRoZSBmaXJzdCBjaGlsZCBvZiBcIitcbmEpO3JldHVybiBhLmZpcnN0Q2hpbGR9LG5leHRTaWJsaW5nOmZ1bmN0aW9uKGQpe2IoZCkmJihkPWUoZCkpO2lmKGQubmV4dFNpYmxpbmcmJmMoZC5uZXh0U2libGluZykpe3ZhciBmPWQubmV4dFNpYmxpbmc7aWYoYyhmKSYmIWEuYS5nLmdldChmLGwpKXRocm93IEVycm9yKFwiRm91bmQgZW5kIGNvbW1lbnQgd2l0aG91dCBhIG1hdGNoaW5nIG9wZW5pbmcgY29tbWVudCwgYXMgY2hpbGQgb2YgXCIrZCk7cmV0dXJuIG51bGx9cmV0dXJuIGQubmV4dFNpYmxpbmd9LEJkOmIsVWQ6ZnVuY3Rpb24oYSl7cmV0dXJuKGE9KGY/YS50ZXh0OmEubm9kZVZhbHVlKS5tYXRjaChnKSk/YVsxXTpudWxsfSxSYzpmdW5jdGlvbihkKXtpZihtW2EuYS5QKGQpXSl7dmFyIGY9ZC5maXJzdENoaWxkO2lmKGYpe2RvIGlmKDE9PT1mLm5vZGVUeXBlKXt2YXIgbDtsPWYuZmlyc3RDaGlsZDt2YXIgZz1udWxsO2lmKGwpe2RvIGlmKGcpZy5wdXNoKGwpO2Vsc2UgaWYoYihsKSl7dmFyIGg9ZShsLCEwKTtoP2w9XG5oOmc9W2xdfWVsc2UgYyhsKSYmKGc9W2xdKTt3aGlsZShsPWwubmV4dFNpYmxpbmcpfWlmKGw9Zylmb3IoZz1mLm5leHRTaWJsaW5nLGg9MDtoPGwubGVuZ3RoO2grKylnP2QuaW5zZXJ0QmVmb3JlKGxbaF0sZyk6ZC5hcHBlbmRDaGlsZChsW2hdKX13aGlsZShmPWYubmV4dFNpYmxpbmcpfX19fX0pKCk7YS5iKFwidmlydHVhbEVsZW1lbnRzXCIsYS5oKTthLmIoXCJ2aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzXCIsYS5oLmVhKTthLmIoXCJ2aXJ0dWFsRWxlbWVudHMuZW1wdHlOb2RlXCIsYS5oLkVhKTthLmIoXCJ2aXJ0dWFsRWxlbWVudHMuaW5zZXJ0QWZ0ZXJcIixhLmguVmIpO2EuYihcInZpcnR1YWxFbGVtZW50cy5wcmVwZW5kXCIsYS5oLlVjKTthLmIoXCJ2aXJ0dWFsRWxlbWVudHMuc2V0RG9tTm9kZUNoaWxkcmVuXCIsYS5oLnVhKTsoZnVuY3Rpb24oKXthLmdhPWZ1bmN0aW9uKCl7dGhpcy5tZD17fX07YS5hLmV4dGVuZChhLmdhLnByb3RvdHlwZSx7bm9kZUhhc0JpbmRpbmdzOmZ1bmN0aW9uKGIpe3N3aXRjaChiLm5vZGVUeXBlKXtjYXNlIDE6cmV0dXJuIG51bGwhPVxuYi5nZXRBdHRyaWJ1dGUoXCJkYXRhLWJpbmRcIil8fGEuaS5nZXRDb21wb25lbnROYW1lRm9yTm9kZShiKTtjYXNlIDg6cmV0dXJuIGEuaC5CZChiKTtkZWZhdWx0OnJldHVybiExfX0sZ2V0QmluZGluZ3M6ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzLmdldEJpbmRpbmdzU3RyaW5nKGIsYyksZD1kP3RoaXMucGFyc2VCaW5kaW5nc1N0cmluZyhkLGMsYik6bnVsbDtyZXR1cm4gYS5pLnNjKGQsYixjLCExKX0sZ2V0QmluZGluZ0FjY2Vzc29yczpmdW5jdGlvbihiLGMpe3ZhciBkPXRoaXMuZ2V0QmluZGluZ3NTdHJpbmcoYixjKSxkPWQ/dGhpcy5wYXJzZUJpbmRpbmdzU3RyaW5nKGQsYyxiLHt2YWx1ZUFjY2Vzc29yczohMH0pOm51bGw7cmV0dXJuIGEuaS5zYyhkLGIsYywhMCl9LGdldEJpbmRpbmdzU3RyaW5nOmZ1bmN0aW9uKGIpe3N3aXRjaChiLm5vZGVUeXBlKXtjYXNlIDE6cmV0dXJuIGIuZ2V0QXR0cmlidXRlKFwiZGF0YS1iaW5kXCIpO2Nhc2UgODpyZXR1cm4gYS5oLlVkKGIpO2RlZmF1bHQ6cmV0dXJuIG51bGx9fSxcbnBhcnNlQmluZGluZ3NTdHJpbmc6ZnVuY3Rpb24oYixjLGQsZSl7dHJ5e3ZhciBmPXRoaXMubWQsZz1iKyhlJiZlLnZhbHVlQWNjZXNzb3JzfHxcIlwiKSxoO2lmKCEoaD1mW2ddKSl7dmFyIG0sbD1cIndpdGgoJGNvbnRleHQpe3dpdGgoJGRhdGF8fHt9KXtyZXR1cm57XCIrYS5tLnViKGIsZSkrXCJ9fX1cIjttPW5ldyBGdW5jdGlvbihcIiRjb250ZXh0XCIsXCIkZWxlbWVudFwiLGwpO2g9ZltnXT1tfXJldHVybiBoKGMsZCl9Y2F0Y2goayl7dGhyb3cgay5tZXNzYWdlPVwiVW5hYmxlIHRvIHBhcnNlIGJpbmRpbmdzLlxcbkJpbmRpbmdzIHZhbHVlOiBcIitiK1wiXFxuTWVzc2FnZTogXCIray5tZXNzYWdlLGs7fX19KTthLmdhLmluc3RhbmNlPW5ldyBhLmdhfSkoKTthLmIoXCJiaW5kaW5nUHJvdmlkZXJcIixhLmdhKTsoZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGIpe3ZhciBjPShiPWEuYS5nLmdldChiLEIpKSYmYi5NO2MmJihiLk09bnVsbCxjLlNjKCkpfWZ1bmN0aW9uIGMoYyxkLGUpe3RoaXMubm9kZT1jO3RoaXMueGM9XG5kO3RoaXMuaWI9W107dGhpcy5UPSExO2QuTXx8YS5hLkkuemEoYyxiKTtlJiZlLk0mJihlLk0uaWIucHVzaChjKSx0aGlzLktiPWUpfWZ1bmN0aW9uIGQoYSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGF9fWZ1bmN0aW9uIGUoYSl7cmV0dXJuIGEoKX1mdW5jdGlvbiBmKGIpe3JldHVybiBhLmEuSGEoYS52LksoYiksZnVuY3Rpb24oYSxjKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gYigpW2NdfX0pfWZ1bmN0aW9uIGcoYixjLGUpe3JldHVyblwiZnVuY3Rpb25cIj09PXR5cGVvZiBiP2YoYi5iaW5kKG51bGwsYyxlKSk6YS5hLkhhKGIsZCl9ZnVuY3Rpb24gaChhLGIpe3JldHVybiBmKHRoaXMuZ2V0QmluZGluZ3MuYmluZCh0aGlzLGEsYikpfWZ1bmN0aW9uIG0oYixjKXt2YXIgZD1hLmguZmlyc3RDaGlsZChjKTtpZihkKXt2YXIgZSxmPWEuZ2EuaW5zdGFuY2Usaz1mLnByZXByb2Nlc3NOb2RlO2lmKGspe2Zvcig7ZT1kOylkPWEuaC5uZXh0U2libGluZyhlKSxrLmNhbGwoZixlKTtcbmQ9YS5oLmZpcnN0Q2hpbGQoYyl9Zm9yKDtlPWQ7KWQ9YS5oLm5leHRTaWJsaW5nKGUpLGwoYixlKX1hLmouR2EoYyxhLmouVCl9ZnVuY3Rpb24gbChiLGMpe3ZhciBkPWIsZT0xPT09Yy5ub2RlVHlwZTtlJiZhLmguUmMoYyk7aWYoZXx8YS5nYS5pbnN0YW5jZS5ub2RlSGFzQmluZGluZ3MoYykpZD1xKGMsbnVsbCxiKS5iaW5kaW5nQ29udGV4dEZvckRlc2NlbmRhbnRzO2QmJiF1W2EuYS5QKGMpXSYmbShkLGMpfWZ1bmN0aW9uIGsoYil7dmFyIGM9W10sZD17fSxlPVtdO2EuYS5PKGIsZnVuY3Rpb24gY2EoZil7aWYoIWRbZl0pe3ZhciBsPWEuZ2V0QmluZGluZ0hhbmRsZXIoZik7bCYmKGwuYWZ0ZXImJihlLnB1c2goZiksYS5hLkMobC5hZnRlcixmdW5jdGlvbihjKXtpZihiW2NdKXtpZigtMSE9PWEuYS5BKGUsYykpdGhyb3cgRXJyb3IoXCJDYW5ub3QgY29tYmluZSB0aGUgZm9sbG93aW5nIGJpbmRpbmdzLCBiZWNhdXNlIHRoZXkgaGF2ZSBhIGN5Y2xpYyBkZXBlbmRlbmN5OiBcIitlLmpvaW4oXCIsIFwiKSk7XG5jYShjKX19KSxlLmxlbmd0aC0tKSxjLnB1c2goe2tleTpmLExjOmx9KSk7ZFtmXT0hMH19KTtyZXR1cm4gY31mdW5jdGlvbiBxKGIsYyxkKXt2YXIgZj1hLmEuZy5UYihiLEIse30pLGw9Zi5nZDtpZighYyl7aWYobCl0aHJvdyBFcnJvcihcIllvdSBjYW5ub3QgYXBwbHkgYmluZGluZ3MgbXVsdGlwbGUgdGltZXMgdG8gdGhlIHNhbWUgZWxlbWVudC5cIik7Zi5nZD0hMH1sfHwoZi5jb250ZXh0PWQpO3ZhciBnO2lmKGMmJlwiZnVuY3Rpb25cIiE9PXR5cGVvZiBjKWc9YztlbHNle3ZhciBxPWEuZ2EuaW5zdGFuY2Usbj1xLmdldEJpbmRpbmdBY2Nlc3NvcnN8fGgsbT1hLiQoZnVuY3Rpb24oKXtpZihnPWM/YyhkLGIpOm4uY2FsbChxLGIsZCkpe2lmKGRbcl0pZFtyXSgpO2lmKGRbQV0pZFtBXSgpfXJldHVybiBnfSxudWxsLHtsOmJ9KTtnJiZtLmphKCl8fChtPW51bGwpfXZhciB5PWQsdTtpZihnKXt2YXIgSj1mdW5jdGlvbigpe3JldHVybiBhLmEuSGEobT9tKCk6ZyxlKX0sdD1tP2Z1bmN0aW9uKGEpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBlKG0oKVthXSl9fTpcbmZ1bmN0aW9uKGEpe3JldHVybiBnW2FdfTtKLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gZ1thXSYmZSh0KGEpKX07Si5oYXM9ZnVuY3Rpb24oYSl7cmV0dXJuIGEgaW4gZ307YS5qLlQgaW4gZyYmYS5qLnN1YnNjcmliZShiLGEuai5ULGZ1bmN0aW9uKCl7dmFyIGM9KDAsZ1thLmouVF0pKCk7aWYoYyl7dmFyIGQ9YS5oLmNoaWxkTm9kZXMoYik7ZC5sZW5ndGgmJmMoZCxhLkRjKGRbMF0pKX19KTthLmoub2EgaW4gZyYmKHk9YS5qLkJiKGIsZCksYS5qLnN1YnNjcmliZShiLGEuai5vYSxmdW5jdGlvbigpe3ZhciBjPSgwLGdbYS5qLm9hXSkoKTtjJiZhLmguZmlyc3RDaGlsZChiKSYmYyhiKX0pKTtmPWsoZyk7YS5hLkMoZixmdW5jdGlvbihjKXt2YXIgZD1jLkxjLmluaXQsZT1jLkxjLnVwZGF0ZSxmPWMua2V5O2lmKDg9PT1iLm5vZGVUeXBlJiYhYS5oLmVhW2ZdKXRocm93IEVycm9yKFwiVGhlIGJpbmRpbmcgJ1wiK2YrXCInIGNhbm5vdCBiZSB1c2VkIHdpdGggdmlydHVhbCBlbGVtZW50c1wiKTtcbnRyeXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkJiZhLnYuSyhmdW5jdGlvbigpe3ZhciBhPWQoYix0KGYpLEoseS4kZGF0YSx5KTtpZihhJiZhLmNvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzKXtpZih1IT09cCl0aHJvdyBFcnJvcihcIk11bHRpcGxlIGJpbmRpbmdzIChcIit1K1wiIGFuZCBcIitmK1wiKSBhcmUgdHJ5aW5nIHRvIGNvbnRyb2wgZGVzY2VuZGFudCBiaW5kaW5ncyBvZiB0aGUgc2FtZSBlbGVtZW50LiBZb3UgY2Fubm90IHVzZSB0aGVzZSBiaW5kaW5ncyB0b2dldGhlciBvbiB0aGUgc2FtZSBlbGVtZW50LlwiKTt1PWZ9fSksXCJmdW5jdGlvblwiPT10eXBlb2YgZSYmYS4kKGZ1bmN0aW9uKCl7ZShiLHQoZiksSix5LiRkYXRhLHkpfSxudWxsLHtsOmJ9KX1jYXRjaChsKXt0aHJvdyBsLm1lc3NhZ2U9J1VuYWJsZSB0byBwcm9jZXNzIGJpbmRpbmcgXCInK2YrXCI6IFwiK2dbZl0rJ1wiXFxuTWVzc2FnZTogJytsLm1lc3NhZ2UsbDt9fSl9Zj11PT09cDtyZXR1cm57c2hvdWxkQmluZERlc2NlbmRhbnRzOmYsXG5iaW5kaW5nQ29udGV4dEZvckRlc2NlbmRhbnRzOmYmJnl9fWZ1bmN0aW9uIG4oYixjKXtyZXR1cm4gYiYmYiBpbnN0YW5jZW9mIGEuZmE/YjpuZXcgYS5mYShiLHAscCxjKX12YXIgcj1hLmEuRGEoXCJfc3Vic2NyaWJhYmxlXCIpLHk9YS5hLkRhKFwiX2FuY2VzdG9yQmluZGluZ0luZm9cIiksQT1hLmEuRGEoXCJfZGF0YURlcGVuZGVuY3lcIik7YS5mPXt9O3ZhciB1PXtzY3JpcHQ6ITAsdGV4dGFyZWE6ITAsdGVtcGxhdGU6ITB9O2EuZ2V0QmluZGluZ0hhbmRsZXI9ZnVuY3Rpb24oYil7cmV0dXJuIGEuZltiXX07dmFyIEo9e307YS5mYT1mdW5jdGlvbihiLGMsZCxlLGYpe2Z1bmN0aW9uIGwoKXt2YXIgYj1xP2goKTpoLGY9YS5hLmMoYik7Yz8oYS5hLmV4dGVuZChrLGMpLHkgaW4gYyYmKGtbeV09Y1t5XSkpOihrLiRwYXJlbnRzPVtdLGsuJHJvb3Q9ZixrLmtvPWEpO2tbcl09bjtnP2Y9ay4kZGF0YTooay4kcmF3RGF0YT1iLGsuJGRhdGE9Zik7ZCYmKGtbZF09Zik7ZSYmZShrLGMsZik7aWYoYyYmXG5jW3JdJiYhYS5VLm8oKS5VYihjW3JdKSljW3JdKCk7bSYmKGtbQV09bSk7cmV0dXJuIGsuJGRhdGF9dmFyIGs9dGhpcyxnPWI9PT1KLGg9Zz9wOmIscT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBoJiYhYS5OKGgpLG4sbT1mJiZmLmRhdGFEZXBlbmRlbmN5O2YmJmYuZXhwb3J0RGVwZW5kZW5jaWVzP2woKToobj1hLndiKGwpLG4udygpLG4uamEoKT9uLmVxdWFsaXR5Q29tcGFyZXI9bnVsbDprW3JdPXApfTthLmZhLnByb3RvdHlwZS5jcmVhdGVDaGlsZENvbnRleHQ9ZnVuY3Rpb24oYixjLGQsZSl7IWUmJmMmJlwib2JqZWN0XCI9PXR5cGVvZiBjJiYoZT1jLGM9ZS5hcyxkPWUuZXh0ZW5kKTtpZihjJiZlJiZlLm5vQ2hpbGRDb250ZXh0KXt2YXIgZj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBiJiYhYS5OKGIpO3JldHVybiBuZXcgYS5mYShKLHRoaXMsbnVsbCxmdW5jdGlvbihhKXtkJiZkKGEpO2FbY109Zj9iKCk6Yn0sZSl9cmV0dXJuIG5ldyBhLmZhKGIsdGhpcyxjLGZ1bmN0aW9uKGEsYil7YS4kcGFyZW50Q29udGV4dD1cbmI7YS4kcGFyZW50PWIuJGRhdGE7YS4kcGFyZW50cz0oYi4kcGFyZW50c3x8W10pLnNsaWNlKDApO2EuJHBhcmVudHMudW5zaGlmdChhLiRwYXJlbnQpO2QmJmQoYSl9LGUpfTthLmZhLnByb3RvdHlwZS5leHRlbmQ9ZnVuY3Rpb24oYixjKXtyZXR1cm4gbmV3IGEuZmEoSix0aGlzLG51bGwsZnVuY3Rpb24oYyl7YS5hLmV4dGVuZChjLFwiZnVuY3Rpb25cIj09dHlwZW9mIGI/YihjKTpiKX0sYyl9O3ZhciBCPWEuYS5nLlooKTtjLnByb3RvdHlwZS5TYz1mdW5jdGlvbigpe3RoaXMuS2ImJnRoaXMuS2IuTSYmdGhpcy5LYi5NLnJkKHRoaXMubm9kZSl9O2MucHJvdG90eXBlLnJkPWZ1bmN0aW9uKGIpe2EuYS5oYih0aGlzLmliLGIpOyF0aGlzLmliLmxlbmd0aCYmdGhpcy5UJiZ0aGlzLkJjKCl9O2MucHJvdG90eXBlLkJjPWZ1bmN0aW9uKCl7dGhpcy5UPSEwO3RoaXMueGMuTSYmIXRoaXMuaWIubGVuZ3RoJiYodGhpcy54Yy5NPW51bGwsYS5hLkkueGIodGhpcy5ub2RlLGIpLGEuai5HYSh0aGlzLm5vZGUsXG5hLmoub2EpLHRoaXMuU2MoKSl9O2Euaj17VDpcImNoaWxkcmVuQ29tcGxldGVcIixvYTpcImRlc2NlbmRhbnRzQ29tcGxldGVcIixzdWJzY3JpYmU6ZnVuY3Rpb24oYixjLGQsZSl7Yj1hLmEuZy5UYihiLEIse30pO2IuRmF8fChiLkZhPW5ldyBhLlIpO3JldHVybiBiLkZhLnN1YnNjcmliZShkLGUsYyl9LEdhOmZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5hLmcuZ2V0KGIsQik7aWYoZCYmKGQuRmEmJmQuRmEubm90aWZ5U3Vic2NyaWJlcnMoYixjKSxjPT1hLmouVCkpaWYoZC5NKWQuTS5CYygpO2Vsc2UgaWYoZC5NPT09cCYmZC5GYSYmZC5GYS5XYShhLmoub2EpKXRocm93IEVycm9yKFwiZGVzY2VuZGFudHNDb21wbGV0ZSBldmVudCBub3Qgc3VwcG9ydGVkIGZvciBiaW5kaW5ncyBvbiB0aGlzIG5vZGVcIik7fSxCYjpmdW5jdGlvbihiLGQpe3ZhciBlPWEuYS5nLlRiKGIsQix7fSk7ZS5NfHwoZS5NPW5ldyBjKGIsZSxkW3ldKSk7cmV0dXJuIGRbeV09PWU/ZDpkLmV4dGVuZChmdW5jdGlvbihhKXthW3ldPVxuZX0pfX07YS5TZD1mdW5jdGlvbihiKXtyZXR1cm4oYj1hLmEuZy5nZXQoYixCKSkmJmIuY29udGV4dH07YS5lYj1mdW5jdGlvbihiLGMsZCl7MT09PWIubm9kZVR5cGUmJmEuaC5SYyhiKTtyZXR1cm4gcShiLGMsbihkKSl9O2Eua2Q9ZnVuY3Rpb24oYixjLGQpe2Q9bihkKTtyZXR1cm4gYS5lYihiLGcoYyxkLGIpLGQpfTthLlBhPWZ1bmN0aW9uKGEsYil7MSE9PWIubm9kZVR5cGUmJjghPT1iLm5vZGVUeXBlfHxtKG4oYSksYil9O2EudWM9ZnVuY3Rpb24oYSxiLGMpeyF2JiZ6LmpRdWVyeSYmKHY9ei5qUXVlcnkpO2lmKDI+YXJndW1lbnRzLmxlbmd0aCl7aWYoYj13LmJvZHksIWIpdGhyb3cgRXJyb3IoXCJrby5hcHBseUJpbmRpbmdzOiBjb3VsZCBub3QgZmluZCBkb2N1bWVudC5ib2R5OyBoYXMgdGhlIGRvY3VtZW50IGJlZW4gbG9hZGVkP1wiKTt9ZWxzZSBpZighYnx8MSE9PWIubm9kZVR5cGUmJjghPT1iLm5vZGVUeXBlKXRocm93IEVycm9yKFwia28uYXBwbHlCaW5kaW5nczogZmlyc3QgcGFyYW1ldGVyIHNob3VsZCBiZSB5b3VyIHZpZXcgbW9kZWw7IHNlY29uZCBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgRE9NIG5vZGVcIik7XG5sKG4oYSxjKSxiKX07YS5DYz1mdW5jdGlvbihiKXtyZXR1cm4hYnx8MSE9PWIubm9kZVR5cGUmJjghPT1iLm5vZGVUeXBlP3A6YS5TZChiKX07YS5EYz1mdW5jdGlvbihiKXtyZXR1cm4oYj1hLkNjKGIpKT9iLiRkYXRhOnB9O2EuYihcImJpbmRpbmdIYW5kbGVyc1wiLGEuZik7YS5iKFwiYmluZGluZ0V2ZW50XCIsYS5qKTthLmIoXCJiaW5kaW5nRXZlbnQuc3Vic2NyaWJlXCIsYS5qLnN1YnNjcmliZSk7YS5iKFwiYmluZGluZ0V2ZW50LnN0YXJ0UG9zc2libHlBc3luY0NvbnRlbnRCaW5kaW5nXCIsYS5qLkJiKTthLmIoXCJhcHBseUJpbmRpbmdzXCIsYS51Yyk7YS5iKFwiYXBwbHlCaW5kaW5nc1RvRGVzY2VuZGFudHNcIixhLlBhKTthLmIoXCJhcHBseUJpbmRpbmdBY2Nlc3NvcnNUb05vZGVcIixhLmViKTthLmIoXCJhcHBseUJpbmRpbmdzVG9Ob2RlXCIsYS5rZCk7YS5iKFwiY29udGV4dEZvclwiLGEuQ2MpO2EuYihcImRhdGFGb3JcIixhLkRjKX0pKCk7KGZ1bmN0aW9uKGIpe2Z1bmN0aW9uIGMoYyxlKXt2YXIgbD1cbk9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChmLGMpP2ZbY106YixrO2w/bC5zdWJzY3JpYmUoZSk6KGw9ZltjXT1uZXcgYS5SLGwuc3Vic2NyaWJlKGUpLGQoYyxmdW5jdGlvbihiLGQpe3ZhciBlPSEoIWR8fCFkLnN5bmNocm9ub3VzKTtnW2NdPXtkZWZpbml0aW9uOmIsRmQ6ZX07ZGVsZXRlIGZbY107a3x8ZT9sLm5vdGlmeVN1YnNjcmliZXJzKGIpOmEubWEueWIoZnVuY3Rpb24oKXtsLm5vdGlmeVN1YnNjcmliZXJzKGIpfSl9KSxrPSEwKX1mdW5jdGlvbiBkKGEsYil7ZShcImdldENvbmZpZ1wiLFthXSxmdW5jdGlvbihjKXtjP2UoXCJsb2FkQ29tcG9uZW50XCIsW2EsY10sZnVuY3Rpb24oYSl7YihhLGMpfSk6YihudWxsLG51bGwpfSl9ZnVuY3Rpb24gZShjLGQsZixrKXtrfHwoaz1hLmkubG9hZGVycy5zbGljZSgwKSk7dmFyIGc9ay5zaGlmdCgpO2lmKGcpe3ZhciBuPWdbY107aWYobil7dmFyIHI9ITE7aWYobi5hcHBseShnLGQuY29uY2F0KGZ1bmN0aW9uKGEpe3I/XG5mKG51bGwpOm51bGwhPT1hP2YoYSk6ZShjLGQsZixrKX0pKSE9PWImJihyPSEwLCFnLnN1cHByZXNzTG9hZGVyRXhjZXB0aW9ucykpdGhyb3cgRXJyb3IoXCJDb21wb25lbnQgbG9hZGVycyBtdXN0IHN1cHBseSB2YWx1ZXMgYnkgaW52b2tpbmcgdGhlIGNhbGxiYWNrLCBub3QgYnkgcmV0dXJuaW5nIHZhbHVlcyBzeW5jaHJvbm91c2x5LlwiKTt9ZWxzZSBlKGMsZCxmLGspfWVsc2UgZihudWxsKX12YXIgZj17fSxnPXt9O2EuaT17Z2V0OmZ1bmN0aW9uKGQsZSl7dmFyIGY9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGcsZCk/Z1tkXTpiO2Y/Zi5GZD9hLnYuSyhmdW5jdGlvbigpe2UoZi5kZWZpbml0aW9uKX0pOmEubWEueWIoZnVuY3Rpb24oKXtlKGYuZGVmaW5pdGlvbil9KTpjKGQsZSl9LEFjOmZ1bmN0aW9uKGEpe2RlbGV0ZSBnW2FdfSxuYzplfTthLmkubG9hZGVycz1bXTthLmIoXCJjb21wb25lbnRzXCIsYS5pKTthLmIoXCJjb21wb25lbnRzLmdldFwiLGEuaS5nZXQpO1xuYS5iKFwiY29tcG9uZW50cy5jbGVhckNhY2hlZERlZmluaXRpb25cIixhLmkuQWMpfSkoKTsoZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGIsYyxkLGUpe2Z1bmN0aW9uIGcoKXswPT09LS1BJiZlKGgpfXZhciBoPXt9LEE9Mix1PWQudGVtcGxhdGU7ZD1kLnZpZXdNb2RlbDt1P2YoYyx1LGZ1bmN0aW9uKGMpe2EuaS5uYyhcImxvYWRUZW1wbGF0ZVwiLFtiLGNdLGZ1bmN0aW9uKGEpe2gudGVtcGxhdGU9YTtnKCl9KX0pOmcoKTtkP2YoYyxkLGZ1bmN0aW9uKGMpe2EuaS5uYyhcImxvYWRWaWV3TW9kZWxcIixbYixjXSxmdW5jdGlvbihhKXtoW21dPWE7ZygpfSl9KTpnKCl9ZnVuY3Rpb24gYyhhLGIsZCl7aWYoXCJmdW5jdGlvblwiPT09dHlwZW9mIGIpZChmdW5jdGlvbihhKXtyZXR1cm4gbmV3IGIoYSl9KTtlbHNlIGlmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBiW21dKWQoYlttXSk7ZWxzZSBpZihcImluc3RhbmNlXCJpbiBiKXt2YXIgZT1iLmluc3RhbmNlO2QoZnVuY3Rpb24oKXtyZXR1cm4gZX0pfWVsc2VcInZpZXdNb2RlbFwiaW5cbmI/YyhhLGIudmlld01vZGVsLGQpOmEoXCJVbmtub3duIHZpZXdNb2RlbCB2YWx1ZTogXCIrYil9ZnVuY3Rpb24gZChiKXtzd2l0Y2goYS5hLlAoYikpe2Nhc2UgXCJzY3JpcHRcIjpyZXR1cm4gYS5hLnRhKGIudGV4dCk7Y2FzZSBcInRleHRhcmVhXCI6cmV0dXJuIGEuYS50YShiLnZhbHVlKTtjYXNlIFwidGVtcGxhdGVcIjppZihlKGIuY29udGVudCkpcmV0dXJuIGEuYS5DYShiLmNvbnRlbnQuY2hpbGROb2Rlcyl9cmV0dXJuIGEuYS5DYShiLmNoaWxkTm9kZXMpfWZ1bmN0aW9uIGUoYSl7cmV0dXJuIHouRG9jdW1lbnRGcmFnbWVudD9hIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudDphJiYxMT09PWEubm9kZVR5cGV9ZnVuY3Rpb24gZihhLGIsYyl7XCJzdHJpbmdcIj09PXR5cGVvZiBiLnJlcXVpcmU/VHx8ei5yZXF1aXJlPyhUfHx6LnJlcXVpcmUpKFtiLnJlcXVpcmVdLGMpOmEoXCJVc2VzIHJlcXVpcmUsIGJ1dCBubyBBTUQgbG9hZGVyIGlzIHByZXNlbnRcIik6YyhiKX1mdW5jdGlvbiBnKGEpe3JldHVybiBmdW5jdGlvbihiKXt0aHJvdyBFcnJvcihcIkNvbXBvbmVudCAnXCIrXG5hK1wiJzogXCIrYik7fX12YXIgaD17fTthLmkucmVnaXN0ZXI9ZnVuY3Rpb24oYixjKXtpZighYyl0aHJvdyBFcnJvcihcIkludmFsaWQgY29uZmlndXJhdGlvbiBmb3IgXCIrYik7aWYoYS5pLnNiKGIpKXRocm93IEVycm9yKFwiQ29tcG9uZW50IFwiK2IrXCIgaXMgYWxyZWFkeSByZWdpc3RlcmVkXCIpO2hbYl09Y307YS5pLnNiPWZ1bmN0aW9uKGEpe3JldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaCxhKX07YS5pLnVucmVnaXN0ZXI9ZnVuY3Rpb24oYil7ZGVsZXRlIGhbYl07YS5pLkFjKGIpfTthLmkuRWM9e2dldENvbmZpZzpmdW5jdGlvbihiLGMpe2MoYS5pLnNiKGIpP2hbYl06bnVsbCl9LGxvYWRDb21wb25lbnQ6ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPWcoYSk7ZihlLGMsZnVuY3Rpb24oYyl7YihhLGUsYyxkKX0pfSxsb2FkVGVtcGxhdGU6ZnVuY3Rpb24oYixjLGYpe2I9ZyhiKTtpZihcInN0cmluZ1wiPT09dHlwZW9mIGMpZihhLmEudGEoYykpO2Vsc2UgaWYoYyBpbnN0YW5jZW9mXG5BcnJheSlmKGMpO2Vsc2UgaWYoZShjKSlmKGEuYS5sYShjLmNoaWxkTm9kZXMpKTtlbHNlIGlmKGMuZWxlbWVudClpZihjPWMuZWxlbWVudCx6LkhUTUxFbGVtZW50P2MgaW5zdGFuY2VvZiBIVE1MRWxlbWVudDpjJiZjLnRhZ05hbWUmJjE9PT1jLm5vZGVUeXBlKWYoZChjKSk7ZWxzZSBpZihcInN0cmluZ1wiPT09dHlwZW9mIGMpe3ZhciBoPXcuZ2V0RWxlbWVudEJ5SWQoYyk7aD9mKGQoaCkpOmIoXCJDYW5ub3QgZmluZCBlbGVtZW50IHdpdGggSUQgXCIrYyl9ZWxzZSBiKFwiVW5rbm93biBlbGVtZW50IHR5cGU6IFwiK2MpO2Vsc2UgYihcIlVua25vd24gdGVtcGxhdGUgdmFsdWU6IFwiK2MpfSxsb2FkVmlld01vZGVsOmZ1bmN0aW9uKGEsYixkKXtjKGcoYSksYixkKX19O3ZhciBtPVwiY3JlYXRlVmlld01vZGVsXCI7YS5iKFwiY29tcG9uZW50cy5yZWdpc3RlclwiLGEuaS5yZWdpc3Rlcik7YS5iKFwiY29tcG9uZW50cy5pc1JlZ2lzdGVyZWRcIixhLmkuc2IpO2EuYihcImNvbXBvbmVudHMudW5yZWdpc3RlclwiLFxuYS5pLnVucmVnaXN0ZXIpO2EuYihcImNvbXBvbmVudHMuZGVmYXVsdExvYWRlclwiLGEuaS5FYyk7YS5pLmxvYWRlcnMucHVzaChhLmkuRWMpO2EuaS5jZD1ofSkoKTsoZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGIsZSl7dmFyIGY9Yi5nZXRBdHRyaWJ1dGUoXCJwYXJhbXNcIik7aWYoZil7dmFyIGY9Yy5wYXJzZUJpbmRpbmdzU3RyaW5nKGYsZSxiLHt2YWx1ZUFjY2Vzc29yczohMCxiaW5kaW5nUGFyYW1zOiEwfSksZj1hLmEuSGEoZixmdW5jdGlvbihjKXtyZXR1cm4gYS5vKGMsbnVsbCx7bDpifSl9KSxnPWEuYS5IYShmLGZ1bmN0aW9uKGMpe3ZhciBlPWMudygpO3JldHVybiBjLmphKCk/YS5vKHtyZWFkOmZ1bmN0aW9uKCl7cmV0dXJuIGEuYS5jKGMoKSl9LHdyaXRlOmEuWWEoZSkmJmZ1bmN0aW9uKGEpe2MoKShhKX0sbDpifSk6ZX0pO09iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChnLFwiJHJhd1wiKXx8KGcuJHJhdz1mKTtyZXR1cm4gZ31yZXR1cm57JHJhdzp7fX19YS5pLmdldENvbXBvbmVudE5hbWVGb3JOb2RlPVxuZnVuY3Rpb24oYil7dmFyIGM9YS5hLlAoYik7aWYoYS5pLnNiKGMpJiYoLTEhPWMuaW5kZXhPZihcIi1cIil8fFwiW29iamVjdCBIVE1MVW5rbm93bkVsZW1lbnRdXCI9PVwiXCIrYnx8OD49YS5hLlcmJmIudGFnTmFtZT09PWMpKXJldHVybiBjfTthLmkuc2M9ZnVuY3Rpb24oYyxlLGYsZyl7aWYoMT09PWUubm9kZVR5cGUpe3ZhciBoPWEuaS5nZXRDb21wb25lbnROYW1lRm9yTm9kZShlKTtpZihoKXtjPWN8fHt9O2lmKGMuY29tcG9uZW50KXRocm93IEVycm9yKCdDYW5ub3QgdXNlIHRoZSBcImNvbXBvbmVudFwiIGJpbmRpbmcgb24gYSBjdXN0b20gZWxlbWVudCBtYXRjaGluZyBhIGNvbXBvbmVudCcpO3ZhciBtPXtuYW1lOmgscGFyYW1zOmIoZSxmKX07Yy5jb21wb25lbnQ9Zz9mdW5jdGlvbigpe3JldHVybiBtfTptfX1yZXR1cm4gY307dmFyIGM9bmV3IGEuZ2E7OT5hLmEuVyYmKGEuaS5yZWdpc3Rlcj1mdW5jdGlvbihhKXtyZXR1cm4gZnVuY3Rpb24oYil7cmV0dXJuIGEuYXBwbHkodGhpcyxcbmFyZ3VtZW50cyl9fShhLmkucmVnaXN0ZXIpLHcuY3JlYXRlRG9jdW1lbnRGcmFnbWVudD1mdW5jdGlvbihiKXtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYz1iKCksZj1hLmkuY2QsZztmb3IoZyBpbiBmKTtyZXR1cm4gY319KHcuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCkpfSkoKTsoZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGIsYyxkKXtjPWMudGVtcGxhdGU7aWYoIWMpdGhyb3cgRXJyb3IoXCJDb21wb25lbnQgJ1wiK2IrXCInIGhhcyBubyB0ZW1wbGF0ZVwiKTtiPWEuYS5DYShjKTthLmgudWEoZCxiKX1mdW5jdGlvbiBjKGEsYixjKXt2YXIgZD1hLmNyZWF0ZVZpZXdNb2RlbDtyZXR1cm4gZD9kLmNhbGwoYSxiLGMpOmJ9dmFyIGQ9MDthLmYuY29tcG9uZW50PXtpbml0OmZ1bmN0aW9uKGUsZixnLGgsbSl7ZnVuY3Rpb24gbCgpe3ZhciBhPWsmJmsuZGlzcG9zZTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgYSYmYS5jYWxsKGspO24mJm4ucygpO3E9az1uPW51bGx9dmFyIGsscSxuLHI9YS5hLmxhKGEuaC5jaGlsZE5vZGVzKGUpKTtcbmEuaC5FYShlKTthLmEuSS56YShlLGwpO2EubyhmdW5jdGlvbigpe3ZhciBnPWEuYS5jKGYoKSksaCx1O1wic3RyaW5nXCI9PT10eXBlb2YgZz9oPWc6KGg9YS5hLmMoZy5uYW1lKSx1PWEuYS5jKGcucGFyYW1zKSk7aWYoIWgpdGhyb3cgRXJyb3IoXCJObyBjb21wb25lbnQgbmFtZSBzcGVjaWZpZWRcIik7dmFyIHA9YS5qLkJiKGUsbSksQj1xPSsrZDthLmkuZ2V0KGgsZnVuY3Rpb24oZCl7aWYocT09PUIpe2woKTtpZighZCl0aHJvdyBFcnJvcihcIlVua25vd24gY29tcG9uZW50ICdcIitoK1wiJ1wiKTtiKGgsZCxlKTt2YXIgZj1jKGQsdSx7ZWxlbWVudDplLHRlbXBsYXRlTm9kZXM6cn0pO2Q9cC5jcmVhdGVDaGlsZENvbnRleHQoZix7ZXh0ZW5kOmZ1bmN0aW9uKGEpe2EuJGNvbXBvbmVudD1mO2EuJGNvbXBvbmVudFRlbXBsYXRlTm9kZXM9cn19KTtmJiZmLmtvRGVzY2VuZGFudHNDb21wbGV0ZSYmKG49YS5qLnN1YnNjcmliZShlLGEuai5vYSxmLmtvRGVzY2VuZGFudHNDb21wbGV0ZSxmKSk7XG5rPWY7YS5QYShkLGUpfX0pfSxudWxsLHtsOmV9KTtyZXR1cm57Y29udHJvbHNEZXNjZW5kYW50QmluZGluZ3M6ITB9fX07YS5oLmVhLmNvbXBvbmVudD0hMH0pKCk7dmFyIFY9e1wiY2xhc3NcIjpcImNsYXNzTmFtZVwiLFwiZm9yXCI6XCJodG1sRm9yXCJ9O2EuZi5hdHRyPXt1cGRhdGU6ZnVuY3Rpb24oYixjKXt2YXIgZD1hLmEuYyhjKCkpfHx7fTthLmEuTyhkLGZ1bmN0aW9uKGMsZCl7ZD1hLmEuYyhkKTt2YXIgZz1jLmluZGV4T2YoXCI6XCIpLGc9XCJsb29rdXBOYW1lc3BhY2VVUklcImluIGImJjA8ZyYmYi5sb29rdXBOYW1lc3BhY2VVUkkoYy5zdWJzdHIoMCxnKSksaD0hMT09PWR8fG51bGw9PT1kfHxkPT09cDtoP2c/Yi5yZW1vdmVBdHRyaWJ1dGVOUyhnLGMpOmIucmVtb3ZlQXR0cmlidXRlKGMpOmQ9ZC50b1N0cmluZygpOzg+PWEuYS5XJiZjIGluIFY/KGM9VltjXSxoP2IucmVtb3ZlQXR0cmlidXRlKGMpOmJbY109ZCk6aHx8KGc/Yi5zZXRBdHRyaWJ1dGVOUyhnLGMsZCk6Yi5zZXRBdHRyaWJ1dGUoYyxcbmQpKTtcIm5hbWVcIj09PWMmJmEuYS5YYyhiLGg/XCJcIjpkKX0pfX07KGZ1bmN0aW9uKCl7YS5mLmNoZWNrZWQ9e2FmdGVyOltcInZhbHVlXCIsXCJhdHRyXCJdLGluaXQ6ZnVuY3Rpb24oYixjLGQpe2Z1bmN0aW9uIGUoKXt2YXIgZT1iLmNoZWNrZWQsZj1nKCk7aWYoIWEuVS5yYigpJiYoZXx8IW0mJiFhLlUucGEoKSkpe3ZhciBsPWEudi5LKGMpO2lmKGspe3ZhciBuPXE/bC53KCk6bCxCPXI7cj1mO0IhPT1mP2UmJihhLmEuT2EobixmLCEwKSxhLmEuT2EobixCLCExKSk6YS5hLk9hKG4sZixlKTtxJiZhLllhKGwpJiZsKG4pfWVsc2UgaCYmKGY9PT1wP2Y9ZTplfHwoZj1wKSksYS5tLiRhKGwsZCxcImNoZWNrZWRcIixmLCEwKX19ZnVuY3Rpb24gZigpe3ZhciBkPWEuYS5jKGMoKSksZT1nKCk7az8oYi5jaGVja2VkPTA8PWEuYS5BKGQsZSkscj1lKTpiLmNoZWNrZWQ9aCYmZT09PXA/ISFkOmcoKT09PWR9dmFyIGc9YS53YihmdW5jdGlvbigpe2lmKGQuaGFzKFwiY2hlY2tlZFZhbHVlXCIpKXJldHVybiBhLmEuYyhkLmdldChcImNoZWNrZWRWYWx1ZVwiKSk7XG5pZihuKXJldHVybiBkLmhhcyhcInZhbHVlXCIpP2EuYS5jKGQuZ2V0KFwidmFsdWVcIikpOmIudmFsdWV9KSxoPVwiY2hlY2tib3hcIj09Yi50eXBlLG09XCJyYWRpb1wiPT1iLnR5cGU7aWYoaHx8bSl7dmFyIGw9YygpLGs9aCYmYS5hLmMobClpbnN0YW5jZW9mIEFycmF5LHE9IShrJiZsLnB1c2gmJmwuc3BsaWNlKSxuPW18fGsscj1rP2coKTpwO20mJiFiLm5hbWUmJmEuZi51bmlxdWVOYW1lLmluaXQoYixmdW5jdGlvbigpe3JldHVybiEwfSk7YS5vKGUsbnVsbCx7bDpifSk7YS5hLkgoYixcImNsaWNrXCIsZSk7YS5vKGYsbnVsbCx7bDpifSk7bD1wfX19O2EubS52YS5jaGVja2VkPSEwO2EuZi5jaGVja2VkVmFsdWU9e3VwZGF0ZTpmdW5jdGlvbihiLGMpe2IudmFsdWU9YS5hLmMoYygpKX19fSkoKTthLmZbXCJjbGFzc1wiXT17dXBkYXRlOmZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5hLkNiKGEuYS5jKGMoKSkpO2EuYS5FYihiLGIuX19rb19fY3NzVmFsdWUsITEpO2IuX19rb19fY3NzVmFsdWU9ZDthLmEuRWIoYixcbmQsITApfX07YS5mLmNzcz17dXBkYXRlOmZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5hLmMoYygpKTtudWxsIT09ZCYmXCJvYmplY3RcIj09dHlwZW9mIGQ/YS5hLk8oZCxmdW5jdGlvbihjLGQpe2Q9YS5hLmMoZCk7YS5hLkViKGIsYyxkKX0pOmEuZltcImNsYXNzXCJdLnVwZGF0ZShiLGMpfX07YS5mLmVuYWJsZT17dXBkYXRlOmZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5hLmMoYygpKTtkJiZiLmRpc2FibGVkP2IucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIik6ZHx8Yi5kaXNhYmxlZHx8KGIuZGlzYWJsZWQ9ITApfX07YS5mLmRpc2FibGU9e3VwZGF0ZTpmdW5jdGlvbihiLGMpe2EuZi5lbmFibGUudXBkYXRlKGIsZnVuY3Rpb24oKXtyZXR1cm4hYS5hLmMoYygpKX0pfX07YS5mLmV2ZW50PXtpbml0OmZ1bmN0aW9uKGIsYyxkLGUsZil7dmFyIGc9YygpfHx7fTthLmEuTyhnLGZ1bmN0aW9uKGcpe1wic3RyaW5nXCI9PXR5cGVvZiBnJiZhLmEuSChiLGcsZnVuY3Rpb24oYil7dmFyIGwsaz1jKClbZ107XG5pZihrKXt0cnl7dmFyIHE9YS5hLmxhKGFyZ3VtZW50cyk7ZT1mLiRkYXRhO3EudW5zaGlmdChlKTtsPWsuYXBwbHkoZSxxKX1maW5hbGx5eyEwIT09bCYmKGIucHJldmVudERlZmF1bHQ/Yi5wcmV2ZW50RGVmYXVsdCgpOmIucmV0dXJuVmFsdWU9ITEpfSExPT09ZC5nZXQoZytcIkJ1YmJsZVwiKSYmKGIuY2FuY2VsQnViYmxlPSEwLGIuc3RvcFByb3BhZ2F0aW9uJiZiLnN0b3BQcm9wYWdhdGlvbigpKX19KX0pfX07YS5mLmZvcmVhY2g9e1FjOmZ1bmN0aW9uKGIpe3JldHVybiBmdW5jdGlvbigpe3ZhciBjPWIoKSxkPWEuYS4kYihjKTtpZighZHx8XCJudW1iZXJcIj09dHlwZW9mIGQubGVuZ3RoKXJldHVybntmb3JlYWNoOmMsdGVtcGxhdGVFbmdpbmU6YS5iYS5OYX07YS5hLmMoYyk7cmV0dXJue2ZvcmVhY2g6ZC5kYXRhLGFzOmQuYXMsbm9DaGlsZENvbnRleHQ6ZC5ub0NoaWxkQ29udGV4dCxpbmNsdWRlRGVzdHJveWVkOmQuaW5jbHVkZURlc3Ryb3llZCxhZnRlckFkZDpkLmFmdGVyQWRkLFxuYmVmb3JlUmVtb3ZlOmQuYmVmb3JlUmVtb3ZlLGFmdGVyUmVuZGVyOmQuYWZ0ZXJSZW5kZXIsYmVmb3JlTW92ZTpkLmJlZm9yZU1vdmUsYWZ0ZXJNb3ZlOmQuYWZ0ZXJNb3ZlLHRlbXBsYXRlRW5naW5lOmEuYmEuTmF9fX0saW5pdDpmdW5jdGlvbihiLGMpe3JldHVybiBhLmYudGVtcGxhdGUuaW5pdChiLGEuZi5mb3JlYWNoLlFjKGMpKX0sdXBkYXRlOmZ1bmN0aW9uKGIsYyxkLGUsZil7cmV0dXJuIGEuZi50ZW1wbGF0ZS51cGRhdGUoYixhLmYuZm9yZWFjaC5RYyhjKSxkLGUsZil9fTthLm0uUmEuZm9yZWFjaD0hMTthLmguZWEuZm9yZWFjaD0hMDthLmYuaGFzZm9jdXM9e2luaXQ6ZnVuY3Rpb24oYixjLGQpe2Z1bmN0aW9uIGUoZSl7Yi5fX2tvX2hhc2ZvY3VzVXBkYXRpbmc9ITA7dmFyIGY9Yi5vd25lckRvY3VtZW50O2lmKFwiYWN0aXZlRWxlbWVudFwiaW4gZil7dmFyIGc7dHJ5e2c9Zi5hY3RpdmVFbGVtZW50fWNhdGNoKGspe2c9Zi5ib2R5fWU9Zz09PWJ9Zj1jKCk7YS5tLiRhKGYsXG5kLFwiaGFzZm9jdXNcIixlLCEwKTtiLl9fa29faGFzZm9jdXNMYXN0VmFsdWU9ZTtiLl9fa29faGFzZm9jdXNVcGRhdGluZz0hMX12YXIgZj1lLmJpbmQobnVsbCwhMCksZz1lLmJpbmQobnVsbCwhMSk7YS5hLkgoYixcImZvY3VzXCIsZik7YS5hLkgoYixcImZvY3VzaW5cIixmKTthLmEuSChiLFwiYmx1clwiLGcpO2EuYS5IKGIsXCJmb2N1c291dFwiLGcpO2IuX19rb19oYXNmb2N1c0xhc3RWYWx1ZT0hMX0sdXBkYXRlOmZ1bmN0aW9uKGIsYyl7dmFyIGQ9ISFhLmEuYyhjKCkpO2IuX19rb19oYXNmb2N1c1VwZGF0aW5nfHxiLl9fa29faGFzZm9jdXNMYXN0VmFsdWU9PT1kfHwoZD9iLmZvY3VzKCk6Yi5ibHVyKCksIWQmJmIuX19rb19oYXNmb2N1c0xhc3RWYWx1ZSYmYi5vd25lckRvY3VtZW50LmJvZHkuZm9jdXMoKSxhLnYuSyhhLmEuRmIsbnVsbCxbYixkP1wiZm9jdXNpblwiOlwiZm9jdXNvdXRcIl0pKX19O2EubS52YS5oYXNmb2N1cz0hMDthLmYuaGFzRm9jdXM9YS5mLmhhc2ZvY3VzO2EubS52YS5oYXNGb2N1cz1cblwiaGFzZm9jdXNcIjthLmYuaHRtbD17aW5pdDpmdW5jdGlvbigpe3JldHVybntjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5nczohMH19LHVwZGF0ZTpmdW5jdGlvbihiLGMpe2EuYS5kYyhiLGMoKSl9fTsoZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGIsZCxlKXthLmZbYl09e2luaXQ6ZnVuY3Rpb24oYixjLGgsbSxsKXt2YXIgayxxLG49e30scixwLEE7aWYoZCl7bT1oLmdldChcImFzXCIpO3ZhciB1PWguZ2V0KFwibm9DaGlsZENvbnRleHRcIik7QT0hKG0mJnUpO249e2FzOm0sbm9DaGlsZENvbnRleHQ6dSxleHBvcnREZXBlbmRlbmNpZXM6QX19cD0ocj1cInJlbmRlclwiPT1oLmdldChcImNvbXBsZXRlT25cIikpfHxoLmhhcyhhLmoub2EpO2EubyhmdW5jdGlvbigpe3ZhciBoPWEuYS5jKGMoKSksbT0hZSE9PSFoLHU9IXEsdDtpZihBfHxtIT09ayl7cCYmKGw9YS5qLkJiKGIsbCkpO2lmKG0pe2lmKCFkfHxBKW4uZGF0YURlcGVuZGVuY3k9YS5VLm8oKTt0PWQ/bC5jcmVhdGVDaGlsZENvbnRleHQoXCJmdW5jdGlvblwiPT1cbnR5cGVvZiBoP2g6YyxuKTphLlUucGEoKT9sLmV4dGVuZChudWxsLG4pOmx9dSYmYS5VLnBhKCkmJihxPWEuYS5DYShhLmguY2hpbGROb2RlcyhiKSwhMCkpO20/KHV8fGEuaC51YShiLGEuYS5DYShxKSksYS5QYSh0LGIpKTooYS5oLkVhKGIpLHJ8fGEuai5HYShiLGEuai5UKSk7az1tfX0sbnVsbCx7bDpifSk7cmV0dXJue2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzOiEwfX19O2EubS5SYVtiXT0hMTthLmguZWFbYl09ITB9YihcImlmXCIpO2IoXCJpZm5vdFwiLCExLCEwKTtiKFwid2l0aFwiLCEwKX0pKCk7YS5mLmxldD17aW5pdDpmdW5jdGlvbihiLGMsZCxlLGYpe2M9Zi5leHRlbmQoYyk7YS5QYShjLGIpO3JldHVybntjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5nczohMH19fTthLmguZWEubGV0PSEwO3ZhciBRPXt9O2EuZi5vcHRpb25zPXtpbml0OmZ1bmN0aW9uKGIpe2lmKFwic2VsZWN0XCIhPT1hLmEuUChiKSl0aHJvdyBFcnJvcihcIm9wdGlvbnMgYmluZGluZyBhcHBsaWVzIG9ubHkgdG8gU0VMRUNUIGVsZW1lbnRzXCIpO1xuZm9yKDswPGIubGVuZ3RoOyliLnJlbW92ZSgwKTtyZXR1cm57Y29udHJvbHNEZXNjZW5kYW50QmluZGluZ3M6ITB9fSx1cGRhdGU6ZnVuY3Rpb24oYixjLGQpe2Z1bmN0aW9uIGUoKXtyZXR1cm4gYS5hLmZiKGIub3B0aW9ucyxmdW5jdGlvbihhKXtyZXR1cm4gYS5zZWxlY3RlZH0pfWZ1bmN0aW9uIGYoYSxiLGMpe3ZhciBkPXR5cGVvZiBiO3JldHVyblwiZnVuY3Rpb25cIj09ZD9iKGEpOlwic3RyaW5nXCI9PWQ/YVtiXTpjfWZ1bmN0aW9uIGcoYyxlKXtpZih5JiZrKWEudS55YShiLGEuYS5jKGQuZ2V0KFwidmFsdWVcIikpLCEwKTtlbHNlIGlmKHIubGVuZ3RoKXt2YXIgZj0wPD1hLmEuQShyLGEudS5MKGVbMF0pKTthLmEuWWMoZVswXSxmKTt5JiYhZiYmYS52LksoYS5hLkZiLG51bGwsW2IsXCJjaGFuZ2VcIl0pfX12YXIgaD1iLm11bHRpcGxlLG09MCE9Yi5sZW5ndGgmJmg/Yi5zY3JvbGxUb3A6bnVsbCxsPWEuYS5jKGMoKSksaz1kLmdldChcInZhbHVlQWxsb3dVbnNldFwiKSYmZC5oYXMoXCJ2YWx1ZVwiKSxcbnE9ZC5nZXQoXCJvcHRpb25zSW5jbHVkZURlc3Ryb3llZFwiKTtjPXt9O3ZhciBuLHI9W107a3x8KGg/cj1hLmEuTWIoZSgpLGEudS5MKTowPD1iLnNlbGVjdGVkSW5kZXgmJnIucHVzaChhLnUuTChiLm9wdGlvbnNbYi5zZWxlY3RlZEluZGV4XSkpKTtsJiYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIGwubGVuZ3RoJiYobD1bbF0pLG49YS5hLmZiKGwsZnVuY3Rpb24oYil7cmV0dXJuIHF8fGI9PT1wfHxudWxsPT09Ynx8IWEuYS5jKGIuX2Rlc3Ryb3kpfSksZC5oYXMoXCJvcHRpb25zQ2FwdGlvblwiKSYmKGw9YS5hLmMoZC5nZXQoXCJvcHRpb25zQ2FwdGlvblwiKSksbnVsbCE9PWwmJmwhPT1wJiZuLnVuc2hpZnQoUSkpKTt2YXIgeT0hMTtjLmJlZm9yZVJlbW92ZT1mdW5jdGlvbihhKXtiLnJlbW92ZUNoaWxkKGEpfTtsPWc7ZC5oYXMoXCJvcHRpb25zQWZ0ZXJSZW5kZXJcIikmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGQuZ2V0KFwib3B0aW9uc0FmdGVyUmVuZGVyXCIpJiYobD1mdW5jdGlvbihiLGMpe2coMCxjKTtcbmEudi5LKGQuZ2V0KFwib3B0aW9uc0FmdGVyUmVuZGVyXCIpLG51bGwsW2NbMF0sYiE9PVE/YjpwXSl9KTthLmEuY2MoYixuLGZ1bmN0aW9uKGMsZSxnKXtnLmxlbmd0aCYmKHI9IWsmJmdbMF0uc2VsZWN0ZWQ/W2EudS5MKGdbMF0pXTpbXSx5PSEwKTtlPWIub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO2M9PT1RPyhhLmEuQWIoZSxkLmdldChcIm9wdGlvbnNDYXB0aW9uXCIpKSxhLnUueWEoZSxwKSk6KGc9ZihjLGQuZ2V0KFwib3B0aW9uc1ZhbHVlXCIpLGMpLGEudS55YShlLGEuYS5jKGcpKSxjPWYoYyxkLmdldChcIm9wdGlvbnNUZXh0XCIpLGcpLGEuYS5BYihlLGMpKTtyZXR1cm5bZV19LGMsbCk7YS52LksoZnVuY3Rpb24oKXtpZihrKWEudS55YShiLGEuYS5jKGQuZ2V0KFwidmFsdWVcIikpLCEwKTtlbHNle3ZhciBjO2g/Yz1yLmxlbmd0aCYmZSgpLmxlbmd0aDxyLmxlbmd0aDpjPXIubGVuZ3RoJiYwPD1iLnNlbGVjdGVkSW5kZXg/YS51LkwoYi5vcHRpb25zW2Iuc2VsZWN0ZWRJbmRleF0pIT09XG5yWzBdOnIubGVuZ3RofHwwPD1iLnNlbGVjdGVkSW5kZXg7YyYmYS5hLkZiKGIsXCJjaGFuZ2VcIil9fSk7YS5hLnZkKGIpO20mJjIwPE1hdGguYWJzKG0tYi5zY3JvbGxUb3ApJiYoYi5zY3JvbGxUb3A9bSl9fTthLmYub3B0aW9ucy5ZYj1hLmEuZy5aKCk7YS5mLnNlbGVjdGVkT3B0aW9ucz17YWZ0ZXI6W1wib3B0aW9uc1wiLFwiZm9yZWFjaFwiXSxpbml0OmZ1bmN0aW9uKGIsYyxkKXthLmEuSChiLFwiY2hhbmdlXCIsZnVuY3Rpb24oKXt2YXIgZT1jKCksZj1bXTthLmEuQyhiLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0aW9uXCIpLGZ1bmN0aW9uKGIpe2Iuc2VsZWN0ZWQmJmYucHVzaChhLnUuTChiKSl9KTthLm0uJGEoZSxkLFwic2VsZWN0ZWRPcHRpb25zXCIsZil9KX0sdXBkYXRlOmZ1bmN0aW9uKGIsYyl7aWYoXCJzZWxlY3RcIiE9YS5hLlAoYikpdGhyb3cgRXJyb3IoXCJ2YWx1ZXMgYmluZGluZyBhcHBsaWVzIG9ubHkgdG8gU0VMRUNUIGVsZW1lbnRzXCIpO3ZhciBkPWEuYS5jKGMoKSksZT1iLnNjcm9sbFRvcDtcbmQmJlwibnVtYmVyXCI9PXR5cGVvZiBkLmxlbmd0aCYmYS5hLkMoYi5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGlvblwiKSxmdW5jdGlvbihiKXt2YXIgYz0wPD1hLmEuQShkLGEudS5MKGIpKTtiLnNlbGVjdGVkIT1jJiZhLmEuWWMoYixjKX0pO2Iuc2Nyb2xsVG9wPWV9fTthLm0udmEuc2VsZWN0ZWRPcHRpb25zPSEwO2EuZi5zdHlsZT17dXBkYXRlOmZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5hLmMoYygpfHx7fSk7YS5hLk8oZCxmdW5jdGlvbihjLGQpe2Q9YS5hLmMoZCk7aWYobnVsbD09PWR8fGQ9PT1wfHwhMT09PWQpZD1cIlwiO2lmKHYpdihiKS5jc3MoYyxkKTtlbHNlIGlmKC9eLS0vLnRlc3QoYykpYi5zdHlsZS5zZXRQcm9wZXJ0eShjLGQpO2Vsc2V7Yz1jLnJlcGxhY2UoLy0oXFx3KS9nLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIudG9VcHBlckNhc2UoKX0pO3ZhciBnPWIuc3R5bGVbY107Yi5zdHlsZVtjXT1kO2Q9PT1nfHxiLnN0eWxlW2NdIT1nfHxpc05hTihkKXx8KGIuc3R5bGVbY109XG5kK1wicHhcIil9fSl9fTthLmYuc3VibWl0PXtpbml0OmZ1bmN0aW9uKGIsYyxkLGUsZil7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgYygpKXRocm93IEVycm9yKFwiVGhlIHZhbHVlIGZvciBhIHN1Ym1pdCBiaW5kaW5nIG11c3QgYmUgYSBmdW5jdGlvblwiKTthLmEuSChiLFwic3VibWl0XCIsZnVuY3Rpb24oYSl7dmFyIGQsZT1jKCk7dHJ5e2Q9ZS5jYWxsKGYuJGRhdGEsYil9ZmluYWxseXshMCE9PWQmJihhLnByZXZlbnREZWZhdWx0P2EucHJldmVudERlZmF1bHQoKTphLnJldHVyblZhbHVlPSExKX19KX19O2EuZi50ZXh0PXtpbml0OmZ1bmN0aW9uKCl7cmV0dXJue2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzOiEwfX0sdXBkYXRlOmZ1bmN0aW9uKGIsYyl7YS5hLkFiKGIsYygpKX19O2EuaC5lYS50ZXh0PSEwOyhmdW5jdGlvbigpe2lmKHomJnoubmF2aWdhdG9yKXt2YXIgYj1mdW5jdGlvbihhKXtpZihhKXJldHVybiBwYXJzZUZsb2F0KGFbMV0pfSxjPXoubmF2aWdhdG9yLnVzZXJBZ2VudCxcbmQsZSxmLGcsaDsoZD16Lm9wZXJhJiZ6Lm9wZXJhLnZlcnNpb24mJnBhcnNlSW50KHoub3BlcmEudmVyc2lvbigpKSl8fChoPWIoYy5tYXRjaCgvRWRnZVxcLyhbXiBdKykkLykpKXx8YihjLm1hdGNoKC9DaHJvbWVcXC8oW14gXSspLykpfHwoZT1iKGMubWF0Y2goL1ZlcnNpb25cXC8oW14gXSspIFNhZmFyaS8pKSl8fChmPWIoYy5tYXRjaCgvRmlyZWZveFxcLyhbXiBdKykvKSkpfHwoZz1hLmEuV3x8YihjLm1hdGNoKC9NU0lFIChbXiBdKykvKSkpfHwoZz1iKGMubWF0Y2goL3J2OihbXiApXSspLykpKX1pZig4PD1nJiYxMD5nKXZhciBtPWEuYS5nLlooKSxsPWEuYS5nLlooKSxrPWZ1bmN0aW9uKGIpe3ZhciBjPXRoaXMuYWN0aXZlRWxlbWVudDsoYz1jJiZhLmEuZy5nZXQoYyxsKSkmJmMoYil9LHE9ZnVuY3Rpb24oYixjKXt2YXIgZD1iLm93bmVyRG9jdW1lbnQ7YS5hLmcuZ2V0KGQsbSl8fChhLmEuZy5zZXQoZCxtLCEwKSxhLmEuSChkLFwic2VsZWN0aW9uY2hhbmdlXCIsaykpO2EuYS5nLnNldChiLFxubCxjKX07YS5mLnRleHRJbnB1dD17aW5pdDpmdW5jdGlvbihiLGMsbCl7ZnVuY3Rpb24gayhjLGQpe2EuYS5IKGIsYyxkKX1mdW5jdGlvbiBtKCl7dmFyIGQ9YS5hLmMoYygpKTtpZihudWxsPT09ZHx8ZD09PXApZD1cIlwiO0whPT1wJiZkPT09TD9hLmEuc2V0VGltZW91dChtLDQpOmIudmFsdWUhPT1kJiYoeD0hMCxiLnZhbHVlPWQseD0hMSx2PWIudmFsdWUpfWZ1bmN0aW9uIHQoKXt3fHwoTD1iLnZhbHVlLHc9YS5hLnNldFRpbWVvdXQoQiw0KSl9ZnVuY3Rpb24gQigpe2NsZWFyVGltZW91dCh3KTtMPXc9cDt2YXIgZD1iLnZhbHVlO3YhPT1kJiYodj1kLGEubS4kYShjKCksbCxcInRleHRJbnB1dFwiLGQpKX12YXIgdj1iLnZhbHVlLHcsTCx6PTk9PWEuYS5XP3Q6Qix4PSExO2cmJmsoXCJrZXlwcmVzc1wiLEIpOzExPmcmJmsoXCJwcm9wZXJ0eWNoYW5nZVwiLGZ1bmN0aW9uKGEpe3h8fFwidmFsdWVcIiE9PWEucHJvcGVydHlOYW1lfHx6KGEpfSk7OD09ZyYmKGsoXCJrZXl1cFwiLEIpLGsoXCJrZXlkb3duXCIsXG5CKSk7cSYmKHEoYix6KSxrKFwiZHJhZ2VuZFwiLHQpKTsoIWd8fDk8PWcpJiZrKFwiaW5wdXRcIix6KTs1PmUmJlwidGV4dGFyZWFcIj09PWEuYS5QKGIpPyhrKFwia2V5ZG93blwiLHQpLGsoXCJwYXN0ZVwiLHQpLGsoXCJjdXRcIix0KSk6MTE+ZD9rKFwia2V5ZG93blwiLHQpOjQ+Zj8oayhcIkRPTUF1dG9Db21wbGV0ZVwiLEIpLGsoXCJkcmFnZHJvcFwiLEIpLGsoXCJkcm9wXCIsQikpOmgmJlwibnVtYmVyXCI9PT1iLnR5cGUmJmsoXCJrZXlkb3duXCIsdCk7ayhcImNoYW5nZVwiLEIpO2soXCJibHVyXCIsQik7YS5vKG0sbnVsbCx7bDpifSl9fTthLm0udmEudGV4dElucHV0PSEwO2EuZi50ZXh0aW5wdXQ9e3ByZXByb2Nlc3M6ZnVuY3Rpb24oYSxiLGMpe2MoXCJ0ZXh0SW5wdXRcIixhKX19fSkoKTthLmYudW5pcXVlTmFtZT17aW5pdDpmdW5jdGlvbihiLGMpe2lmKGMoKSl7dmFyIGQ9XCJrb191bmlxdWVfXCIrICsrYS5mLnVuaXF1ZU5hbWUucWQ7YS5hLlhjKGIsZCl9fX07YS5mLnVuaXF1ZU5hbWUucWQ9MDthLmYudXNpbmc9e2luaXQ6ZnVuY3Rpb24oYixcbmMsZCxlLGYpe3ZhciBnO2QuaGFzKFwiYXNcIikmJihnPXthczpkLmdldChcImFzXCIpLG5vQ2hpbGRDb250ZXh0OmQuZ2V0KFwibm9DaGlsZENvbnRleHRcIil9KTtjPWYuY3JlYXRlQ2hpbGRDb250ZXh0KGMsZyk7YS5QYShjLGIpO3JldHVybntjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5nczohMH19fTthLmguZWEudXNpbmc9ITA7YS5mLnZhbHVlPXthZnRlcjpbXCJvcHRpb25zXCIsXCJmb3JlYWNoXCJdLGluaXQ6ZnVuY3Rpb24oYixjLGQpe3ZhciBlPWEuYS5QKGIpLGY9XCJpbnB1dFwiPT1lO2lmKCFmfHxcImNoZWNrYm94XCIhPWIudHlwZSYmXCJyYWRpb1wiIT1iLnR5cGUpe3ZhciBnPVtcImNoYW5nZVwiXSxoPWQuZ2V0KFwidmFsdWVVcGRhdGVcIiksbT0hMSxsPW51bGw7aCYmKFwic3RyaW5nXCI9PXR5cGVvZiBoJiYoaD1baF0pLGEuYS5nYihnLGgpLGc9YS5hLnZjKGcpKTt2YXIgaz1mdW5jdGlvbigpe2w9bnVsbDttPSExO3ZhciBlPWMoKSxmPWEudS5MKGIpO2EubS4kYShlLGQsXCJ2YWx1ZVwiLGYpfTshYS5hLld8fFxuIWZ8fFwidGV4dFwiIT1iLnR5cGV8fFwib2ZmXCI9PWIuYXV0b2NvbXBsZXRlfHxiLmZvcm0mJlwib2ZmXCI9PWIuZm9ybS5hdXRvY29tcGxldGV8fC0xIT1hLmEuQShnLFwicHJvcGVydHljaGFuZ2VcIil8fChhLmEuSChiLFwicHJvcGVydHljaGFuZ2VcIixmdW5jdGlvbigpe209ITB9KSxhLmEuSChiLFwiZm9jdXNcIixmdW5jdGlvbigpe209ITF9KSxhLmEuSChiLFwiYmx1clwiLGZ1bmN0aW9uKCl7bSYmaygpfSkpO2EuYS5DKGcsZnVuY3Rpb24oYyl7dmFyIGQ9azthLmEuVGQoYyxcImFmdGVyXCIpJiYoZD1mdW5jdGlvbigpe2w9YS51LkwoYik7YS5hLnNldFRpbWVvdXQoaywwKX0sYz1jLnN1YnN0cmluZyg1KSk7YS5hLkgoYixjLGQpfSk7dmFyIHE7cT1mJiZcImZpbGVcIj09Yi50eXBlP2Z1bmN0aW9uKCl7dmFyIGQ9YS5hLmMoYygpKTtudWxsPT09ZHx8ZD09PXB8fFwiXCI9PT1kP2IudmFsdWU9XCJcIjphLnYuSyhrKX06ZnVuY3Rpb24oKXt2YXIgZj1hLmEuYyhjKCkpLGc9YS51LkwoYik7aWYobnVsbCE9PWwmJlxuZj09PWwpYS5hLnNldFRpbWVvdXQocSwwKTtlbHNlIGlmKGYhPT1nfHxnPT09cClcInNlbGVjdFwiPT09ZT8oZz1kLmdldChcInZhbHVlQWxsb3dVbnNldFwiKSxhLnUueWEoYixmLGcpLGd8fGY9PT1hLnUuTChiKXx8YS52LksoaykpOmEudS55YShiLGYpfTthLm8ocSxudWxsLHtsOmJ9KX1lbHNlIGEuZWIoYix7Y2hlY2tlZFZhbHVlOmN9KX0sdXBkYXRlOmZ1bmN0aW9uKCl7fX07YS5tLnZhLnZhbHVlPSEwO2EuZi52aXNpYmxlPXt1cGRhdGU6ZnVuY3Rpb24oYixjKXt2YXIgZD1hLmEuYyhjKCkpLGU9XCJub25lXCIhPWIuc3R5bGUuZGlzcGxheTtkJiYhZT9iLnN0eWxlLmRpc3BsYXk9XCJcIjohZCYmZSYmKGIuc3R5bGUuZGlzcGxheT1cIm5vbmVcIil9fTthLmYuaGlkZGVuPXt1cGRhdGU6ZnVuY3Rpb24oYixjKXthLmYudmlzaWJsZS51cGRhdGUoYixmdW5jdGlvbigpe3JldHVybiFhLmEuYyhjKCkpfSl9fTsoZnVuY3Rpb24oYil7YS5mW2JdPXtpbml0OmZ1bmN0aW9uKGMsZCxlLGYsZyl7cmV0dXJuIGEuZi5ldmVudC5pbml0LmNhbGwodGhpcyxcbmMsZnVuY3Rpb24oKXt2YXIgYT17fTthW2JdPWQoKTtyZXR1cm4gYX0sZSxmLGcpfX19KShcImNsaWNrXCIpO2EuY2E9ZnVuY3Rpb24oKXt9O2EuY2EucHJvdG90eXBlLnJlbmRlclRlbXBsYXRlU291cmNlPWZ1bmN0aW9uKCl7dGhyb3cgRXJyb3IoXCJPdmVycmlkZSByZW5kZXJUZW1wbGF0ZVNvdXJjZVwiKTt9O2EuY2EucHJvdG90eXBlLmNyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9jaz1mdW5jdGlvbigpe3Rocm93IEVycm9yKFwiT3ZlcnJpZGUgY3JlYXRlSmF2YVNjcmlwdEV2YWx1YXRvckJsb2NrXCIpO307YS5jYS5wcm90b3R5cGUubWFrZVRlbXBsYXRlU291cmNlPWZ1bmN0aW9uKGIsYyl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGIpe2M9Y3x8dzt2YXIgZD1jLmdldEVsZW1lbnRCeUlkKGIpO2lmKCFkKXRocm93IEVycm9yKFwiQ2Fubm90IGZpbmQgdGVtcGxhdGUgd2l0aCBJRCBcIitiKTtyZXR1cm4gbmV3IGEuQi5EKGQpfWlmKDE9PWIubm9kZVR5cGV8fDg9PWIubm9kZVR5cGUpcmV0dXJuIG5ldyBhLkIuaWEoYik7XG50aHJvdyBFcnJvcihcIlVua25vd24gdGVtcGxhdGUgdHlwZTogXCIrYik7fTthLmNhLnByb3RvdHlwZS5yZW5kZXJUZW1wbGF0ZT1mdW5jdGlvbihhLGMsZCxlKXthPXRoaXMubWFrZVRlbXBsYXRlU291cmNlKGEsZSk7cmV0dXJuIHRoaXMucmVuZGVyVGVtcGxhdGVTb3VyY2UoYSxjLGQsZSl9O2EuY2EucHJvdG90eXBlLmlzVGVtcGxhdGVSZXdyaXR0ZW49ZnVuY3Rpb24oYSxjKXtyZXR1cm4hMT09PXRoaXMuYWxsb3dUZW1wbGF0ZVJld3JpdGluZz8hMDp0aGlzLm1ha2VUZW1wbGF0ZVNvdXJjZShhLGMpLmRhdGEoXCJpc1Jld3JpdHRlblwiKX07YS5jYS5wcm90b3R5cGUucmV3cml0ZVRlbXBsYXRlPWZ1bmN0aW9uKGEsYyxkKXthPXRoaXMubWFrZVRlbXBsYXRlU291cmNlKGEsZCk7Yz1jKGEudGV4dCgpKTthLnRleHQoYyk7YS5kYXRhKFwiaXNSZXdyaXR0ZW5cIiwhMCl9O2EuYihcInRlbXBsYXRlRW5naW5lXCIsYS5jYSk7YS5pYz1mdW5jdGlvbigpe2Z1bmN0aW9uIGIoYixjLGQsaCl7Yj1hLm0uWmIoYik7XG5mb3IodmFyIG09YS5tLlJhLGw9MDtsPGIubGVuZ3RoO2wrKyl7dmFyIGs9YltsXS5rZXk7aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG0saykpe3ZhciBxPW1ba107aWYoXCJmdW5jdGlvblwiPT09dHlwZW9mIHEpe2lmKGs9cShiW2xdLnZhbHVlKSl0aHJvdyBFcnJvcihrKTt9ZWxzZSBpZighcSl0aHJvdyBFcnJvcihcIlRoaXMgdGVtcGxhdGUgZW5naW5lIGRvZXMgbm90IHN1cHBvcnQgdGhlICdcIitrK1wiJyBiaW5kaW5nIHdpdGhpbiBpdHMgdGVtcGxhdGVzXCIpO319ZD1cImtvLl9fdHJfYW1idG5zKGZ1bmN0aW9uKCRjb250ZXh0LCRlbGVtZW50KXtyZXR1cm4oZnVuY3Rpb24oKXtyZXR1cm57IFwiK2EubS51YihiLHt2YWx1ZUFjY2Vzc29yczohMH0pK1wiIH0gfSkoKX0sJ1wiK2QudG9Mb3dlckNhc2UoKStcIicpXCI7cmV0dXJuIGguY3JlYXRlSmF2YVNjcmlwdEV2YWx1YXRvckJsb2NrKGQpK2N9dmFyIGM9Lyg8KFthLXpdK1xcZCopKD86XFxzKyg/IWRhdGEtYmluZFxccyo9XFxzKilbYS16MC05XFwtXSsoPzo9KD86XFxcIlteXFxcIl0qXFxcInxcXCdbXlxcJ10qXFwnfFtePl0qKSk/KSpcXHMrKWRhdGEtYmluZFxccyo9XFxzKihbXCInXSkoW1xcc1xcU10qPylcXDMvZ2ksXG5kPS9cXHgzYyEtLVxccyprb1xcYlxccyooW1xcc1xcU10qPylcXHMqLS1cXHgzZS9nO3JldHVybnt3ZDpmdW5jdGlvbihiLGMsZCl7Yy5pc1RlbXBsYXRlUmV3cml0dGVuKGIsZCl8fGMucmV3cml0ZVRlbXBsYXRlKGIsZnVuY3Rpb24oYil7cmV0dXJuIGEuaWMuS2QoYixjKX0sZCl9LEtkOmZ1bmN0aW9uKGEsZil7cmV0dXJuIGEucmVwbGFjZShjLGZ1bmN0aW9uKGEsYyxkLGUsayl7cmV0dXJuIGIoayxjLGQsZil9KS5yZXBsYWNlKGQsZnVuY3Rpb24oYSxjKXtyZXR1cm4gYihjLFwiXFx4M2MhLS0ga28gLS1cXHgzZVwiLFwiI2NvbW1lbnRcIixmKX0pfSxsZDpmdW5jdGlvbihiLGMpe3JldHVybiBhLmFhLldiKGZ1bmN0aW9uKGQsaCl7dmFyIG09ZC5uZXh0U2libGluZzttJiZtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk9PT1jJiZhLmViKG0sYixoKX0pfX19KCk7YS5iKFwiX190cl9hbWJ0bnNcIixhLmljLmxkKTsoZnVuY3Rpb24oKXthLkI9e307YS5CLkQ9ZnVuY3Rpb24oYil7aWYodGhpcy5EPWIpe3ZhciBjPVxuYS5hLlAoYik7dGhpcy5EYj1cInNjcmlwdFwiPT09Yz8xOlwidGV4dGFyZWFcIj09PWM/MjpcInRlbXBsYXRlXCI9PWMmJmIuY29udGVudCYmMTE9PT1iLmNvbnRlbnQubm9kZVR5cGU/Mzo0fX07YS5CLkQucHJvdG90eXBlLnRleHQ9ZnVuY3Rpb24oKXt2YXIgYj0xPT09dGhpcy5EYj9cInRleHRcIjoyPT09dGhpcy5EYj9cInZhbHVlXCI6XCJpbm5lckhUTUxcIjtpZigwPT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiB0aGlzLkRbYl07dmFyIGM9YXJndW1lbnRzWzBdO1wiaW5uZXJIVE1MXCI9PT1iP2EuYS5kYyh0aGlzLkQsYyk6dGhpcy5EW2JdPWN9O3ZhciBiPWEuYS5nLlooKStcIl9cIjthLkIuRC5wcm90b3R5cGUuZGF0YT1mdW5jdGlvbihjKXtpZigxPT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gYS5hLmcuZ2V0KHRoaXMuRCxiK2MpO2EuYS5nLnNldCh0aGlzLkQsYitjLGFyZ3VtZW50c1sxXSl9O3ZhciBjPWEuYS5nLlooKTthLkIuRC5wcm90b3R5cGUubm9kZXM9ZnVuY3Rpb24oKXt2YXIgYj10aGlzLkQ7XG5pZigwPT1hcmd1bWVudHMubGVuZ3RoKXt2YXIgZT1hLmEuZy5nZXQoYixjKXx8e30sZj1lLmpifHwoMz09PXRoaXMuRGI/Yi5jb250ZW50OjQ9PT10aGlzLkRiP2I6cCk7aWYoIWZ8fGUuaGQpaWYoZT10aGlzLnRleHQoKSlmPWEuYS5MZChlLGIub3duZXJEb2N1bWVudCksdGhpcy50ZXh0KFwiXCIpLGEuYS5nLnNldChiLGMse2piOmYsaGQ6ITB9KTtyZXR1cm4gZn1hLmEuZy5zZXQoYixjLHtqYjphcmd1bWVudHNbMF19KX07YS5CLmlhPWZ1bmN0aW9uKGEpe3RoaXMuRD1hfTthLkIuaWEucHJvdG90eXBlPW5ldyBhLkIuRDthLkIuaWEucHJvdG90eXBlLmNvbnN0cnVjdG9yPWEuQi5pYTthLkIuaWEucHJvdG90eXBlLnRleHQ9ZnVuY3Rpb24oKXtpZigwPT1hcmd1bWVudHMubGVuZ3RoKXt2YXIgYj1hLmEuZy5nZXQodGhpcy5ELGMpfHx7fTtiLmpjPT09cCYmYi5qYiYmKGIuamM9Yi5qYi5pbm5lckhUTUwpO3JldHVybiBiLmpjfWEuYS5nLnNldCh0aGlzLkQsYyx7amM6YXJndW1lbnRzWzBdfSl9O1xuYS5iKFwidGVtcGxhdGVTb3VyY2VzXCIsYS5CKTthLmIoXCJ0ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudFwiLGEuQi5EKTthLmIoXCJ0ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGVcIixhLkIuaWEpfSkoKTsoZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGIsYyxkKXt2YXIgZTtmb3IoYz1hLmgubmV4dFNpYmxpbmcoYyk7YiYmKGU9YikhPT1jOyliPWEuaC5uZXh0U2libGluZyhlKSxkKGUsYil9ZnVuY3Rpb24gYyhjLGQpe2lmKGMubGVuZ3RoKXt2YXIgZT1jWzBdLGY9Y1tjLmxlbmd0aC0xXSxnPWUucGFyZW50Tm9kZSxoPWEuZ2EuaW5zdGFuY2UsbT1oLnByZXByb2Nlc3NOb2RlO2lmKG0pe2IoZSxmLGZ1bmN0aW9uKGEsYil7dmFyIGM9YS5wcmV2aW91c1NpYmxpbmcsZD1tLmNhbGwoaCxhKTtkJiYoYT09PWUmJihlPWRbMF18fGIpLGE9PT1mJiYoZj1kW2QubGVuZ3RoLTFdfHxjKSl9KTtjLmxlbmd0aD0wO2lmKCFlKXJldHVybjtlPT09Zj9jLnB1c2goZSk6KGMucHVzaChlLGYpLGEuYS5VYShjLFxuZykpfWIoZSxmLGZ1bmN0aW9uKGIpezEhPT1iLm5vZGVUeXBlJiY4IT09Yi5ub2RlVHlwZXx8YS51YyhkLGIpfSk7YihlLGYsZnVuY3Rpb24oYil7MSE9PWIubm9kZVR5cGUmJjghPT1iLm5vZGVUeXBlfHxhLmFhLmJkKGIsW2RdKX0pO2EuYS5VYShjLGcpfX1mdW5jdGlvbiBkKGEpe3JldHVybiBhLm5vZGVUeXBlP2E6MDxhLmxlbmd0aD9hWzBdOm51bGx9ZnVuY3Rpb24gZShiLGUsZixoLG0pe209bXx8e307dmFyIHA9KGImJmQoYil8fGZ8fHt9KS5vd25lckRvY3VtZW50LEE9bS50ZW1wbGF0ZUVuZ2luZXx8ZzthLmljLndkKGYsQSxwKTtmPUEucmVuZGVyVGVtcGxhdGUoZixoLG0scCk7aWYoXCJudW1iZXJcIiE9dHlwZW9mIGYubGVuZ3RofHwwPGYubGVuZ3RoJiZcIm51bWJlclwiIT10eXBlb2YgZlswXS5ub2RlVHlwZSl0aHJvdyBFcnJvcihcIlRlbXBsYXRlIGVuZ2luZSBtdXN0IHJldHVybiBhbiBhcnJheSBvZiBET00gbm9kZXNcIik7cD0hMTtzd2l0Y2goZSl7Y2FzZSBcInJlcGxhY2VDaGlsZHJlblwiOmEuaC51YShiLFxuZik7cD0hMDticmVhaztjYXNlIFwicmVwbGFjZU5vZGVcIjphLmEuV2MoYixmKTtwPSEwO2JyZWFrO2Nhc2UgXCJpZ25vcmVUYXJnZXROb2RlXCI6YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcIlVua25vd24gcmVuZGVyTW9kZTogXCIrZSk7fXAmJihjKGYsaCksbS5hZnRlclJlbmRlciYmYS52LksobS5hZnRlclJlbmRlcixudWxsLFtmLGhbbS5hc3x8XCIkZGF0YVwiXV0pLFwicmVwbGFjZUNoaWxkcmVuXCI9PWUmJmEuai5HYShiLGEuai5UKSk7cmV0dXJuIGZ9ZnVuY3Rpb24gZihiLGMsZCl7cmV0dXJuIGEuTihiKT9iKCk6XCJmdW5jdGlvblwiPT09dHlwZW9mIGI/YihjLGQpOmJ9dmFyIGc7YS5lYz1mdW5jdGlvbihiKXtpZihiIT1wJiYhKGIgaW5zdGFuY2VvZiBhLmNhKSl0aHJvdyBFcnJvcihcInRlbXBsYXRlRW5naW5lIG11c3QgaW5oZXJpdCBmcm9tIGtvLnRlbXBsYXRlRW5naW5lXCIpO2c9Yn07YS5iYz1mdW5jdGlvbihiLGMsaCxtLHIpe2g9aHx8e307aWYoKGgudGVtcGxhdGVFbmdpbmV8fGcpPT1cbnApdGhyb3cgRXJyb3IoXCJTZXQgYSB0ZW1wbGF0ZSBlbmdpbmUgYmVmb3JlIGNhbGxpbmcgcmVuZGVyVGVtcGxhdGVcIik7cj1yfHxcInJlcGxhY2VDaGlsZHJlblwiO2lmKG0pe3ZhciB5PWQobSk7cmV0dXJuIGEuJChmdW5jdGlvbigpe3ZhciBnPWMmJmMgaW5zdGFuY2VvZiBhLmZhP2M6bmV3IGEuZmEoYyxudWxsLG51bGwsbnVsbCx7ZXhwb3J0RGVwZW5kZW5jaWVzOiEwfSkscD1mKGIsZy4kZGF0YSxnKSxnPWUobSxyLHAsZyxoKTtcInJlcGxhY2VOb2RlXCI9PXImJihtPWcseT1kKG0pKX0sbnVsbCx7U2E6ZnVuY3Rpb24oKXtyZXR1cm4heXx8IWEuYS5SYih5KX0sbDp5JiZcInJlcGxhY2VOb2RlXCI9PXI/eS5wYXJlbnROb2RlOnl9KX1yZXR1cm4gYS5hYS5XYihmdW5jdGlvbihkKXthLmJjKGIsYyxoLGQsXCJyZXBsYWNlTm9kZVwiKX0pfTthLlBkPWZ1bmN0aW9uKGIsZCxnLGgsbSl7ZnVuY3Rpb24geShiLGMpe2Eudi5LKGEuYS5jYyxudWxsLFtoLGIsdSxnLHQsY10pO2Euai5HYShoLGEuai5UKX1cbmZ1bmN0aW9uIHQoYSxiKXtjKGIsdik7Zy5hZnRlclJlbmRlciYmZy5hZnRlclJlbmRlcihiLGEpO3Y9bnVsbH1mdW5jdGlvbiB1KGEsYyl7dj1tLmNyZWF0ZUNoaWxkQ29udGV4dChhLHthczpCLG5vQ2hpbGRDb250ZXh0Omcubm9DaGlsZENvbnRleHQsZXh0ZW5kOmZ1bmN0aW9uKGEpe2EuJGluZGV4PWM7QiYmKGFbQitcIkluZGV4XCJdPWMpfX0pO3ZhciBkPWYoYixhLHYpO3JldHVybiBlKGgsXCJpZ25vcmVUYXJnZXROb2RlXCIsZCx2LGcpfXZhciB2LEI9Zy5hcyx3PSExPT09Zy5pbmNsdWRlRGVzdHJveWVkfHxhLm9wdGlvbnMuZm9yZWFjaEhpZGVzRGVzdHJveWVkJiYhZy5pbmNsdWRlRGVzdHJveWVkO2lmKHd8fGcuYmVmb3JlUmVtb3ZlfHwhYS5PYyhkKSlyZXR1cm4gYS4kKGZ1bmN0aW9uKCl7dmFyIGI9YS5hLmMoZCl8fFtdO1widW5kZWZpbmVkXCI9PXR5cGVvZiBiLmxlbmd0aCYmKGI9W2JdKTt3JiYoYj1hLmEuZmIoYixmdW5jdGlvbihiKXtyZXR1cm4gYj09PXB8fG51bGw9PT1ifHxcbiFhLmEuYyhiLl9kZXN0cm95KX0pKTt5KGIpfSxudWxsLHtsOmh9KTt5KGQudygpKTt2YXIgej1kLnN1YnNjcmliZShmdW5jdGlvbihhKXt5KGQoKSxhKX0sbnVsbCxcImFycmF5Q2hhbmdlXCIpO3oubChoKTtyZXR1cm4gen07dmFyIGg9YS5hLmcuWigpLG09YS5hLmcuWigpO2EuZi50ZW1wbGF0ZT17aW5pdDpmdW5jdGlvbihiLGMpe3ZhciBkPWEuYS5jKGMoKSk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGR8fGQubmFtZSlhLmguRWEoYik7ZWxzZSBpZihcIm5vZGVzXCJpbiBkKXtkPWQubm9kZXN8fFtdO2lmKGEuTihkKSl0aHJvdyBFcnJvcignVGhlIFwibm9kZXNcIiBvcHRpb24gbXVzdCBiZSBhIHBsYWluLCBub24tb2JzZXJ2YWJsZSBhcnJheS4nKTt2YXIgZT1kWzBdJiZkWzBdLnBhcmVudE5vZGU7ZSYmYS5hLmcuZ2V0KGUsbSl8fChlPWEuYS5YYihkKSxhLmEuZy5zZXQoZSxtLCEwKSk7KG5ldyBhLkIuaWEoYikpLm5vZGVzKGUpfWVsc2UgaWYoZD1hLmguY2hpbGROb2RlcyhiKSwwPGQubGVuZ3RoKWU9XG5hLmEuWGIoZCksKG5ldyBhLkIuaWEoYikpLm5vZGVzKGUpO2Vsc2UgdGhyb3cgRXJyb3IoXCJBbm9ueW1vdXMgdGVtcGxhdGUgZGVmaW5lZCwgYnV0IG5vIHRlbXBsYXRlIGNvbnRlbnQgd2FzIHByb3ZpZGVkXCIpO3JldHVybntjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5nczohMH19LHVwZGF0ZTpmdW5jdGlvbihiLGMsZCxlLGYpe3ZhciBnPWMoKTtjPWEuYS5jKGcpO2Q9ITA7ZT1udWxsO1wic3RyaW5nXCI9PXR5cGVvZiBjP2M9e306KGc9Yy5uYW1lLFwiaWZcImluIGMmJihkPWEuYS5jKGNbXCJpZlwiXSkpLGQmJlwiaWZub3RcImluIGMmJihkPSFhLmEuYyhjLmlmbm90KSkpO1wiZm9yZWFjaFwiaW4gYz9lPWEuUGQoZ3x8YixkJiZjLmZvcmVhY2h8fFtdLGMsYixmKTpkPyhkPWYsXCJkYXRhXCJpbiBjJiYoZD1mLmNyZWF0ZUNoaWxkQ29udGV4dChjLmRhdGEse2FzOmMuYXMsbm9DaGlsZENvbnRleHQ6Yy5ub0NoaWxkQ29udGV4dCxleHBvcnREZXBlbmRlbmNpZXM6ITB9KSksZT1hLmJjKGd8fGIsZCxjLFxuYikpOmEuaC5FYShiKTtmPWU7KGM9YS5hLmcuZ2V0KGIsaCkpJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBjLnMmJmMucygpO2EuYS5nLnNldChiLGgsIWZ8fGYuamEmJiFmLmphKCk/cDpmKX19O2EubS5SYS50ZW1wbGF0ZT1mdW5jdGlvbihiKXtiPWEubS5aYihiKTtyZXR1cm4gMT09Yi5sZW5ndGgmJmJbMF0udW5rbm93bnx8YS5tLkhkKGIsXCJuYW1lXCIpP251bGw6XCJUaGlzIHRlbXBsYXRlIGVuZ2luZSBkb2VzIG5vdCBzdXBwb3J0IGFub255bW91cyB0ZW1wbGF0ZXMgbmVzdGVkIHdpdGhpbiBpdHMgdGVtcGxhdGVzXCJ9O2EuaC5lYS50ZW1wbGF0ZT0hMH0pKCk7YS5iKFwic2V0VGVtcGxhdGVFbmdpbmVcIixhLmVjKTthLmIoXCJyZW5kZXJUZW1wbGF0ZVwiLGEuYmMpO2EuYS5KYz1mdW5jdGlvbihhLGMsZCl7aWYoYS5sZW5ndGgmJmMubGVuZ3RoKXt2YXIgZSxmLGcsaCxtO2ZvcihlPWY9MDsoIWR8fGU8ZCkmJihoPWFbZl0pOysrZil7Zm9yKGc9MDttPWNbZ107KytnKWlmKGgudmFsdWU9PT1tLnZhbHVlKXtoLm1vdmVkPVxubS5pbmRleDttLm1vdmVkPWguaW5kZXg7Yy5zcGxpY2UoZywxKTtlPWc9MDticmVha31lKz1nfX19O2EuYS5PYj1mdW5jdGlvbigpe2Z1bmN0aW9uIGIoYixkLGUsZixnKXt2YXIgaD1NYXRoLm1pbixtPU1hdGgubWF4LGw9W10sayxwPWIubGVuZ3RoLG4scj1kLmxlbmd0aCx0PXItcHx8MSxBPXArcisxLHUsdix3O2ZvcihrPTA7azw9cDtrKyspZm9yKHY9dSxsLnB1c2godT1bXSksdz1oKHIsayt0KSxuPW0oMCxrLTEpO248PXc7bisrKXVbbl09bj9rP2Jbay0xXT09PWRbbi0xXT92W24tMV06aCh2W25dfHxBLHVbbi0xXXx8QSkrMTpuKzE6aysxO2g9W107bT1bXTt0PVtdO2s9cDtmb3Iobj1yO2t8fG47KXI9bFtrXVtuXS0xLG4mJnI9PT1sW2tdW24tMV0/bS5wdXNoKGhbaC5sZW5ndGhdPXtzdGF0dXM6ZSx2YWx1ZTpkWy0tbl0saW5kZXg6bn0pOmsmJnI9PT1sW2stMV1bbl0/dC5wdXNoKGhbaC5sZW5ndGhdPXtzdGF0dXM6Zix2YWx1ZTpiWy0ta10saW5kZXg6a30pOigtLW4sLS1rLFxuZy5zcGFyc2V8fGgucHVzaCh7c3RhdHVzOlwicmV0YWluZWRcIix2YWx1ZTpkW25dfSkpO2EuYS5KYyh0LG0sIWcuZG9udExpbWl0TW92ZXMmJjEwKnApO3JldHVybiBoLnJldmVyc2UoKX1yZXR1cm4gZnVuY3Rpb24oYSxkLGUpe2U9XCJib29sZWFuXCI9PT10eXBlb2YgZT97ZG9udExpbWl0TW92ZXM6ZX06ZXx8e307YT1hfHxbXTtkPWR8fFtdO3JldHVybiBhLmxlbmd0aDxkLmxlbmd0aD9iKGEsZCxcImFkZGVkXCIsXCJkZWxldGVkXCIsZSk6YihkLGEsXCJkZWxldGVkXCIsXCJhZGRlZFwiLGUpfX0oKTthLmIoXCJ1dGlscy5jb21wYXJlQXJyYXlzXCIsYS5hLk9iKTsoZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGIsYyxkLGgsbSl7dmFyIGw9W10saz1hLiQoZnVuY3Rpb24oKXt2YXIgaz1jKGQsbSxhLmEuVWEobCxiKSl8fFtdOzA8bC5sZW5ndGgmJihhLmEuV2MobCxrKSxoJiZhLnYuSyhoLG51bGwsW2QsayxtXSkpO2wubGVuZ3RoPTA7YS5hLmdiKGwsayl9LG51bGwse2w6YixTYTpmdW5jdGlvbigpe3JldHVybiFhLmEuamQobCl9fSk7XG5yZXR1cm57WTpsLCQ6ay5qYSgpP2s6cH19dmFyIGM9YS5hLmcuWigpLGQ9YS5hLmcuWigpO2EuYS5jYz1mdW5jdGlvbihlLGYsZyxoLG0sbCl7ZnVuY3Rpb24gayhiKXt4PXtBYTpiLG5iOmEuc2EodysrKX07di5wdXNoKHgpO3R8fEYucHVzaCh4KX1mdW5jdGlvbiBxKGIpe3g9cltiXTt3IT09eC5uYi53KCkmJkQucHVzaCh4KTt4Lm5iKHcrKyk7YS5hLlVhKHguWSxlKTt2LnB1c2goeCl9ZnVuY3Rpb24gbihiLGMpe2lmKGIpZm9yKHZhciBkPTAsZT1jLmxlbmd0aDtkPGU7ZCsrKWEuYS5DKGNbZF0uWSxmdW5jdGlvbihhKXtiKGEsZCxjW2RdLkFhKX0pfWY9Znx8W107XCJ1bmRlZmluZWRcIj09dHlwZW9mIGYubGVuZ3RoJiYoZj1bZl0pO2g9aHx8e307dmFyIHI9YS5hLmcuZ2V0KGUsYyksdD0hcix2PVtdLHU9MCx3PTAsQj1bXSx6PVtdLEM9W10sRD1bXSxGPVtdLHgsST0wO2lmKHQpYS5hLkMoZixrKTtlbHNle2lmKCFsfHxyJiZyLl9jb3VudFdhaXRpbmdGb3JSZW1vdmUpe3ZhciBFPVxuYS5hLk1iKHIsZnVuY3Rpb24oYSl7cmV0dXJuIGEuQWF9KTtsPWEuYS5PYihFLGYse2RvbnRMaW1pdE1vdmVzOmguZG9udExpbWl0TW92ZXMsc3BhcnNlOiEwfSl9Zm9yKHZhciBFPTAsRyxILEs7Rz1sW0VdO0UrKylzd2l0Y2goSD1HLm1vdmVkLEs9Ry5pbmRleCxHLnN0YXR1cyl7Y2FzZSBcImRlbGV0ZWRcIjpmb3IoO3U8SzspcSh1KyspO0g9PT1wJiYoeD1yW3VdLHguJCYmKHguJC5zKCkseC4kPXApLGEuYS5VYSh4LlksZSkubGVuZ3RoJiYoaC5iZWZvcmVSZW1vdmUmJih2LnB1c2goeCksSSsrLHguQWE9PT1kP3g9bnVsbDpDLnB1c2goeCkpLHgmJkIucHVzaC5hcHBseShCLHguWSkpKTt1Kys7YnJlYWs7Y2FzZSBcImFkZGVkXCI6Zm9yKDt3PEs7KXEodSsrKTtIIT09cD8oei5wdXNoKHYubGVuZ3RoKSxxKEgpKTprKEcudmFsdWUpfWZvcig7dzxmLmxlbmd0aDspcSh1KyspO3YuX2NvdW50V2FpdGluZ0ZvclJlbW92ZT1JfWEuYS5nLnNldChlLGMsdik7bihoLmJlZm9yZU1vdmUsRCk7YS5hLkMoQixcbmguYmVmb3JlUmVtb3ZlP2EubmE6YS5yZW1vdmVOb2RlKTt2YXIgTSxPLFA7dHJ5e1A9ZS5vd25lckRvY3VtZW50LmFjdGl2ZUVsZW1lbnR9Y2F0Y2goTil7fWlmKHoubGVuZ3RoKWZvcig7KEU9ei5zaGlmdCgpKSE9cDspe3g9dltFXTtmb3IoTT1wO0U7KWlmKChPPXZbLS1FXS5ZKSYmTy5sZW5ndGgpe009T1tPLmxlbmd0aC0xXTticmVha31mb3IoZj0wO3U9eC5ZW2ZdO009dSxmKyspYS5oLlZiKGUsdSxNKX1FPTA7Zm9yKHo9YS5oLmZpcnN0Q2hpbGQoZSk7eD12W0VdO0UrKyl7eC5ZfHxhLmEuZXh0ZW5kKHgsYihlLGcseC5BYSxtLHgubmIpKTtmb3IoZj0wO3U9eC5ZW2ZdO3o9dS5uZXh0U2libGluZyxNPXUsZisrKXUhPT16JiZhLmguVmIoZSx1LE0pOyF4LkRkJiZtJiYobSh4LkFhLHguWSx4Lm5iKSx4LkRkPSEwLE09eC5ZW3guWS5sZW5ndGgtMV0pfVAmJmUub3duZXJEb2N1bWVudC5hY3RpdmVFbGVtZW50IT1QJiZQLmZvY3VzKCk7bihoLmJlZm9yZVJlbW92ZSxDKTtmb3IoRT1cbjA7RTxDLmxlbmd0aDsrK0UpQ1tFXS5BYT1kO24oaC5hZnRlck1vdmUsRCk7bihoLmFmdGVyQWRkLEYpfX0pKCk7YS5iKFwidXRpbHMuc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZ1wiLGEuYS5jYyk7YS5iYT1mdW5jdGlvbigpe3RoaXMuYWxsb3dUZW1wbGF0ZVJld3JpdGluZz0hMX07YS5iYS5wcm90b3R5cGU9bmV3IGEuY2E7YS5iYS5wcm90b3R5cGUuY29uc3RydWN0b3I9YS5iYTthLmJhLnByb3RvdHlwZS5yZW5kZXJUZW1wbGF0ZVNvdXJjZT1mdW5jdGlvbihiLGMsZCxlKXtpZihjPSg5PmEuYS5XPzA6Yi5ub2Rlcyk/Yi5ub2RlcygpOm51bGwpcmV0dXJuIGEuYS5sYShjLmNsb25lTm9kZSghMCkuY2hpbGROb2Rlcyk7Yj1iLnRleHQoKTtyZXR1cm4gYS5hLnRhKGIsZSl9O2EuYmEuTmE9bmV3IGEuYmE7YS5lYyhhLmJhLk5hKTthLmIoXCJuYXRpdmVUZW1wbGF0ZUVuZ2luZVwiLGEuYmEpOyhmdW5jdGlvbigpe2EuWmE9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLkdkPWZ1bmN0aW9uKCl7aWYoIXZ8fFxuIXYudG1wbClyZXR1cm4gMDt0cnl7aWYoMDw9di50bXBsLnRhZy50bXBsLm9wZW4udG9TdHJpbmcoKS5pbmRleE9mKFwiX19cIikpcmV0dXJuIDJ9Y2F0Y2goYSl7fXJldHVybiAxfSgpO3RoaXMucmVuZGVyVGVtcGxhdGVTb3VyY2U9ZnVuY3Rpb24oYixlLGYsZyl7Zz1nfHx3O2Y9Znx8e307aWYoMj5hKXRocm93IEVycm9yKFwiWW91ciB2ZXJzaW9uIG9mIGpRdWVyeS50bXBsIGlzIHRvbyBvbGQuIFBsZWFzZSB1cGdyYWRlIHRvIGpRdWVyeS50bXBsIDEuMC4wcHJlIG9yIGxhdGVyLlwiKTt2YXIgaD1iLmRhdGEoXCJwcmVjb21waWxlZFwiKTtofHwoaD1iLnRleHQoKXx8XCJcIixoPXYudGVtcGxhdGUobnVsbCxcInt7a29fd2l0aCAkaXRlbS5rb0JpbmRpbmdDb250ZXh0fX1cIitoK1wie3sva29fd2l0aH19XCIpLGIuZGF0YShcInByZWNvbXBpbGVkXCIsaCkpO2I9W2UuJGRhdGFdO2U9di5leHRlbmQoe2tvQmluZGluZ0NvbnRleHQ6ZX0sZi50ZW1wbGF0ZU9wdGlvbnMpO2U9di50bXBsKGgsYixlKTtlLmFwcGVuZFRvKGcuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG52LmZyYWdtZW50cz17fTtyZXR1cm4gZX07dGhpcy5jcmVhdGVKYXZhU2NyaXB0RXZhbHVhdG9yQmxvY2s9ZnVuY3Rpb24oYSl7cmV0dXJuXCJ7e2tvX2NvZGUgKChmdW5jdGlvbigpIHsgcmV0dXJuIFwiK2ErXCIgfSkoKSkgfX1cIn07dGhpcy5hZGRUZW1wbGF0ZT1mdW5jdGlvbihhLGIpe3cud3JpdGUoXCI8c2NyaXB0IHR5cGU9J3RleHQvaHRtbCcgaWQ9J1wiK2ErXCInPlwiK2IrXCJcXHgzYy9zY3JpcHQ+XCIpfTswPGEmJih2LnRtcGwudGFnLmtvX2NvZGU9e29wZW46XCJfXy5wdXNoKCQxIHx8ICcnKTtcIn0sdi50bXBsLnRhZy5rb193aXRoPXtvcGVuOlwid2l0aCgkMSkge1wiLGNsb3NlOlwifSBcIn0pfTthLlphLnByb3RvdHlwZT1uZXcgYS5jYTthLlphLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1hLlphO3ZhciBiPW5ldyBhLlphOzA8Yi5HZCYmYS5lYyhiKTthLmIoXCJqcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmVcIixhLlphKX0pKCl9KX0pKCk7fSkoKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxca25vY2tvdXRcXFxcYnVpbGRcXFxcb3V0cHV0XFxcXGtub2Nrb3V0LWxhdGVzdC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxrbm9ja291dFxcXFxidWlsZFxcXFxvdXRwdXRcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1xcXFxicm93c2VyLmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXHByb2Nlc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVVzZXIodXNlcikge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJlc29sdmUoeyB1c2VyLCB0b2tlbjogXCJ0ZXN0LnRva2VuXCIgfSk7XHJcbiAgICAgIH0sIDEwMDApO1xyXG4gICAgfSk7XHJcbiAgfVxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJlL1UrOTdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcc2RrXFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXHNka1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmNvbnN0IGtvID0gcmVxdWlyZShcImtub2Nrb3V0XCIpO1xyXG5yZXF1aXJlKFwia25vY2tvdXQudmFsaWRhdGlvblwiKTtcclxuXHJcbmNvbnN0IGNyZWF0ZVVzZXIgPSByZXF1aXJlKFwic2RrXCIpO1xyXG5cclxua28udmFsaWRhdGlvbi5ydWxlcy5wYXR0ZXJuLm1lc3NhZ2UgPSBcIkludmFsaWQuXCI7XHJcblxyXG4vLyBrby52YWxpZGF0aW9uLmNvbmZpZ3VyZSh7XHJcbi8vICAgICByZWdpc3RlckV4dGVuZGVyczogdHJ1ZSxcclxuLy8gICAgIG1lc3NhZ2VzT25Nb2RpZmllZDogdHJ1ZSxcclxuLy8gICAgIGluc2VydE1lc3NhZ2VzOiB0cnVlLFxyXG4vLyAgICAgcGFyc2VJbnB1dEF0dHJpYnV0ZXM6IHRydWUsXHJcbi8vICAgICBtZXNzYWdlVGVtcGxhdGU6IG51bGxcclxuLy8gfSk7XHJcblxyXG5mdW5jdGlvbiBmaWVsZFZpZXdNb2RlbChcclxuICBzdGVwSWQsXHJcbiAgbmFtZSxcclxuICBsYWJlbCxcclxuICB2YWx1ZSxcclxuICB0ZW1wbGF0ZSxcclxuICB2YWxpZGF0aW9uLFxyXG4gIHByb3BzXHJcbikge1xyXG4gIC8vaWYgKCF2YWxpZGF0ZSlcclxuICAvL2xldCB2YWxpZGF0ZSA9ICgpID0+IHt9O1xyXG4gIGxldCBzZWxmID0ge1xyXG4gICAgbmFtZSxcclxuICAgIHN0ZXBJZCxcclxuICAgIHZhbDoga28ub2JzZXJ2YWJsZSh2YWx1ZSkuZXh0ZW5kKHZhbGlkYXRpb24pLFxyXG4gICAgdGVtcGxhdGU6IGtvLm9ic2VydmFibGUodGVtcGxhdGUpLFxyXG4gICAgbGFiZWw6IGtvLm9ic2VydmFibGUobGFiZWwpLFxyXG4gICAgdmlzaWJsZToga28ub2JzZXJ2YWJsZSh0cnVlKSxcclxuICAgIHByb3BzXHJcbiAgfTtcclxuICBzZWxmLl9faXNWYWxpZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9yZXR1cm4gdHJ1ZTtcclxuICAgIHJldHVybiBzZWxmLnZhbC5pc01vZGlmaWVkKCkgPyBzZWxmLnZhbC5pc1ZhbGlkKCkgOiB0cnVlO1xyXG4gIH07XHJcbiAgcmV0dXJuIHNlbGY7XHJcbn1cclxuXHJcbnZhciB2aWV3TW9kZWwgPSB7XHJcbiAgY3VycmVudFN0ZXBJZDoga28ub2JzZXJ2YWJsZSgwKSxcclxuICBmaWVsZHM6IGtvLm9ic2VydmFibGVBcnJheShbXHJcbiAgICBmaWVsZFZpZXdNb2RlbChcclxuICAgICAgMCxcclxuICAgICAgXCJuYW1lXCIsXHJcbiAgICAgIFwiTmFtZVwiLFxyXG4gICAgICBcIlwiLFxyXG4gICAgICBcImlucHV0VGVtcGxhdGVcIixcclxuICAgICAge1xyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgIG1pbkxlbmd0aDogM1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXI6IGtvLm9ic2VydmFibGUoXCJlZzogSm9obiBTbWl0aFwiKSxcclxuICAgICAgICB0eXBlOiBrby5vYnNlcnZhYmxlKFwic3RyaW5nXCIpXHJcbiAgICAgIH1cclxuICAgICksXHJcbiAgICBmaWVsZFZpZXdNb2RlbChcclxuICAgICAgMCxcclxuICAgICAgXCJhZ2VcIixcclxuICAgICAgXCJBZ2VcIixcclxuICAgICAgMTgsXHJcbiAgICAgIFwiaW5wdXRUZW1wbGF0ZVwiLFxyXG4gICAgICB7XHJcbiAgICAgICAgbWluOiAxOCxcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcGxhY2Vob2xkZXI6IGtvLm9ic2VydmFibGUoXCJZb3VyIGFnZVwiKSxcclxuICAgICAgICB0eXBlOiBrby5vYnNlcnZhYmxlKFwibnVtYmVyXCIpXHJcbiAgICAgIH1cclxuICAgICksXHJcbiAgICBmaWVsZFZpZXdNb2RlbChcclxuICAgICAgMSxcclxuICAgICAgXCJlbWFpbFwiLFxyXG4gICAgICBcIkVtYWlsXCIsXHJcbiAgICAgIFwiXCIsXHJcbiAgICAgIFwiaW5wdXRUZW1wbGF0ZVwiLFxyXG4gICAgICB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgZW1haWw6IHRydWVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHBsYWNlaG9sZGVyOiBrby5vYnNlcnZhYmxlKFwiZWc6IEpvaG5TbWl0aEBnbWFpbC5jb21cIiksXHJcbiAgICAgICAgdHlwZToga28ub2JzZXJ2YWJsZShcImVtYWlsXCIpXHJcbiAgICAgIH1cclxuICAgICksXHJcbiAgICBmaWVsZFZpZXdNb2RlbChcclxuICAgICAgMSxcclxuICAgICAgXCJuZXdzbGV0dGVyXCIsXHJcbiAgICAgIFwiTmV3c2xldHRlclwiLFxyXG4gICAgICBcImRhaWx5XCIsXHJcbiAgICAgIFwic2VsZWN0VGVtcGxhdGVcIixcclxuICAgICAge1xyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBvcHRpb25zQ2FwdGlvbjoga28ub2JzZXJ2YWJsZShcIkNob29zZSBhIHBlcmlvZFwiKSxcclxuICAgICAgICBvcHRpb25zOiBrby5vYnNlcnZhYmxlQXJyYXkoW1wiZGFpbHlcIiwgXCJ3ZWVrbHlcIiwgXCJtb250aGx5XCJdKVxyXG4gICAgICB9XHJcbiAgICApXHJcbiAgXSksXHJcbiAgY29tcGxldGVkOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcclxuICBoYW5kbGVTdWJtaXQ6ICgpID0+IHtcclxuICAgIGNvbnN0IHN0ZXBJZCA9IHZpZXdNb2RlbC5jdXJyZW50U3RlcElkKCk7XHJcbiAgICBjb25zdCBmaWx0ZXJlZFZpZXdNb2RlbCA9IHt9O1xyXG4gICAgdmlld01vZGVsXHJcbiAgICAgIC5zdGVwcygpXHJcbiAgICAgIFtzdGVwSWRdLmZpZWxkcygpXHJcbiAgICAgIC5tYXAoZmllbGQgPT4ge1xyXG4gICAgICAgIGZpbHRlcmVkVmlld01vZGVsW2ZpZWxkLm5hbWVdID0gZmllbGQudmFsO1xyXG4gICAgICB9KTtcclxuICAgIGNvbnN0IGZvcm1WaWV3TW9kZWwgPSBrby52YWxpZGF0ZWRPYnNlcnZhYmxlKGZpbHRlcmVkVmlld01vZGVsKTtcclxuICAgIGlmICghZm9ybVZpZXdNb2RlbC5pc1ZhbGlkKCkpIHtcclxuICAgICAgYWxlcnQoXCJQbGVhc2UgY29tcGxldGUgdGhlIGZvcm1cIik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChzdGVwSWQgKyAxIDwgdmlld01vZGVsLnN0ZXBzKCkubGVuZ3RoKSB7XHJcbiAgICAgIHZpZXdNb2RlbC5jdXJyZW50U3RlcElkKHN0ZXBJZCArIDEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy9jb21wbGV0ZWQgYWxsIHN0ZXBzXHJcbiAgICAgIGNvbnN0IHVzZXIgPSB7fTtcclxuICAgICAgdmlld01vZGVsLmZpZWxkcygpLm1hcChmaWVsZCA9PiB7XHJcbiAgICAgICAgdXNlcltmaWVsZC5uYW1lXSA9IGZpZWxkLnZhbCgpO1xyXG4gICAgICB9KTtcclxuICAgICAgY29uc29sZS5sb2coXCJ1c2VyIDpcIiwgdXNlcik7XHJcblxyXG4gICAgICBjcmVhdGVVc2VyKHVzZXIpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2aWV3TW9kZWwuY29tcGxldGVkKHRydWUpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgYWxlcnQoXCJzb210aGluZyB3ZW50IHdyb25nIHBsZWFzZSB0cnkgYWdhaW4gaW4gYSBtb21lbnRcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBwcmV2OiAoKSA9PiB7XHJcbiAgICB2aWV3TW9kZWwuY3VycmVudFN0ZXBJZCh2aWV3TW9kZWwuY3VycmVudFN0ZXBJZCgpIC0gMSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy9jb25zdCB2Vmlld01vZGVsID0ga292LnZhbGlkYXRlZE9ic2VydmFibGUodmlld01vZGVsKVxyXG52aWV3TW9kZWwuc3RlcHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xyXG4gIHtcclxuICAgIGJ0blRleHQ6IGtvLm9ic2VydmFibGUoXCJOZXh0XCIpLFxyXG4gICAgZmllbGRzOiBrby5vYnNlcnZhYmxlQXJyYXkoXHJcbiAgICAgIHZpZXdNb2RlbC5maWVsZHMoKS5maWx0ZXIoZmllbGQgPT4gZmllbGQuc3RlcElkID09PSAwKVxyXG4gICAgKVxyXG4gIH0sXHJcbiAge1xyXG4gICAgYnRuVGV4dDoga28ub2JzZXJ2YWJsZShcIkNyZWF0ZVwiKSxcclxuICAgIGZpZWxkczoga28ub2JzZXJ2YWJsZUFycmF5KFxyXG4gICAgICB2aWV3TW9kZWwuZmllbGRzKCkuZmlsdGVyKGZpZWxkID0+IGZpZWxkLnN0ZXBJZCA9PT0gMSlcclxuICAgIClcclxuICB9XHJcbl0pO1xyXG5cclxudmFyIGFwcEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKTtcclxua28uYXBwbHlCaW5kaW5ncyh2aWV3TW9kZWwsIGFwcEVsZW1lbnQpO1xyXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZS9VKzk3XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbWFpbi5qc1wiLFwiL1wiKSJdfQ==
