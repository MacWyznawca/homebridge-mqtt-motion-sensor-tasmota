// Sonoff-Tasmota Motion Sensor Accessory plugin for HomeBridge
//
// Remember to add accessory to config.json. Example:
/* 	"accessories": [
	{
		"accessory": "mqtt-motion-sensor-tasmota",
		"name": "Motion Sensor",
		
		"url": "mqtt://MQTT-BROKER-ADDRESS",
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

	}]
*/
// When you attempt to add a device, it will ask for a "PIN code".
// The default code for all HomeBridge accessories is 031-45-154.

'use strict';

var Service, Characteristic;
var mqtt = require("mqtt");

module.exports = function(homebridge) {
  	Service = homebridge.hap.Service;
  	Characteristic = homebridge.hap.Characteristic;

  	homebridge.registerAccessory("homebridge-mqtt-motion-sensor-tasmota", "mqtt-motion-sensor-tasmota", MotionSensorTasmotaAccessory);
}

function MotionSensorTasmotaAccessory(log, config) {
  	this.log          	= log;
  	
  	this.url 			= config["url"];
    this.publish_options = {
      qos: ((config["qos"] !== undefined)? config["qos"]: 0)
    };
    
	this.client_Id 		= 'mqttjs_' + Math.random().toString(16).substr(2, 8);
	this.options = {
	    keepalive: 10,
    	clientId: this.client_Id,
	    protocolId: 'MQTT',
    	protocolVersion: 4,
    	clean: true,
    	reconnectPeriod: 1000,
    	connectTimeout: 30 * 1000,
		will: {
			topic: 'WillMsg',
			payload: 'Connection Closed abnormally..!',
			qos: 0,
			retain: false
		},
	    username: config["username"],
	    password: config["password"],
    	rejectUnauthorized: false
	};
	
	this.topicStatusGet	= config["topics"].statusGet;
	this.topicsStateGet	= (config["topics"].stateGet  !== undefined) ? config["topics"].stateGet : "";
	
	this.onValue = (config["onValue"] !== undefined) ? config["onValue"]: "ON";
    this.offValue = (config["offValue"] !== undefined) ? config["offValue"]: "OFF";

	if (config["activityTopic"] !== undefined && config["activityParameter"] !== undefined) {
		this.activityTopic = config["activityTopic"];
	  	this.activityParameter = config["activityParameter"];
	}
	else {
		this.activityTopic = "";
	  	this.activityParameter = "";
	}
	
	this.name = config["name"] || "Sonoff";
  	this.manufacturer = config['manufacturer'] || "ITEAD";
	this.model = config['model'] || "Sonoff";
	this.serialNumberMAC = config['serialNumberMAC'] || "";
  	
	this.motionDetected = false;
	
	this.service = new Service.MotionSensor(this.name);

	
	this.service
    	.getCharacteristic(Characteristic.MotionDetected)
    	.on('get', this.getStatus.bind(this))

	if(this.activityTopic !== "") {
		this.service.addOptionalCharacteristic(Characteristic.StatusActive);
		this.service
			.getCharacteristic(Characteristic.StatusActive)
			.on('get', this.getStatusActive.bind(this));
	}


	this.client = mqtt.connect(this.url, this.options);
	var that = this;
	this.client.on('error', function () {
		that.log('Error event on MQTT');
	});
	
	this.client.on('connect', function () {
		if (config["startCmd"] !== undefined && config["startParameter"] !== undefined) {
			that.client.publish(config["startCmd"], config["startParameter"]);
		}
	});
		
	this.client.on('message', function (topic, message) {
		if (topic == that.topicStatusGet) {
			var status = message.toString();
			that.motionDetected = (status == this.onValue) ? true : false;
		   	that.service.getCharacteristic(Characteristic.MotionDetected).setValue(that.motionDetected, undefined);
		}
		
		if (topic == that.topicsStateGet) {
			var data = JSON.parse(message);
			
			if (data.hasOwnProperty("POWER")) { 
				var status = data.POWER;
				that.motionDetected = (status == this.onValue);
		   		that.service.getCharacteristic(Characteristic.MotionDetected).setValue(that.motionDetected, undefined);
			}
		} else if (topic == that.activityTopic) {
			var status = message.toString(); 	
			that.activeStat = (status == that.activityParameter);
			that.service.setCharacteristic(Characteristic.StatusActive, that.activeStat);
		}
	});
    this.client.subscribe(this.topicStatusGet);
	if(this.topicsStateGet !== ""){
	  	this.client.subscribe(this.topicsStateGet);
 	}
	if(this.activityTopic !== ""){
	  	this.client.subscribe(this.activityTopic);
 	}
}

MotionSensorTasmotaAccessory.prototype.getStatus = function(callback) {
    callback(null, this.motionDetected);
}

MotionSensorTasmotaAccessory.prototype.setStatus = function(status, callback) {
	this.motionDetected = status;
	this.client.publish(this.topicStatusSet, status ? this.onValue : this.offValue, this.publish_options);
	callback();
}

MotionSensorTasmotaAccessory.prototype.getStatusActive = function(callback) {
    callback(null, this.activeStat);
}

MotionSensorTasmotaAccessory.prototype.getOutletUse = function(callback) {
    callback(null, true); // If configured for outlet - always in use (for now)
}

MotionSensorTasmotaAccessory.prototype.getServices = function() {

	var informationService = new Service.AccessoryInformation();

	informationService
		.setCharacteristic(Characteristic.Name, this.name)
		.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
		.setCharacteristic(Characteristic.Model, this.model)
		.setCharacteristic(Characteristic.SerialNumber, this.serialNumberMAC);

	return [informationService, this.service];
}