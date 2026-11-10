#ifndef CONNECTION_H
#define CONNECTION_H

#include <Arduino.h>

bool connectWiFi();
bool sendEvent(String uid, String timestamp);

#endif