kiwapp.js
=========
[More informations here](http://developer.kiwapp.com/)

## How to install

### With bower
```
bower install kiwapp.js --save
```

### Without bower
Download this repository and use the kiwapp.js/kiwapp.js file

### Notice: For use this lib you must have a config folder at the racine of your project and a kiwapp_config.js inside

You can setup this example file inside your config folder:

	Kiwapp.set({
	    "appParameters":{
	        "osID":"webbrowser",
            "deviceIdentifier":"471558745454554246824212",
            "appInstanceId":"458",
            "driverVersion":"2.0.0"
	    }
	});
	
## List of features

 - General methods : 
    - Kiwapp.rotate() : Allow you to control the device orientation
    - Kiwapp.log() : Output a log in the driver JS console (debug version only)
     
 - Session methods : 
    - Kiwapp.session().start() : Start a new Kiwapp session (for the statistics for example)
    - Kiwapp.session().end() : End a Kiwapp session
    - Kiwapp.session().end().start() : Restart a Kiwapp session
    - Kiwapp.session().launchTimeout() : Wrap a callback method
    - Kiwapp.session().resetTimeout() : Stop the timeout
    - Kiwapp.session().relaunchTimeout() : Restart the timer for the callback method
    - Kiwapp.session().store() : Store some data
    - Kiwapp.session().send() : Send to a specified url the stored data
 
 - Statistic methods : 
    - Kiwapp.stats().page() : Send a statistic type page
    - Kiwapp.stats().event() : Send a statistic type event
    
 - Driver methods :
    - Kiwapp.driver().sendFile() : Send some files to a specified url
    - Kiwapp.driver().openNativeApp() : Open a native application (Android only)
    - Kiwapp.driver().openHTML5App() : Open a HTML5 application who is already in the Kiwapp container
    - Kiwapp.driver().print() : Send an print order to a zebra printer
    - Kiwapp.driver().closeApplication() : Close the current HTML5 application (you must specify a sharing key for this application)
    - Kiwapp.driver().openPhotoPicker() : Open the photo galery
    



