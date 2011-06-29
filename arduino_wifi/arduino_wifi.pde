#include <WiFly.h>
#include "Credentials.h"



byte server[] = { 184, 73, 237, 221 }; // bitponics on ec2

Client client(server, 1337);
//Client client("google.com", 80);

//Client client("http://ec2-184-73-237-221.compute-1.amazonaws.com/", 3000); // doesn't work with just a domain. need IP


int lightSensorPin = A0;
int lightSensorValue = 0;
int outPin = 13;

void setup() {

  pinMode(outPin, OUTPUT);
  Serial.begin(9600);
    Serial.println("launched");
  WiFly.begin();
//  if (!WiFly.join(ssid, passphrase)) { // For home
  if (!WiFly.join(ssid, passphrase, false)) { // For ITP
    Serial.println("Association failed.");
    while (1) {
      // Hang on failure.
    }
  }  

  WiFly.configure(WIFLY_BAUD, 38400);

  Serial.println("connecting...");

  if (client.connect()) {
    Serial.println("connected");
    client.println("GET / HTTP/1.0");
    client.println();
  } else {
    Serial.println("connection failed");
  }
  
}

void loop() {
  if (client.available()) {
    
    while(client.available()){
      char c = client.read();
      Serial.print(c);
      digitalWrite(outPin, HIGH);
    }
    digitalWrite(outPin, LOW);
    /*
    lightSensorValue = map(analogRead(lightSensorPin), 0, 400, 0, 100);
    String toSend = "{ \"sensorType\": \"light\", \"value\": ";
    toSend += lightSensorValue + "}";
    client.print(toSend);
    Serial.print(toSend);
    */
    delay(2000);
  }
  
  if (!client.connected()) {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();
  }
}



/*
// Version for node.js running locally, communication over serial
#define SERIAL_BAUDRATE 115200
#define OPC_PIN_MODE         0x01
#define OPC_DIGITAL_READ     0x02
#define OPC_DIGITAL_WRITE    0x03
#define OPC_ANALOG_REFERENCE 0x04
#define OPC_ANALOG_READ      0x05
#define OPC_ANALOG_WRITE     0x06

int LDR = 0;       // select the input pin for the LDR
int ledPin = 13;   // select the pin for the LED
int val = 0;       // variable to store the value coming from the sensor
int rangeStart = 930;
int rangeEnd = 1020;


void setup() {
  Serial.begin(SERIAL_BAUDRATE);
  pinMode(LDR, INPUT);       // declare the LDR as an INPUT
  pinMode(ledPin, OUTPUT);  // declare the ledPin as an OUTPUT
}



int sensorPin = A0;
int sensorValue = 0;

void loop() {
 
    val = analogRead(LDR);       // read the value from the sensor
    val = map(val, rangeStart, rangeEnd, 255, 0);
    
    
    String valStr = "";
    String valStr2 = valStr + val;
    //Serial.print(valStr2 + "|");    
    Serial.println(val);    
     
   while (Serial.available() > 0) {
      switch (Serial.read()) {
        case OPC_PIN_MODE: {
          //Serial.println("pinMode");
          pinMode(Serial.read(), Serial.read());
          break;
        }
        case OPC_DIGITAL_READ: {
          digitalRead(Serial.read());
          break;
        }
        case OPC_DIGITAL_WRITE: {
          Serial.println("digitalWrite");
          digitalWrite(Serial.read(), Serial.read());
          break;
        }
        case OPC_ANALOG_REFERENCE: {
          analogReference(Serial.read());
          break;
        }
        case OPC_ANALOG_READ: {
          
          analogRead(Serial.read());
          break;
        }
        case OPC_ANALOG_WRITE: {
          analogWrite(Serial.read(), Serial.read());
          break;
        default:
      
          
          break;
        }
      }
    }
 
   //delay(500);
 
} 

*/
