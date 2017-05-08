"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const gcf_boiler_1 = require("./lib/gcf-boiler");
const lambda_boiler_1 = require("./lib/lambda-boiler");
class CloudBoiler {
    constructor() {
        this.socketSuffix = 0;
        this.functionSpace = process.env.LAMBDA_TASK_ROOT ? functionSpace.lambda : functionSpace.gcf;
    }
    static getInstance() {
        if (!CloudBoiler.instance)
            CloudBoiler.instance = new CloudBoiler();
        return CloudBoiler.instance;
    }
    ignite(app) {
        this.server = http.createServer(app);
        this.server.on("error", err => { console.error("CloudBoiler couldn't create http server", err); ++this.socketSuffix; this.server.close(); })
            .on("listening", () => { console.log("CloudBoiler is now listening"); this.server._isListening = true; })
            .on("close", () => { console.log("CloudBoiler is closed"); this.server._isListening = false; });
    }
    boil(firstParam, secondParam) {
        let boiler;
        if (this.functionSpace === functionSpace.lambda)
            boiler = new lambda_boiler_1.default(this.server, firstParam, secondParam);
        else
            boiler = new gcf_boiler_1.default(this.server, firstParam, secondParam);
        try {
            if (this.server._isListening)
                this.work(boiler);
            else {
                this.server.socketPath = `/tmp/cloudboiler${this.socketSuffix}.sock`;
                this.server.listen(this.server.socketPath)
                    .on("listening", () => this.work(boiler))
                    .on("error", e => this.sendError(boiler, e));
            }
        }
        catch (e) {
            this.sendError(boiler, e);
        }
    }
    work(boiler) {
        boiler.mapToHTTP()
            .then(options => {
            return new Promise((resolve, reject) => {
                let bodyBuffer = new Array();
                const request = http.request(options, response => {
                    response.on("data", chunk => bodyBuffer.push(chunk))
                        .on("end", () => {
                        const result = { response, body: Buffer.concat(bodyBuffer), headers: response.headers, statusCode: response.statusCode || 500 };
                        resolve(result);
                    })
                        .on("error", error => this.sendError(boiler, error));
                });
                request.end();
            });
        })
            .then(result => boiler.sendResponse(result));
    }
    sendError(boiler, error) {
        if (error)
            console.error("CloudBoiler error");
        else
            console.error("CloudBoiler error", error);
        boiler.sendError(error);
    }
}
var functionSpace;
(function (functionSpace) {
    functionSpace[functionSpace["lambda"] = 0] = "lambda";
    functionSpace[functionSpace["gcf"] = 1] = "gcf";
})(functionSpace || (functionSpace = {}));
;
exports.default = CloudBoiler.getInstance();
//# sourceMappingURL=index.js.map