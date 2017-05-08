import * as http from "http";

export interface IBoiler
{
    mapToHTTP(): Promise<http.RequestOptions>;
    sendResponse(result: IResult): Promise<void>;
    sendError(error?: any): Promise<void>;
}

export interface IResult
{
    response: http.IncomingMessage;
    body: Buffer;
    headers: any;
    statusCode: number;
}