#NOTE
This was modularized into 2 other repos. Please go there:
* https://github.com/jacobrosenthal/chrome-serialport
* https://github.com/jacobrosenthal/pinoccio-serial-unofficial

##pinoccio-chrome
Setup your Pinoccio via front end javascript just like the 'hq' app. Uses [Google Chrome Messaging](https://developer.chrome.com/extensions/messaging) to pass data from USB devices to front end code. A replacement for the, currently, unreleased Pinoccio HQ app.

##INSTALL
install node modules
```npm i```
Then build with gulp
```gulp```
Go to chrome://extensions/ and check developer mode in the upper right corner. Then load unpacked extension and choose this directory.

##RUN
Functionality is very limited out of the box as Chrome's security policy is very strict. Front end javascript can only access USB devices if this application is installed from the Google Chrome App store and if you're on the whitelisted domain listed in the manifest.json. This means until you upload to Chrome App Store as your own app, you can only test available functions attached to window via the extensions background page development console. See index.js for the commands attached to window.

##Make it your own
Edit main.js and manifest.json and replace my domain, guarded-journey, with your domain. Then see [Google Developer Pages](https://developer.chrome.com/webstore) for how to get your app uploaded. The chrome.js has the functions that interact with this extension, and can be copied to your domain and called from your front end code.
