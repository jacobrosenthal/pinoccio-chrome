chrome.runtime.onMessageExternal.addListener(function(msg, sender, responder) {

  var cmds = {
  	getManifest:function(){
  	  responder(chrome.runtime.getManifest());
  	},
    bootload:function(){
      programmer.bootload(msg.path, msg.url, function(err) {
        var resp = {};
        if (err) resp.error = err;
        responder(resp);
      });
    },
    list:function(){
      programmer.listPorts(function(err, ports) {
        var resp = {};
        if (err) resp.error = err;
        resp.ports = ports;
        responder(resp);
      });
  	},
  	send:function(){
      device.send(msg.path, msg.cmd, function(err, data) {
        var resp = {};
        if (err) resp.error = err;
        if (data) resp.data = data;
        responder(resp);
      });
  	},
    batch:function(){
      device.batch(msg.path, msg.cmd, function(err, data) {
        var resp = {};
        if (err) resp.error = err;
        if (data) resp.data = data;
        responder(resp);
      });
    },
    programWifi:function(){
      device.programWifi(msg.path, msg.ssid, msg.pass, function(err) {
        var resp = {};
        if (err) resp.error = err;
        responder(resp);
      });
    },
    open:function(){
      device.open(msg.path, function(err){
        var resp = {};
        if (err) resp.error = err;
        responder(resp);
      });

    },
    close:function(){
      device.close(msg.connectionId, function(err){
        var resp = {};
        if (err) resp.error = err;
        responder(resp);
      });
    }
  };

  if (!cmds.hasOwnProperty(msg.op)) {
    return responder({error:"Unknown op"});
  }

  cmds[msg.op]();

  return true; // required if we want to respond after the listener
});

chrome.app.runtime.onLaunched.addListener(function(data) {
  console.log("We launched");

  var a = document.createElement('a');
  a.href = "http://guarded-journey-2862.herokuapp.com";
  a.target='_blank';
  a.click();
});