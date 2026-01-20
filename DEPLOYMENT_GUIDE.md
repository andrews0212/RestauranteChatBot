# 🚀 Guía de Despliegue a Azure Static Web Apps

## ✅ Prerequisitos
- ✅ Código funcionando en local
- ✅ Entity detection implementado
- ✅ Cuenta de GitHub
- ✅ Azure Language Service configurado

## 📋 Paso 1: Configurar GitHub Secrets

Ve a tu repositorio en GitHub:
```
Settings → Secrets and variables → Actions → New repository secret
```

### Agrega estos 3 secretos:

#### Secret 1: CHAT_ENDPOINT
- **Name:** `CHAT_ENDPOINT`
- **Value:** Tu endpoint de Azure (ejemplo: `https://tu-recurso.cognitiveservices.azure.com`)

#### Secret 2: CHAT_KEY
- **Name:** `CHAT_KEY`
- **Value:** Tu API Key de Azure Language Service

#### Secret 3: CHATBOT_DEPLOYMENT
- **Name:** `CHATBOT_DEPLOYMENT`
- **Value:** Nombre de tu deployment (ejemplo: `restauranteDesploy`)

## 📋 Paso 2: Hacer Push

```bash
git add .
git commit -m "feat: Implementar entity detection para platos"
git push origin main
```

## 📋 Paso 3: Verificar el Despliegue

1. Ve a **Actions** en GitHub
2. Espera a que termine el workflow (ícono verde ✅)
3. Tu sitio estará disponible en la URL de Azure Static Web Apps

## 🧪 Paso 4: Probar el Chatbot

Prueba estos mensajes para verificar entity detection:
- "quiero pizza margarita"
- "me gustaría ensalada césar"
- "hamburguesa bbq por favor"

## 🔍 Verificar Modo de Producción

Abre la consola del navegador (F12) y verifica:
```
📍 Modo: PRODUCCIÓN (con Azure)
```

## 🐛 Solución de Problemas

### Problema: Modo DEMO en producción
**Solución:** Verifica que los 3 Secrets estén configurados correctamente

### Problema: Error 404
**Solución:** Verifica el endpoint y deployment name

### Problema: Error 401
**Solución:** Verifica la API Key

## 📊 Entities Configuradas

### 🍕 Pizzas
- Margarita, Pepperoni, Cuatro Quesos

### 🥗 Ensaladas
- César, Mixta, Griega

### 🍔 Hamburguesas
- Clásica, BBQ, Completa

### 🍰 Postres
- Tiramisú, Cheesecake, Brownie

### ☕ Bebidas
- Agua, Refrescos, Cerveza, Vino

## ⚠️ IMPORTANTE - Seguridad

**NUNCA** incluyas tus credenciales de Azure en el código:
- ❌ No subas archivos con API Keys
- ❌ No hagas commit de secretos
- ✅ Usa GitHub Secrets
- ✅ Usa variables de entorno
