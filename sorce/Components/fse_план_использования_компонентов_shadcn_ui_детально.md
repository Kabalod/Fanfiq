# FSE — План использования компонентов shadcn/ui (детально)

Цель: зафиксировать состав готовых компонентов shadcn/ui, области применения, состояния для Storybook и критерии готовности. План основан на вашем документе и расширен до полного внедрения в дизайн‑систему и MVP (Поиск, Результаты, Читалка).

---

## 0) Установка через CLI
```bash
npx shadcn@latest init
# Атомы
npx shadcn@latest add button input select checkbox badge avatar tooltip separator
# Молекулы и служебные
npx shadcn@latest add card accordion dropdown-menu pagination dialog toast
# Дополнительно для FSE
npx shadcn@latest add sheet popover command slider radio-group toggle-group
npx shadcn@latest add tabs aspect-ratio skeleton scrollbar
```
> Примечание: `lucide-react` используется для иконок; Tailwind и токены темы уже подключены.

---

## 1) Атомарные компоненты (Atoms)
| Наш компонент | shadcn/ui | Где используем | Состояния для Storybook | Статус |
|---|---|---|---|---|
| **Button** | `button` | CTA, хедер, читалка, фильтры | default/outline/secondary/ghost, disabled, loading | ✅ готов
| **Input** | `input` | Поиск, фильтры (числа/даты), логин | empty, with icon (prefix), error | ✅ готов
| **Select** | `select` | Сортировка, язык, рейтинг, главы | placeholder, disabled, long list | ✅ готов
| **Checkbox** | `checkbox` | Жанры, теги | checked/indeterminate/disabled | ✅ готов
| **Badge (Tag/Pill)** | `badge` | Рейтинг, теги, предупреждения, статусы | default/secondary/outline/destructive | ✅ готов
| **Avatar** | `avatar` | Меню пользователя | with fallback, image error | ✅ готов
| **Tooltip** | `tooltip` | Иконки и управл. читалки | top/bottom/long text | ✅ готов
| **Separator** | `separator` | Подвал, между секциями | horizontal/vertical | ✅ готов
| **Skeleton** | `skeleton` | Загрузочные карточки | card line set | ✅ готов

**Критерии готовности (atoms):** доступность (`role`, `aria-*`), видимый `focus-ring`, поддержка тёмной темы, документация токенов/вариантов.

---

## 2) Молекулярные компоненты (Molecules)
| Наш компонент | shadcn/ui | Состав и примечания | Состояния для Storybook | Статус |
|---|---|---|---|---|
| **Work Card** | `card` | Внутри: `badge`, мета, ховер‑кнопка закладки | completed/in‑progress, long title/tags, warnings | 🔶 в работе
| **Filter Group** | `accordion` | Секции «Основные», «Метаданные», «Статистика» | expanded/collapsed, error hints | ✅ готово (v1)
| **User Menu** | `dropdown-menu` + `avatar` | Профиль, выход, тема | logged‑in/out | 🔶 настроить пункты
| **Pagination** | `pagination` | Список результатов | 1/5/…/N, disabled prev/next | ✅ готово
| **Search Bar** | составной (`input`+`button`) | + `sheet` для свёрнутых фильтров | with filters open/closed | ✅ готово (v1)
| **Reader Controls** | составной (`button`+`select`) | Верх/низ, прогресс, глава‑селектор | prev/next disabled на краях | 🔶 в работе
| **Results Header** | `select` + счётчик | Сортировка, число результатов | разные сортировки | ✅ готово

**Допомолекулы (служебные):** `dialog` (модалки), `toast` (уведомления), `popover` (помощь/подсказки), `command` (поиск в списках тегов/фандомов), `slider` (размер шрифта, диапазоны), `tabs` (витрины).

---

## 3) Доп. компоненты/утилиты для FSE
- **Sheet** — панель фильтров («по умолчанию свёрнута» по ТЗ).
- **Popover + Command** — быстрый выбор фандома/тегов (autocomplete).
- **RangeSlider** (кастом поверх `slider`) — диапазон слов.
- **TagMultiSelect** — мультиселект тэгов/фандомов (с суггестиями).
- **Toast** — «Добавлено в закладки», «Фильтры сброшены».

---

## 4) Читалка (Reader)
| Подкомпонент | shadcn/ui | Примечания |
|---|---|---|
| **ReaderShell** | `button`, `select`, `separator` | Кнопка «Назад», «Перевести», «Озвучить», прогресс/навигация |
| **ReaderSettings** | `dialog`, `slider`, `select` | Размер шрифта, семейство, темы (светлая/тёмная/сепия) |
| **ReaderContext** | — | Сохранение настроек в LocalStorage, применение стилей к контенту |

**Сторис:** базовая, длинный контент, разные темы, большая/мал. кегль, «края навигации».

---

## 5) Мэппинг по ТЗ → компоненты
- **Поисковая строка** → `SearchBar` (Input+Button), иконка из `lucide-react`.
- **Фильтры (свёрнутые)** → `Sheet` + `FilterPanel` (`Accordion`, `Select`, `Checkbox`, `Slider`, `TagMultiSelect`).
- **Сброс фильтров** → `Button` + `toast`.
- **Результаты** → `ResultsHeader` (`Select` для сортировки) + `ResultsList` (`WorkCard`, `Pagination`).
- **Hover‑действие «в закладки»** → кнопка с `aria-pressed` на карточке, уведомление через `toast`.
- **Читалка** → `ReaderShell` + `ReaderSettings` (диалог), `Tooltip` для иконок.

---

## 6) Состояния и истории в Storybook
- **Atoms**: все вариации размеров/вариантов, disabled, focus.
- **Work Card**: completed / in‑progress; длинные названия; 10+ тегов; предупреждения (`destructive badge`).
- **Results Page**: загрузка (`Skeletons`), пусто (`EmptyState`), ошибка (mock `500`).
- **FilterPanel**: открыты/закрыты группы, ввод кастомного тега, сброс одним кликом.
- **Reader**: разные темы (light/dark/sepia), A-/A+, список глав 1/100, крайние главы.

---

## 7) Критерии готовности (DoD)
- A11y: focus‑ring, `aria-label/aria-pressed`, таб‑навигация, контраст ≥ 4.5:1.
- Темизация: корректные токены (`--primary`, `--muted`, `--foreground`) и тёмная тема.
- Документация: в каждой story — controls и примеры кода.
- Тест‑кейсы: визуальные снапшоты (Chromatic/локально), ручная проверка длинных строк/переносов.

---

## 8) Нотации и соглашения
- **Именование**: `src/components/fse/...` (atoms не дублировать — брать из `ui/`).
- **Варианты**: в `WorkCard` — `compact` проп для плотных списков.
- **Иконки**: только `lucide-react`, размер по умолчанию 16–20 px.
- **Анимации**: `transition-*`, без heavy motion (respect `prefers-reduced-motion`).

---

## 9) Следующие шаги
1) Установить список компонентов через CLI (см. раздел 0).
2) Подключить stories из пакетов «FSE Storybook Components» и «Complete Pack».
3) Доделать: `Work Card` (варианты + bookmark state) и `Reader Controls` (блокировка prev/next на краях).
4) Добавить MSW‑моки `/api/v1/works/search` к интеграционной story «ResultsPage».
5) Провести a11y‑аудит и финальный pass по токенам темы.

---

## 10) Итог
Используем готовые shadcn/ui как основу, кастомизируем только доменные компоненты (WorkCard, FilterPanel, Reader). Такой подход ускоряет разработку, обеспечивает консистентность и доступность, и позволяет фокусироваться на логике поиска/читалки/парсеров.

