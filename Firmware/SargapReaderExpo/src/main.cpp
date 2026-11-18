  #include <SPI.h> 
  #include <MFRC522.h> 
  #include <WiFi.h> 
  #include <ESPmDNS.h>
  #include <HTTPClient.h> 
  #include <ArduinoJson.h> // Requiere instalar esta librería 
  #include <stdio.h>
  #include <Wire.h>     // Necesaria para la comunicación I2C
  #include <RTClib.h>   // Librería para el RTC DS3231

  RTC_DS3231 rtc;       // Crea el objeto del reloj


  // Configuración de pines para el RTC DS3231
  #define PIN_SDA 21
  #define PIN_SCL 22

  // Pines para el lector RFID RC522 
  #define SS_PIN 5 
  #define RST_PIN 4 
  MFRC522 rfid(SS_PIN, RST_PIN); 

  // #Configuración Wi-Fi#


  // Casa
  const char* ssid = WIFI_SSID; 
  const char* password = WIFI_PASSWORD;
  


  // URL de tu API Java 
  const String serverName = SERVER_URL; 

  void enviarUidAApi(String uid); 

  void setup() { 
    Serial.begin(9600); 
    SPI.begin(); // Inicializa bus SPI 
    rfid.PCD_Init(); // Inicializa MFRC522 
    


// En setup(), después de imprimir "Conectado con éxito al wifi."
if (!MDNS.begin("esp32-acceso")) {
  Serial.println("Error iniciando mDNS");
} else {
  Serial.println("mDNS iniciado correctamente");
}


    // Inicializa el RTC DS3231
    Wire.begin(PIN_SDA, PIN_SCL); // Inicia los pines 21 y 22 para el RTC
    
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
    
    // 1. LEER EL RELOJ Y FORMATEAR ANTES DE ENVIAR
    DateTime now = rtc.now();
    char buffer[25];
    sprintf(buffer, "%04d-%02d-%02d %02d:%02d:%02d", now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());
    
    // Imprime la fecha en el Monitor Serial justo cuando escanea
    Serial.print("Fecha y Hora RTC: ");
    Serial.println(buffer);

    // 2. CREAR EL JSON COMPLETO CON UID, LECTOR Y FECHA
    JsonDocument docRequest; 
    docRequest["uid"] = uid; 
    docRequest["lector"] = "Entrada Principal"; // Identifica qué ESP32 leyó la tarjeta
    docRequest["fechaHora"] = String(buffer);   // Agrega la fecha exacta del RTC al JSON

    String jsonPayload; 
    serializeJson(docRequest, jsonPayload); 
    
    // 3. REALIZAR LA PETICIÓN POST CON EL JSON COMPLETO
    int httpResponseCode = http.POST(jsonPayload); 
    
    // 4. EVALUAR LA RESPUESTA QUE VIENE DE JAVA
    if (httpResponseCode == 200) { // HTTP OK 
      String responseBody = http.getString();   
      Serial.println("Respuesta recibida de la API."); 
      
      // Parsear la respuesta JSON de la API Java 
      JsonDocument docResponse; 
      DeserializationError error = deserializeJson(docResponse, responseBody); 
      
      if (!error) { 
        boolean autorizado = docResponse["autorizado"]; 
        const char* mensaje = docResponse["mensaje"]; 
        
        if (autorizado) { 
          Serial.println(">> ACCESO CONCEDIDO <<"); 
        } else { 
          Serial.println(">> ACCESO DENEGADO <<"); 
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
