# multicloud-serverless-express
Boilerplate javascript to wrap AWS Lambda and Google Cloud Functions into the ExpressJS framework when using the serverless framework.  Empowers CRUD operations between clouds with a one-function-per-resource approach.

## Example
With API Gateway and Lambda, you'd typically write a handler as such
``` javascript
exports.handler = (event, context) => {
    // Do something important
    // ...
    context.succeed({statusCode: 200, body: "some result"});
}
```

Using http with Google Cloud Functions, you'd write a slightly different handler
``` javascript
exports.handler = (req, res) => {
    // Do something important
    // ...
    res.status(200).send("some result");
}
```

The rub - how do you keep your `serverless.yml` configs and handlers generic?
### Icky Workaround 1 - Multiple handlers

``` yml
- lambda.serverless.yml
...
functions:
  example:
    handler: index.lambdaHandler
```

``` yml
- gcf.serverless.yml
...
functions:
  example:
    handler: gcfHandler
```
Not only are the serverless files referencing different pieces of code, your handlers must be coded differently to serialize/deserialize requests/responses for each cloud

### Icky Workaround 2 - Shared handler with boiler plate

``` javascript
exports.handler = (firstParam, secondParam) => {
    // Are we in lambda or gcf?
    // Uniquely rip out the headers, path, method and body from the request
    // Somehow pipe request to express for routing
    // Do some generic logic
    // Uniquely assemble response
}
```

### A better way

``` javascript
const express = require("express");
const CloudBoiler = require("multicloud-serverless-express").default;

const app = express();
app.get("/customPath/:echo", (req, res) => {
    // Called by both clouds with identical request/response models!
    res.send(`It works! You sent ${req.params.echo}`));
};
CloudBoiler.ignite(app);

exports.handler = (firstParam, secondParam) => CloudBoiler.boil(firstParam, secondParam);
```

## Install
``` bash
npm install multicloud-serverless-express --save
```
Or
``` bash
yarn add multicloud-serverless-express --save
```

## Run the example
In the `example` folder, you'll see a minimal and complete serverless project using Lambda and GCF.  You'll want to modify gcf/lambda.serverless.yml for your environments before running.  To run, navigate to the `example` folder and execute `npm run deploy-lambda` or `npm run deploy-gcf`.

## Best practices
**Serverless** - When dealing with multiple clouds, the [serverless folks suggest](https://github.com/serverless/serverless/issues/1328#issuecomment-226717626) multiple `serverless.yml` files rather than trying to be fancy with variables/overrides.  This makes sense as each cloud has different functionality including raw syntax!  Take a look at the [package.json example](example/package.json) for a simple idea on managing multiple serverless files during deployment.

**Express** - Google Cloud Functions do not have a fancy API gateway driving a resource-centric, CRUD pattern.  GCF also doesn't allow one to nest path's beyond one level deep.  That's ok though because we love express!  This project embraces one function per resource.  IE, CRUD operations against a resource such as `/person` (POST - `/person` or GET/DELETE/PATCH - `/person/:id`).  For consistency between clouds, we must be sure to configure dynamic pathing within API Gateway:
``` yml
events:
    - http:
        path: /{fullPath+}
```