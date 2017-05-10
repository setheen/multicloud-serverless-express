"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
class LambdaBoiler {
    constructor(server, event, context) {
        this.server = server;
        this.event = event;
        this.context = context;
    }
    mapToHTTP() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {};
            options.headers = this.event.headers;
            options.method = this.event.httpMethod;
            const pathname = this.event.path.replace(/\/[a-zA-Z0-9]*/, ""); // Strip resource name off the path
            options.path = url.format({ pathname, query: this.event.queryStringParameters });
            options.socketPath = this.server.socketPath;
            return options;
        });
    }
    sendResponse(result) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = { statusCode: result.statusCode, headers: result.headers };
            response.body = result.body ? result.body.toString("utf8") : "";
            this.context.succeed(response);
        });
    }
    sendError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            this.context.succeed({ statusCode: 500, body: "", headers: {} });
        });
    }
}
exports.default = LambdaBoiler;
//# sourceMappingURL=lambda-boiler.js.map