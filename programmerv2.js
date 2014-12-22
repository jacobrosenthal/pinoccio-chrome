//npm linking the stk500 v2 branch here until the proper pinoccio release
var SerialPort = require("serialport");
var intel_hex = require('intel-hex');
var stk500 = require('stk500');
var async = require("async");
var fs = require('fs');
var rest = require('rest');

// //create a window incase we are running this from node
if(typeof window === 'undefined') window = this;

(function() {

function listPorts(done){

  SerialPort.list(function (error, ports) {
    done(error, ports);
  });

}

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
    function(cbdone){
      getHex(url, function(error, data){
        hex = data;
        cbdone();
      });
    },
    function(cbdone){
      programmer.connect(cbdone);
    },
    function(cbdone){
      programmer.reset(delay1, delay2, cbdone);
    },
    function(cbdone){
      programmer.sync(3,cbdone);
    },
    function(cbdone){
      programmer.verifySignature(signature, cbdone);
    },
    function(cbdone){
      programmer.enterProgrammingMode(options, cbdone);
    },
    function(cbdone){
      programmer.upload(hex, pageSize,cbdone);
    },
    function(cbdone){
      programmer.exitProgrammingMode(cbdone);
    }    
  ], function(error){

    programmer.disconnect(function(err){
      console.log(err);
    });

    done(error);
  });

}

function getHex(url, done){

  rest(url).then(function(response) {
      done(null, intel_hex.parse(response.entity).data);
  });

}

window.programmer = {
  bootload:bootload,
  listPorts:listPorts
};

})(window);

//if we are in node, upload to the supplied port
if(process && process.argv && process.argv[2]  && process.argv[3] )
{
  this.programmer.bootload(process.argv[2], process.argv[3], function(error){
    console.log(error);
  });
}