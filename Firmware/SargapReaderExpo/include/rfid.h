#ifndef RFID_H
#define RFID_H

#include <Arduino.h>

void initRFID();
bool readCard(String &uid);

#endif