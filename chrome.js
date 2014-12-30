var editorExtensionId = 'hmeplpidlhmbaagjjkoghlgiphongmmg';

function configureScout(path, options, done){

  chrome.runtime.sendMessage(editorExtensionId, {op: 'configureScout', path: path, options: options},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}

function listAvailablePorts(done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'listAvailablePorts'},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}

function listConnectedPorts(done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'listConnectedPorts'},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}

function getManifest(done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'getManifest'},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}

function open(path, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'open', path: path},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done();

    });
}

function close(path, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'close', path: path},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done();

    });
}

function send(path, cmds, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'send', path: path, cmds:cmds},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}


function statelessSend(path, options, cmds, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'statelessSend', path: path, options: options, cmds: cmds},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}


function bootload(path, url, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'bootload', path: path, url: url},
    function(response) {
      if(chrome.runtime.lastError && !isEmpty(chrome.runtime.lastError)){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done();

    });
}

function programWifi(path, ssid, pass, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'programWifi', path: path, ssid: ssid, pass: pass},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done();

    });
}

function findWifi(path, timeout, done)
{
  chrome.runtime.sendMessage(editorExtensionId, {op: 'findWifi', path: path, timeout:timeout},
    function(response) {
      if(chrome.runtime.lastError){
        return done(new Error(chrome.runtime.lastError));
      }

      if(response && response.error){
        return done(new Error(response.error));
      }

      done(null, response.data);

    });
}