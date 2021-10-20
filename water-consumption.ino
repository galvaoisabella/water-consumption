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

/*****************************************************************************************/
/************************************** SENSOR *******************************************/
/*****************************************************************************************/
//definicao do pino do sensor e de interrupcao
const int INTERRUPCAO_SENSOR = 0; //interrupt = 0 equivale ao pino digital 2
const int PINO_SENSOR = 2;

//definicao da variavel de contagem de voltas
unsigned long contador = 0;

//definicao do fator de calibracao para conversao do valor lido
const float FATOR_CALIBRACAO = 4.5;

//definicao das variaveis de fluxo e volume
float fluxo = 0;
float volume = 0;
float volume_total = 0;

//definicao da variavel de intervalo de tempo
unsigned long tempo_antes = 0;
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
int estadobotao = LOW;


void setup()
{
  // Iniciamos a serial com velocidade de 115200
  Serial.begin(115200);

  // Definimos o pino como saída
  pinMode(led, OUTPUT);
  // Definindo botão flash como entrada
  pinMode(BUTTON, INPUT_PULLUP);

  //configuracao do pino do sensor como entrada em nivel logico alto
  pinMode(PINO_SENSOR, INPUT_PULLUP);

  WiFi.mode(WIFI_STA);

  // Conectamos o wifi
  WiFi.begin(ssid, password);

  // Enquanto não conectar printamos um "."
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(1000);
  }

  // Exibimos "WiFi Conectado"
  Serial.println("Connected to Wifi, Connecting to server.");

  // Tentamos conectar com o websockets server
  bool connected = client.connect(websockets_server_host, websockets_server_port, "/");

  // Se foi possível conectar
  if (connected)
  {
    // Exibimos mensagem de sucesso
    Serial.println("Connected!");
    // Enviamos uma msg "Hello Server" para o servidor
    client.send("Hello Server");
  }   // Se não foi possível conectar
  else
  {
    // Exibimos mensagem de falha
    Serial.println("Not Connected!");
    return;
  }

  // Iniciamos o callback onde as mesagens serão recebidas
  client.onMessage([&](WebsocketsMessage message)
  {
    // Exibimos a mensagem recebida na serial
    Serial.print("Got Message: ");
    Serial.println(message.data());

    // Ligamos/Desligamos o led de acordo com o comando
    if (message.data().equalsIgnoreCase("ON"))
      digitalWrite(led, HIGH);
    else if (message.data().equalsIgnoreCase("OFF"))
      digitalWrite(led, LOW);
  });


  // ArduinoOTA config
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

void loop()
{
  ArduinoOTA.handle();
  //  De tempo em tempo, o websockets client checa por novas mensagens recebidas
  if (client.available())
    client.poll();

  // Verifica se o botao reset foi pressionado
  // estadobotao = digitalRead(BUTTON);
  // digitalWrite(led, HIGH);

  // Teste botão
  // if (estadobotao == LOW) {
  //   contador = contador++;
  //  Serial.println("Botão Pressionado");
  //   client.send(contador);
  // }
  //delay(300);

  readSensorFluke();

}


void readSensorFluke() {
  //executa a contagem de pulsos uma vez por segundo
  if ((millis() - tempo_antes) > 1000) {

    //desabilita a interrupcao para realizar a conversao do valor de pulsos
    detachInterrupt(INTERRUPCAO_SENSOR);

    //conversao do valor de pulsos para L/min
    fluxo = ((1000.0 / (millis() - tempo_antes)) * contador) / FATOR_CALIBRACAO;

    //exibicao do valor de fluxo
    Serial.print("Fluxo de: ");
    Serial.print(fluxo);
    Serial.println(" L/min");

    //calculo do volume em L passado pelo sensor
    volume = fluxo / 60;

    //armazenamento do volume
    volume_total += volume;

    //exibicao do valor de volume
    Serial.print("Volume: ");
    Serial.print(volume_total);
    Serial.println(" L");
    Serial.println();

    //reinicializacao do contador de pulsos
    contador = 0;

    //atualizacao da variavel tempo_antes
    tempo_antes = millis();

    //contagem de pulsos do sensor
    attachInterrupt(INTERRUPCAO_SENSOR, contador_pulso, FALLING);

  }
}

//funcao chamada pela interrupcao para contagem de pulsos
void contador_pulso() {

  contador++;

}
