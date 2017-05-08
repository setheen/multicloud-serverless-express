const express = require("express");
const app = express();
const CloudBoiler = require("./dist/index.js");

app.get("/test1", (req, res) =>
{
    res.json({some: "value"});
});

app.get("/test2/deeper/:part", (req, res) =>
{
    res.send(`You sent ${req.params.part}`);
});

CloudBoiler.default.ignite(app);

exports.test = (firstParam, secondParam) => CloudBoiler.default.boil(firstParam, secondParam);