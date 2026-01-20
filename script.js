// ========================================
// CONFIGURACIÓN DEL CHATBOT
// ========================================

// MODO ACTUAL: Detecta automáticamente si hay variables de entorno de Azure
// Si están disponibles, usa Azure. Si no, usa modo DEMO.

const CONFIG = {
    // ⚙️ MODO DE OPERACIÓN
    // Detecta automáticamente: si hay variables de entorno, usa Azure; si no, modo demo
    useDemoMode: !(window.ENV?.CHATBOT_ENDPOINT && 
                   window.ENV?.CHATBOT_ENDPOINT !== "{{ CHATBOT_ENDPOINT }}" &&
                   window.ENV?.CHATBOT_ENDPOINT !== ""),
    
    // 🔧 CREDENCIALES DE AZURE (desde variables de entorno de Azure Static Web Apps)
    // Estas se configuran en GitHub Secrets y se inyectan automáticamente
    endpoint: window.ENV?.CHATBOT_ENDPOINT || 'YOUR_ENDPOINT_HERE',
    apiKey: window.ENV?.CHATBOT_KEY || 'YOUR_API_KEY_HERE',
    deploymentName: window.ENV?.CHATBOT_DEPLOYMENT || 'YOUR_PROJECT_NAME',
    
    // 🤖 TIPO DE SERVICIO DE AZURE
    useConversationalLanguage: true // true = CLU, false = Azure OpenAI
};

// Elementos del DOM
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

// Historial de conversación
let conversationHistory = [];

// Event Listeners
chatForm.addEventListener('submit', handleSubmit);

async function handleSubmit(e) {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // Agregar mensaje del usuario
    addMessage(message, 'user');
    userInput.value = '';
    
    // Deshabilitar el input mientras se procesa
    setInputState(false);
    showTypingIndicator();
    
    try {
        // Enviar mensaje (modo demo o Azure según configuración)
        let response;
        if (CONFIG.useDemoMode) {
            response = getDemoResponse(message);
        } else {
            response = await sendMessageToAzure(message);
        }
        
        // Agregar respuesta del bot
        addMessage(response, 'bot');
    } catch (error) {
        console.error('Error:', error);
        addMessage('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.', 'bot', true);
    } finally {
        hideTypingIndicator();
        setInputState(true);
        userInput.focus();
    }
}

function addMessage(text, sender, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    if (isError) contentDiv.classList.add('error-message');
    
    // Procesar el texto para mantener formato
    contentDiv.innerHTML = formatMessage(text);
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll al último mensaje
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Guardar en historial
    if (!isError) {
        conversationHistory.push({
            role: sender === 'user' ? 'user' : 'assistant',
            content: text
        });
    }
}

function formatMessage(text) {
    // Convertir saltos de línea a <br>
    text = text.replace(/\n/g, '<br>');
    
    // Detectar y formatear listas
    if (text.includes('- ') || text.includes('• ')) {
        const lines = text.split('<br>');
        let inList = false;
        let formatted = '';
        
        lines.forEach(line => {
            if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                if (!inList) {
                    formatted += '<ul>';
                    inList = true;
                }
                formatted += `<li>${line.trim().substring(2)}</li>`;
            } else {
                if (inList) {
                    formatted += '</ul>';
                    inList = false;
                }
                formatted += line + '<br>';
            }
        });
        
        if (inList) formatted += '</ul>';
        return formatted;
    }
    
    return text;
}

function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

function setInputState(enabled) {
    userInput.disabled = !enabled;
    sendButton.disabled = !enabled;
}

// Función principal para enviar mensaje a Azure
async function sendMessageToAzure(message) {
    if (CONFIG.useConversationalLanguage) {
        return await sendToConversationalLanguage(message);
    } else {
        return await sendToAzureOpenAI(message);
    }
}

// Opción 1: Azure Conversational Language Understanding (CLU)
async function sendToConversationalLanguage(message) {
    const url = `${CONFIG.endpoint}/language/:analyze-conversations?api-version=2022-10-01-preview`;
    
    const requestBody = {
        kind: "Conversation",
        analysisInput: {
            conversationItem: {
                id: "1",
                participantId: "user",
                text: message
            }
        },
        parameters: {
            projectName: CONFIG.deploymentName,
            deploymentName: "production", // o tu nombre de deployment
            stringIndexType: "TextElement_V8"
        }
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': CONFIG.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Procesar la respuesta según tu configuración de CLU
        return processConversationalResponse(data);
    } catch (error) {
        console.error('Error en CLU:', error);
        throw error;
    }
}

// Opción 2: Azure OpenAI
async function sendToAzureOpenAI(message) {
    const url = `${CONFIG.endpoint}/openai/deployments/${CONFIG.deploymentName}/chat/completions?api-version=2024-02-15-preview`;
    
    // Agregar contexto del sistema
    const messages = [
        {
            role: "system",
            content: "Eres un asistente virtual amigable de un restaurante. Ayudas a los clientes con información sobre el menú, horarios, reservaciones y ubicación. Sé cortés, profesional y útil."
        },
        ...conversationHistory,
        {
            role: "user",
            content: message
        }
    ];
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'api-key': CONFIG.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                max_tokens: 800,
                temperature: 0.7,
                top_p: 0.95,
                frequency_penalty: 0,
                presence_penalty: 0
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error en Azure OpenAI:', error);
        throw error;
    }
}

// Procesar respuesta de Conversational Language
function processConversationalResponse(data) {
    try {
        // Esta función depende de cómo hayas configurado tu proyecto CLU
        const prediction = data.result.prediction;
        
        // Si tienes intenciones configuradas
        const topIntent = prediction.topIntent;
        const entities = prediction.entities;
        
        // Generar respuesta basada en la intención
        return generateResponseFromIntent(topIntent, entities, prediction);
    } catch (error) {
        console.error('Error procesando respuesta CLU:', error);
        return 'Lo siento, no pude entender tu mensaje. ¿Podrías reformularlo?';
    }
}

// Generar respuesta basada en intenciones (personalizar según tu proyecto)
function generateResponseFromIntent(intent, entities, prediction) {
    // Ejemplo de respuestas basadas en intenciones
    const responses = {
        'MenuInfo': 'Nuestro menú incluye una variedad de platillos deliciosos. ¿Te gustaría saber sobre alguna categoría específica como entradas, platos principales o postres?',
        'Horarios': 'Estamos abiertos de lunes a domingo:\n- Lunes a viernes: 12:00 PM - 11:00 PM\n- Sábados y domingos: 11:00 AM - 12:00 AM',
        'Reservacion': 'Para hacer una reservación, por favor llama al (123) 456-7890 o envíanos un email a reservas@restaurante.com. ¿Para cuántas personas y qué fecha?',
        'Ubicacion': 'Nos encontramos en Av. Principal 123, Ciudad. Tenemos estacionamiento disponible.',
        'None': 'Puedo ayudarte con información sobre nuestro menú, horarios, reservaciones o ubicación. ¿Qué te gustaría saber?'
    };
    
    return responses[intent] || responses['None'];
}

// Función de ejemplo para modo offline/demo (opcional)
function getDemoResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('menú') || lowerMessage.includes('menu') || lowerMessage.includes('comida')) {
        return 'Nuestro menú incluye:\n- Entradas: Ensalada César, Bruschetta, Sopa del día\n- Platos principales: Pasta Alfredo, Salmón a la parrilla, Filete de res\n- Postres: Tiramisú, Cheesecake, Helado artesanal\n\n¿Te gustaría más detalles sobre algún platillo?';
    }
    
    if (lowerMessage.includes('hora') || lowerMessage.includes('abierto') || lowerMessage.includes('horario')) {
        return 'Nuestro horario es:\n• Lunes a viernes: 12:00 PM - 11:00 PM\n• Sábados y domingos: 11:00 AM - 12:00 AM\n\n¡Te esperamos!';
    }
    
    if (lowerMessage.includes('reserva') || lowerMessage.includes('reservación')) {
        return 'Para hacer una reservación puedes:\n• Llamar al: (123) 456-7890\n• Email: reservas@restaurante.com\n• WhatsApp: (123) 456-7890\n\n¿Para cuántas personas necesitas la mesa?';
    }
    
    if (lowerMessage.includes('ubicación') || lowerMessage.includes('ubicacion') || lowerMessage.includes('dirección') || lowerMessage.includes('donde')) {
        return 'Nos encontramos en:\n📍 Av. Principal 123, Centro\nCiudad, CP 12345\n\nContamos con:\n• Estacionamiento gratuito\n• Acceso para sillas de ruedas\n• Zona de terraza';
    }
    
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
        return 'Nuestros precios varían:\n• Entradas: $80 - $150\n• Platos principales: $200 - $450\n• Postres: $80 - $120\n\nContamos con menú del día de lunes a viernes por $180.';
    }
    
    return 'Puedo ayudarte con:\n• Información del menú\n• Horarios de atención\n• Realizar reservaciones\n• Ubicación y contacto\n• Precios\n\n¿Qué necesitas saber?';
}

// ========================================
// INICIALIZACIÓN DEL CHATBOT
// ========================================
console.log('🤖 ChatBot Restaurante Inicializado');
console.log('📍 Modo:', CONFIG.useDemoMode ? 'DEMO (sin Azure)' : 'PRODUCCIÓN (con Azure)');

if (!CONFIG.useDemoMode) {
    console.log('🔗 Endpoint:', CONFIG.endpoint);
    console.log('🎯 Deployment:', CONFIG.deploymentName);
    console.log('⚙️ Servicio:', CONFIG.useConversationalLanguage ? 'Conversational Language' : 'Azure OpenAI');
    
    // Validar configuración
    if (CONFIG.endpoint === 'YOUR_ENDPOINT_HERE' || CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ ADVERTENCIA: Credenciales de Azure no configuradas.');
        console.warn('💡 El chatbot funcionará en modo DEMO. Para usar Azure:');
        console.warn('   1. Abre script.js');
        console.warn('   2. Cambia useDemoMode a false');
        console.warn('   3. Completa endpoint, apiKey y deploymentName');
    }
} else {
    console.log('✅ Modo DEMO activo - El chatbot usa respuestas predefinidas');
    console.log('💡 Para conectar con Azure, cambia CONFIG.useDemoMode a false en script.js');
}

