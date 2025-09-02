# Fanfiq Frontend Structure

Полная UI-структура для платформы фанфиков на Next.js 15 с TypeScript, Tailwind CSS и shadcn/ui.

## 🏗️ Архитектура проекта

### Структура папок
\`\`\`
src/
├── components/
│   ├── auth/                 # Аутентификация
│   │   ├── UserProfile.tsx   # Профиль пользователя
│   │   └── UserMenu.tsx      # Меню пользователя
│   ├── common/               # Общие компоненты
│   │   ├── BadgeList.tsx     # Список бейджей
│   │   ├── Breadcrumbs.tsx   # Хлебные крошки
│   │   └── ThemeToggle.tsx   # Переключатель темы
│   ├── layout/               # Компоненты макета
│   │   ├── SiteHeader.tsx    # Шапка сайта
│   │   ├── SiteFooter.tsx    # Подвал сайта
│   │   └── Container.tsx     # Контейнер
│   ├── mobile/               # Мобильные компоненты
│   │   └── MobileNav.tsx     # Мобильная навигация
│   ├── reader/               # Компоненты читалки
│   │   ├── ReaderShell.tsx   # Оболочка читалки
│   │   ├── ReaderSettings.tsx # Настройки читалки
│   │   ├── ChapterNav.tsx    # Навигация по главам
│   │   └── BookmarkButton.tsx # Кнопка закладки
│   ├── results/              # Компоненты результатов
│   │   ├── ResultsList.tsx   # Список результатов
│   │   ├── WorkCard.tsx      # Карточка работы
│   │   └── Pagination.tsx    # Пагинация
│   ├── search/               # Компоненты поиска
│   │   ├── SearchBar.tsx     # Строка поиска
│   │   ├── FilterPanel.tsx   # Панель фильтров
│   │   └── filters/          # Отдельные фильтры
│   ├── social/               # Социальные функции
│   │   ├── CommentSection.tsx # Секция комментариев
│   │   ├── FavoriteButton.tsx # Кнопка избранного
│   │   └── RatingComponent.tsx # Компонент рейтинга
│   ├── states/               # Состояния
│   │   ├── EmptyState.tsx    # Пустое состояние
│   │   ├── ErrorState.tsx    # Состояние ошибки
│   │   └── LoadingState.tsx  # Состояние загрузки
│   └── ui/                   # UI компоненты
│       ├── NotificationToast.tsx # Уведомления
│       └── InfiniteScroll.tsx    # Бесконечная прокрутка
├── types/
│   └── index.ts              # TypeScript типы
├── utils/
│   ├── sanitize.ts           # Санитизация данных
│   └── url-state.ts          # Управление URL состоянием
└── hooks/                    # Кастомные хуки (предполагается)
    ├── useSearchWorks.ts
    ├── useWork.ts
    └── useWorkChapters.ts
\`\`\`

## 🎯 Основные компоненты

### Layout Components
- **SiteHeader**: Шапка с навигацией, поиском и пользовательским меню
- **SiteFooter**: Подвал с ссылками и информацией
- **Container**: Адаптивный контейнер для контента
- **MobileNav**: Мобильная навигация с боковым меню

### Search Components
- **SearchBar**: Строка поиска с автодополнением
- **FilterPanel**: Панель фильтров с возможностью сворачивания
- **Filters**: Отдельные фильтры (рейтинг, категории, статус, предупреждения, фандомы, персонажи, отношения, теги)

### Results Components
- **ResultsList**: Список результатов поиска с сортировкой
- **WorkCard**: Карточка работы с превью и метаданными
- **Pagination**: Пагинация с навигацией по страницам

### Reader Components
- **ReaderShell**: Основная оболочка читалки
- **ReaderSettings**: Настройки чтения (тема, шрифт, размер)
- **ChapterNav**: Навигация между главами
- **BookmarkButton**: Сохранение позиции чтения

### Social Components
- **CommentSection**: Система комментариев с ответами
- **FavoriteButton**: Добавление в избранное
- **RatingComponent**: Система оценок (1-5 звезд)

### Auth Components
- **UserProfile**: Профиль пользователя с настройками
- **UserMenu**: Выпадающее меню пользователя

### State Components
- **EmptyState**: Пустые состояния с призывами к действию
- **ErrorState**: Обработка ошибок с возможностью повтора
- **LoadingState**: Индикаторы загрузки

### UI Components
- **NotificationToast**: Система уведомлений
- **InfiniteScroll**: Бесконечная прокрутка для списков

## 🔧 Технические особенности

### TypeScript
Все компоненты полностью типизированы с интерфейсами для:
- Props компонентов
- API данных (Work, Chapter, User, Comment, etc.)
- Состояний и событий
- Фильтров и настроек

### Accessibility (a11y)
- Семантическая HTML разметка
- ARIA атрибуты для интерактивных элементов
- Поддержка клавиатурной навигации
- Screen reader friendly контент
- Правильные контрастные соотношения

### Responsive Design
- Mobile-first подход
- Адаптивные компоненты для всех экранов
- Специальные мобильные компоненты
- Оптимизированные touch интерфейсы

### Theming
Поддержка тем:
- `light` - светлая тема
- `dark` - темная тема  
- `sepia` - сепия для чтения

### Performance
- Lazy loading компонентов
- Виртуализация больших списков
- Оптимизированные изображения
- Мемоизация тяжелых вычислений

## 🎨 Стилизация

### Tailwind CSS
- Utility-first подход
- Кастомные CSS переменные для тем
- Адаптивные классы
- Компонентные стили через @apply

### Design System
- shadcn/ui компоненты как основа
- Консистентная цветовая палитра
- Типографическая система
- Spacing и sizing стандарты

## 🔌 Интеграция с API

### Предполагаемые хуки
\`\`\`typescript
// Поиск работ
const { data, isLoading, error } = useSearchWorks(filters)

// Получение работы
const { work, isLoading } = useWork(workId)

// Главы работы
const { chapters, isLoading } = useWorkChapters(workId)
\`\`\`

### Обработка состояний
- Loading states для всех асинхронных операций
- Error boundaries для обработки ошибок
- Empty states для пустых результатов
- Optimistic updates для лучшего UX

## 🚀 Использование

### Базовый пример
\`\`\`tsx
import { SearchBar, FilterPanel, ResultsList } from '@/components'

export default function SearchPage() {
  return (
    <Container>
      <SearchBar onSearch={handleSearch} />
      <div className="flex gap-6">
        <FilterPanel filters={filters} onChange={handleFiltersChange} />
        <ResultsList works={works} isLoading={isLoading} />
      </div>
    </Container>
  )
}
\`\`\`

### Читалка
\`\`\`tsx
import { ReaderShell } from '@/components'

export default function ReaderPage({ workId, chapterId }) {
  return (
    <ReaderShell
      work={work}
      chapter={chapter}
      settings={readerSettings}
      onSettingsChange={handleSettingsChange}
    />
  )
}
\`\`\`

## 📱 Мобильная оптимизация

### Особенности
- Боковое меню для навигации
- Swipe жесты в читалке
- Оптимизированные touch targets
- Адаптивная типографика
- Мобильные модальные окна

### Breakpoints
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+

## 🔍 SEO и метаданные

### Структурированные данные
- Schema.org разметка для работ
- Open Graph теги
- Twitter Card метаданные
- Canonical URLs

## 🛠️ Разработка

### Команды
\`\`\`bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Линтинг
npm run lint

# Проверка типов
npm run type-check
\`\`\`

### Требования
- Node.js 18+
- Next.js 15+
- TypeScript 5+
- Tailwind CSS 4+

## 📋 TODO / Roadmap

### Планируемые улучшения
- [ ] Виртуализация списков для больших результатов
- [ ] Offline режим с Service Worker
- [ ] Push уведомления
- [ ] Расширенная аналитика
- [ ] A/B тестирование компонентов
- [ ] Интернационализация (i18n)
- [ ] Темы пользователей
- [ ] Плагинная архитектура

### Известные ограничения
- Компоненты содержат только UI логику
- Требуется интеграция с реальным API
- Некоторые функции требуют серверной части
- Мобильные жесты требуют дополнительных библиотек

## 🤝 Вклад в проект

### Гайдлайны
1. Следуйте TypeScript строгим типам
2. Используйте семантическую HTML разметку
3. Обеспечивайте accessibility
4. Пишите тесты для новых компонентов
5. Документируйте сложную логику

### Структура коммитов
\`\`\`
feat: добавить новый компонент
fix: исправить баг в компоненте
docs: обновить документацию
style: форматирование кода
refactor: рефакторинг без изменения функциональности
test: добавить тесты
\`\`\`

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей.

---

**Примечание**: Это UI-скелет без бизнес-логики. Для полной функциональности требуется интеграция с backend API и добавление соответствующих хуков для управления состоянием.
