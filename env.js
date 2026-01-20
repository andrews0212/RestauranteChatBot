// ========================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ========================================
// Este archivo es para desarrollo LOCAL
// En producción (Azure Static Web Apps), este archivo se genera automáticamente
// durante el build con los valores de GitHub Secrets

// Para desarrollo local:
// 1. Copia este archivo a 'env.local.js' (está en .gitignore)
// 2. Reemplaza los valores con tus credenciales reales
// 3. Cambia la referencia en index.html a env.local.js

window.ENV = {
    // Estas se reemplazan automáticamente en Azure desde GitHub Secrets
    CHATBOT_ENDPOINT: "",  // Se llena automáticamente desde secrets.CHATBOT_ENDPOINT
    CHATBOT_KEY: "",       // Se llena automáticamente desde secrets.CHATBOT_KEY
    CHATBOT_DEPLOYMENT: "" // Se llena automáticamente desde secrets.CHATBOT_DEPLOYMENT
};

// Para desarrollo local, descomenta y completa:
/*
window.ENV = {
    CHATBOT_ENDPOINT: "https://tu-recurso.cognitiveservices.azure.com",
    CHATBOT_KEY: "tu-api-key-aqui",
    CHATBOT_DEPLOYMENT: "nombre-de-tu-proyecto"
};
*/

