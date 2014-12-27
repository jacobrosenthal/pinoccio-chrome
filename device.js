var async = require('async');
var util = require('util');
var Device = require('device');

// //create a window incase we are running this from node
if(typeof window === 'undefined') window = this;

(function() {

var serialPorts = {};

function open(path, done){
  //return an error if path already assingned to a port?

  var options = {baudrate: 115200};

  Device.open(path, options, function(err, port){
    if(err){
      return done(err);
    }

    port.on('error', function (err) {
      console.log(path, "error", err);
      port.close();
      delete serialPorts[path];
    });

    port.on('close', function () {
      console.log(path, "closed");
    });

    serialPorts[path] = port;

  });
}

function close(path, done){
  var port = serialPorts[path];
  if (!port) { return done(new Error("Device not open")); }

  port.close();
  delete serialPorts[path];

}

function send(path, cmds, done){
  var port = serialPorts[path];
  if (!port) { return done(new Error("Device not open")); }

  Device.send(port, cmds, done);
}

function programWifi(path, ssid, pass, done){
  var port = serialPorts[path];
  if (!port) { return done(new Error("Device not open")); }

  Device.programWifi(port, ssid, pass, done);
}


function findWifi(path, timeout, done){
  var port = serialPorts[path];
  if (!port) { return done(new Error("Device not open")); }

  Device.findWifi(port, timeout, done);
}

function makeTroop(path, name, done){
  var port = serialPorts[path];
  if (!port) { return done(new Error("Device not open")); }

  Device.makeTroop(port, name, done);
}

window.device = {
  statelessSend: Device.statelessSend,
  open: open,
  send: send,
  close: close,
  findWifi: findWifi,
  programWifi: programWifi,
  makeTroop:makeTroop
};

})(window);

//if we are in node, upload to the supplied port
if(process && process.argv && process.argv[2] && process.argv[3])
{
  var self = this;
  this.device.open(process.argv[2], function(err){
    console.log(err);

    var opt = {
      timeout: 10000,
      cmd: process.argv[3]
    };

    self.device.send(process.argv[2], opt, function(err, data){
      console.log(err, data);
    });
  });
}