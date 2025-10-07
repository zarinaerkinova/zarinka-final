/**
 * SMS Service - централизованная система отправки SMS
 * Поддерживает несколько провайдеров и fallback механизмы
 */

import fetch from 'node-fetch';

/**
 * Отправка SMS через SMS.ru (для российских номеров)
 */
export const sendSMSviaSMSRu = async (phone, code) => {
    try {
        const apiId = process.env.SMS_RU_API_ID;
        if (!apiId || apiId === 'your_sms_ru_api_id') {
            throw new Error('SMS_RU_API_ID не настроен. Получите API ключ на https://sms.ru/');
        }

        // Очистка номера для SMS.ru
        const cleanPhone = phone.replace(/\D/g, '');
        
        const message = `Ваш код подтверждения: ${code}. Не сообщайте его никому.`;
        const url = `https://sms.ru/sms/send`;
        
        const params = new URLSearchParams({
            api_id: apiId,
            to: cleanPhone,
            msg: message,
            json: '1'
        });

        console.log(`📱 Отправка SMS через SMS.ru на номер ${phone}`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('SMS.ru response:', data);
        
        if (data.status === 'OK') {
            const smsInfo = data.sms && data.sms[cleanPhone];
            return {
                success: true,
                messageId: smsInfo?.sms_id || `sms_ru_${Date.now()}`,
                cost: smsInfo?.cost || 0,
                status: smsInfo?.status || 'sent',
                provider: 'sms_ru'
            };
        } else {
            throw new Error(data.status_text || `SMS.ru error: ${data.status}`);
        }
    } catch (error) {
        console.error('❌ Ошибка отправки SMS через SMS.ru:', error.message);
        throw error;
    }
};

/**
 * Отправка SMS через Eskiz.uz (для узбекских номеров)
 */
export const sendSMSviaEskizUz = async (phone, code) => {
    try {
        const login = process.env.ESKIZ_LOGIN;
        const password = process.env.ESKIZ_PASSWORD;
        
        if (!login || !password || login === 'your_eskiz_email') {
            throw new Error('ESKIZ_LOGIN или ESKIZ_PASSWORD не настроены. Зарегистрируйтесь на https://eskiz.uz/');
        }

        console.log(`📱 Отправка SMS через Eskiz.uz на номер ${phone}`);

        // Получаем токен авторизации
        const authResponse = await fetch('https://notify.eskiz.uz/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: login,
                password: password
            })
        });

        if (!authResponse.ok) {
            throw new Error(`Auth failed: ${authResponse.status} ${authResponse.statusText}`);
        }

        const authData = await authResponse.json();
        if (!authData.data?.token) {
            throw new Error(`Ошибка аутентификации в Eskiz.uz: ${authData.message || 'неизвестная ошибка'}`);
        }

        // Отправляем SMS
        const message = `Ваш код подтверждения: ${code}. Не сообщайте его никому.`;
        const cleanPhone = phone.replace('+', '');
        
        const smsResponse = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authData.data.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mobile_phone: cleanPhone,
                message: message,
                from: '4546' // Обычный отправитель для Eskiz
            })
        });

        if (!smsResponse.ok) {
            throw new Error(`SMS send failed: ${smsResponse.status} ${smsResponse.statusText}`);
        }

        const smsData = await smsResponse.json();
        console.log('Eskiz.uz response:', smsData);
        
        if (smsData.status === 'success') {
            return {
                success: true,
                messageId: smsData.data?.id || `eskiz_${Date.now()}`,
                cost: 0.01, // Примерная стоимость для Eskiz
                status: 'sent',
                provider: 'eskiz_uz'
            };
        } else {
            throw new Error(smsData.message || 'Неизвестная ошибка Eskiz.uz');
        }
    } catch (error) {
        console.error('❌ Ошибка отправки SMS через Eskiz.uz:', error.message);
        throw error;
    }
};

/**
 * Отправка SMS через Twilio (международный провайдер)
 */
export const sendSMSviaTwilio = async (phone, code) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhone = process.env.TWILIO_PHONE_NUMBER;
        
        if (!accountSid || !authToken || !fromPhone) {
            throw new Error('Twilio credentials не настроены');
        }

        console.log(`📱 Отправка SMS через Twilio на номер ${phone}`);

        const message = `Ваш код подтверждения: ${code}. Не сообщайте его никому.`;
        
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                From: fromPhone,
                To: phone,
                Body: message
            })
        });

        const data = await response.json();
        console.log('Twilio response:', data);
        
        if (response.ok && data.sid) {
            return {
                success: true,
                messageId: data.sid,
                cost: parseFloat(data.price) || 0,
                status: data.status || 'sent',
                provider: 'twilio'
            };
        } else {
            throw new Error(data.message || `Twilio error: ${data.code}`);
        }
    } catch (error) {
        console.error('❌ Ошибка отправки SMS через Twilio:', error.message);
        throw error;
    }
};

/**
 * Демо режим (для тестирования без реальной отправки)
 */
export const sendSMSDemo = async (phone, code) => {
    try {
        console.log('🎯 === ДЕМО РЕЖИМ SMS ===');
        console.log(`📱 Номер: ${phone}`);
        console.log(`🔐 Код: ${code}`);
        console.log(`⏰ Время: ${new Date().toLocaleString('ru-RU')}`);
        console.log('📤 SMS НЕ отправлен реально (демо режим)');
        console.log('🔧 Для реальной отправки настройте SMS_PROVIDER в .env');
        console.log('========================');
        
        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
            success: true,
            messageId: `demo_${Date.now()}`,
            cost: 0,
            status: 'demo',
            provider: 'demo',
            demo: true
        };
    } catch (error) {
        console.error('❌ Ошибка в демо режиме:', error.message);
        throw error;
    }
};

/**
 * Автоматический выбор провайдера на основе номера телефона
 */
export const selectSMSProvider = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Узбекские номера (код страны 998)
    if (cleanPhone.startsWith('998') || (cleanPhone.length === 9 && !cleanPhone.startsWith('7') && !cleanPhone.startsWith('8'))) {
        return 'eskiz_uz';
    }
    
    // Российские номера (код страны 7)
    if (cleanPhone.startsWith('7') || cleanPhone.startsWith('8') || 
        (cleanPhone.length === 10 && ['9', '4', '8'].includes(cleanPhone[0]))) {
        return 'sms_ru';
    }
    
    // Международные номера
    return 'twilio';
};

/**
 * Основная функция отправки SMS с поддержкой fallback
 */
export const sendSMSCode = async (phone, code) => {
    try {
        const configuredProvider = process.env.SMS_PROVIDER || 'demo';
        let provider = configuredProvider;
        
        // Автоматический выбор провайдера если не настроен
        if (provider === 'auto') {
            provider = selectSMSProvider(phone);
            console.log(`🤖 Автоматически выбран провайдер: ${provider} для номера ${phone}`);
        }
        
        console.log(`📡 Используется SMS провайдер: ${provider}`);
        
        let result;
        let errors = [];
        
        switch (provider) {
            case 'sms_ru':
                try {
                    result = await sendSMSviaSMSRu(phone, code);
                } catch (error) {
                    errors.push(`SMS.ru: ${error.message}`);
                    // Fallback на демо режим
                    console.log('⚠️ SMS.ru недоступен, переключаемся на демо режим');
                    result = await sendSMSDemo(phone, code);
                }
                break;
                
            case 'eskiz_uz':
                try {
                    result = await sendSMSviaEskizUz(phone, code);
                } catch (error) {
                    errors.push(`Eskiz.uz: ${error.message}`);
                    // Fallback на демо режим
                    console.log('⚠️ Eskiz.uz недоступен, переключаемся на демо режим');
                    result = await sendSMSDemo(phone, code);
                }
                break;
                
            case 'twilio':
                try {
                    result = await sendSMSviaTwilio(phone, code);
                } catch (error) {
                    errors.push(`Twilio: ${error.message}`);
                    // Fallback на демо режим
                    console.log('⚠️ Twilio недоступен, переключаемся на демо режим');
                    result = await sendSMSDemo(phone, code);
                }
                break;
                
            case 'demo':
            default:
                result = await sendSMSDemo(phone, code);
                break;
        }
        
        // Логирование результата
        if (result.success) {
            console.log(`✅ SMS успешно отправлен через ${result.provider}`);
            console.log(`📊 ID сообщения: ${result.messageId}`);
            console.log(`💰 Стоимость: ${result.cost} руб.`);
        }
        
        return {
            ...result,
            errors: errors.length > 0 ? errors : undefined
        };
        
    } catch (error) {
        console.error('💥 Критическая ошибка отправки SMS:', error.message);
        
        // Последний fallback - демо режим
        try {
            const demoResult = await sendSMSDemo(phone, code);
            return {
                ...demoResult,
                fallback: true,
                originalError: error.message
            };
        } catch (demoError) {
            return {
                success: false,
                error: `Все провайдеры недоступны: ${error.message}`,
                provider: 'none'
            };
        }
    }
};

/**
 * Проверка статуса отправленного SMS (для провайдеров, которые это поддерживают)
 */
export const checkSMSStatus = async (messageId, provider) => {
    try {
        switch (provider) {
            case 'sms_ru':
                const apiId = process.env.SMS_RU_API_ID;
                if (!apiId) return { status: 'unknown' };
                
                const response = await fetch(`https://sms.ru/sms/status?api_id=${apiId}&sms_id=${messageId}&json=1`);
                const data = await response.json();
                
                return {
                    status: data.sms?.[messageId]?.status || 'unknown',
                    cost: data.sms?.[messageId]?.cost || 0
                };
                
            case 'demo':
                return { status: 'delivered', cost: 0 };
                
            default:
                return { status: 'unknown' };
        }
    } catch (error) {
        console.error('Ошибка проверки статуса SMS:', error);
        return { status: 'error', error: error.message };
    }
};

/**
 * Получение баланса SMS провайдера
 */
export const getSMSBalance = async (provider = process.env.SMS_PROVIDER) => {
    try {
        switch (provider) {
            case 'sms_ru':
                const apiId = process.env.SMS_RU_API_ID;
                if (!apiId) return { balance: 0, currency: 'RUB' };
                
                const response = await fetch(`https://sms.ru/my/balance?api_id=${apiId}&json=1`);
                const data = await response.json();
                
                return {
                    balance: data.balance || 0,
                    currency: 'RUB'
                };
                
            case 'demo':
                return { balance: 999, currency: 'DEMO' };
                
            default:
                return { balance: 0, currency: 'UNKNOWN' };
        }
    } catch (error) {
        console.error('Ошибка получения баланса SMS:', error);
        return { balance: 0, currency: 'ERROR' };
    }
};