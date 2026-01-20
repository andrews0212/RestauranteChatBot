# Script PowerShell para generar env.js con variables de entorno
# Este script se ejecuta durante el build en Azure Static Web Apps

Write-Host "Generando env.js con variables de entorno..." -ForegroundColor Cyan

$envContent = @"
// Archivo generado automáticamente durante el build
// Variables de entorno de Azure Static Web Apps

window.ENV = {
    CHATBOT_ENDPOINT: "$env:CHATBOT_ENDPOINT",
    CHATBOT_KEY: "$env:CHATBOT_KEY",
    CHATBOT_DEPLOYMENT: "$env:CHATBOT_DEPLOYMENT"
};
"@

Set-Content -Path "env.js" -Value $envContent

Write-Host "✅ env.js generado correctamente" -ForegroundColor Green
