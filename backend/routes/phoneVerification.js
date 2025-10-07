import express from 'express';
import { 
    validateUzbekPhone,
    validateRussianPhone, 
    verifyPhoneWithAPI, 
    sendSMSCode, 
    generateVerificationCode,
    checkSMSLimits,
    checkPhoneForFraud,
    formatUzbekPhone
} from '../utils/phoneValidation.js';

// Импортируем дополнительные функции SMS сервиса
import { checkSMSStatus, getSMSBalance } from '../utils/smsService.js';

const router = express.Router();

// Временное хранилище кодов (в продакшене использовать Redis)
const verificationCodes = new Map();
const phoneVerificationAttempts = new Map();

/**
 * Валидация номера телефона
 * POST /api/phone/validate
 */
router.post('/validate', async (req, res) => {
    try {
        const { phone, type = 'uzbek' } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Номер телефона обязателен'
            });
        }

        // Базовая валидация (приоритет узбекским номерам)
        let validation = validateUzbekPhone(phone);
        
        // Если узбекский формат не подходит, пробуем российский
        if (!validation.isValid) {
            const russianValidation = validateRussianPhone(phone);
            if (russianValidation.isValid) {
                validation = russianValidation;
            }
        }
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Невалидный номер телефона',
                errors: validation.errors,
                warnings: validation.warnings
            });
        }

        // Дополнительная проверка через API (если нужно)
        let apiVerification = null;
        if (req.query.detailed === 'true') {
            apiVerification = await verifyPhoneWithAPI(phone);
        }

        // Проверка на фрод
        const fraudCheck = await checkPhoneForFraud(phone, req.user?.id);

        res.json({
            success: true,
            data: {
                isValid: validation.isValid,
                formatted: validation.formatted,
                warnings: validation.warnings,
                apiVerification: apiVerification?.data || null,
                fraudCheck,
                recommendation: fraudCheck.recommendation
            }
        });

    } catch (error) {
        console.error('Ошибка валидации номера:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * Отправка SMS кода верификации
 * POST /api/phone/send-verification
 */
router.post('/send-verification', async (req, res) => {
    try {
        const { phone } = req.body;
        const userId = req.user?.id || 'anonymous';

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Номер телефона обязателен'
            });
        }

        // Валидация номера (приоритет узбекским номерам)
        let validation = validateUzbekPhone(phone);
        if (!validation.isValid) {
            const russianValidation = validateRussianPhone(phone);
            if (russianValidation.isValid) {
                validation = russianValidation;
            }
        }
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false, 
                message: 'Невалидный номер телефона',
                errors: validation.errors
            });
        }

        const formattedPhone = validation.formatted;

        // Проверка лимитов
        const limitsCheck = await checkSMSLimits(formattedPhone, userId);
        if (!limitsCheck.canSend) {
            return res.status(429).json({
                success: false,
                message: 'Превышен лимит отправки SMS',
                data: {
                    hourlyRemaining: limitsCheck.hourlyRemaining,
                    dailyRemaining: limitsCheck.dailyRemaining,
                    nextAllowedTime: limitsCheck.nextAllowedTime
                }
            });
        }

        // Проверка на фрод
        const fraudCheck = await checkPhoneForFraud(formattedPhone, userId);
        if (fraudCheck.recommendation === 'block') {
            return res.status(403).json({
                success: false,
                message: 'Номер заблокирован по соображениям безопасности'
            });
        }

        // Генерация и сохранение кода
        const code = generateVerificationCode(6);
        const expireTime = Date.now() + 10 * 60 * 1000; // 10 минут
        
        verificationCodes.set(formattedPhone, {
            code,
            expireTime,
            attempts: 0,
            userId
        });

        // Отправка SMS
        const smsResult = await sendSMSCode(formattedPhone, code);
        
        if (!smsResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Ошибка отправки SMS',
                error: smsResult.error,
                errors: smsResult.errors
            });
        }

        // Логирование для безопасности
        console.log(`📱 SMS код отправлен на ${formattedPhone} для пользователя ${userId}`);
        console.log(`📊 Провайдер: ${smsResult.provider || process.env.SMS_PROVIDER || 'demo'}`);
        console.log(`💰 Стоимость: ${smsResult.cost || 0} руб.`);
        
        // Показываем код только в демо режиме или при fallback
        if (smsResult.demo || smsResult.fallback || process.env.SMS_PROVIDER === 'demo') {
            console.log(`🔐 ДЕМО КОД: ${code} (срок действия: 10 минут)`);
            console.log(`⚠️  ВНИМАНИЕ: Приложение работает в демо-режиме!`);
            console.log(`📧 Для реальной отправки SMS настройте SMS_PROVIDER в .env файле`);
        }

        const responseData = {
            phone: formattedPhone,
            expiresIn: 600, // 10 минут в секундах
            messageId: smsResult.messageId,
            provider: smsResult.provider || 'demo',
            cost: smsResult.cost || 0
        };

        // В демо режиме или при fallback возвращаем код
        if (smsResult.demo || smsResult.fallback || process.env.SMS_PROVIDER === 'demo') {
            responseData.demoCode = code;
            responseData.demoMode = true;
            responseData.message = smsResult.fallback ? 
                'SMS провайдер недоступен, код показан для тестирования' :
                'SMS не отправлено - приложение в демо-режиме. Используйте код выше.';
            
            if (smsResult.errors) {
                responseData.providerErrors = smsResult.errors;
            }
        }

        const isDemo = smsResult.demo || smsResult.fallback || process.env.SMS_PROVIDER === 'demo';
        
        res.json({
            success: true,
            message: isDemo ? 
                (smsResult.fallback ? 'Провайдер недоступен: SMS код сгенерирован для тестирования' : 'Демо-режим: SMS код сгенерирован, но не отправлен') : 
                'SMS код отправлен',
            data: responseData
        });

    } catch (error) {
        console.error('Ошибка отправки SMS:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * Верификация SMS кода
 * POST /api/phone/verify-code
 */
router.post('/verify-code', async (req, res) => {
    try {
        const { phone, code } = req.body;
        const userId = req.user?.id || 'anonymous';

        if (!phone || !code) {
            return res.status(400).json({
                success: false,
                message: 'Номер телефона и код обязательны'
            });
        }

        // Форматируем номер для поиска в кэше (верификация кода)
        let formattedPhone = formatUzbekPhone(phone);
        if (!validateUzbekPhone(phone).isValid) {
            formattedPhone = phone; // Используем как есть, если не узбекский формат
        }
        const storedData = verificationCodes.get(formattedPhone);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'Код не найден или истек'
            });
        }

        // Проверка срока действия
        if (Date.now() > storedData.expireTime) {
            verificationCodes.delete(formattedPhone);
            return res.status(400).json({
                success: false,
                message: 'Срок действия кода истек'
            });
        }

        // Проверка количества попыток
        if (storedData.attempts >= 3) {
            verificationCodes.delete(formattedPhone);
            return res.status(429).json({
                success: false,
                message: 'Превышено количество попыток ввода кода'
            });
        }

        // Проверка кода
        if (storedData.code !== code.toString()) {
            storedData.attempts++;
            verificationCodes.set(formattedPhone, storedData);
            
            return res.status(400).json({
                success: false,
                message: 'Неверный код',
                data: {
                    attemptsRemaining: 3 - storedData.attempts
                }
            });
        }

        // Успешная верификация
        verificationCodes.delete(formattedPhone);
        
        // Можно сохранить информацию о верифицированном номере в базе данных
        // await saveVerifiedPhone(userId, formattedPhone);

        console.log(`Номер ${formattedPhone} успешно верифицирован для пользователя ${userId}`);

        res.json({
            success: true,
            message: 'Номер телефона подтвержден',
            data: {
                phone: formattedPhone,
                verifiedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Ошибка верификации кода:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * Получение информации о номере телефона
 * GET /api/phone/info/:phone
 */
router.get('/info/:phone', async (req, res) => {
    try {
        const { phone } = req.params;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Номер телефона обязателен'
            });
        }

        // Валидация номера
        const validation = validateRussianPhone(phone);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Невалидный номер телефона'
            });
        }

        // Получение информации через API
        const apiInfo = await verifyPhoneWithAPI(phone);
        
        res.json({
            success: true,
            data: apiInfo.data
        });

    } catch (error) {
        console.error('Ошибка получения информации о номере:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * Проверка статуса верификации номера
 * GET /api/phone/verification-status/:phone
 */
router.get('/verification-status/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const userId = req.user?.id || 'anonymous';

        // Форматируем номер для поиска в кэше (статус верификации)
        let formattedPhone = formatUzbekPhone(phone);
        if (!validateUzbekPhone(phone).isValid) {
            formattedPhone = phone; // Используем как есть, если не узбекский формат
        }
        const storedData = verificationCodes.get(formattedPhone);

        if (!storedData) {
            return res.json({
                success: true,
                data: {
                    hasActiveCode: false,
                    isExpired: true
                }
            });
        }

        const isExpired = Date.now() > storedData.expireTime;
        const remainingTime = Math.max(0, Math.floor((storedData.expireTime - Date.now()) / 1000));

        res.json({
            success: true,
            data: {
                hasActiveCode: !isExpired,
                isExpired,
                remainingTime,
                attemptsRemaining: 3 - storedData.attempts
            }
        });

    } catch (error) {
        console.error('Ошибка проверки статуса верификации:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * Очистка истекших кодов (запускать по cron)
 */
router.post('/cleanup-expired', async (req, res) => {
    try {
        let cleanedCount = 0;
        const now = Date.now();

        for (const [phone, data] of verificationCodes.entries()) {
            if (now > data.expireTime) {
                verificationCodes.delete(phone);
                cleanedCount++;
            }
        }

        console.log(`Очищено ${cleanedCount} истекших кодов верификации`);

        res.json({
            success: true,
            message: `Очищено ${cleanedCount} истекших кодов`
        });

    } catch (error) {
        console.error('Ошибка очистки кодов:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * Получение информации о настроенном SMS провайдере
 * GET /api/phone/provider-info
 */
router.get('/provider-info', async (req, res) => {
    try {
        const provider = process.env.SMS_PROVIDER || 'demo';
        const balance = await getSMSBalance(provider);
        
        const providerInfo = {
            provider,
            balance: balance.balance,
            currency: balance.currency,
            isDemo: provider === 'demo',
            isConfigured: provider !== 'demo' && provider !== 'your_sms_ru_api_id'
        };

        // Дополнительная информация в зависимости от провайдера
        switch (provider) {
            case 'sms_ru':
                providerInfo.description = 'SMS.ru - для российских номеров';
                providerInfo.website = 'https://sms.ru/';
                break;
            case 'eskiz_uz':
                providerInfo.description = 'Eskiz.uz - для узбекских номеров';
                providerInfo.website = 'https://eskiz.uz/';
                break;
            case 'twilio':
                providerInfo.description = 'Twilio - международный провайдер';
                providerInfo.website = 'https://twilio.com/';
                break;
            case 'demo':
            default:
                providerInfo.description = 'Демо режим - SMS не отправляются';
                providerInfo.website = null;
                break;
        }

        res.json({
            success: true,
            data: providerInfo
        });

    } catch (error) {
        console.error('Ошибка получения информации о провайдере:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * Проверка статуса отправленного SMS
 * GET /api/phone/sms-status/:messageId/:provider
 */
router.get('/sms-status/:messageId/:provider', async (req, res) => {
    try {
        const { messageId, provider } = req.params;
        
        const status = await checkSMSStatus(messageId, provider);
        
        res.json({
            success: true,
            data: {
                messageId,
                provider,
                ...status
            }
        });

    } catch (error) {
        console.error('Ошибка проверки статуса SMS:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * Тестовая отправка SMS (только для разработки)
 * POST /api/phone/test-sms
 */
router.post('/test-sms', async (req, res) => {
    try {
        const { phone, testCode = '123456' } = req.body;
        
        // Только в режиме разработки
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'Тестовая отправка недоступна в продакшене'
            });
        }

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Номер телефона обязателен'
            });
        }

        console.log(`🧪 Тестовая отправка SMS на номер ${phone} с кодом ${testCode}`);
        
        const result = await sendSMSCode(phone, testCode);
        
        res.json({
            success: true,
            message: 'Тестовое SMS отправлено',
            data: {
                phone,
                testCode,
                result
            }
        });

    } catch (error) {
        console.error('Ошибка тестовой отправки SMS:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

export default router;