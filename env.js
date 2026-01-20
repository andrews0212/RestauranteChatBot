// ========================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ========================================
// Este archivo se genera automáticamente durante el build en Azure Static Web Apps
// Para desarrollo local:
// 1. Copia este archivo a 'env.local.js' (está en .gitignore)
// 2. Reemplaza los valores vacíos con tus credenciales reales
// 3. El index.html cargará env.js automáticamente

window.ENV = {
    // Estas se reemplazan automáticamente en Azure desde GitHub Secrets durante el build
    CHATBOT_ENDPOINT: "",  // Se llena automáticamente desde secrets.CHATBOT_ENDPOINT
    CHATBOT_KEY: "",       // Se llena automáticamente desde secrets.CHATBOT_KEY
    CHATBOT_DEPLOYMENT: "" // Se llena automáticamente desde secrets.CHATBOT_DEPLOYMENT
};

console.log('env.js cargado. Endpoint configurado:', window.ENV.CHATBOT_ENDPOINT ? '✓' : '✗ FALTA CONFIGURAR');
/*
window.ENV = {
    CHATBOT_ENDPOINT: "https://tu-recurso.cognitiveservices.azure.com",
    CHATBOT_KEY: "tu-api-key-aqui",
    CHATBOT_DEPLOYMENT: "nombre-de-tu-proyecto"
};
*/

