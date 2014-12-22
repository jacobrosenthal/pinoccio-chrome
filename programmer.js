var SerialPort = require("serialport");
var intel_hex = require('intel-hex');
var Stk500 = require('stk500');
var async = require('async');
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

  var board = {
    name: "Arduino Uno",
    baud: 115200,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    timeout: 400
  };

  var hex;
  var serialPort;

  async.series([
    function(cbdone){
      getHex(url, function(error, data){
        hex = data;
        cbdone();
      });
    },
    function(cbdone){
      serialPort = new SerialPort.SerialPort(path, {
          baudrate: board.baud,
        }, cbdone);
    },
    function(cbdone){
      Stk500.bootload(serialPort, hex, board, cbdone);
    },
    function(cbdone){
      serialPort.close(cbdone);
    }], 
    function(error){
      return done(error);
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