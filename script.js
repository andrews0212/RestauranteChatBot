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
    const url = `${CONFIG.endpoint}/language/:analyze-conversations?api-version=2024-11-15-preview`;
    
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
            projectName: "Restaurante",  // Nombre del proyecto (con mayúscula)
            deploymentName: "restauranteDesploy",  // Nombre exacto del deployment (con "s")
            stringIndexType: "TextElement_V8"
        }
    };
    
    console.log('🔗 Enviando a CLU:', url);
    console.log('📦 Request Body:', requestBody);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': CONFIG.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Response data:', data);
        
        // Procesar la respuesta según tu configuración de CLU
        return processConversationalResponse(data);
    } catch (error) {
        console.error('❌ Error en CLU:', error);
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
        console.log('📊 Procesando respuesta de CLU:', data);
        
        // Esta función depende de cómo hayas configurado tu proyecto CLU
        const prediction = data.result.prediction;
        
        // Si tienes intenciones configuradas
        const topIntent = prediction.topIntent;
        const entities = prediction.entities || [];
        
        console.log('🎯 Intent detectado:', topIntent);
        console.log('📋 Entities:', entities);
        
        // Generar respuesta basada en la intención
        return generateResponseFromIntent(topIntent, entities, prediction);
    } catch (error) {
        console.error('Error procesando respuesta CLU:', error);
        return 'Lo siento, no pude entender tu mensaje. ¿Podrías reformularlo?';
    }
}

// Generar respuesta basada en intenciones (personalizar según tu proyecto)
function generateResponseFromIntent(intent, entities, prediction) {
    console.log('🔍 Generando respuesta para intent:', intent);
    
    // Respuestas basadas en las intenciones de tu proyecto Azure CLU
    const responses = {
        // === INTENTS DE CONVERSACIÓN ===
        'Saludo': '¡Hola! 👋 Bienvenido al restaurante. ¿En qué puedo ayudarte hoy?',
        
        'Despedida': '¡Gracias por contactarnos! 😊 Esperamos verte pronto. ¡Que tengas un excelente día!',
        
        'Confirmar': '¡Perfecto! ¿En qué más puedo ayudarte?',
        
        'Negar': 'Entiendo. ¿Hay algo más en lo que pueda asistirte?',
        
        // === INTENTS DEL MENÚ ===
        'MenuInfo': 'Nuestro menú incluye:\n\n🥗 Entradas: Ensalada, Bruschetta, Sopa\n🍝 Platos principales: Pasta, Pizza, Hamburguesa, Carnes, Pescados\n🍰 Postres: Tiramisú, Cheesecake, Helado\n☕ Bebidas: Refrescos, Vino, Cerveza\n\n¿Te gustaría saber más sobre alguna categoría?',
        
        // === INTENTS DE INFORMACIÓN ===
        'Horarios': 'Nuestro horario de atención:\n• Lunes a viernes: 12:00 PM - 11:00 PM\n• Sábados y domingos: 11:00 AM - 12:00 AM\n\n¡Te esperamos!',
        
        'Ubicacion': 'Nos encontramos en:\n📍 Av. Principal 123, Centro, Ciudad\n\n✅ Estacionamiento gratuito\n✅ Acceso para sillas de ruedas\n✅ Terraza disponible',
        
        // === INTENTS DE PEDIDOS Y RESERVACIONES ===
        'RealizarPedido': '¡Perfecto! Para realizar tu pedido:\n• 📞 Llámanos: (123) 456-7890\n• 🌐 En línea: www.restaurante.com/pedidos\n• 🛵 Delivery: Uber Eats, Rappi, DiDi Food\n\n¿Qué te gustaría ordenar?',
        
        'Reservacion': 'Para reservar una mesa:\n• 📞 Teléfono: (123) 456-7890\n• � Email: reservas@restaurante.com\n• 💬 WhatsApp: (123) 456-7890\n\n¿Para cuántas personas y qué día?',
        
        'CancelarPedido': 'Para cancelar tu pedido:\n• Llámanos al: (123) 456-7890\n• Envía un WhatsApp: (123) 456-7890\n• Email: pedidos@restaurante.com\n\nPor favor indica tu número de pedido.',
        
        'ConsultarEstadoPedido': 'Para consultar el estado de tu pedido:\n• Llámanos: (123) 456-7890\n• WhatsApp: (123) 456-7890\n• Revisa tu email de confirmación\n\n¿Cuál es tu número de pedido?',
        
        'SolicitarRecomendacion': '¡Con gusto te recomiendo! 🌟\n\nNuestros platos más populares:\n• 🍕 Pizza Margarita - Clásica y deliciosa\n• 🍝 Pasta Alfredo - Cremosa y suave\n• 🍔 Hamburguesa de la casa - Jugosa y completa\n• 🥩 Filete de res - Término perfecto\n\n¿Qué tipo de comida prefieres?',
        
        // === OTROS INTENTS ===
        'ConversationItem': 'Puedo ayudarte con información sobre nuestro menú, horarios, reservaciones, pedidos o ubicación. ¿Qué te gustaría saber?',
        
        'None': 'Puedo ayudarte con:\n• 🍽️ Información del menú\n• ⏰ Horarios de atención\n• 📅 Reservaciones\n• 🛵 Realizar pedidos\n• � Consultar estado de pedido\n• ❌ Cancelar pedido\n• 💡 Recomendaciones\n• 📍 Ubicación\n\n¿Qué necesitas saber?'
    };
    
    // Si el intent no está en el diccionario, devolver respuesta genérica
    if (!responses[intent]) {
        console.warn(`⚠️ Intent '${intent}' no tiene respuesta configurada`);
        return responses['None'];
    }
    
    return responses[intent];
}

// Generar respuesta basada en intenciones (personalizar según tu proyecto)
function generateResponseFromIntent(intent, entities, prediction) {
    console.log('🔍 Generando respuesta para intent:', intent);
    console.log('📦 Entities detectadas:', entities);
    
    // === PROCESAR ENTITIES (PLATOS ESPECÍFICOS) ===
    const detectedPlates = [];
    if (entities && entities.length > 0) {
        entities.forEach(entity => {
            if (entity.category === 'Plato') {
                detectedPlates.push(entity.text);
            }
        });
    }
    
    // Si se detectaron platos específicos, personalizar la respuesta
    if (detectedPlates.length > 0) {
        return handlePlateResponse(intent, detectedPlates);
    }
    
    // Respuestas basadas en las intenciones de tu proyecto Azure CLU
    const responses = {
        'Saludo': '¡Hola! 👋 Bienvenido al restaurante. ¿En qué puedo ayudarte hoy?',
        'Despedida': '¡Gracias por contactarnos! 😊 Esperamos verte pronto. ¡Que tengas un excelente día!',
        'Confirmar': '¡Perfecto! ¿Hay algo más que necesites?',
        'Negar': 'Entiendo. ¿Te gustaría ver otras opciones?',
        'MenuInfo': 'Nuestro menú incluye:\n\n🥗 Entradas: Ensalada, Bruschetta, Sopa\n🍝 Platos principales: Pasta, Pizza, Hamburguesa, Carnes, Pescados\n🍰 Postres: Tiramisú, Cheesecake, Helado\n☕ Bebidas: Refrescos, Vino, Cerveza\n\n¿Qué te gustaría saber más sobre alguna categoría?',
        'Horarios': 'Nuestro horario de atención:\n• Lunes a viernes: 12:00 PM - 11:00 PM\n• Sábados y domingos: 11:00 AM - 12:00 AM\n\n¡Te esperamos!',
        'Ubicacion': 'Nos encontramos en:\n📍 Av. Principal 123, Centro, Ciudad\n\n✅ Estacionamiento gratuito\n✅ Acceso para sillas de ruedas\n✅ Terraza disponible',
        'RealizarPedido': '¡Excelente! Para confirmar:\n\n📞 Llámanos: (123) 456-7890\n🌐 En línea: www.restaurante.com\n🛵 Delivery disponible\n\n¿Necesitas algo más?',
        'Reservacion': 'Para reservar mesa:\n• 📞 Teléfono: (123) 456-7890\n• 📧 Email: reservas@restaurante.com\n• 💬 WhatsApp: (123) 456-7890\n\n¿Para cuántas personas?',
        'CancelarPedido': 'Para cancelar:\n• Llámanos: (123) 456-7890\n• WhatsApp: (123) 456-7890\n\nIndícanos tu número de pedido.',
        'ConsultarEstadoPedido': 'Para consultar tu pedido:\n• Llama al: (123) 456-7890\n• Revisa tu email de confirmación\n\n¿Tienes tu número de pedido?',
        'SolicitarRecomendacion': '¡Con gusto! 🌟 Te recomiendo:\n\n🍕 Pizza Margarita\n🍝 Pasta Alfredo\n🍔 Hamburguesa BBQ\n\n¿Cuál te llama más la atención?',
        'ConversationItem': 'Puedo ayudarte con menú, horarios, reservaciones o pedidos. ¿Qué necesitas?',
        'None': '¿En qué puedo ayudarte?\n• 🍽️ Ver el menú\n• ⏰ Horarios\n• 📅 Reservar\n• 🛵 Pedir'
    };
    
    if (!responses[intent]) {
        console.warn(`⚠️ Intent '${intent}' no tiene respuesta configurada`);
        return responses['None'];
    }
    
    return responses[intent];
}

// Nueva función para manejar respuestas personalizadas por plato
function handlePlateResponse(intent, plates) {
    console.log('🍽️ Platos detectados:', plates);
    
    // Información detallada de cada plato
    const plateInfo = {
        // PIZZAS
        'pizza': '🍕 **Pizzas**\n• Margarita: $150\n• Pepperoni: $180\n• Cuatro Quesos: $200\n\n¿Cuál te gusta?',
        'margarita': '🍕 **Pizza Margarita** - $150\nTomate, mozzarella, albahaca\n¿La ordenamos?',
        'pepperoni': '🍕 **Pizza Pepperoni** - $180\nSalsa, mozzarella, pepperoni\n¿Te gustaría pedirla?',
        'cuatro quesos': '🍕 **Pizza Cuatro Quesos** - $200\nMozzarella, parmesano, gorgonzola, fontina\n¿La preparamos?',
        
        // ENSALADAS
        'ensalada': '🥗 **Ensaladas**\n• César: $120\n• Mixta: $100\n• Griega: $130\n\n¿Cuál prefieres?',
        'cesar': '🥗 **Ensalada César** - $120\nLechuga, crutones, parmesano\n¿Te la preparo?',
        'mixta': '🥗 **Ensalada Mixta** - $100\nLechuga, tomate, cebolla, zanahoria\n¿La pedimos?',
        'griega': '🥗 **Ensalada Griega** - $130\nTomate, pepino, queso feta, aceitunas\n¿Te gusta?',
        
        // HAMBURGUESAS
        'hamburguesa': '🍔 **Hamburguesas**\n• Clásica: $180\n• BBQ: $200\n• Completa: $220\n\nCon papas fritas. ¿Cuál quieres?',
        'clasica': '🍔 **Hamburguesa Clásica** - $180\nCarne, lechuga, tomate, queso\n¿La ordenamos?',
        'bbq': '🍔 **Hamburguesa BBQ** - $200\nCarne, salsa BBQ, cebolla caramelizada\n¿Te la preparo?',
        'completa': '🍔 **Hamburguesa Completa** - $220\nDoble carne, queso, bacon, huevo\n¿La pedimos?',
        
        // POSTRES
        'postre': '🍰 **Postres**\n• Tiramisú: $90\n• Cheesecake: $85\n• Brownie: $75\n\n¿Cuál te provoca?',
        'tiramisu': '🍰 **Tiramisú** - $90\nPostre italiano con café\n¿Lo pedimos?',
        'cheesecake': '🍰 **Cheesecake** - $85\nCremoso pastel de queso\n¿Te lo traigo?',
        'brownie': '🍰 **Brownie** - $75\nChocolate con helado\n¿Lo ordenamos?',
        
        // BEBIDAS
        'bebida': '☕ **Bebidas**\n• Refrescos: $35\n• Agua: $25\n• Cerveza: $50\n• Vino: $120+\n\n¿Qué tomas?',
        'agua': '💧 **Agua** - $25\nNatural o mineral',
        'coca': '🥤 **Coca-Cola** - $35\nRegular, Zero o Light',
        'refresco': '🥤 **Refrescos** - $35\nCoca, Sprite, Fanta\n¿Cuál?',
        'cerveza': '🍺 **Cerveza** - $50\nNacional o importada',
        'vino': '🍷 **Vino** - $120+\nTinto, blanco o rosado'
    };
    
    // Construir respuesta personalizada
    let response = '';
    plates.forEach((plate, index) => {
        const plateLower = plate.toLowerCase();
        const info = plateInfo[plateLower] || `${plate} - ¡Excelente elección!`;
        response += info;
        if (index < plates.length - 1) response += '\n\n';
    });
    
    // Agregar call-to-action según el intent
    if (intent === 'RealizarPedido') {
        response += '\n\n✅ Para confirmar:\n📞 (123) 456-7890';
    }
    
    return response;
}
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

