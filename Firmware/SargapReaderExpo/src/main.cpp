#include <SPI.h> 
#include <MFRC522.h> 
#include <WiFi.h> 
#include <HTTPClient.h> 
#include <ArduinoJson.h> // Requiere instalar esta librería 

// Pines para el lector RFID RC522 
#define SS_PIN 5 
#define RST_PIN 22 
MFRC522 rfid(SS_PIN, RST_PIN); 

// Configuración Wi-Fi 


// Casa
const char* ssid = "TELE-CARP2058"; 
const char* password = "nima8083";


// Colegio: "Tecnica 3 San Isidro"
//const char* ssid = "Tecnica 3 San Isidro"; 
//const char* password = "25demayo714"; 

// URL de tu API Java 
const String serverName = "http://192.168.0.92:8080/api/v1/acceso/verificar"; 

void enviarUidAApi(String uid); 

void setup() { 
  Serial.begin(9600); 
  SPI.begin(); // Inicializa bus SPI 
  rfid.PCD_Init(); // Inicializa MFRC522 
  
  // Conexión Wi-Fi 
  WiFi.begin(ssid, password); 
  Serial.print("Conectando a Wi-Fi"); 
  while (WiFi.status() != WL_CONNECTED) { 
    delay(500); 
    Serial.print("."); 
  } 
  Serial.println("\nConectado con éxito al wifi."); 
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
  } 
  
  // Detiene la lectura de la tarjeta actual 
  rfid.PICC_HaltA(); 
  rfid.PCD_StopCrypto1(); 
  delay(2000); // Evita lecturas consecutivas inmediatas 
} 

void enviarUidAApi(String uid) { 
  WiFiClient client; 
  HTTPClient http; 
  
  http.begin(client, serverName); 
  http.addHeader("Content-Type", "application/json"); 
  
  // Crear el JSON para enviar a Java utilizando ArduinoJson 
  JsonDocument docRequest; 
  docRequest["uid"] = uid; 
  String jsonPayload; 
  serializeJson(docRequest, jsonPayload); 
  
  // Realizar la petición POST 
  int httpResponseCode = http.POST(jsonPayload); 
  
  if (httpResponseCode == 200) { // HTTP OK 
    String responseBody = http.getString(); 
    Serial.println("Respuesta recibida."); 
    
    // Parsear la respuesta JSON de la API Java 
    JsonDocument docResponse; 
    DeserializationError error = deserializeJson(docResponse, responseBody); 
    
    if (!error) { 
      boolean autorizado = docResponse["autorizado"]; 
      const char* mensaje = docResponse["mensaje"]; 
      
      if (autorizado) { 
        Serial.println(">> ACCESO CONCEDIDO <<"); 
        // Aquí puedes activar un relé, encender un LED verde, etc. 
      } else { 
        Serial.println(">> ACCESO DENEGADO <<"); 
        // Aquí puedes encender un LED rojo o activar un buzzer 
      } 
      Serial.println("Mensaje de la API: " + String(mensaje)); 
    } else { 
      Serial.println("Error al parsear el JSON de respuesta."); 
    } 
  } else { 
    Serial.print("Error en la petición HTTP. Código: "); 
    Serial.println(httpResponseCode); 
  } 
  http.end(); 
}
