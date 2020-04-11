const int trigPin = 12;
const int echoPin = 13;

const int led[3] = {14, 26, 33};
const int gnd[3] = {27, 25, 32};

int brightness = 0;   
int fadeAmount = 5;    

long duration;
int distance;

void setup() {
  
    pinMode(gnd[0], OUTPUT);
    digitalWrite(gnd[0], 0);
    pinMode(gnd[1], OUTPUT);
    digitalWrite(gnd[1], 0);
    pinMode(gnd[2], OUTPUT);
    digitalWrite(gnd[2], 0);
        
    ledcAttachPin(led[0], 0);
    ledcAttachPin(led[1], 1);
    ledcAttachPin(led[2], 2);
    ledcSetup(0, 4000, 8); 
    ledcSetup(1, 4000, 8); 
    ledcSetup(2, 4000, 8); 
    
    pinMode(trigPin, OUTPUT); 
    pinMode(echoPin, INPUT); 

    Serial.begin(115200);
}

void loop() {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);

    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    duration = pulseIn(echoPin, HIGH);
    
    distance= duration*0.034/2;
    
    if(distance < 10){
      for(int i=0; i<3; i++){
        //digitalWrite(led[i], 1);
        ledcWrite(i, 255);
        delay(50);
        ledcWrite(i, 0);
        delay(100);
      }
    }
    else{
      ledcWrite(0, brightness); 
      ledcWrite(1, brightness);
      ledcWrite(2, brightness);
    
      brightness = brightness + fadeAmount;
      
      if (brightness <= 0 || brightness >= 255) {
          fadeAmount = -fadeAmount;
          delay(250);
      }
       delay(30);
    }
    Serial.print("Distance: ");
    Serial.println(distance);
}
