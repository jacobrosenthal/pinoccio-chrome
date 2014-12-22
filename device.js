var SerialPort = require("serialport");
var async = require('async');
var Bitlash = require('bitlash-js');
var util = require('util');

// //create a window incase we are running this from node
if(typeof window === 'undefined') window = this;

(function() {

var serialPorts = [];

function connect(path, done){
  //return an error if path already assingned to a port?

  //add juggling to take a board object as argument
  var board = {
    name: "Arduino Uno",
    baud: 115200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
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

    port.on('data', function (data) {
      console.log("device received", data);
      console.log(data.toString());
    });

    port.on('open', function () {
      console.log("device opened");

      Bitlash.send(port, function(err){
        if(err){
          port.close();
          done(error);
        }
        console.log("device synced", err);

        var connectionId = serialPorts.push(port);

        done(null, connectionId-1);
      });

    });
}

function close(connectionId, done){
  var port = serialPorts[connectionId];
  if (!port) { return done(new Error("Device not open")); }

  port.close();
  serialPorts.splice(connectionId, 1);

  port.on("close", function(err){
      connect('/dev/tty.usbmodem1411', function(err){
        console.log("connected", err);
      });
  });

}

// function write(connectionId, cmds, done){
//   var port = serialPorts[connectionId];
//   if (!port) { return done(new Error("Device not open")); }

//   port.write(new Buffer("\n"), function(err){
//     console.log("written", err)
//   });
//     done(null);
// }

function send(connectionId, cmds, done){
  var port = serialPorts[connectionId];
  if (!port) { return done(new Error("Device not open")); }

  if (typeof(cmds) === 'String')
    cmds = [cmds];

  var cmd;

  async.whilst (
    function() {
      //shift undefined value if empty?
      cmd = cmds.shift();
      console.log(cmd);
      console.log(typeof cmd === 'object');
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

function programWifi(connectionId, ssid, pass, done){
  var port = serialPorts[connectionId];
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
  connect: connect,
  send:send,
  programWifi:programWifi,
  close: close
};

})(window);

//if we are in node, upload to the supplied port
if(process && process.argv && process.argv[2] && process.argv[3])
{
  var self = this;
  this.device.connect(process.argv[2], function(err){
    console.log(err);

    var opt = {
      timeout: 10000,
      cmd: process.argv[3]
    };
    self.device.send(0, opt, function(err){
      console.log(err);
    });
  });
}