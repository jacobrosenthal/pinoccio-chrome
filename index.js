'use strict';

var Device = require('./device');

// //create a window incase we are running this from node
if(typeof window === 'undefined') { window = this; }

(function() {

  var serialPorts = {};

  function open(path, options, done){
    var existing = serialPorts[path];
    if (existing) { return done(new Error('Device already open')); }

    Device.open(path, options, function(err, port){
      if(err){
        return done(err);
      }

      port.on('disconnect', function (err) {
        console.log(path, 'disconnect', err);
        port.close();
        delete serialPorts[path];
      });

      port.on('error', function (err) {
        console.log(path, 'error', err);
        port.close();
        delete serialPorts[path];
      });

      serialPorts[path] = port;
      done();
    });
  }

  function close(path, done){
    var port = serialPorts[path];
    if (!port) { return done(new Error('Device not open')); }

    port.on('close', function () {
      console.log(path, 'closed');
      delete serialPorts[path];
      done();
    });

    port.close();
  }

  function send(path, cmds, timeout, done){
    var port = serialPorts[path];
    if (!port) { return done(new Error('Device not open')); }

    Device.send(port, cmds, timeout, done);
  }

  function programWifi(path, ssid, pass, done){
    var port = serialPorts[path];
    if (!port) { return done(new Error('Device not open')); }

    Device.programWifi(port, ssid, pass, done);
  }

  function findWifi(path, timeout, done){
    var port = serialPorts[path];
    if (!port) { return done(new Error('Device not open')); }

    Device.findWifi(port, timeout, done);
  }

  function configureScout(path, options, done){
    var port = serialPorts[path];
    if (!port) { return done(new Error('Device not open')); }

    Device.configureScout(port, options, done);
  }

  function statelessSend(path, options, cmds, timeout, done){
    var port = serialPorts[path];
    if (port) { return done(new Error('Device already open')); }

    Device.statelessSend(path, options, cmds, timeout, done);
  }

  function listConnectedPorts(done){
    done(null, serialPorts);
  }

  window.device = {
    statelessSend: statelessSend,
    open: open,
    send: send,
    close: close,
    findWifi: findWifi,
    programWifi: programWifi,
    configureScout:configureScout,
    bootload: Device.bootload,
    listAvailablePorts: Device.listPorts,
    listConnectedPorts: listConnectedPorts
  };

})(window);

//if we are in node, upload to the supplied port
if(process && process.argv && process.argv[2] && process.argv[3])
{
  window.device.bootload(process.argv[2], process.argv[3], function(err){
    console.log(err);
  });

  // var self = this;
  // this.device.open(process.argv[2], function(err){
  //   console.log(err);

  //   var opt = {
  //     timeout: 10000,
  //     cmd: process.argv[3]
  //   };

  //   self.device.send(process.argv[2], opt, function(err, data){
  //     console.log(err, data);
  //   });
  // });
};