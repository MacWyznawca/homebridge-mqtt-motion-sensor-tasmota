# homebridge-mqtt-motion-sensor-tasmota

Plugin to HomeBridge optimized for work with Itead Sonoff hardware and firmware [Sonoff-Tasmota](https://github.com/arendst/Sonoff-Tasmota) via MQTT. It acts as a motion detector. Ex. connect the motion detector to GPIO14 and set GPIO14 as a switch in the configuration of the firmware Tasmota.

Like this? Please buy me a beer (or coffee) ;-) <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&amp;hosted_button_id=CK56Q7SFHEHSW"><img src="http://macwyznawca.pl/donate-paypal2.png" alt="Donate a coder" data-canonical-src="http://macwyznawca.pl/donate-paypal.svg" style="max-width:100%;"></a>

[MacWyznawca.pl](http://macwyznawca.pl) Jaromir Kopp

Installation
--------------------
    sudo npm install -g homebridge-mqtt-motion-sensor-tasmota

Sample HomeBridge Configuration (complete)
--------------------
{
    "bridge": {
        "name": "Homebridge",
        "username": "CC:22:3D:E3:CE:30",
        "port": 51826,
        "pin": "031-45-154"
    },
    
    "description": "This is an example configuration file. You can use this as a template for creating your own configuration file.",

    "platforms": [
    ],
	"accessories": [
	    {
			"accessory": "mqtt-motion-sensor-tasmota",
		
			"name": "NAME OF THIS ACCESSORY",
		
			"url": "mqtt://MQTT-ADDRESS",
			"username": "MQTT USER NAME",
			"password": "MQTT PASSWORD",
		
			"topics": {
				"statusGet": "stat/sonoff/POWER",
				"stateGet": "tele/sonoff/STATE"
			},
			"onValue": "ON",
			"offValue": "OFF",
		
			"activityTopic": "tele/sonoff/LWT",
	        "activityParameter": "Online",
        
			"startCmd": "cmnd/sonoff/TelePeriod",
			"startParameter": "60",

			"manufacturer": "ITEAD",
			"model": "Sonoff",
			"serialNumberMAC": "MAC OR SERIAL NUMBER"
		}
	]
}


Sample HomeBridge Configuration (minimal)
--------------------
{
    "bridge": {
        "name": "Homebridge",
        "username": "CC:22:3D:E3:CE:30",
        "port": 51826,
        "pin": "031-45-154"
    },
    
    "description": "This is an example configuration file. You can use this as a template for creating your own configuration file.",

    "platforms": [
    ],
	"accessories": [
	    {
			"accessory": "mqtt-motion-sensor-tasmota",
			"switchType": "outlet",
		
			"name": "NAME OF THIS ACCESSORY",
		
			"url": "mqtt://MQTT-ADDRESS",
			"username": "MQTT USER NAME",
			"password": "MQTT PASSWORD",
		
			"topics": {
				"statusGet": "stat/sonoff/POWER",
				"stateGet": "tele/sonoff/STATE"
			}
		}
	]
}

# Description of the configuration file.

**"switchType": "outlet"** - outlet for outlet emulation, other or empty for switch.

**sonoff** in topic - topics name of Your Sonoff switch.

**"stateGet": "tele/sonoff/STATE"** - topic for cyclic telemetry information.

**"activityTopic": "tele/sonoff/LWT"** - last will topic for check online state.

**"activityParameter": "Online"** - last will payload for online state.

**"startCmd": "cmnd/sonoff/TelePeriod"** -  command sent after the connection.

**"startParameter": "60"** - payload for **startCmd**.

