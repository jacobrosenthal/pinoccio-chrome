var SerialPort = require('serialport');
var async = require('async');
var intel_hex = require('intel-hex');
var stk500 = require('stk500');
var rest = require('rest');
var Bitlash = require('bitlash-js');
var util = require('util');

/*
  port open serialport object
  troop object with troopId, scoutId and token
  returns error
*/
function configureScout(port, options, done){

  async.series([

    function(cbStep){
      var cmd = {
        timeout: 10000,
        cmd: 'hq.settoken("' + options.trooptoken + '")'
      };

      Bitlash.send(port, cmd, cbStep);

    },
    function(cbStep){
      var cmd = {
        timeout: 10000,
        cmd: 'mesh.config(' + options.scoutid + ', ' + options.troopid + ', 20)'
      };

      Bitlash.send(port, cmd, cbStep);

    },
    function(cbStep){
      var cmd = {
        timeout: 10000,
        cmd: 'mesh.setkey("' + options.trooptoken.substring(0, 16) + '")'
      };

      Bitlash.send(port, cmd, cbStep);

    }
  ], function(err){

    done(err);
  });

}

/*
  path string system path to connect to
  options serialport options object
  returns error, open serialport object
*/
function open(path, options, done){
  //return an error if path already assingned to a port?
  var port = new SerialPort.SerialPort(path, options);

  port.on('open', function () {
    console.log(path, 'opened');

    Bitlash.send(port, function(err){
      if(err){
        return done(err);
      }
      console.log(path, 'synced');

      done(null, port);
    });

  });
}

/*
  port open serialport object
  cmds command object, or array of command objects to send
  returns error, array of strings, including an empty array if the command has no response
*/
function send(port, cmds, done){
  if (cmds && cmds.constructor !== Array){
    cmds = [cmds];
  }

  var cmd;
  var results = [];

  async.whilst (
    function() {
      //shift undefined value if empty?
      cmd = cmds.shift();
      return (typeof cmd === 'object');
    },
    function(cbStep) {
      Bitlash.send(port, cmd, function(err, data){
        if(err){
          return done(err);
        }

        if(!data){
          data = [];
        }
        results.push(data);
        cbStep();
      });
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
      done(err, results);
    });
}

/*
  path string system path to connect to
  options serialport options object
  cmds command object, or array of command objects to send
  returns error, an array of array of strings, including an empty array if the command has no response
*/
function statelessSend(path, options, cmds, done){

  open(path, options, function(err, port){
    if(err){
      return done(err);
    }

    var data;
    var error;

    port.on('close', function () {
      console.log(path, 'closed');
      done(error, data);
    });

    port.on('error', function (err) {
      console.log(path, 'closed');
      error = err;
      port.close();
    });

    send(port, cmds, function(err, results){
      error = err;
      data = results;
      port.close();
    });

  });

}

/*
  returns error, array of serial objects (not serialports) see serialport list
*/
function listPorts(done){

  SerialPort.list(function (err, ports) {
    done(err, ports);
  });

}

/*
  path string system path to connect to
  url string of .hex file location
  returns error
*/
function bootload(path, url, done){

  var pageSize = 256;
  var baud = 115200;
  var delay1 = 10; //minimum is 2.5us, so anything over 1 fine?
  var delay2 = 1;
  var signature = new Buffer([0x1e, 0xa8, 0x02]);
  var options = {
    timeout:0xc8,
    stabDelay:0x64,
    cmdexeDelay:0x19,
    synchLoops:0x20,
    byteDelay:0x00,
    pollValue:0x53,
    pollIndex:0x03
  };

  var hex;

  var serialPort = new SerialPort.SerialPort(path, {
    baudrate: baud
  }, false);

  var programmer = new stk500(serialPort);

  async.series([
    function(cbStep){
      getHex(url, function(err, data){
        if(err){
          return cbStep(err);
        }

        hex = data;
        cbStep();
      });
    },
    function(cbStep){
      programmer.connect(cbStep);
    },
    function(cbStep){
      programmer.sync(3,cbStep);
    },
    function(cbStep){
      programmer.verifySignature(signature, cbStep);
    },
    function(cbStep){
      programmer.enterProgrammingMode(options, cbStep);
    },
    function(cbStep){
      programmer.upload(hex, pageSize,cbStep);
    },
    function(cbStep){
      programmer.exitProgrammingMode(cbStep);
    }
  ], function(err){

    serialPort.on('close', function () {
      done(err);
    });

    serialPort.close();
    
  });

}

/*
  url string of .hex file location
  returns error, Buffer object of hex bytes
*/
function getHex(url, done){

  rest(url).then(function(response) {
      //todo check some error https://www.npmjs.com/package/rest
    done(null, intel_hex.parse(response.entity).data);
  });

}

/*
  port open serialport object
  timeout Number of milliseconds
  returns error, array of strings enumerating wifi access points
*/
function findWifi(port, timeout, done){

  var timedout = false;
  var list;

  var opt = {
    timeout: 10000,
    cmd: 'wifi.list'
  };

  setTimeout(function() { timedout = true; }, timeout);

  async.whilst (
    function() {
      return (!list || timedout);
    },
    function(cbStep) {
      Bitlash.send(port, opt, function(err, results){
        if (err) {
          return cbStep(err);
        }

        if(typeof results === 'object' && results.length > 1 && results[0] !== 'Error: Scan failed')
        {
          list = results;
        }

        cbStep();

      });
    },
    function(err) {
      done(err, list);
    });
}

/*
  port open serialport object
  ssid string wifi ssid
  pass string of password
  returns error
*/
function programWifi(port, ssid, pass, done){

  var self = this;
  var timeout = 60000;

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
        cmd: 'wifi.reassociate'
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
}

/*
  port open serialport object
  timeout Number of milliseconds
  returns error
*/
function waitWifi(port, timeout, done){
  var timedout = false;
  var connected = false;

  var opt = {
    timeout: 2000,
    cmd: 'wifi.report'
  };

  setTimeout(function() { timedout = true; }, timeout);

  async.whilst (
    function() {
      return !(connected || timedout);
    },
    function(cbStep) {
      Bitlash.send(port, opt, function(err, results){
        if (err) {
          return cbStep(err);
        }

        // console.log(results[0]);
        if(results[0].indexOf('"connected":true') > 0){
          connected = true;
        }
        
        cbStep();
      });
    },
    function(err) {
      if(err){
        return done(err);
      }

      if(timedout){
        return done(new Error('timed out'));
      }

      done();
    });
}

module.exports = {
  findWifi: findWifi,
  programWifi: programWifi,
  open: open,
  send: send,
  configureScout: configureScout,
  bootload:bootload,
  listPorts:listPorts,
  statelessSend:statelessSend
};