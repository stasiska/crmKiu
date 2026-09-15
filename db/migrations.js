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

        // Таблица organizations
        await client.query(`
  CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    contact_person VARCHAR(255),
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

        // Добавляем новые поля реквизитов к organizations (если их еще нет)
        await client.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='ogrn') THEN
      ALTER TABLE organizations ADD COLUMN ogrn VARCHAR(15);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='okpo') THEN
      ALTER TABLE organizations ADD COLUMN okpo VARCHAR(10);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='okved') THEN
      ALTER TABLE organizations ADD COLUMN okved VARCHAR(10);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='okfs') THEN
      ALTER TABLE organizations ADD COLUMN okfs VARCHAR(10);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='okopf') THEN
      ALTER TABLE organizations ADD COLUMN okopf VARCHAR(10);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='okato') THEN
      ALTER TABLE organizations ADD COLUMN okato VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='inn') THEN
      ALTER TABLE organizations ADD COLUMN inn VARCHAR(12);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='kpp') THEN
      ALTER TABLE organizations ADD COLUMN kpp VARCHAR(9);
    END IF;
  END $$;
`);

        // Таблица listeners
        await client.query(`
  CREATE TABLE IF NOT EXISTS listeners (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(10),
    citizenship VARCHAR(100),
    identity_document VARCHAR(100),
    document_series VARCHAR(20),
    document_number VARCHAR(20),
    issued_by VARCHAR(255),
    snils VARCHAR(14),
    residence_address TEXT,
    registration_address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    education_level VARCHAR(20),
    education_series VARCHAR(20),
    education_number VARCHAR(20),
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

        // Таблица organization_notes
        await client.query(`
  CREATE TABLE IF NOT EXISTS organization_notes (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'plan')),
    date TIMESTAMP,
    note TEXT NOT NULL,
    executor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

        // Таблица groups
        await client.query(`
  CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    auditorium VARCHAR(100),
    branch VARCHAR(100),
    course_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'набор',
    hours INTEGER,
    start_date DATE,
    end_date DATE,
    format VARCHAR(50) DEFAULT 'аудитория',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

        // Таблица group_listeners (связь многие-ко-многим)
        await client.query(`
  CREATE TABLE IF NOT EXISTS group_listeners (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    listener_id INTEGER NOT NULL REFERENCES listeners(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, listener_id)
  )
`);

        // Индексы для скорости
        await client.query(`CREATE INDEX IF NOT EXISTS idx_recipients_email ON recipients(email)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_send_logs_sender_id ON send_logs(sender_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_send_logs_sent_at ON send_logs(sent_at)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_listeners_last_name ON listeners(last_name)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_listeners_first_name ON listeners(first_name)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_listeners_email ON listeners(email)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_listeners_organization_id ON listeners(organization_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_listeners_manager_id ON listeners(manager_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_organization_notes_org_id ON organization_notes(organization_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_organization_notes_created_at ON organization_notes(created_at)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_groups_course_name ON groups(course_name)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_groups_manager_id ON groups(manager_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_group_listeners_group_id ON group_listeners(group_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_group_listeners_listener_id ON group_listeners(listener_id)`);

        // Добавление новых полей в таблицу groups
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='course_name') THEN
          ALTER TABLE groups ADD COLUMN course_name VARCHAR(255) NOT NULL DEFAULT '';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='status') THEN
          ALTER TABLE groups ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'набор';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='hours') THEN
          ALTER TABLE groups ADD COLUMN hours INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='start_date') THEN
          ALTER TABLE groups ADD COLUMN start_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='end_date') THEN
          ALTER TABLE groups ADD COLUMN end_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='format') THEN
          ALTER TABLE groups ADD COLUMN format VARCHAR(50) DEFAULT 'аудитория';
        END IF;
      END $$;
    `);

        // Добавление поля branch в таблицу users
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='branch') THEN
          ALTER TABLE users ADD COLUMN branch VARCHAR(100);
        END IF;
      END $$;
    `);

        // Добавление поля branch в таблицу groups
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='branch') THEN
          ALTER TABLE groups ADD COLUMN branch VARCHAR(100);
        END IF;
      END $$;
    `);

        // Добавление поля name_accusative в таблицу listeners
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listeners' AND column_name='name_accusative') THEN
          ALTER TABLE listeners ADD COLUMN name_accusative VARCHAR(255);
        END IF;
      END $$;
    `);

        // Таблица branches (справочник филиалов)
        await client.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        director_name VARCHAR(255),
        city VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Заполнение справочника филиалов
        await client.query(`
      INSERT INTO branches (code, name, director_name, city) VALUES
        ('kazan', 'ЧФ КИУ (ИЭУП)', 'Н.И. Мухаметханова', 'Казань'),
        ('moscow', 'МФ КИУ (ИЭУП)', 'И.И. Иванов', 'Москва'),
        ('chelny', 'НЧФ КИУ (ИЭУП)', 'П.П. Петров', 'Набережные Челны')
      ON CONFLICT (code) DO NOTHING
    `);

        // Таблица document_templates (шаблоны документов)
        await client.query(`
      CREATE TABLE IF NOT EXISTS document_templates (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        file_data BYTEA NOT NULL,
        file_name VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Таблица group_documents (документы, привязанные к группам)
        await client.query(`
      CREATE TABLE IF NOT EXISTS group_documents (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        document_type VARCHAR(100) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_data BYTEA NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_group_documents_group_id ON group_documents(group_id)`);

        // Добавление поля manager_name в таблицу groups
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='manager_name') THEN
          ALTER TABLE groups ADD COLUMN manager_name VARCHAR(255);
        END IF;
      END $$;
    `);

        // Добавление полей финансовых данных в таблицу group_listeners
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_listeners' AND column_name='contract_amount') THEN
          ALTER TABLE group_listeners ADD COLUMN contract_amount DECIMAL(10,2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_listeners' AND column_name='paid_amount') THEN
          ALTER TABLE group_listeners ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_listeners' AND column_name='payment_type') THEN
          ALTER TABLE group_listeners ADD COLUMN payment_type VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_listeners' AND column_name='comment') THEN
          ALTER TABLE group_listeners ADD COLUMN comment TEXT;
        END IF;
      END $$;
    `);

        // Добавление поля course_price в таблицу groups
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='course_price') THEN
          ALTER TABLE groups ADD COLUMN course_price DECIMAL(10,2);
        END IF;
      END $$;
    `);

        // Таблица listener_notes
        await client.query(`
      CREATE TABLE IF NOT EXISTS listener_notes (
        id SERIAL PRIMARY KEY,
        listener_id INTEGER NOT NULL REFERENCES listeners(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'plan')),
        date TIMESTAMP,
        note TEXT NOT NULL,
        executor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_listener_notes_listener_id ON listener_notes(listener_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_listener_notes_created_at ON listener_notes(created_at)`);

        // Вставка дефолтного администратора, если его нет
        await client.query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('admin@example.com', '$2b$10$MrCgl5Ll8pHvB2pVa3P7iOioqrH3B9JfptLq.G6VFFp3H8ajRtg5a', 'Администратор', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);


        await client.query('COMMIT');
        //console.log('✅ Таблицы созданы/проверены, администратор создан');
    } catch (err) {
        await client.query('ROLLBACK');
        //console.error('❌ Ошибка миграции:', err);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { runMigrations };