/**
 * Утилиты для валидации телефонных номеров
 */

// Основное регулярое выражение для гибкой проверки формата
export const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

// Узбекские номера
export const UZBEK_PHONE_REGEX = /^(\+998|998)?[\s\-]?\(?[0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

// Российские номера (оставляем для совместимости)
export const RUSSIAN_PHONE_REGEX = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

// Международные форматы
export const INTERNATIONAL_PHONE_REGEX = /^[\+]?[1-9]\d{1,14}$/;

/**
 * Очистка номера от всех нецифровых символов кроме +
 * @param {string} phone - номер телефона
 * @returns {string} очищенный номер
 */
export const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
};

/**
 * Форматирование узбекского номера телефона
 * @param {string} phone - номер телефона
 * @returns {string} отформатированный номер
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
 * @param {string} phone - номер телефона
 * @returns {string} отформатированный номер
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
 * Проверка количества цифр в номере
 * @param {string} phone - номер телефона
 * @param {number} min - минимальное количество цифр
 * @param {number} max - максимальное количество цифр
 * @returns {boolean}
 */
export const validatePhoneLength = (phone, min = 10, max = 15) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= min && digits.length <= max;
};

/**
 * Проверка наличия кода страны
 * @param {string} phone - номер телефона
 * @returns {boolean}
 */
export const hasCountryCode = (phone) => {
    const cleaned = cleanPhoneNumber(phone);
    return cleaned.startsWith('+') || cleaned.length > 10;
};

/**
 * Валидация узбекского номера телефона
 * @param {string} phone - номер телефона
 * @returns {object} результат валидации
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
    
    // Проверка основного формата
    if (!UZBEK_PHONE_REGEX.test(trimmedPhone)) {
        result.errors.push('Неверный формат узбекского номера телефона');
    }

    // Проверка длины
    if (!validatePhoneLength(trimmedPhone, 9, 12)) {
        result.errors.push('Номер должен содержать от 9 до 12 цифр');
    }

    // Проверка на корректные коды операторов Узбекистана
    const cleaned = cleanPhoneNumber(trimmedPhone);
    let operatorCode = '';
    
    if (cleaned.startsWith('998')) {
        operatorCode = cleaned.substring(3, 5);
    } else if (cleaned.length === 9) {
        operatorCode = cleaned.substring(0, 2);
    }
    
    const validOperatorCodes = [
        '90', '91', '93', '94', '95', '97', '98', '99', // Мобильные операторы
        '33', '55', '66', '71', '73', '74', '75', '76', '77', '78', '79' // Городские коды
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
 * Валидация международного номера телефона
 * @param {string} phone - номер телефона
 * @returns {object} результат валидации
 */
export const validateInternationalPhone = (phone) => {
    const result = {
        isValid: false,
        errors: [],
        formatted: phone,
        countryCode: null
    };

    if (!phone || phone.trim() === '') {
        result.errors.push('Номер телефона обязателен');
        return result;
    }

    const cleaned = cleanPhoneNumber(phone);
    
    // Проверка международного формата
    if (!INTERNATIONAL_PHONE_REGEX.test(cleaned)) {
        result.errors.push('Неверный формат международного номера');
    }

    // Проверка длины
    if (!validatePhoneLength(phone, 7, 15)) {
        result.errors.push('Международный номер должен содержать от 7 до 15 цифр');
    }

    // Извлечение кода страны
    if (cleaned.startsWith('+')) {
        const potentialCode = cleaned.substring(1, 4);
        result.countryCode = potentialCode;
    }

    if (result.errors.length === 0) {
        result.isValid = true;
        result.formatted = cleaned.startsWith('+') ? cleaned : '+' + cleaned;
    }

    return result;
};

/**
 * Валидация российского номера телефона
 * @param {string} phone - номер телефона
 * @returns {object} результат валидации
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
    
    // Проверка основного формата
    if (!RUSSIAN_PHONE_REGEX.test(trimmedPhone)) {
        result.errors.push('Неверный формат российского номера телефона');
    }

    // Проверка длины
    if (!validatePhoneLength(trimmedPhone, 10, 11)) {
        result.errors.push('Номер должен содержать от 10 до 11 цифр');
    }

    // Проверка на корректные коды операторов
    const cleaned = cleanPhoneNumber(trimmedPhone);
    const operatorCode = cleaned.replace(/^(\+?7|8)/, '').substring(0, 3);
    
    const validOperatorCodes = ['900', '901', '902', '903', '904', '905', '906', '908', '909', '910', '911', '912', '913', '914', '915', '916', '917', '918', '919', '920', '921', '922', '923', '924', '925', '926', '927', '928', '929', '930', '931', '932', '933', '934', '936', '937', '938', '939', '950', '951', '952', '953', '954', '955', '956', '958', '960', '961', '962', '963', '964', '965', '966', '967', '968', '969', '970', '971', '977', '978', '980', '981', '982', '983', '984', '985', '986', '987', '988', '989', '991', '992', '993', '994', '995', '996', '997', '999'];
    
    if (!validOperatorCodes.includes(operatorCode)) {
        result.warnings.push('Код оператора может быть недействительным');
    }

    if (result.errors.length === 0) {
        result.isValid = true;
        result.formatted = formatRussianPhone(trimmedPhone);
    }

    return result;
};
/**
 * Универсальная валидация номера телефона
 * @param {string} phone - номер телефона
 * @param {string} type - тип валидации ('uzbek', 'russian', 'international', 'flexible')
 * @returns {object} результат валидации
 */
export const validatePhone = (phone, type = 'flexible') => {
    switch (type) {
        case 'uzbek':
            return validateUzbekPhone(phone);
        case 'russian':
            return validateRussianPhone(phone);
        case 'international':
            return validateInternationalPhone(phone);
        case 'flexible':
        default:
            // Сначала пробуем узбекский формат
            const uzbekResult = validateUzbekPhone(phone);
            if (uzbekResult.isValid) {
                return uzbekResult;
            }
            
            // Потом российский формат
            const russianResult = validateRussianPhone(phone);
            if (russianResult.isValid) {
                return russianResult;
            }
            
            // Если не подходит, пробуем международный
            const internationalResult = validateInternationalPhone(phone);
            if (internationalResult.isValid) {
                return internationalResult;
            }
            
            // Если ничего не подходит, возвращаем ошибки узбекского формата (приоритет)
            return uzbekResult;
    }
};

/**
 * Получение информации о номере телефона через backend API
 * @param {string} phone - номер телефона
 * @returns {Promise<object>} информация о номере
 */
export const getPhoneInfo = async (phone) => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${baseUrl}/phone/info/${encodeURIComponent(phone)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Ошибка получения информации о номере');
        }
    } catch (error) {
        console.error('Ошибка получения информации о номере:', error);
        
        // Возвращаем базовую информацию в случае ошибки
        const cleaned = cleanPhoneNumber(phone);
        return {
            isValid: validatePhone(phone).isValid,
            exists: null,
            carrier: 'Неизвестно',
            lineType: 'mobile',
            country: cleaned.startsWith('+7') || cleaned.startsWith('7') || cleaned.startsWith('8') ? 'RU' : 'Unknown',
            region: 'Неизвестно',
            riskScore: 0,
            isRoaming: false,
            apiError: true,
            errorMessage: error.message
        };
    }
};

/**
 * Отправка SMS кода верификации через backend
 * @param {string} phone - номер телефона
 * @returns {Promise<object>} результат отправки
 */
export const sendVerificationSMS = async (phone) => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${baseUrl}/phone/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone })
        });

        const result = await response.json();
        
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } else {
            return {
                success: false,
                error: result.message || 'Ошибка отправки SMS'
            };
        }
    } catch (error) {
        console.error('Ошибка отправки SMS:', error);
        return {
            success: false,
            error: error.message || 'Ошибка сети при отправке SMS'
        };
    }
};

/**
 * Верификация SMS кода через backend
 * @param {string} phone - номер телефона
 * @param {string} code - код верификации
 * @returns {Promise<object>} результат верификации
 */
export const verifySMSCode = async (phone, code) => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${baseUrl}/phone/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, code })
        });

        const result = await response.json();
        
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } else {
            return {
                success: false,
                error: result.message || 'Ошибка верификации кода',
                data: result.data
            };
        }
    } catch (error) {
        console.error('Ошибка верификации кода:', error);
        return {
            success: false,
            error: error.message || 'Ошибка сети при верификации кода'
        };
    }
};

/**
 * Валидация номера телефона через backend API
 * @param {string} phone - номер телефона
 * @param {boolean} detailed - получить детальную информацию
 * @returns {Promise<object>} результат валидации
 */
export const validatePhoneWithAPI = async (phone, detailed = false) => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const url = `${baseUrl}/phone/validate${detailed ? '?detailed=true' : ''}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone })
        });

        const result = await response.json();
        
        if (result.success) {
            return {
                success: true,
                data: result.data
            };
        } else {
            return {
                success: false,
                error: result.message || 'Ошибка валидации номера',
                errors: result.errors,
                warnings: result.warnings
            };
        }
    } catch (error) {
        console.error('Ошибка валидации номера через API:', error);
        return {
            success: false,
            error: error.message || 'Ошибка сети при валидации номера'
        };
    }
};

/**
 * Маскирование номера телефона для отображения
 * @param {string} phone - номер телефона
 * @returns {string} замаскированный номер
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