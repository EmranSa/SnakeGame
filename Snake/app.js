'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var SignalRJS = require('signalrjs');

var routes = require('./routes/index');
var users = require('./routes/users');

var globallib = require("./public/javascripts/globallib");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

//app.use('/gloabllib.js', express.static(__dirname + '/globallib.js'));

const gameInfoHolder = {
    clientsInfo: [],
    initNewClient: function (connectionid, userName, color) {
        this.clientsInfo.push({ connectionid: connectionid, userName: userName, color: color });
    },
    reset: function () {
        this.clientsInfo = [];
    }
};

//Init SignalRJs 
const signalR = SignalRJS();

let _clientCanvasWidth;
let _clientCanvasHeight;
let _isFirstUser = true;
let _lastFoodXY;
let _cw = 10;

function generateLocation() {
    _lastFoodXY = {
        x: Math.round(Math.random() * (_clientCanvasWidth - _cw) / _cw),
        y: Math.round(Math.random() * (_clientCanvasHeight - _cw) / _cw)
    };
}

//Create the hub connection 
//NOTE: Server methods are defined as an object on the second argument 
signalR.hub('signalRHub', {
    startNewClient: function (connectionid, userName, color, clientCanvasWidth, clientCanvasHeight) {
        if (_isFirstUser) {
            _clientCanvasWidth = clientCanvasWidth;
            _clientCanvasHeight = clientCanvasHeight;
            _isFirstUser = false;
            generateLocation();
        }

        this.clients.all.invoke('startBrodcastClient').withArgs([gameInfoHolder.clientsInfo, connectionid, userName, color]);
        gameInfoHolder.initNewClient(connectionid, userName, color);
    },
    setRemoteDirection: function(snakeId, direction) {
        this.clients.all.invoke('setRemoteDirectionCallBack').withArgs([snakeId, direction]);
    },
    getLastLocation: function() {
        this.clients.all.invoke('getLastLocationCallBack').withArgs([_lastFoodXY]);
    },
    generateFood: function() {
        generateLocation(); 
        this.clients.all.invoke('generateFoodCallBack').withArgs([_lastFoodXY]);
    },
    globalReset: function () {
        gameInfoHolder.reset();
        this.clients.all.invoke('globalResetCallBack').withArgs(['Reset']);
    }
});

app.use(express.static(__dirname));
app.use(signalR.createListener());


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
