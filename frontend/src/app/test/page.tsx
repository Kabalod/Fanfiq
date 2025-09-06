export default function TestPage() {
  return (
    <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <div style={{ minHeight: '100vh', backgroundColor: 'blue', padding: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
            Test Page
          </h1>
          <p style={{ color: 'white', fontSize: '1.125rem' }}>
            Если вы видите эту страницу со стилями, значит Next.js работает правильно!
          </p>
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
              Тестовые элементы
            </h2>
            <button style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', marginRight: '1rem' }}>
              Зеленая кнопка
            </button>
            <input
              type="text"
              placeholder="Тестовый input"
              style={{ border: '1px solid #d1d5db', padding: '0.5rem 0.75rem', borderRadius: '0.25rem' }}
            />
          </div>
        </div>
      </body>
    </html>
  )
}
