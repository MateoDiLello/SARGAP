#include <SPI.h> 
#include <MFRC522.h> 
#include <WiFi.h> 
#include <ESPmDNS.h>
#include <HTTPClient.h> 
#include <ArduinoJson.h> 
#include <stdio.h>
#include <Wire.h>     
#include <RTClib.h>   

RTC_DS3231 rtc;       

// Configuración de pines para el RTC DS3231
#define PIN_SDA 21
#define PIN_SCL 22

// Pines para el lector RFID RC522 
#define SS_PIN 5 
#define RST_PIN 4 
MFRC522 rfid(SS_PIN, RST_PIN); 

// Pines para Buzzer y LEDs de estado
#define BUZZER_PIN 27
#define LED_VERDE 25   // Si al probar ves que es el rojo, cambiá este a 26
#define LED_ROJO 26    // y este a 25

// Configuración Wi-Fi y Servidor desde .env
const char* ssid = WIFI_SSID; 
const char* password = WIFI_PASSWORD;
const String serverName = SERVER_URL; 

// Declaración de funciones
void enviarUidAApi(String uid);
void feedbackAccesoConcedido();
void feedbackAccesoDenegado();
void feedbackErrorSistema();

void setup() { 
  Serial.begin(9600); 

  // Configurar pines de LEDs y Buzzer como salida
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_ROJO, LOW);

  // Prueba visual rápida al encender para identificar cuál LED es cada pin
  digitalWrite(LED_VERDE, HIGH);
  delay(400);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_ROJO, HIGH);
  delay(400);
  digitalWrite(LED_ROJO, LOW);

  SPI.begin(); 
  rfid.PCD_Init(); 
  
  // Inicializa el RTC DS3231
  Wire.begin(PIN_SDA, PIN_SCL); 
  if (!rtc.begin()) {
    Serial.println("Error: No se encontró el módulo RTC");
  }
  if (rtc.lostPower()) {
    Serial.println("El RTC perdió energía, cargando hora de compilación...");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }

  // Conexión Wi-Fi 
  WiFi.begin(ssid, password); 
  Serial.print("Conectando a Wi-Fi"); 
  while (WiFi.status() != WL_CONNECTED) { 
    delay(500); 
    Serial.print("."); 
  } 
  Serial.println("\nConectado con éxito al wifi."); 

  // Iniciar mDNS después de tener Wi-Fi conectado
  if (!MDNS.begin("esp32-acceso")) {
    Serial.println("Error iniciando mDNS");
  } else {
    Serial.println("mDNS iniciado correctamente");
  }
} 

void loop() { 
  // Revisa si hay una nueva tarjeta presente 
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) { 
    return; 
  } 

  // Obtener el UID en formato String (ej: "A3B2C1D0") 
  String uidString = ""; 
  for (byte i = 0; i < rfid.uid.size; i++) { 
    if (rfid.uid.uidByte[i] < 0x10) uidString += "0"; 
    uidString += String(rfid.uid.uidByte[i], HEX); 
  } 
  uidString.toUpperCase(); 
  Serial.println("\n--- Tarjeta detectada ---"); 
  Serial.println("UID: " + uidString); 
  
  // Enviar el UID a la API si hay Wi-Fi disponible 
  if (WiFi.status() == WL_CONNECTED) { 
    enviarUidAApi(uidString); 
  } else { 
    Serial.println("Error: Sin conexión Wi-Fi");
    feedbackErrorSistema();
  } 
  
  // Detiene la lectura de la tarjeta actual 
  rfid.PICC_HaltA(); 
  rfid.PCD_StopCrypto1(); 
  delay(1000); // Evita lecturas consecutivas inmediatas 
} 

void enviarUidAApi(String uid) { 
  WiFiClient client; 
  HTTPClient http; 

  http.begin(client, serverName); 
  http.addHeader("Content-Type", "application/json"); 
  
  // 1. LEER EL RELOJ Y FORMATEAR ANTES DE ENVIAR
  DateTime now = rtc.now();
  char buffer[25];
  sprintf(buffer, "%04d-%02d-%02d %02d:%02d:%02d", now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());
  
  Serial.print("Fecha y Hora RTC: ");
  Serial.println(buffer);

  // 2. CREAR EL JSON COMPLETO CON UID, LECTOR Y FECHA
  JsonDocument docRequest; 
  docRequest["uid"] = uid; 
  docRequest["lector"] = NOMBRE_LECTOR;
  docRequest["fechaHora"] = String(buffer);   

  String jsonPayload; 
  serializeJson(docRequest, jsonPayload); 
  
  // 3. REALIZAR LA PETICIÓN POST CON EL JSON COMPLETO
  int httpResponseCode = http.POST(jsonPayload); 
  
  // 4. EVALUAR LA RESPUESTA QUE VIENE DE JAVA
  if (httpResponseCode == 200) { 
    String responseBody = http.getString();   
    Serial.println("Respuesta recibida de la API."); 
    
    JsonDocument docResponse; 
    DeserializationError error = deserializeJson(docResponse, responseBody); 
    
    if (!error) { 
      boolean autorizado = docResponse["autorizado"]; 
      const char* mensaje = docResponse["mensaje"]; 
      
      if (autorizado) { 
        Serial.println(">> ACCESO CONCEDIDO <<");
        feedbackAccesoConcedido();
      } else { 
        Serial.println(">> ACCESO DENEGADO <<");
        feedbackAccesoDenegado();
      } 
      Serial.println("Mensaje de la API: " + String(mensaje)); 
    } else { 
      Serial.println("Error al parsear el JSON de respuesta.");
      feedbackErrorSistema();
    } 
  } else { 
    Serial.print("Error en la petición HTTP. Código: "); 
    Serial.println(httpResponseCode);
    feedbackErrorSistema();
  } 
  http.end(); 
}

// ==========================================
// SONIDOS Y LUCES DE RETROALIMENTACIÓN
// ==========================================

// Dos pitidos agudos ascendentes + LED verde encendido 1.5s
void feedbackAccesoConcedido() {
  digitalWrite(LED_VERDE, HIGH);
  tone(BUZZER_PIN, 1200, 120);
  delay(150);
  tone(BUZZER_PIN, 1800, 180);
  delay(1350);
  noTone(BUZZER_PIN);
  digitalWrite(LED_VERDE, LOW);
}

// Pitido grave largo + parpadeo de LED rojo
void feedbackAccesoDenegado() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(LED_ROJO, HIGH);
    tone(BUZZER_PIN, 350, 250);
    delay(300);
    digitalWrite(LED_ROJO, LOW);
    delay(150);
  }
  noTone(BUZZER_PIN);
}

// Tres pitidos rápidos + ambos LEDs si falla el Wi-Fi o el servidor Java
void feedbackErrorSistema() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_VERDE, HIGH);
    digitalWrite(LED_ROJO, HIGH);
    tone(BUZZER_PIN, 800, 80);
    delay(120);
    digitalWrite(LED_VERDE, LOW);
    digitalWrite(LED_ROJO, LOW);
    delay(100);
  }
  noTone(BUZZER_PIN);
}
