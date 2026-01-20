# 🔐 Configuración de GitHub Secrets para Azure Static Web Apps

## 📋 Secrets Requeridos

Para que el chatbot funcione correctamente en Azure Static Web Apps, necesitas configurar los siguientes secrets en tu repositorio de GitHub:

### 1️⃣ CHATBOT_ENDPOINT
- **Descripción:** URL del endpoint de tu recurso de Azure Language Service o Azure OpenAI
- **Ejemplo:** `https://tu-recurso.cognitiveservices.azure.com`
- **Dónde obtenerlo:** Azure Portal → Tu recurso → Keys and Endpoint → Endpoint

### 2️⃣ CHATBOT_KEY
- **Descripción:** API Key de tu recurso de Azure
- **Ejemplo:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **Dónde obtenerlo:** Azure Portal → Tu recurso → Keys and Endpoint → Key 1 o Key 2

### 3️⃣ CHATBOT_DEPLOYMENT (Opcional)
- **Descripción:** Nombre de tu proyecto/deployment en Azure Language Service
- **Ejemplo:** `restaurante-chatbot` o `production`
- **Dónde obtenerlo:** Azure Language Studio → Tu proyecto → Nombre del deployment
- **Default:** Si no se configura, usa `production`

### 4️⃣ AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_GRASS_012810903
- **Descripción:** Token de deployment de Azure Static Web Apps
- **Dónde obtenerlo:** Ya debería estar configurado automáticamente por Azure

## 🔧 Cómo Configurar los Secrets

### Paso a Paso:

1. **Ve a tu repositorio en GitHub:**
   ```
   https://github.com/andrews0212/RestauranteChatBot
   ```

2. **Navega a Settings:**
   - Haz clic en la pestaña "Settings" (arriba a la derecha)

3. **Accede a Secrets and Variables:**
   - En el menú lateral izquierdo, busca "Security"
   - Haz clic en "Secrets and variables"
   - Selecciona "Actions"

4. **Agrega cada Secret:**
   - Haz clic en "New repository secret"
   - **Name:** Nombre exacto del secret (ej: `CHATBOT_ENDPOINT`)
   - **Secret:** El valor correspondiente
   - Haz clic en "Add secret"

5. **Repite para cada secret:**
   - `CHATBOT_ENDPOINT`
   - `CHATBOT_KEY`
   - `CHATBOT_DEPLOYMENT` (opcional)

## ✅ Verificar la Configuración

Después de agregar los secrets:

1. **Verifica los secrets:**
   - Ve a Settings → Secrets and variables → Actions
   - Deberías ver tus secrets listados (los valores están ocultos)

2. **Haz un nuevo deployment:**
   - Haz un cambio en cualquier archivo (ej: README.md)
   - Commit y push:
     ```bash
     git add .
     git commit -m "Update config"
     git push
     ```

3. **Verifica el build:**
   - Ve a la pestaña "Actions" en GitHub
   - Mira el workflow en ejecución
   - Verifica que no haya errores

4. **Prueba el chatbot:**
   - Abre tu sitio web de Azure Static Web Apps
   - Abre la consola del navegador (F12)
   - Deberías ver: `📍 Modo: PRODUCCIÓN (con Azure)`
   - Envía un mensaje y verifica que funcione

## 🐛 Solución de Problemas

### Secret no se carga
- **Problema:** El chatbot sigue en modo DEMO
- **Solución:** 
  - Verifica que el nombre del secret sea EXACTO (mayúsculas)
  - Haz un nuevo push para triggear el deployment
  - Espera a que el workflow termine completamente

### Error 401/403
- **Problema:** Azure rechaza las credenciales
- **Solución:**
  - Verifica que el `CHATBOT_KEY` sea correcto
  - Copia nuevamente el key desde Azure Portal
  - Asegúrate de no tener espacios al inicio/final

### Error 404
- **Problema:** No encuentra el endpoint
- **Solución:**
  - Verifica que `CHATBOT_ENDPOINT` tenga el formato correcto
  - No debe terminar en `/`
  - Debe empezar con `https://`

## 📝 Ejemplo de Configuración

```
Secrets en GitHub Actions:
├── CHATBOT_ENDPOINT: https://mi-restaurante.cognitiveservices.azure.com
├── CHATBOT_KEY: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
├── CHATBOT_DEPLOYMENT: restaurante-bot
└── AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_GRASS_012810903: (generado por Azure)
```

## 🔒 Seguridad

- ✅ **NUNCA** hagas commit de los valores reales de los secrets
- ✅ **SIEMPRE** usa GitHub Secrets para credenciales
- ✅ Los secrets están encriptados y solo son visibles durante el build
- ✅ El archivo `env.js` se genera automáticamente durante el deployment
- ❌ **NO** edites manualmente `env.js` con credenciales reales

## 💡 Para Desarrollo Local

Si quieres probar con Azure localmente:

1. Copia `env.js` a `env.local.js`
2. Edita `env.local.js` y completa tus credenciales
3. En `index.html`, cambia:
   ```html
   <script src="env.local.js"></script>
   ```
4. `env.local.js` está en `.gitignore` y no se subirá a GitHub

---

**¿Necesitas ayuda?** Abre un issue en el repositorio.
