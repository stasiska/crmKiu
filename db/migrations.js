const { Pool } = require('pg');

async function runMigrations(pool) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
  CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
        // Таблица users
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Таблица senders
        await client.query(`
      CREATE TABLE IF NOT EXISTS senders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) NOT NULL,
        host VARCHAR(100),
        port INTEGER,
        secure INTEGER DEFAULT 1,
        password VARCHAR(255),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Таблица recipients
        await client.query(`
      CREATE TABLE IF NOT EXISTS recipients (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100),
        phone VARCHAR(50),
        city VARCHAR(100),
        organization VARCHAR(100),
        specialization VARCHAR(100),
        comment TEXT,
        extra JSONB,
        imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Таблица send_logs
        await client.query(`
      CREATE TABLE IF NOT EXISTS send_logs (
        id SERIAL PRIMARY KEY,
        recipient_email VARCHAR(255) NOT NULL,
        sender_id INTEGER REFERENCES senders(id) ON DELETE SET NULL,
        subject VARCHAR(255),
        body_preview TEXT,
        status VARCHAR(50),
        error_message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Таблица templates
        await client.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        subject VARCHAR(255),
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Таблица reminders
        await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        recipient_id INTEGER REFERENCES recipients(id) ON DELETE CASCADE,
        recipient_email VARCHAR(255),
        reminder_date TIMESTAMP NOT NULL,
        message TEXT,
        is_completed BOOLEAN DEFAULT FALSE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Таблица tasks
        await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        deadline TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await client.query(`
  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER REFERENCES recipients(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

        // Индексы для скорости
        await client.query(`CREATE INDEX IF NOT EXISTS idx_recipients_email ON recipients(email)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_send_logs_sender_id ON send_logs(sender_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_send_logs_sent_at ON send_logs(sent_at)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date)`);

        // Вставка дефолтного администратора, если его нет
        await client.query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('admin@example.com', '$2b$10$MrCgl5Ll8pHvB2pVa3P7iOioqrH3B9JfptLq.G6VFFp3H8ajRtg5a', 'Администратор', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);


        await client.query('COMMIT');
        console.log('✅ Таблицы созданы/проверены, администратор создан');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка миграции:', err);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { runMigrations };