#!/bin/bash

# Script para generar env.js con variables de entorno
# Este script se ejecuta durante el build en Azure Static Web Apps

echo "Generando env.js con variables de entorno..."

cat > env.js << EOF
// Archivo generado automáticamente durante el build
// Variables de entorno de Azure Static Web Apps

window.ENV = {
    CHATBOT_ENDPOINT: "${CHATBOT_ENDPOINT}",
    CHATBOT_KEY: "${CHATBOT_KEY}",
    CHATBOT_DEPLOYMENT: "${CHATBOT_DEPLOYMENT}"
};
EOF

echo "✅ env.js generado correctamente"
