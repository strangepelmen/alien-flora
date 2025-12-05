// Основные данные о растениях
let plantsData = [];
let currentStep = 1;
const userSelections = {
    type: null,
    season: null,
    habitat: null,
    features: []
};

// Загрузка данных из JSON
async function loadPlantsData() {
    try {
        const response = await fetch('data.json');
        plantsData = await response.json();
        console.log('✅ Данные успешно загружены:', plantsData.length, 'растений');
        initializeApp();
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        plantsData = getDefaultPlantsData();
        console.log('⚠️ Используются демо-данные');
        initializeApp();
    }
}

// Инициализация приложения
function initializeApp() {
    setupTheme();
    setupNavigation();
    createStaticEmojiBackground(); // Создаем фиксированные эмодзи на фоне
    renderPlantCatalog();
    setupCatalogFilters();
    setupIdentifier();
    setupActionTabs();
    initializeFooter();
    setupButtonListeners();
    
    // Обработка хэша с фильтром
    if (window.location.hash.includes('catalog?filter=')) {
        const filter = window.location.hash.split('=')[1];
        showPage('catalog');
        
        setTimeout(() => {
            const filterTags = document.querySelectorAll('.filter-tag');
            filterTags.forEach(tag => {
                if (tag.dataset.filter === filter) {
                    tag.click();
                }
            });
        }, 100);
    }
}

// Создание фиксированных анимированных эмодзи на фоне
function createStaticEmojiBackground() {
    const container = document.querySelector('.emoji-background');
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Эмодзи растений
    const emojis = ['🌿', '🌱', '🍃', '🌾', '🍂', '🌻', '🌸', '🌼', '🌺', '🌷'];
    
    // Количество эмодзи на странице - меньше
    const emojiCount = window.innerWidth < 768 ? 8 : 12;
    
    // Минимальное расстояние между эмодзи (в процентах)
    const minDistance = 10;
    
    // Массив для хранения позиций эмодзи
    const placedEmojis = [];
    
    for (let i = 0; i < emojiCount; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'background-emoji';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        let attempts = 0;
        let left, top;
        let isPositionValid = false;
        
        // Пытаемся найти валидную позицию, не пересекающуюся с другими
        while (!isPositionValid && attempts < 100) {
            left = 5 + Math.random() * 90;
            top = 5 + Math.random() * 85;
            
            // Проверяем расстояние до других эмодзи
            isPositionValid = true;
            for (const placed of placedEmojis) {
                const distance = Math.sqrt(
                    Math.pow(placed.left - left, 2) + 
                    Math.pow(placed.top - top, 2)
                );
                
                if (distance < minDistance) {
                    isPositionValid = false;
                    break;
                }
            }
            
            // Дополнительная проверка для верхней и нижней частей экрана
            // Чтобы эмодзи не попадали на важный контент
            if (isPositionValid) {
                // Избегаем позиций по центру экрана (где обычно контент)
                if (top > 25 && top < 75 && left > 30 && left < 70) {
                    isPositionValid = Math.random() > 0.3; // 30% шанс разместить в центре
                }
            }
            
            attempts++;
        }
        
        // Если не нашли валидную позицию, используем крайние зоны
        if (!isPositionValid) {
            left = Math.random() > 0.5 ? 5 + Math.random() * 15 : 80 + Math.random() * 15;
            top = Math.random() > 0.5 ? 5 + Math.random() * 15 : 80 + Math.random() * 15;
        }
        
        // Сохраняем позицию
        placedEmojis.push({ left, top });
        
        // Применяем стили
        emoji.style.left = `${left}%`;
        emoji.style.top = `${top}%`;
        
        // Размер больше (от 28px до 42px)
        const size = 28 + Math.random() * 14;
        emoji.style.fontSize = `${size}px`;
        
        // Случайная задержка анимации от 0 до 15 секунд
        emoji.style.animationDelay = `${Math.random() * 15}s`;
        
        // Случайная длительность анимации от 8 до 15 секунд
        const duration = 8 + Math.random() * 7;
        emoji.style.animationDuration = `${duration}s`;
        
        // Случайная прозрачность
        const opacity = 0.05 + Math.random() * 0.07; // от 0.05 до 0.12
        emoji.style.opacity = opacity;
        
        // У всех эмодзи одинаковая анимация вверх-вниз
        emoji.style.animationName = 'floatUpDown';
        
        // Добавляем эмодзи в контейнер
        container.appendChild(emoji);
    }
}

// Тема
function setupTheme() {
    const desktopThemeSwitch = document.getElementById('desktopThemeSwitch');
    const mobileThemeSwitch = document.getElementById('mobileThemeSwitch');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Функция переключения темы
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Анимация переключения
        const activeSwitch = event?.currentTarget || desktopThemeSwitch;
        activeSwitch.style.transform = 'scale(0.95)';
        setTimeout(() => {
            activeSwitch.style.transform = 'scale(1)';
        }, 150);
    }
    
    // Обработчики для обоих переключателей
    desktopThemeSwitch.addEventListener('click', toggleTheme);
    mobileThemeSwitch.addEventListener('click', toggleTheme);
    
    // Слушаем изменение системной темы
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// Навигация
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');
    
    // Бургер-меню
    function toggleMenu() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }
    
    navToggle.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', toggleMenu);
    
    // Закрытие меню при клике на ссылку
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
    
    // Навигация по страницам
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showPage(targetId);
            
            // Обновляем активные ссылки
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Обработка хэша в URL при загрузке
    const initialHash = window.location.hash.substring(1) || 'home';
    showPage(initialHash);
    
    // Обновляем активную ссылку навигации
    const initialLink = document.querySelector(`.nav-link[href="#${initialHash}"]`);
    if (initialLink) {
        navLinks.forEach(l => l.classList.remove('active'));
        initialLink.classList.add('active');
    }
}

// Настройка кнопок
function setupButtonListeners() {
    // Кнопки на главной
    document.querySelector('.catalog-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('catalog');
        updateActiveNav('catalog');
    });
    
    document.querySelector('.identifier-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('identifier');
        updateActiveNav('identifier');
    });
    
    // Кнопки быстрых действий
    document.querySelector('.critical-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('catalog');
        updateActiveNav('catalog');
        
        setTimeout(() => {
            const criticalFilter = document.querySelector('.filter-tag[data-filter="critical"]');
            if (criticalFilter) {
                criticalFilter.click();
            }
        }, 100);
    });
    
    document.querySelector('.identify-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('identifier');
        updateActiveNav('identifier');
    });
    
    document.querySelector('.report-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('action');
        updateActiveNav('action');
    });
}

// Обновить активную навигацию
function updateActiveNav(pageId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${pageId}`) {
            link.classList.add('active');
        }
    });
}

// Показать выбранную страницу
function showPage(pageId) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показать выбранную страницу
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.location.hash = pageId;
        
        // Если это каталог, обновляем его
        if (pageId === 'catalog') {
            renderPlantCatalog();
        }
        
        // Прокрутка к верху страницы
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Рендер каталога растений
function renderPlantCatalog(filteredPlants = null) {
    const catalogContainer = document.getElementById('plantCatalog');
    const noResults = document.getElementById('noResults');
    const plantsToRender = filteredPlants || plantsData;
    
    catalogContainer.innerHTML = '';
    
    if (plantsToRender.length === 0) {
        catalogContainer.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    catalogContainer.style.display = 'grid';
    noResults.style.display = 'none';
    
    plantsToRender.forEach(plant => {
        const plantCard = createPlantCard(plant);
        catalogContainer.appendChild(plantCard);
    });
    
    // Обработчики событий на карточки
    document.querySelectorAll('.plant-card').forEach(card => {
        card.addEventListener('click', function() {
            const plantId = this.dataset.id;
            showPlantDetails(plantId);
        });
    });
}

// Создание карточки растения
function createPlantCard(plant) {
    const card = document.createElement('div');
    card.className = 'plant-card';
    card.dataset.id = plant.id;
    
    // Определяем цвет статуса опасности
    let dangerClass = '';
    let dangerText = '';
    
    switch(plant.dangerLevel) {
        case 'critical':
            dangerClass = 'badge-critical';
            dangerText = 'Критично';
            break;
        case 'dangerous':
            dangerClass = 'badge-dangerous';
            dangerText = 'Опасно';
            break;
        case 'watch':
            dangerClass = 'badge-watch';
            dangerText = 'Наблюдать';
            break;
        case 'moderate':
            dangerClass = 'badge-moderate';
            dangerText = 'Умеренно';
            break;
        case 'low':
            dangerClass = 'badge-low';
            dangerText = 'Низкая';
            break;
    }
    
    // Тип растения на русском
    let typeText = '';
    switch(plant.type) {
        case 'tree':
            typeText = 'Дерево';
            break;
        case 'shrub':
            typeText = 'Кустарник';
            break;
        case 'herb':
            typeText = 'Трава';
            break;
        case 'vine':
            typeText = 'Лиана';
            break;
    }
    
    // Подготовка изображения
    const imageSrc = plant.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50" y="50" font-size="14" text-anchor="middle" dy=".3em" fill="%2394a3b8">' + (plant.emoji || '🌿') + '</text></svg>';
    
    card.innerHTML = `
        <div class="plant-image">
            <img src="${imageSrc}" alt="${plant.name}" loading="lazy">
            <div class="image-loading">Загрузка...</div>
        </div>
        <div class="plant-content">
            <div class="plant-header">
                <div class="plant-name">${plant.name}</div>
                <div class="danger-badge ${dangerClass}">${dangerText}</div>
            </div>
            <div class="plant-latin">${plant.latinName}</div>
            <div class="plant-type">${typeText}</div>
            <p class="plant-description">${plant.description}</p>
            <div class="plant-features">
                <span class="plant-feature">${plant.floweringSeason}</span>
                <span class="plant-feature">${getHabitatText(plant.habitat)}</span>
            </div>
            <div class="plant-card-footer">
                <span>Подробнее</span>
                <i class="fas fa-arrow-right"></i>
            </div>
        </div>
    `;
    
    // Загрузка изображения
    const img = card.querySelector('img');
    const loading = card.querySelector('.image-loading');
    
    img.onload = () => {
        loading.style.display = 'none';
        img.style.opacity = '1';
    };
    
    img.onerror = () => {
        loading.textContent = 'Изображение недоступно';
        img.style.display = 'none';
    };
    
    return card;
}

// Получить текст места обитания
function getHabitatText(habitat) {
    switch(habitat) {
        case 'wasteland': return 'Пустырь';
        case 'forest': return 'Лес/парк';
        case 'water': return 'Берег водоёма';
        case 'lawn': return 'Газон';
        case 'roadside': return 'Обочина';
        default: return habitat;
    }
}

// Показать детали растения
function showPlantDetails(plantId) {
    const plant = plantsData.find(p => p.id === plantId);
    if (!plant) return;
    
    const modal = document.getElementById('plantModal');
    const modalContent = document.getElementById('plantModalContent');
    
    // Определяем цвет статуса опасности
    let dangerClass = '';
    let dangerText = '';
    
    switch(plant.dangerLevel) {
        case 'critical':
            dangerClass = 'badge-critical';
            dangerText = 'Критическая опасность';
            break;
        case 'dangerous':
            dangerClass = 'badge-dangerous';
            dangerText = 'Опасный вид';
            break;
        case 'watch':
            dangerClass = 'badge-watch';
            dangerText = 'Требует наблюдения';
            break;
        case 'moderate':
            dangerClass = 'badge-moderate';
            dangerText = 'Умеренная опасность';
            break;
        case 'low':
            dangerClass = 'badge-low';
            dangerText = 'Низкая опасность';
            break;
    }
    
    // Тип растения на русском
    let typeText = '';
    switch(plant.type) {
        case 'tree':
            typeText = 'Дерево';
            break;
        case 'shrub':
            typeText = 'Кустарник';
            break;
        case 'herb':
            typeText = 'Трава';
            break;
        case 'vine':
            typeText = 'Лиана';
            break;
    }
    
    // Подготовка изображения
    const imageSrc = plant.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50" y="50" font-size="20" text-anchor="middle" dy=".3em" fill="%2394a3b8">' + (plant.emoji || '🌿') + '</text></svg>';
    
    // Методы борьбы
    const methodsHTML = plant.controlMethods ? plant.controlMethods.map(method => {
        let methodClass = '';
        switch(method.type) {
            case 'mechanical':
                methodClass = 'mechanical';
                break;
            case 'chemical':
                methodClass = 'chemical';
                break;
            case 'agro':
                methodClass = 'agro';
                break;
        }
        return `<span class="method-tag ${methodClass}">${method.name}</span>`;
    }).join('') : '';
    
    modalContent.innerHTML = `
        <div class="plant-details">
            <div class="plant-details-header">
                <div class="plant-details-name">
                    <h2>${plant.name}</h2>
                    <div class="plant-details-latin">${plant.latinName}</div>
                    ${plant.belarusianName ? `<div>${plant.belarusianName}</div>` : ''}
                </div>
                <div class="danger-badge ${dangerClass}">${dangerText}</div>
            </div>
            
            <div class="plant-details-content">
                <div class="plant-gallery">
                    <div class="gallery-main">
                        <img src="${imageSrc}" alt="Фото: ${plant.name}" loading="lazy">
                    </div>
                </div>
                
                <div class="plant-info">
                    <div class="details-section">
                        <h3><i class="fas fa-info-circle"></i> Основная информация</h3>
                        <ul class="details-list">
                            <li><strong>Тип:</strong> ${typeText}</li>
                            <li><strong>Происхождение:</strong> ${plant.origin}</li>
                            <li><strong>Период цветения:</strong> ${plant.floweringSeason}</li>
                            <li><strong>Места обитания:</strong> ${getHabitatText(plant.habitat)}</li>
                        </ul>
                    </div>
                    
                    <div class="details-section">
                        <h3><i class="fas fa-exclamation-triangle"></i> Опасность и воздействие</h3>
                        <ul class="details-list">
                            <li><strong>Влияние на экосистему:</strong> ${plant.ecosystemImpact}</li>
                            <li><strong>Опасность для человека:</strong> ${plant.humanDanger}</li>
                            <li><strong>Пути распространения:</strong> ${plant.spreadWays}</li>
                        </ul>
                    </div>
                    
                    <div class="details-section">
                        <h3><i class="fas fa-hammer"></i> Методы борьбы</h3>
                        <div class="method-tags">
                            ${methodsHTML}
                        </div>
                        <p>${plant.controlDescription || 'Комбинирование методов повышает эффективность борьбы.'}</p>
                    </div>
                    
                    <div class="details-section">
                        <h3><i class="fas fa-eye"></i> Как отличить</h3>
                        <p>${plant.identificationTips || 'См. фотографии для точной идентификации.'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Показываем модальное окно
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Загрузка изображения
    const img = modalContent.querySelector('img');
    img.onload = () => {
        img.style.opacity = '1';
    };
    
    // Закрытие модального окна
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function closeModal() {
    const modal = document.getElementById('plantModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Фильтры каталога
function setupCatalogFilters() {
    const searchInput = document.getElementById('plantSearch');
    const searchClear = document.getElementById('searchClear');
    const filterTags = document.querySelectorAll('.filter-tag');
    
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-tag.active').dataset.filter;
        
        const filteredPlants = plantsData.filter(plant => {
            // Поиск
            const matchesSearch = !searchTerm || 
                plant.name.toLowerCase().includes(searchTerm) ||
                plant.latinName.toLowerCase().includes(searchTerm) ||
                plant.description.toLowerCase().includes(searchTerm);
            
            // Фильтр
            let matchesFilter = false;
            if (activeFilter === 'all') {
                matchesFilter = true;
            } else if (activeFilter === 'critical') {
                matchesFilter = plant.dangerLevel === 'critical';
            } else {
                matchesFilter = plant.type === activeFilter;
            }
            
            return matchesSearch && matchesFilter;
        });
        
        renderPlantCatalog(filteredPlants);
        
        // Показать/скрыть кнопку очистки поиска
        searchClear.style.display = searchTerm ? 'block' : 'none';
    }
    
    // События
    searchInput.addEventListener('input', applyFilters);
    
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        applyFilters();
        searchInput.focus();
    });
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            applyFilters();
        });
    });
}

// Определитель растений
function setupIdentifier() {
    const nextButton = document.getElementById('nextStep');
    const prevButton = document.getElementById('prevStep');
    const resetButton = document.getElementById('resetIdentifier');
    const progressFill = document.getElementById('progressFill');
    const stepPanels = document.querySelectorAll('.step-panel');
    const optionCards = document.querySelectorAll('.option-card');
    
    // Инициализация
    function initializeIdentifier() {
        currentStep = 1;
        userSelections.type = null;
        userSelections.season = null;
        userSelections.habitat = null;
        userSelections.features = [];
        
        updateStepIndicator();
        updateButtons();
        resetOptionSelections();
    }
    
    // Обновление индикатора прогресса
    function updateStepIndicator() {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressFill.style.width = `${(currentStep - 1) * 25}%`;
        
        progressSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === currentStep);
            step.classList.toggle('completed', stepNum < currentStep);
        });
        
        stepPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
    
    // Обновление кнопок
    function updateButtons() {
        prevButton.disabled = currentStep === 1;
        
        if (currentStep === 5) {
            nextButton.style.display = 'none';
            identifyPlants();
        } else {
            nextButton.style.display = 'flex';
            nextButton.disabled = !isStepComplete(currentStep);
        }
    }
    
    // Проверка завершенности шага
    function isStepComplete(step) {
        switch(step) {
            case 1:
                return userSelections.type !== null;
            case 2:
                return userSelections.season !== null;
            case 3:
                return userSelections.habitat !== null;
            case 4:
                return userSelections.features.length > 0;
            default:
                return true;
        }
    }
    
    // Сброс выбранных опций
    function resetOptionSelections() {
        optionCards.forEach(card => {
            card.classList.remove('selected');
        });
    }
    
    // Обработка выбора опции
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            const step = currentStep;
            const value = this.dataset.value;
            
            // Шаг 4 (множественный выбор)
            if (step === 4) {
                this.classList.toggle('selected');
                const index = userSelections.features.indexOf(value);
                if (index === -1) {
                    userSelections.features.push(value);
                } else {
                    userSelections.features.splice(index, 1);
                }
            } else {
                // Одиночный выбор
                const currentSelected = document.querySelector(`#step${step} .option-card.selected`);
                if (currentSelected) {
                    currentSelected.classList.remove('selected');
                }
                this.classList.add('selected');
                
                switch(step) {
                    case 1:
                        userSelections.type = value;
                        break;
                    case 2:
                        userSelections.season = value;
                        break;
                    case 3:
                        userSelections.habitat = value;
                        break;
                }
            }
            
            updateButtons();
        });
    });
    
    // Навигация по шагам
    nextButton.addEventListener('click', () => {
        if (currentStep < 5 && isStepComplete(currentStep)) {
            currentStep++;
            updateStepIndicator();
            updateButtons();
            window.scrollTo({ top: document.querySelector('.identifier-content').offsetTop - 100, behavior: 'smooth' });
        }
    });
    
    prevButton.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepIndicator();
            updateButtons();
            window.scrollTo({ top: document.querySelector('.identifier-content').offsetTop - 100, behavior: 'smooth' });
        }
    });
    
    resetButton.addEventListener('click', initializeIdentifier);
    
    // Идентификация растений
    function identifyPlants() {
        const resultsContainer = document.getElementById('identificationResults');
        
        // Расширенный алгоритм поиска с приоритетами
        const matchedPlants = plantsData.map(plant => {
            let score = 0;
            let matches = [];
            
            // Проверка типа (высокий приоритет)
            if (userSelections.type && plant.type === userSelections.type) {
                score += 3;
                matches.push('type');
            }
            
            // Проверка сезона цветения
            if (userSelections.season) {
                const floweringSeasons = plant.floweringSeason.toLowerCase();
                if (floweringSeasons.includes(userSelections.season)) {
                    score += 2;
                    matches.push('season');
                } else if (userSelections.season === 'winter' && !floweringSeasons.includes('весна') && 
                          !floweringSeasons.includes('лето') && !floweringSeasons.includes('осень')) {
                    score += 1;
                    matches.push('season_partial');
                }
            }
            
            // Проверка места обитания
            if (userSelections.habitat && plant.habitat === userSelections.habitat) {
                score += 2;
                matches.push('habitat');
            }
            
            // Проверка особенностей
            if (userSelections.features.length > 0) {
                const plantFeatures = plant.features || [];
                const matchedFeatures = userSelections.features.filter(feature => 
                    plantFeatures.includes(feature)
                );
                score += matchedFeatures.length;
                matches.push(...matchedFeatures.map(f => `feature_${f}`));
            }
            
            return { plant, score, matches };
        }).filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6); // Ограничиваем 6 результатами
        
        // Если результаты есть, но их мало - добавляем дополнительные
        if (matchedPlants.length > 0 && matchedPlants.length < 3) {
            const additionalPlants = plantsData
                .filter(p => !matchedPlants.some(mp => mp.plant.id === p.id))
                .slice(0, 3 - matchedPlants.length)
                .map(plant => ({ plant, score: 1, matches: ['recommended'] }));
            
            matchedPlants.push(...additionalPlants);
        }
        
        // Отображение результатов
        if (matchedPlants.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-match-found">
                    <div class="no-match-icon">😔</div>
                    <h3>Подходящих растений не найдено</h3>
                    <p>К сожалению, по вашим критериям не удалось найти подходящих растений в нашей базе данных.</p>
                    <p>Возможно, вы обнаружили редкий вид или наши критерии слишком специфичны.</p>
                    <p><strong>Что можно сделать:</strong></p>
                    <ul>
                        <li>Попробуйте изменить критерии поиска</li>
                        <li>Используйте меньше признаков для более широкого поиска</li>
                        <li>Обратитесь к специалистам для точной идентификации</li>
                    </ul>
                    <p>Наша база данных постоянно пополняется, и возможно, ваш вид скоро будет в неё добавлен!</p>
                    <button class="btn btn-primary" id="tryAgainBtn" style="margin-top: 1rem;">
                        <i class="fas fa-redo"></i>
                        <span>Попробовать снова</span>
                    </button>
                </div>
            `;
            
            document.getElementById('tryAgainBtn')?.addEventListener('click', () => {
                currentStep = 1;
                initializeIdentifier();
                window.scrollTo({ top: document.querySelector('.identifier-container').offsetTop - 100, behavior: 'smooth' });
            });
        } else {
            resultsContainer.innerHTML = matchedPlants.map(({ plant, score }) => `
                <div class="plant-card" data-id="${plant.id}">
                    <div class="plant-image">
                        <img src="${plant.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50" y="50" font-size="14" text-anchor="middle" dy=".3em" fill="%2394a3b8">' + (plant.emoji || '🌿') + '</text></svg>'}" alt="${plant.name}" loading="lazy" style="opacity: 0;">
                        <div class="image-loading">Загрузка...</div>
                    </div>
                    <div class="plant-content">
                        <div class="plant-header">
                            <div class="plant-name">${plant.name}</div>
                            <div class="danger-badge ${getDangerClass(plant.dangerLevel)}">
                                ${getDangerText(plant.dangerLevel)}
                            </div>
                        </div>
                        <div class="plant-latin">${plant.latinName}</div>
                        <div class="plant-type">${getTypeText(plant.type)}</div>
                        <p class="plant-description">${plant.description}</p>
                        <div class="plant-features">
                            <span class="plant-feature">Совпадение: ${score} баллов</span>
                        </div>
                        <div class="plant-card-footer">
                            <span>Подробнее</span>
                            <i class="fas fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Загрузка изображений для карточек результатов
            resultsContainer.querySelectorAll('.plant-card img').forEach(img => {
                img.onload = () => {
                    img.style.opacity = '1';
                    const loading = img.parentElement.querySelector('.image-loading');
                    if (loading) loading.style.display = 'none';
                };
                
                img.onerror = () => {
                    const loading = img.parentElement.querySelector('.image-loading');
                    if (loading) {
                        loading.textContent = 'Изображение недоступно';
                        img.style.display = 'none';
                    }
                };
            });
            
            // Обработчики для карточек результатов
            resultsContainer.querySelectorAll('.plant-card').forEach(card => {
                card.addEventListener('click', function() {
                    const plantId = this.dataset.id;
                    showPlantDetails(plantId);
                });
            });
        }
    }
    
    initializeIdentifier();
}

// Вспомогательные функции
function getDangerClass(dangerLevel) {
    switch(dangerLevel) {
        case 'critical': return 'badge-critical';
        case 'dangerous': return 'badge-dangerous';
        case 'watch': return 'badge-watch';
        case 'moderate': return 'badge-moderate';
        case 'low': return 'badge-low';
        default: return '';
    }
}

function getDangerText(dangerLevel) {
    switch(dangerLevel) {
        case 'critical': return 'Критично';
        case 'dangerous': return 'Опасно';
        case 'watch': return 'Наблюдать';
        case 'moderate': return 'Умеренно';
        case 'low': return 'Низкая';
        default: return '';
    }
}

function getTypeText(type) {
    switch(type) {
        case 'tree': return 'Дерево';
        case 'shrub': return 'Кустарник';
        case 'herb': return 'Трава';
        case 'vine': return 'Лиана';
        default: return '';
    }
}

// Вкладки "Что делать?"
function setupActionTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Обновляем активную вкладку
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Показываем соответствующий контент
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}Content`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Инициализация футера
function initializeFooter() {
    const footerHTML = `
        <div class="footer-content">
            <div class="footer-brand">
                <div class="footer-logo">🌿</div>
                <div class="footer-text">
                    <h4>Чужая флора</h4>
                    <p>Атлас инвазивных растений Минска</p>
                </div>
            </div>
            
            <div class="footer-links">
                <h5>Разделы</h5>
                <ul>
                    <li><a href="#home">Главная</a></li>
                    <li><a href="#catalog">Каталог</a></li>
                    <li><a href="#identifier">Определитель</a></li>
                    <li><a href="#action">Что делать?</a></li>
                </ul>
            </div>
            
            <div class="footer-contact">
                <h5>Контакты</h5>
                <p>По вопросам сотрудничества и добавления данных</p>
                <div class="contact-info">
                    <i class="fas fa-envelope"></i>
                    <span>info@alienflora.by</span>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>© 2025 Чужая флора: атлас инвазивных растений Минска</p>
            <p>Сайт работает на GitHub Pages</p>
        </div>
    `;
    
    // Вставляем футер в каждую страницу
    document.querySelectorAll('.site-footer').forEach(footer => {
        footer.innerHTML = footerHTML;
    });
    
    // Обработка кликов по ссылкам в футере
    document.addEventListener('click', (e) => {
        if (e.target.matches('.footer-links a')) {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            if (href.startsWith('#')) {
                const pageId = href.substring(1);
                showPage(pageId);
                
                // Обновляем активную ссылку в навигации
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === href) {
                        link.classList.add('active');
                    }
                });
            }
        }
    });
}

// Загрузка данных при запуске
document.addEventListener('DOMContentLoaded', loadPlantsData);

// Резервные данные
function getDefaultPlantsData() {
    // Возвращаем пустой массив, так как у нас будет data.json с 35 растениями
    return [];
}