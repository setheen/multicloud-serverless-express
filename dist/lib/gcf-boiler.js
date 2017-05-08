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
class GCFBoiler {
    constructor(server, request, response) {
        this.server = server;
        this.request = request;
        this.response = response;
    }
    mapToHTTP() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {};
            options.headers = this.request.headers;
            options.method = this.request.method;
            options.path = this.request.url;
            options.socketPath = this.server.socketPath;
            return options;
        });
    }
    sendResponse(result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (result.body)
                this.response.write(result.body);
            this.response.headers = result.headers;
            this.response.status(result.statusCode).send();
        });
    }
    sendError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            this.response.write(error);
            this.response.status(500).send();
        });
    }
}
exports.default = GCFBoiler;
//# sourceMappingURL=gcf-boiler.js.map