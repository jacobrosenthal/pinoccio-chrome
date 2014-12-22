var SerialPort = require("serialport");
var async = require('async');
var Bitlash = require('bitlash-js');
var util = require('util');

// //create a window incase we are running this from node
if(typeof window === 'undefined') window = this;

(function() {

var serialPorts = {};

function open(path, done){
  //return an error if path already assingned to a port?

  //add juggling to take a board object as argument
  var board = {
    name: "Pinoccio",
    baud: 115200,
    signature: new Buffer([0x1e, 0xa8, 0x02]),
    pageSize: 256,
    timeout: 400
  };

  var port = new SerialPort.SerialPort(path, {baudrate: board.baud});

    port.on('disconnect', function (err) {
      console.log("device disconnected", err);
    });

    port.on('error', function (err) {
      console.log("device error", err);
      port.close();
      serialPorts.splice(connectionId, 1);
    });

    port.on('close', function () {
      console.log("device closed");
    });

    port.on('open', function () {
      console.log("device opened");

      Bitlash.send(port, function(err){
        if(err){
          port.close();
          done(error);
        }
        console.log("device synced", err);

        serialPorts[path] = port;

        done(null);
      });

    });
}

function close(path, done){
  var port = serialPorts[path];
  if (!port) { return done(new Error("Device not open")); }

  port.close();
  delete serialPorts[path]

}

function send(path, cmds, done){
  var port = serialPorts[path];
  if (!port) { return done(new Error("Device not open")); }

  if (typeof(cmds) === 'String')
    cmds = [cmds];

  var cmd;

  async.whilst (
    function() {
      //shift undefined value if empty?
      cmd = cmds.shift();
      return (typeof cmd === 'object'); 
    },
    function(cbStep) {
      console.log("command", cmd);
      Bitlash.send(port, cmd, cbStep);
    },
    function(err) {

      //check why it failed
      //some types of errors mean need to invalidate connection
      //any serial errors
      //timeout probably
      //do I have a way to check the type of error or do you just check string equality?
      // if(something){
      //   port.close();
      //   serialPorts.splice(connectionId, 1);
      // }

      //but not
      //invalid command 
      //Prompt not at end
      console.log("send complete", err);
      done(err);
    });
}

function programWifi(path, ssid, pass, done){
  var port = serialPorts[path];
  if (!port) { return done(new Error("Device not open")); }

  var self = this;
  var timeout = 30000;

  async.series([
    function(cbStep){
      var opt = {
        timeout: 10000,
        cmd: util.format('wifi.config("%s", "%s")', ssid, pass)
      };

      Bitlash.send(port, opt, cbStep);
    },
    function(cbStep){
      var opt = {
        timeout: 2000,
        cmd: "wifi.reassociate"
      };

      Bitlash.send(port, opt, cbStep);
    },
    function(cbStep){
      waitWifi(port, 30000, cbStep);
    },
    ],
    function(err) {
      done(err);
    });
};

function waitWifi(port, timeout, done){
  var timedout = false;
  var ctc = false;

  var opt = {
    timeout: 2000,
    cmd: 'wifi.report'
  };

  setTimeout(function() { timedout = true; }, timeout);

  async.whilst (
    function() {
      return (!ctc || timedout); 
    }, 
    function(cbStep) {
      Bitlash.send(port, opt, function(err, response){
        if (err || typeof response === 'undefined') {
          return cbStep(err);
        }
        var resp = JSON.parse(response.toString());
        ctc = JSON.parse(resp.connected);
        cbStep();
      });
    }, 
    function(err) {
      done(err);
    });
}

window.device = {
  open: open,
  send:send,
  programWifi:programWifi,
  close: close
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

    self.device.send(process.argv[2], opt, function(err){
      console.log(err);
    });
  });
}