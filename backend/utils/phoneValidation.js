/**
 * Утилиты для валидации телефонных номеров на backend
 */

import fetch from 'node-fetch';
// Импортируем новый SMS сервис
import { sendSMSCode as sendSMSCodeNew } from './smsService.js';

// Регулярные выражения для валидации
export const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
export const UZBEK_PHONE_REGEX = /^(\+998|998)?[\s\-]?\(?[0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
export const RUSSIAN_PHONE_REGEX = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
export const INTERNATIONAL_PHONE_REGEX = /^[\+]?[1-9]\d{1,14}$/;

/**
 * Очистка номера от всех нецифровых символов кроме +
 */
export const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
};

/**
 * Форматирование узбекского номера телефона
 */
export const formatUzbekPhone = (phone) => {
    const cleaned = cleanPhoneNumber(phone);
    
    if (cleaned.startsWith('998') && cleaned.length === 12) {
        return '+' + cleaned;
    } else if (cleaned.length === 9) {
        return '+998' + cleaned;
    }
    
    return phone;
};

/**
 * Форматирование российского номера телефона
 */
export const formatRussianPhone = (phone) => {
    const cleaned = cleanPhoneNumber(phone);
    
    if (cleaned.startsWith('8') && cleaned.length === 11) {
        return '+7' + cleaned.slice(1);
    } else if (cleaned.startsWith('7') && cleaned.length === 11) {
        return '+' + cleaned;
    } else if (cleaned.length === 10) {
        return '+7' + cleaned;
    }
    
    return phone;
};

/**
 * Валидация узбекского номера телефона
 */
export const validateUzbekPhone = (phone) => {
    const result = {
        isValid: false,
        errors: [],
        formatted: phone,
        warnings: []
    };

    if (!phone || phone.trim() === '') {
        result.errors.push('Номер телефона обязателен');
        return result;
    }

    const trimmedPhone = phone.trim();
    
    if (!UZBEK_PHONE_REGEX.test(trimmedPhone)) {
        result.errors.push('Неверный формат узбекского номера телефона');
    }

    const digits = trimmedPhone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 12) {
        result.errors.push('Номер должен содержать от 9 до 12 цифр');
    }

    // Проверка кода оператора
    const cleaned = cleanPhoneNumber(trimmedPhone);
    let operatorCode = '';
    
    if (cleaned.startsWith('998')) {
        operatorCode = cleaned.substring(3, 5);
    } else if (cleaned.length === 9) {
        operatorCode = cleaned.substring(0, 2);
    }
    
    const validOperatorCodes = [
        '90', '91', '93', '94', '95', '97', '98', '99',
        '33', '55', '66', '71', '73', '74', '75', '76', '77', '78', '79'
    ];
    
    if (!validOperatorCodes.includes(operatorCode)) {
        result.warnings.push('Код оператора может быть недействительным');
    }

    if (result.errors.length === 0) {
        result.isValid = true;
        result.formatted = formatUzbekPhone(trimmedPhone);
    }

    return result;
};
/**
 * Валидация российского номера телефона
 */
export const validateRussianPhone = (phone) => {
    const result = {
        isValid: false,
        errors: [],
        formatted: phone,
        warnings: []
    };

    if (!phone || phone.trim() === '') {
        result.errors.push('Номер телефона обязателен');
        return result;
    }

    const trimmedPhone = phone.trim();
    
    if (!RUSSIAN_PHONE_REGEX.test(trimmedPhone)) {
        result.errors.push('Неверный формат российского номера телефона');
    }

    const digits = trimmedPhone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
        result.errors.push('Номер должен содержать от 10 до 11 цифр');
    }

    // Проверка кода оператора
    const cleaned = cleanPhoneNumber(trimmedPhone);
    const operatorCode = cleaned.replace(/^(\+?7|8)/, '').substring(0, 3);
    
    const validOperatorCodes = [
        '900', '901', '902', '903', '904', '905', '906', '908', '909',
        '910', '911', '912', '913', '914', '915', '916', '917', '918', '919',
        '920', '921', '922', '923', '924', '925', '926', '927', '928', '929',
        '930', '931', '932', '933', '934', '936', '937', '938', '939',
        '950', '951', '952', '953', '954', '955', '956', '958',
        '960', '961', '962', '963', '964', '965', '966', '967', '968', '969',
        '970', '971', '977', '978',
        '980', '981', '982', '983', '984', '985', '986', '987', '988', '989',
        '991', '992', '993', '994', '995', '996', '997', '999'
    ];
    
    if (!validOperatorCodes.includes(operatorCode)) {
        result.warnings.push('Код оператора может быть недействительным');
    }

    if (result.errors.length === 0) {
        result.isValid = true;
        result.formatted = formatRussianPhone(trimmedPhone);
    }

    return result;
};

// Импортируем новый SMS сервис
import { sendSMSCode as sendSMSCodeService } from './smsService.js';

/**
 * Отправка SMS кода с поддержкой разных провайдеров
 * Теперь использует улучшенный SMS сервис
 */
export const sendSMSCode = sendSMSCodeService;

/**
 * Проверка номера через NumLookupAPI
 * Интеграция с реальным сервисом валидации номеров
 */
export const verifyPhoneWithAPI = async (phone) => {
    try {
        const apiKey = process.env.NUMLOOKUP_API_KEY || 'num_live_gdXMpYQQmIQbdTOQUUb2BdMEsMfvMrzMJjunpe2S';
        const cleanedPhone = cleanPhoneNumber(phone);
        
        // Форматируем номер для API (должен начинаться с +)
        const formattedPhone = cleanedPhone.startsWith('+') ? cleanedPhone : '+' + cleanedPhone;
        
        const response = await fetch(`https://api.numlookupapi.com/v1/validate/${encodeURIComponent(formattedPhone)}`, {
            method: 'GET',
            headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
            success: true,
            data: {
                valid: data.valid || false,
                number: data.number || cleanedPhone,
                local_format: data.local_format || phone,
                international_format: data.international_format || formattedPhone,
                country_prefix: data.country_prefix || '+7',
                country_code: data.country_code || 'RU',
                country_name: data.country_name || 'Russia',
                location: data.location || 'Unknown',
                carrier: data.carrier || 'Unknown',
                line_type: data.line_type || 'mobile',
                is_possible: data.is_possible !== undefined ? data.is_possible : true,
                is_valid: data.is_valid !== undefined ? data.is_valid : data.valid,
                risk_score: data.risk_score || 0,
                fraud_score: data.fraud_score || 0,
                is_disposable: data.is_disposable || false,
                is_ported: data.is_ported || false,
                active: data.active !== undefined ? data.active : true,
                timezone: data.timezone || 'Europe/Moscow'
            }
        };
        
    } catch (error) {
        console.error('Ошибка проверки номера через NumLookupAPI:', error);
        
        // Fallback на базовую валидацию если API недоступен
        const fallbackValidation = validateRussianPhone(phone);
        
        return {
            success: false,
            error: error.message,
            fallback: {
                valid: fallbackValidation.isValid,
                number: cleanPhoneNumber(phone),
                local_format: phone,
                international_format: fallbackValidation.formatted,
                country_prefix: '+7',
                country_code: 'RU',
                country_name: 'Russia',
                location: 'Russia',
                carrier: 'Unknown',
                line_type: 'mobile',
                is_possible: true,
                is_valid: fallbackValidation.isValid,
                risk_score: 0,
                fraud_score: 0,
                is_disposable: false,
                is_ported: false,
                active: true,
                timezone: 'Europe/Moscow',
                api_error: true
            }
        };
    }
};

/**
 * Получение случайного оператора для мок данных
 */
const getRandomCarrier = () => {
    const carriers = ['МТС', 'Билайн', 'МегаФон', 'Теле2', 'Yota'];
    return carriers[Math.floor(Math.random() * carriers.length)];
};

/**
 * Получение информации о регионе по коду оператора
 */
export const getRegionByOperatorCode = (operatorCode) => {
    const regionCodes = {
        '900': 'Москва',
        '901': 'Санкт-Петербург', 
        '902': 'Екатеринбург',
        '903': 'Новосибирск',
        '904': 'Казань',
        '905': 'Нижний Новгород',
        '906': 'Самара',
        '908': 'Волгоград',
        '909': 'Ростов-на-Дону',
        '910': 'Краснодар'
    };
    
    return regionCodes[operatorCode] || 'Россия';
};

/**
 * Маскирование номера для безопасного отображения
 */
export const maskPhoneNumber = (phone) => {
    if (!phone) return '';
    
    const cleaned = cleanPhoneNumber(phone);
    if (cleaned.length < 4) return phone;
    
    const visibleStart = cleaned.substring(0, 2);
    const visibleEnd = cleaned.substring(cleaned.length - 2);
    const maskedMiddle = '*'.repeat(cleaned.length - 4);
    
    return visibleStart + maskedMiddle + visibleEnd;
};

/**
 * Проверка на подозрительную активность (фрод)
 */
export const checkPhoneForFraud = async (phone, userId = null) => {
    try {
        // В реальном приложении здесь была бы проверка:
        // - Частота использования номера
        // - Связь с заблокированными аккаунтами
        // - Географические аномалии
        // - Временные паттерны использования
        
        const riskFactors = [];
        let riskScore = 0;
        
        // Проверка на слишком новый номер
        if (Math.random() > 0.9) {
            riskFactors.push('Номер недавно активирован');
            riskScore += 20;
        }
        
        // Проверка на частое использование
        if (Math.random() > 0.85) {
            riskFactors.push('Номер используется в нескольких аккаунтах');
            riskScore += 30;
        }
        
        // Проверка на подозрительную географию
        if (Math.random() > 0.95) {
            riskFactors.push('Необычная геолокация для данного номера');
            riskScore += 25;
        }
        
        return {
            riskScore,
            riskLevel: riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low',
            riskFactors,
            recommendation: riskScore > 50 ? 'block' : riskScore > 25 ? 'verify' : 'allow'
        };
        
    } catch (error) {
        console.error('Ошибка проверки на фрод:', error);
        return {
            riskScore: 0,
            riskLevel: 'unknown',
            riskFactors: [],
            recommendation: 'allow'
        };
    }
};

/**
 * Генерация кода подтверждения
 */
export const generateVerificationCode = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Проверка лимитов отправки SMS
 */
export const checkSMSLimits = async (phone, userId = null) => {
    try {
        // В реальном приложении здесь была бы проверка:
        // - Количество SMS за день/час
        // - Лимиты на пользователя
        // - Лимиты на номер телефона
        
        const dailyLimit = 5;
        const hourlyLimit = 3;
        
        // Мок проверка
        const currentHourSent = Math.floor(Math.random() * 2);
        const currentDaySent = Math.floor(Math.random() * 3);
        
        return {
            canSend: currentHourSent < hourlyLimit && currentDaySent < dailyLimit,
            hourlyRemaining: hourlyLimit - currentHourSent,
            dailyRemaining: dailyLimit - currentDaySent,
            nextAllowedTime: currentHourSent >= hourlyLimit ? new Date(Date.now() + 3600000) : null
        };
        
    } catch (error) {
        console.error('Ошибка проверки лимитов SMS:', error);
        return {
            canSend: false,
            error: error.message
        };
    }
};