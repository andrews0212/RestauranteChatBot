# 🍽️ ChatBot de Restaurante - Azure Language Service

ChatBot interactivo para restaurante construido con HTML, CSS y JavaScript puro, integrado con Azure Language Service.

## 📋 Características

- ✨ Interfaz moderna y responsive
- 💬 Chat en tiempo real
- 🤖 Integración con Azure Language Service (CLU) o Azure OpenAI
- 📱 Compatible con dispositivos móviles
- 🎨 Diseño atractivo con gradientes y animaciones
- ⚡ Sin dependencias externas (Vanilla JavaScript)

## 🚀 Configuración Rápida

### Opción 1: Modo Demo (Sin Azure)

Para probar el chatbot sin configurar Azure:

1. Abre `script.js`
2. Descomenta la última línea:
   ```javascript
   sendMessageToAzure = getDemoResponse;
   ```
3. Abre `index.html` en tu navegador

### Opción 2: Con Azure Language Service

#### Prerrequisitos

- Cuenta de Azure activa
- Recurso de Azure Language Service o Azure OpenAI creado

#### Pasos de Configuración

1. **Obtén tus credenciales de Azure:**
   - Ve a [portal.azure.com](https://portal.azure.com)
   - Navega a tu recurso de Language Service
   - En "Keys and Endpoint", copia:
     - Endpoint URL
     - Una de las API Keys
     - Nombre del proyecto/deployment

2. **Configura el chatbot:**
   - Abre `script.js`
   - Busca la sección `CONFIG` al inicio del archivo
   - Reemplaza los valores:
   ```javascript
   const CONFIG = {
       endpoint: 'https://TU-RECURSO.cognitiveservices.azure.com',
       apiKey: 'TU-API-KEY-AQUI',
       deploymentName: 'NOMBRE-DE-TU-PROYECTO',
       useConversationalLanguage: true // true para CLU, false para OpenAI
   };
   ```

3. **Para Azure OpenAI (alternativo):**
   ```javascript
   const CONFIG = {
       endpoint: 'https://TU-RECURSO.openai.azure.com',
       apiKey: 'TU-AZURE-OPENAI-KEY',
       deploymentName: 'gpt-35-turbo', // o gpt-4
       useConversationalLanguage: false
   };
   ```

## 📁 Estructura de Archivos

```
RestauranteChatBot/
│
├── index.html          # Estructura HTML del chatbot
├── styles.css          # Estilos y diseño
├── script.js           # Lógica del chatbot e integración con Azure
├── config.example.js   # Ejemplo de configuración
├── .gitignore         # Archivos a ignorar en Git
└── README.md          # Esta documentación
```

## 🔧 Integración con Azure

### Para Azure Conversational Language Understanding (CLU)

El chatbot está preconfigurado para usar CLU. Asegúrate de:

1. Crear un proyecto en Azure Language Studio
2. Entrenar tu modelo con intenciones como:
   - `MenuInfo` - Información del menú
   - `Horarios` - Horarios de atención
   - `Reservacion` - Hacer reservaciones
   - `Ubicacion` - Ubicación del restaurante

3. Desplegar el modelo
4. Usar el nombre del deployment en la configuración

### Para Azure OpenAI

1. Cambia `useConversationalLanguage: false`
2. El chatbot usará el modelo GPT con contexto de restaurante
3. Ajusta el prompt del sistema en la función `sendToAzureOpenAI()`

## 🌐 Despliegue

### Despliegue Local

Simplemente abre `index.html` en tu navegador.

### Despliegue en Azure Static Web Apps

Este proyecto ya está configurado con GitHub Actions (`.github/workflows/azure-static-web-apps-blue-grass-012810903.yml`).

#### Configurar Secrets en GitHub:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Agrega los siguientes secrets:
   - `CHATBOT_ENDPOINT`: Tu endpoint de Azure
   - `CHATBOT_KEY`: Tu API key
   - `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_GRASS_012810903`: Token de Static Web Apps

## 🎨 Personalización

### Cambiar Colores

Edita `styles.css`:

```css
/* Cambia el gradiente principal */
background: linear-gradient(135deg, #TU-COLOR-1 0%, #TU-COLOR-2 100%);
```

### Modificar Respuestas Demo

Edita la función `getDemoResponse()` en `script.js` para cambiar las respuestas predefinidas.

### Ajustar el Contexto del Sistema

Para Azure OpenAI, modifica el mensaje del sistema en `sendToAzureOpenAI()`:

```javascript
{
    role: "system",
    content: "Tu prompt personalizado aquí..."
}
```

## 📱 Responsive Design

El chatbot está optimizado para:
- 📱 Móviles (< 768px)
- 💻 Tablets (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🔒 Seguridad

⚠️ **IMPORTANTE:** Nunca expongas tu API Key directamente en el código del frontend en producción.

### Mejores Prácticas:

1. **Usa un backend proxy:**
   - Crea una Azure Function o API que llame a Language Service
   - El frontend llama a tu API, no directamente a Azure

2. **Variables de entorno:**
   - Usa Azure Static Web Apps con API Functions
   - Configura las keys en el portal de Azure

3. **Para desarrollo:**
   - Crea un archivo `config.js` (está en .gitignore)
   - Úsalo solo localmente

## 🐛 Solución de Problemas

### Error CORS

Si ves errores CORS en la consola:
- Verifica que el endpoint de Azure permita tu dominio
- En Azure Portal → Tu recurso → CORS → Agrega tu dominio

### Error 401 Unauthorized

- Verifica que tu API Key sea correcta
- Comprueba que el recurso esté activo

### El chatbot no responde

1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que CONFIG esté bien configurado
4. Prueba el modo demo primero

## 📚 Recursos Adicionales

- [Azure Language Service Docs](https://learn.microsoft.com/azure/cognitive-services/language-service/)
- [Azure OpenAI Docs](https://learn.microsoft.com/azure/cognitive-services/openai/)
- [Azure Static Web Apps Docs](https://learn.microsoft.com/azure/static-web-apps/)

---

**¿Necesitas ayuda?** Abre un issue en el repositorio.