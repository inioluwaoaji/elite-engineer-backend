const jsonLogic = require('json-logic-js');

function executeRule(rule, data) {
  return jsonLogic.apply(rule, data);
}

module.exports = { executeRule };