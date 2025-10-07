import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
    validatePhone, 
    formatUzbekPhone, 
    getPhoneInfo, 
    maskPhoneNumber,
    sendVerificationSMS,
    verifySMSCode,
    validatePhoneWithAPI
} from '../../utils/phoneValidation';
import './PhoneVerification.scss';

const PhoneVerification = ({ 
    onVerificationComplete, 
    onPhoneChange, 
    initialPhone = '', 
    required = true,
    showInfo = false,
    validationType = 'flexible',
    className = ''
}) => {
    const { t } = useTranslation();
    
    // Основные состояния
    const [phone, setPhone] = useState(initialPhone);
    const [isVerified, setIsVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [phoneInfo, setPhoneInfo] = useState(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    
    // SMS верификация
    const [showSmsVerification, setShowSmsVerification] = useState(false);
    const [smsCode, setSmsCode] = useState('');
    const [systemCode, setSystemCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(true);

    // Refs для предотвращения бесконечных циклов
    const lastNotifiedPhone = useRef('');
    const lastNotifiedResult = useRef(null);

    const validatePhoneNumber = useCallback(async (phoneValue) => {
        if (!phoneValue) {
            setValidationResult(null);
            setPhoneInfo(null);
            return;
        }

        // Сначала базовая валидация
        const result = validatePhone(phoneValue, validationType);
        setValidationResult(result);

        // Загружаем дополнительную информацию о номере если нужно и номер валиден
        if (result.isValid && showInfo) {
            setIsLoadingInfo(true);
            try {
                // Используем API валидацию для получения детальной информации
                const apiResult = await validatePhoneWithAPI(phoneValue, true);
                if (apiResult.success) {
                    const info = {
                        isValid: apiResult.data.isValid,
                        exists: apiResult.data.apiVerification?.is_valid,
                        carrier: apiResult.data.apiVerification?.carrier || 'Неизвестно',
                        lineType: apiResult.data.apiVerification?.line_type || 'mobile',
                        country: apiResult.data.apiVerification?.country_code || 'UZ',
                        region: apiResult.data.apiVerification?.location || 'Неизвестно',
                        riskScore: apiResult.data.fraudCheck?.riskScore || 0,
                        isRoaming: false,
                        recommendation: apiResult.data.recommendation
                    };
                    setPhoneInfo(info);
                } else {
                    // Fallback к базовой информации
                    const basicInfo = await getPhoneInfo(phoneValue);
                    setPhoneInfo(basicInfo);
                }
            } catch (error) {
                console.error('Ошибка получения информации о номере:', error);
                const basicInfo = await getPhoneInfo(phoneValue);
                setPhoneInfo(basicInfo);
            } finally {
                setIsLoadingInfo(false);
            }
        }
    }, [validationType, showInfo]);

    // Уведомляем родительский компонент об изменениях только когда действительно нужно
    useEffect(() => {
        if (onPhoneChange && 
            (phone !== lastNotifiedPhone.current || 
             JSON.stringify(validationResult) !== JSON.stringify(lastNotifiedResult.current))) {
            
            lastNotifiedPhone.current = phone;
            lastNotifiedResult.current = validationResult;
            onPhoneChange(phone, validationResult);
        }
    }, [phone, validationResult, onPhoneChange]);

    useEffect(() => {
        if (phone) {
            validatePhoneNumber(phone);
        }
    }, [phone, validatePhoneNumber]);

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setPhone(value);
        
        // Сбрасываем верификацию при изменении номера
        if (isVerified) {
            setIsVerified(false);
            setShowSmsVerification(false);
        }
    };

    const sendSMSVerification = async () => {
        if (!validationResult?.isValid) {
            toast.error('Сначала введите корректный номер телефона');
            return;
        }

        setIsVerifying(true);
        
        try {
            const result = await sendVerificationSMS(phone);
            
            if (result.success) {
                setShowSmsVerification(true);
                startResendTimer();
                
                toast.success(result.message || `Код отправлен на ${maskPhoneNumber(phone)}`);
                
                // В демо режиме показываем код если он есть
                if (result.data?.demoCode) {
                    // Показываем код сразу и долго
                    toast.success(`🔐 КОД ПОДТВЕРЖДЕНИЯ: ${result.data.demoCode}`, { 
                        duration: 15000,
                        style: {
                            fontSize: '18px',
                            fontWeight: 'bold',
                            background: '#4ade80',
                            color: 'white'
                        }
                    });
                    setSystemCode(result.data.demoCode);
                    
                    // Дополнительно показываем в alert для надежности
                    setTimeout(() => {
                        alert(`Демо код подтверждения: ${result.data.demoCode}\n\nВведите этот код в поле ввода.`);
                    }, 1000);
                }
            } else {
                toast.error(result.error || 'Ошибка при отправке SMS');
            }
            
        } catch (error) {
            console.error('Ошибка отправки SMS:', error);
            toast.error('Ошибка при отправке SMS. Попробуйте позже.');
        } finally {
            setIsVerifying(false);
        }
    };

    const startResendTimer = () => {
        setCanResend(false);
        setCountdown(60);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const verifyCode = async () => {
        if (smsCode.length !== 6) {
            toast.error('Введите 6-значный код');
            return;
        }

        try {
            const result = await verifySMSCode(phone, smsCode);
            
            if (result.success) {
                setIsVerified(true);
                setShowSmsVerification(false);
                toast.success(result.message || 'Номер телефона подтвержден!');
                
                if (onVerificationComplete) {
                    onVerificationComplete(phone, true);
                }
            } else {
                toast.error(result.error || 'Неверный код подтверждения');
                
                // Показываем количество оставшихся попыток если есть
                if (result.data?.attemptsRemaining !== undefined) {
                    toast.error(`Осталось попыток: ${result.data.attemptsRemaining}`);
                }
            }
        } catch (error) {
            console.error('Ошибка верификации кода:', error);
            toast.error('Ошибка при проверке кода');
        }
    };

    const resendCode = async () => {
        if (!canResend) return;
        
        setSmsCode('');
        await sendSMSVerification();
    };

    const renderValidationErrors = () => {
        if (!validationResult || validationResult.isValid) return null;

        return (
            <div className="validation-errors">
                {validationResult.errors.map((error, index) => (
                    <div key={index} className="error-message">
                        ⚠️ {error}
                    </div>
                ))}
                {validationResult.warnings?.map((warning, index) => (
                    <div key={index} className="warning-message">
                        ⚡ {warning}
                    </div>
                ))}
            </div>
        );
    };

    const renderPhoneInfo = () => {
        if (!showInfo || !phoneInfo || isLoadingInfo) return null;

        return (
            <div className="phone-info">
                <div className="info-header">📞 Информация о номере</div>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Оператор:</span>
                        <span className="info-value">{phoneInfo.carrier}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Тип линии:</span>
                        <span className="info-value">{phoneInfo.lineType}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Регион:</span>
                        <span className="info-value">{phoneInfo.region}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Существует:</span>
                        <span className={`info-value ${phoneInfo.exists ? 'valid' : 'invalid'}`}>
                            {phoneInfo.exists ? '✅ Да' : '❌ Нет'}
                        </span>
                    </div>
                    {phoneInfo.riskScore > 50 && (
                        <div className="info-item warning">
                            <span className="info-label">Риск:</span>
                            <span className="info-value">⚠️ Высокий ({phoneInfo.riskScore}%)</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSMSVerification = () => {
        if (!showSmsVerification) return null;

        return (
            <div className="sms-verification">
                <div className="verification-header">
                    <h4>📱 Подтверждение номера</h4>
                    <p>Введите код, отправленный на {maskPhoneNumber(phone)}</p>
                </div>
                
                <div className="code-input-container">
                    <input
                        type="text"
                        className="code-input"
                        placeholder="000000"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                    />
                    <button
                        type="button"
                        className="verify-code-btn"
                        onClick={verifyCode}
                        disabled={smsCode.length !== 6}
                    >
                        Подтвердить
                    </button>
                </div>

                <div className="resend-container">
                    {canResend ? (
                        <button
                            type="button"
                            className="resend-btn"
                            onClick={resendCode}
                        >
                            Отправить код повторно
                        </button>
                    ) : (
                        <span className="countdown">
                            Повторная отправка через {countdown} сек
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`phone-verification ${className}`}>
            <div className="phone-input-container">
                <label className="phone-label">
                    Номер телефона {required && <span className="required">*</span>}
                </label>
                
                <div className="input-group">
                    <input
                        type="tel"
                        className={`phone-input ${validationResult && !validationResult.isValid ? 'invalid' : ''} ${isVerified ? 'verified' : ''}`}
                        placeholder="+998 (90) 111-66-59"
                        value={phone}
                        onChange={handlePhoneChange}
                        disabled={isVerified}
                    />
                    
                    {validationResult?.isValid && !isVerified && (
                        <button
                            type="button"
                            className="verify-btn"
                            onClick={sendSMSVerification}
                            disabled={isVerifying}
                        >
                            {isVerifying ? '⏳' : '📱'} Подтвердить
                        </button>
                    )}
                    
                    {isVerified && (
                        <div className="verification-status verified">
                            ✅ Подтвержден
                        </div>
                    )}
                </div>

                {isLoadingInfo && (
                    <div className="loading-info">🔄 Проверяем номер...</div>
                )}
            </div>

            {renderValidationErrors()}
            {renderPhoneInfo()}
            {renderSMSVerification()}
        </div>
    );
};

export default PhoneVerification;