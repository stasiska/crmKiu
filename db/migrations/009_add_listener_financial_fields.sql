-- Добавление финансовых полей в group_listeners
ALTER TABLE group_listeners
ADD COLUMN IF NOT EXISTS contract_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Добавление стоимости курса в groups
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS course_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);

-- Создание таблицы listener_notes
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
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_listener_notes_listener_id ON listener_notes(listener_id);
CREATE INDEX IF NOT EXISTS idx_listener_notes_type ON listener_notes(type);
CREATE INDEX IF NOT EXISTS idx_listener_notes_created_at ON listener_notes(created_at);
