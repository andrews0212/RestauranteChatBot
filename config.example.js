// ARCHIVO DE EJEMPLO DE CONFIGURACIÓN
// Copia este archivo a 'config.js' y reemplaza con tus credenciales reales

const CONFIG = {
    // OPCIÓN 1: Azure Conversational Language Understanding (CLU)
    // Obtén estos valores del portal de Azure Language Service
    endpoint: 'https://YOUR-RESOURCE-NAME.cognitiveservices.azure.com',
    apiKey: 'YOUR-API-KEY-HERE',
    deploymentName: 'YOUR-PROJECT-NAME',
    useConversationalLanguage: true,

    // OPCIÓN 2: Azure OpenAI
    // endpoint: 'https://YOUR-RESOURCE-NAME.openai.azure.com',
    // apiKey: 'YOUR-AZURE-OPENAI-KEY',
    // deploymentName: 'YOUR-DEPLOYMENT-NAME', // ej: gpt-35-turbo, gpt-4
    // useConversationalLanguage: false,

    // OPCIÓN 3: Para desarrollo local (modo demo sin Azure)
    // Comenta la última línea de script.js:
    // sendMessageToAzure = getDemoResponse;
};

// Instrucciones:
// 1. Ve al portal de Azure (portal.azure.com)
// 2. Navega a tu recurso de Language Service o Azure OpenAI
// 3. En "Keys and Endpoint", copia el endpoint y una de las keys
// 4. Reemplaza los valores arriba
// 5. Guarda este archivo como 'config.js' (sin .example)
// 6. Agrega 'config.js' a tu .gitignore para no compartir tus credenciales
