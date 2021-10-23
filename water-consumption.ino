#include <ArduinoWebsockets.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

#ifndef STASSID
#define STASSID "GALVAO"
#define STAPSK  "minhasenha123"
#endif

#define BUTTON D3 // Botão flash arduino
#define SENSOR D2 // Sensor
#define DEBUG true
#define LEDTEST false

/*****************************************************************************************/
/************************************** SENSOR *******************************************/
/*****************************************************************************************/
long currentMillis = 0;
long previousMillis = 0;
long previousMillisService = 0;
int interval = 1000;
long oneHour = 3600000;
float calibrationFactor = 5;
volatile byte pulseCount;
byte pulse1Sec = 0;
float flowRate;
unsigned long flowMilliLitres;
unsigned int totalMilliLitres;
float flowLitres;
float totalLitres;

void IRAM_ATTR pulseCounter()
{
  pulseCount++;
}
/*****************************************************************************************/

/*****************************************************************************************/
/************************** WEBSOCKET ***************************************************/
/*****************************************************************************************/
const char* ssid = STASSID; // Nome da rede
const char* password = STAPSK; // Senha da rede
const char* websockets_server_host = "10.10.2.228"; // IP do servidor websocket
const int websockets_server_port = 80; // Porta de conexão do servidor

// Utilizamos o namespace de websocket para podermos utilizar a classe WebsocketsClient
using namespace websockets;

// Objeto websocket client
WebsocketsClient client;
/*****************************************************************************************/

// Led
const int led = LED_BUILTIN;
//const char* contador = 0;
int buttonState = LOW;


void setup() {
  // Inicia a serial com velocidade de 115200
  Serial.begin(115200);

  // Definimos o pino como saída
  pinMode(led, OUTPUT);
  // Definindo botão flash como entrada
  pinMode(BUTTON, INPUT_PULLUP);

  //configuracao do pino do sensor como entrada em nivel logico alto
  pinMode(SENSOR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(SENSOR), pulseCounter, FALLING);

  // Valor inicial variáveis
  pulseCount = 0;
  flowRate = 0.0;
  flowMilliLitres = 0;
  totalMilliLitres = 0;
  previousMillis = 0;
  previousMillisService = 0;



  WiFi.mode(WIFI_STA);

  // Conectamos o wifi
  WiFi.begin(ssid, password);

  // Enquanto não conectar printamos um "."
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  // Exibimos "WiFi Conectado"
  Serial.println("Connected to Wifi, Connecting to server.");

  // Tentamos conectar com o websockets server
  bool connected = client.connect(websockets_server_host, websockets_server_port, "/");

  // Se foi possível conectar
  if (connected) {
    // Exibimos mensagem de sucesso
    Serial.println("Connected!");
    // Enviamos uma msg "Hello Server" para o servidor
    client.send("Hello Server");
  }   // Se não foi possível conectar
  else {
    // Exibimos mensagem de falha
    Serial.println("Not Connected!");
    return;
  }

  // Callback onde as mesagens serão recebidas
  client.onMessage([&](WebsocketsMessage message) 
  {
    if (LEDTEST) {
      //Exibe mensagem recebida na serial
      Serial.print("Got Message: ");
      Serial.println(message.data());

      // Teste: Liga/Desliga o led de acordo com o comando
      if (message.data().equalsIgnoreCase("ON"))
        digitalWrite(led, HIGH);
      else if (message.data().equalsIgnoreCase("OFF"))
        digitalWrite(led, LOW);
      }
  });
 

  // Configuração ArduinoOTA
  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) {
      type = "sketch";
    } else { // U_FS
      type = "filesystem";
    }

    // NOTE: if updating FS this would be the place to unmount FS using FS.end()
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) {
      Serial.println("Auth Failed");
    } else if (error == OTA_BEGIN_ERROR) {
      Serial.println("Begin Failed");
    } else if (error == OTA_CONNECT_ERROR) {
      Serial.println("Connect Failed");
    } else if (error == OTA_RECEIVE_ERROR) {
      Serial.println("Receive Failed");
    } else if (error == OTA_END_ERROR) {
      Serial.println("End Failed");
    }
  });
  ArduinoOTA.begin();
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  listenService();
  readSensorFlow();
}

/**
   Método que escuta informações enviadas do servidor
*/
void listenService() {
  ArduinoOTA.handle();
  //  De tempo em tempo, o websockets client checa por novas mensagens recebidas
  if (client.available())
    client.poll();
}


/**
   Método que faz a leitura e interpretação dos dados recebidos pelo sensor
*/
void readSensorFlow() {
  currentMillis = millis();
  //Leitura sensor
  if (currentMillis - previousMillis > interval) {

    pulse1Sec = pulseCount;
    pulseCount = 0;

    // Calcula o número de milissegundos que se passaram desde a última execução para dimensionar a saída.
    // A variável CalibrationFactor serve para dimensionar a saída com base no número de pulsos por segundo por
    // unidades de medida (litros / minuto) vindo do sensor
    flowRate = ((1000.0 / (millis() - previousMillis)) * pulse1Sec) / calibrationFactor;
    previousMillis = millis();

    // Divide a vazão em litros / minuto por 60 para determinar quantos litros têm
    // passou pelo sensor neste intervalo de 1 segundo, então multiplique por 1000 para
    // converter para mililitros.
    flowMilliLitres = (flowRate / 60) * 1000;
    flowLitres = (flowRate / 60);

    // Add the millilitres passed in this second to the cumulative total
    totalMilliLitres += flowMilliLitres;
    totalLitres += flowLitres;

    // Print the flow rate for this second in litres / minute
    if (DEBUG) {
      Serial.print("Litros: ");
      Serial.print(float(totalLitres));  // Print the integer part of the variable
      Serial.print("L");
      Serial.println("\t");       // Print tab space
    }
  }

  if (currentMillis - previousMillisService > oneHour) {
    client.send(String(totalLitres));
    Serial.println("Enviado ao servidor");
    previousMillisService = millis();
  }
}
