import * as http from "http";
import * as url from "url";
import { IBoiler, IResult } from "../interfaces/IBoiler";

export default class LambdaBoiler implements IBoiler
{
    public constructor(private server: http.Server, private event: any, private context: any) {}
    public async mapToHTTP() : Promise<http.RequestOptions>
    {
        const options: http.RequestOptions = {};
        options.headers = this.event.headers;
        options.method = this.event.httpMethod;
        options.path = url.format({ pathname: this.event.path, query: this.event.queryStringParameters });
        options.socketPath = (this.server as any).socketPath;
        return options;
    }

    public async sendResponse(result: IResult): Promise<void>
    {
        let response = {statusCode: result.statusCode, headers: result.headers};
        (response as any).body = result.body ? result.body.toString("utf8") : "";
        this.context.succeed(response);
    }

    public async sendError(error?: any): Promise<void>
    {
        this.context.succeed({statusCode: 500, body: "", headers: {}});
    }
}