import * as http from "http";
import { IBoiler, IResult } from "../interfaces/IBoiler";

export default class GCFBoiler implements IBoiler
{
    public constructor(private server: http.Server, private request: any, private response: any) {}
    public async mapToHTTP(): Promise<http.RequestOptions>
    {
        const options: http.RequestOptions = {};
        options.headers = this.request.headers;
        options.method = this.request.method;
        options.path = this.request.url;
        options.socketPath = (this.server as any).socketPath;
        return options;
    }

    public async sendResponse(result: IResult): Promise<void>
    {
        if (result.body)
            this.response.write(result.body);
        this.response.headers = result.headers;
        this.response.status(result.statusCode).send();
    }

    public async sendError(error?: any): Promise<void>
    {
        this.response.write(error);
        this.response.status(500).send();
    }
}