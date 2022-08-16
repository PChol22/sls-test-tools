"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _testResult = require("../../utils/testResult");

var _default = {
  toHaveEventWithSource(Events, expectedSourceName) {
    let message;

    if (Events.Messages === undefined || Events.Messages.length < 1) {
      return (0, _testResult.testResult)("There are no events present.", false);
    }

    const parsedBody = JSON.parse(Events.Messages[0].Body);

    if (parsedBody.source === expectedSourceName) {
      message = `expected sent event to have source ${expectedSourceName}`;
      return (0, _testResult.testResult)(message, true);
    }

    message = `sent event source "${parsedBody.source ?? "undefined"}" does not match expected source "${expectedSourceName}"`;
    return (0, _testResult.testResult)(message, false);
  }

};
exports.default = _default;
//# sourceMappingURL=index.js.map