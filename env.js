// ========================================// ========================================

// ARCHIVO PLACEHOLDER PARA DESARROLLO LOCAL// CONFIGURACIÓN DE VARIABLES DE ENTORNO

// ========================================// ========================================

// Este archivo está en el repositorio solo como placeholder// Este archivo se genera automáticamente durante el build en Azure Static Web Apps

// Durante el build en Azure, se REEMPLAZA automáticamente con las credenciales de GitHub Secrets// Para desarrollo local:

//// 1. Copia este archivo a 'env.local.js' (está en .gitignore)

// Para desarrollo local:// 2. Reemplaza los valores vacíos con tus credenciales reales

// 1. Copia este archivo a 'env.local.js'// 3. El index.html cargará env.js automáticamente

// 2. Llena env.local.js con tus credenciales reales

// 3. Cambia la referencia en index.html de env.js a env.local.jswindow.ENV = {

    // Estas se reemplazan automáticamente en Azure desde GitHub Secrets durante el build

window.ENV = {    CHATBOT_ENDPOINT: "",  // Se llena automáticamente desde secrets.CHATBOT_ENDPOINT

    CHATBOT_ENDPOINT: "",    CHATBOT_KEY: "",       // Se llena automáticamente desde secrets.CHATBOT_KEY

    CHATBOT_KEY: "",    CHATBOT_DEPLOYMENT: "" // Se llena automáticamente desde secrets.CHATBOT_DEPLOYMENT

    CHATBOT_DEPLOYMENT: ""};

};

console.log('env.js cargado. Endpoint configurado:', window.ENV.CHATBOT_ENDPOINT ? '✓' : '✗ FALTA CONFIGURAR');

console.log('⚠️ env.js cargado - Si estás en local, usa env.local.js con tus credenciales');/*

window.ENV = {
    CHATBOT_ENDPOINT: "https://tu-recurso.cognitiveservices.azure.com",
    CHATBOT_KEY: "tu-api-key-aqui",
    CHATBOT_DEPLOYMENT: "nombre-de-tu-proyecto"
};
*/

