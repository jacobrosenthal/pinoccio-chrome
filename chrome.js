var editorExtensionId = 'hmeplpidlhmbaagjjkoghlgiphongmmg';

function isInstalled(done)
{
  if(typeof chrome.runtime === 'undefined')
  {
    return done(new Error('ReVent not installed'));
  }

  getManifest(function(err, data){
    if(err){
      return err;
    }

    done();
  });
}
/*
input
path: string '/dev/tty.usbmodem1411'
options object
done callback
*/
function configureScout(path, options, done){

  chrome.runtime.sendMessage(editorExtensionId, {op: 'configureScout', path: path, options: options},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done();

    });
}

/*
input
done callback
*/
function listAvailablePorts(done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'listAvailablePorts'},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}

/*
input
done callback
*/
function listConnectedPorts(done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'listConnectedPorts'},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}

/*
input
done callback
*/
function getManifest(done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'getManifest'},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}

/*
input
path: string '/dev/tty.usbmodem1411'
options object
done callback
*/
function open(path, options, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'open', path: path, options: options},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done();

    });
}

/*
input
path: string '/dev/tty.usbmodem1411'
done callback
*/
function close(path, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'close', path: path},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done();

    });
}

/*
input
path: string '/dev/tty.usbmodem1411'
cmds object or array
timeout: delay between sending commands
done callback
*/
function send(path, cmds, timeout, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'send', path: path, cmds:cmds, timeout:timeout},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}

/*
input
path: string '/dev/tty.usbmodem1411'
options object
cmds object or array
timeout: delay between sending commands
done callback
*/
function statelessSend(path, options, cmds, timeout, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'statelessSend', path: path, options: options, cmds: cmds, timeout:timeout},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}

/*
input
path: string '/dev/tty.usbmodem1411'
url string 'http://guarded-journey-2862.herokuapp.com/firmware/Bootstrap.cpp.hex'
cmds object or array
done callback
*/
function bootload(path, url, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'bootload', path: path, url: url},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done();

    });
}

/*
input
path: string '/dev/tty.usbmodem1411'
ssid string 'Filthy Worm Babies'
pass: string 'password'
done callback
*/
function programWifi(path, ssid, pass, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'programWifi', path: path, ssid: ssid, pass: pass},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done();

    });
}

/*
input
path: string '/dev/tty.usbmodem1411'
timeout: integer 
done callback
*/
function findWifi(path, timeout, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'findWifi', path: path, timeout:timeout},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError.message));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, parseWifi(response.data));

    });
}

/* not sure why yet, but can be of 2 types. So count from the last element instead of the first
["    IP              SubNet         Gateway   ", " 192.168.1.99:255.255.255.0:192.168.1.1 ", "       BSSID              SSID                     Channel  Type  RSSI Security", " 20:e5:2a:f7:3d:c2, Horatio Cornblower              , 01,  INFRA , -70 , WPA2-PERSONAL", " 06:26:bb:75:a3:bd, lain_1032                       , 11,  INFRA , -48 , WPA2-PERSONAL", " 00:26:bb:75:a3:bd, Filthy Worm Babies              , 11,  INFRA , -48 , WPA2-PERSONAL", "No.Of AP Found:3"]
or
"       BSSID              SSID                     Channel  Type  RSSI Security", " c2:9f:db:f1:ba:35, Mill Cue Club MB                , 01,  INFRA , -76 , WPA2-PERSONAL", " be:ae:c5:c3:6b:af, endgame-wifi                    , 06,  INFRA , -52 , WPA-PERSONAL", " bc:ae:c5:c3:6b:ae, endgamewifi                     , 06,  INFRA , -53 , WPA2-PERSONAL", " b0:05:94:c6:d2:f9, PS4-6E61D0A70E17                , 06,  INFRA , -68 , WPA2-PERSONAL", " 30:46:9a:9b:30:40, Ipoos                           , 08,  INFRA , -57 , WEP", "No.Of AP Found:5"
*/
function parseWifi(list){
  var headings = ['bssid', 'ssid', 'channel', 'type', 'rssi', 'security'];

  var last = list[list.length-1];
  var resultsRegex = /:([0-9]*)/;
  
  var regexed = last.match(resultsRegex);

  var count = 0;
  if(regexed && regexed.length > 1){
    count = regexed[1];
  }

  list = list.slice(list.length-1-count, list.length-1);
  
  var aps = [];
  list.forEach(function(row) {
    var ap = {};
    var columns = row.split(',');
    columns.forEach(function(e, idx) {
      var heading = headings[idx];
      ap[heading] = e.trim();
    });
    aps.push(ap);
  });
  return aps;
}

module.exports = {
  isInstalled: isInstalled,
  configureScout: configureScout,
  listAvailablePorts: listAvailablePorts,
  listConnectedPorts: listConnectedPorts,
  getManifest: getManifest,
  open: open,
  close: close,
  send: send,
  statelessSend: statelessSend,
  bootload: bootload,
  programWifi: programWifi,
  findWifi: findWifi
};