'use strict';

const gaPubsub = require('./ga-pubsub');

// Support CommonJS (Node.js, React)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = gaPubsub;
}

// Support ES6 Modules (Angular)
if (typeof exports !== 'undefined') {
  exports.default = gaPubsub;
}
