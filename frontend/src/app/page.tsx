export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'black', marginBottom: '1rem' }}>
        Fanfiq - Поиск фанфиков
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Приложение работает! Теперь можно добавить стили и компоненты.
      </p>
      <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', border: '1px solid #ddd' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Следующие шаги:
        </h2>
        <ul style={{ color: '#555' }}>
          <li>• Восстановить Tailwind CSS конфигурацию</li>
          <li>• Добавить компоненты интерфейса</li>
          <li>• Подключить API endpoints</li>
          <li>• Настроить поиск и фильтры</li>
        </ul>
      </div>
    </div>
  )
}