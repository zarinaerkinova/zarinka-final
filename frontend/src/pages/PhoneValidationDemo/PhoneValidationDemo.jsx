import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import PhoneVerification from '../../components/PhoneVerification/PhoneVerification';
import { validatePhoneWithAPI, getPhoneInfo } from '../../utils/phoneValidation';
import './PhoneValidationDemo.scss';

const PhoneValidationDemo = () => {
    const [verifiedPhone, setVerifiedPhone] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleVerificationComplete = (phone, verified) => {
        setVerifiedPhone(phone);
        setIsVerified(verified);
        toast.success(`Номер ${phone} успешно подтвержден!`);
    };

    const testNumbers = [
        '+998901116659',
        '+998911234567',
        '+998331234567',
        '901116659',
        '998901116659',
        '+79991234567',
        'invalid-phone'
    ];

    const runBatchTest = async () => {
        setLoading(true);
        setTestResults([]);
        
        for (const phone of testNumbers) {
            try {
                const result = await validatePhoneWithAPI(phone, true);
                setTestResults(prev => [...prev, {
                    phone,
                    result,
                    timestamp: new Date().toLocaleTimeString()
                }]);
            } catch (error) {
                setTestResults(prev => [...prev, {
                    phone,
                    result: { success: false, error: error.message },
                    timestamp: new Date().toLocaleTimeString()
                }]);
            }
            
            // Небольшая задержка между запросами
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setLoading(false);
    };

    return (
        <div className="phone-validation-demo">
            <div className="demo-container">
                <header className="demo-header">
                    <h1>📱 Демонстрация валидации номеров телефонов</h1>
                    <p>Интеграция с NumLookupAPI для проверки номеров телефонов</p>
                </header>

                <div className="demo-sections">
                    {/* Интерактивная валидация */}
                    <section className="demo-section">
                        <h2>🔍 Интерактивная валидация</h2>
                        <div className="verification-container">
                            <PhoneVerification
                                onVerificationComplete={handleVerificationComplete}
                                showInfo={true}
                                validationType="uzbek"
                                className="demo-phone-verification"
                            />
                        </div>
                        
                        {isVerified && (
                            <div className="verification-result">
                                <h3>✅ Результат верификации</h3>
                                <p><strong>Подтвержденный номер:</strong> {verifiedPhone}</p>
                                <p><strong>Статус:</strong> Верифицирован</p>
                            </div>
                        )}
                    </section>

                    {/* Массовое тестирование */}
                    <section className="demo-section">
                        <h2>🧪 Тестирование различных форматов</h2>
                        <div className="batch-test-controls">
                            <button 
                                className="batch-test-btn"
                                onClick={runBatchTest}
                                disabled={loading}
                            >
                                {loading ? '⏳ Тестируем...' : '🚀 Запустить тест'}
                            </button>
                        </div>
                        
                        {testResults.length > 0 && (
                            <div className="test-results">
                                <h3>📊 Результаты тестирования</h3>
                                <div className="results-grid">
                                    {testResults.map((test, index) => (
                                        <div key={index} className="result-card">
                                            <div className="result-header">
                                                <span className="phone-number">{test.phone}</span>
                                                <span className="timestamp">{test.timestamp}</span>
                                            </div>
                                            
                                            {test.result.success ? (
                                                <div className="result-success">
                                                    <div className="status-badge success">
                                                        ✅ {test.result.data.isValid ? 'Валидный' : 'Невалидный'}
                                                    </div>
                                                    
                                                    {test.result.data.apiVerification && (
                                                        <div className="api-info">
                                                            <p><strong>Формат:</strong> {test.result.data.apiVerification.international_format}</p>
                                                            <p><strong>Страна:</strong> {test.result.data.apiVerification.country_name}</p>
                                                            <p><strong>Оператор:</strong> {test.result.data.apiVerification.carrier}</p>
                                                            <p><strong>Тип:</strong> {test.result.data.apiVerification.line_type}</p>
                                                            <p><strong>Активный:</strong> {test.result.data.apiVerification.active ? 'Да' : 'Нет'}</p>
                                                            <p><strong>Риск:</strong> {test.result.data.fraudCheck?.riskScore || 0}%</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="result-error">
                                                    <div className="status-badge error">❌ Ошибка</div>
                                                    <p className="error-message">{test.result.error}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Информация об API */}
                    <section className="demo-section">
                        <h2>📖 Информация об интеграции</h2>
                        <div className="info-grid">
                            <div className="info-card">
                                <h3>🔧 Возможности</h3>
                                <ul>
                                    <li>Валидация узбекских и международных номеров</li>
                                    <li>Определение оператора связи</li>
                                    <li>Проверка существования номера</li>
                                    <li>Оценка риска мошенничества</li>
                                    <li>SMS верификация с кодом</li>
                                    <li>Форматирование номеров (+998XXXXXXXXX)</li>
                                </ul>
                            </div>

                            <div className="info-card">
                                <h3>🛡️ Безопасность</h3>
                                <ul>
                                    <li>Проверка лимитов отправки SMS</li>
                                    <li>Анализ подозрительной активности</li>
                                    <li>Маскирование номеров в логах</li>
                                    <li>Защита от спама и ботов</li>
                                    <li>Валидация на стороне сервера</li>
                                </ul>
                            </div>

                            <div className="info-card">
                                <h3>🌐 API Интеграция</h3>
                                <ul>
                                    <li>NumLookupAPI для валидации</li>
                                    <li>Fallback на локальную валидацию</li>
                                    <li>Кэширование результатов</li>
                                    <li>Обработка ошибок сети</li>
                                    <li>Гибкая конфигурация</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PhoneValidationDemo;