chrome.runtime.onMessageExternal.addListener(function(msg, sender, responder) {

  var cmds = {
    getManifest:function(){
      var resp = {};
      resp.data = chrome.runtime.getManifest();
      responder(resp);
    },
    configureScout:function(){
      device.configureScout(msg.path, msg.options, function(err) {
        console.log(err);
        var resp = {};
        if (err){ resp.error = err.message; }
        responder(resp);
      });
    },
    bootload:function(){
      device.bootload(msg.path, msg.url, function(err) {
        console.log(err);
        var resp = {};
        if (err){ resp.error = err.message; }
        responder(resp);
      });
    },
    listAvailablePorts:function(){
      device.listAvailablePorts(function(err, data) {
        console.log(err, data);
        var resp = {};
        if (err){ resp.error = err.message; }
        if (data){ resp.data = data; }
        responder(resp);
      });
    },
    listConnectedPorts:function(){
      device.listConnectedPorts(function(err, data) {
        console.log(err, data);
        var resp = {};
        if (err){ resp.error = err.message; }
        if (data){ resp.data = data; }
        responder(resp);
      });
    },
    send:function(){
      device.send(msg.path, msg.cmds, function(err, data) {
        console.log(err, data);
        var resp = {};
        if (err){ resp.error = err.message; }
        if (data){ resp.data = data; }
        responder(resp);
      });
    },
    //beware, opens its own port
    statelessSend:function(){
      device.statelessSend(msg.path, msg.options, msg.cmds, function(err, data) {
        console.log(err, data);
        var resp = {};
        if (err){ resp.error = err.message; }
        if (data){ resp.data = data; }
        responder(resp);
      });
    },
    programWifi:function(){
      device.programWifi(msg.path, msg.ssid, msg.pass, function(err) {
        console.log(err);
        var resp = {};
        if (err){ resp.error = err.message; }
        responder(resp);
      });
    },
    findWifi:function(){
      device.findWifi(msg.path, msg.timeout, function(err, data) {
        console.log(err, data);
        var resp = {};
        if (err){ resp.error = err.message; }
        if (data){ resp.data = data; }
        responder(resp);
      });
    },
    open:function(){
      device.open(msg.path, msg.options, function(err){
        console.log(err);
        var resp = {};
        if (err){ resp.error = err.message; }
        responder(resp);
      });

    },
    close:function(){
      device.close(msg.path, function(err){
        console.log(err);
        var resp = {};
        if (err){ resp.error = err.message; }
        responder(resp);
      });
    }
  };

  if (!cmds.hasOwnProperty(msg.op)) {
    return responder({error:'Unknown op'});
  }

  cmds[msg.op]();

  return true; // required if we want to respond after the listener
});

chrome.app.runtime.onLaunched.addListener(function(data) {
  var a = document.createElement('a');
  a.href = 'http://guarded-journey-2862.herokuapp.com';
  a.target='_blank';
  a.click();
});