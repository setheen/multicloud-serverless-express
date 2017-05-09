import * as http from "http";
import { Express } from "express";

import { IBoiler, IResult } from "./interfaces/IBoiler";
import GCFBoiler from "./lib/gcf-boiler";
import LambdaBoiler from "./lib/lambda-boiler";

class CloudBoiler
{
    private static instance: CloudBoiler;
    private server: http.Server;
    private functionSpace: functionSpace;
    private socketSuffix: number = 0;
    
    private constructor()
    {
        this.functionSpace =  process.env.LAMBDA_TASK_ROOT ? functionSpace.lambda : functionSpace.gcf;
    }
    
    static getInstance()
    {
        if (!CloudBoiler.instance)
            CloudBoiler.instance = new CloudBoiler();
        return CloudBoiler.instance;
    }

    public ignite(app: Express)
    {
        this.server = http.createServer(app);
        this.server.on("error", err => { console.error("CloudBoiler couldn't create http server", err); ++this.socketSuffix; this.server.close(); })
        .on("listening", () => { console.log("CloudBoiler is now listening"); (this.server as any)._isListening = true; })
        .on("close", () => { console.log("CloudBoiler is closed"); (this.server as any)._isListening = false; });
    }

    public boil(firstParam: any, secondParam: any)
    {
        let boiler: IBoiler;
        if (this.functionSpace === functionSpace.lambda)
            boiler = new LambdaBoiler(this.server, firstParam, secondParam);
        else
            boiler = new GCFBoiler(this.server, firstParam, secondParam);

        try
        {
            if ((this.server as any)._isListening)
                this.work(boiler);
            else
            {
                (this.server as any).socketPath = `/tmp/cloudboiler${this.socketSuffix}.sock`;
                this.server.listen((this.server as any).socketPath)
                .on("listening", () => this.work(boiler))
                .on("error", e => this.sendError(boiler, e));
            }
        }
        catch (e)
        {
            this.sendError(boiler, e);
        }
    }

    private work(boiler: IBoiler)
    {    
        boiler.mapToHTTP()
        .then(options => 
        {
            return new Promise<IResult>((resolve, reject) =>
            {
                let bodyBuffer = new Array<any>();
                const request = http.request(options, response =>
                {
                    response.on("data", chunk => bodyBuffer.push(chunk))
                    .on("end", () => {
                        const result: IResult = {response, body: Buffer.concat(bodyBuffer), headers: response.headers, statusCode: response.statusCode || 500};
                        resolve(result);
                    })
                    .on("error", error => this.sendError(boiler, error));
                });
                request.end();
            });
        })
        .then(result => boiler.sendResponse(result));
    }

    private sendError(boiler: IBoiler, error?: any)
    {
        if (error)
            console.error("CloudBoiler error");
        else
            console.error("CloudBoiler error", error);
        boiler.sendError(error);
    }
}

enum functionSpace { lambda, gcf };

export default CloudBoiler.getInstance();