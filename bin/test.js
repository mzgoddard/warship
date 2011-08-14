////////////////////////////////////
// test.js - NODEjs simple server //
////////////////////////////////////

var path = require('path');
var express = require('express');

app = express.createServer();

var oneYear = 31557600000;
// console.log(__dirname);
var dir = path.dirname(__dirname);
// app.use(express.static(dir+'/source', {maxAge: -1}));
// app.use(express.static(dir+'/assets', {maxAge: -1}));
app.use(express.static(dir));

app.listen(9080);