-- Таблица для хранения документов слушателей
CREATE TABLE IF NOT EXISTS listener_documents (
  id SERIAL PRIMARY KEY,
  listener_id INTEGER NOT NULL REFERENCES listeners(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  document_type VARCHAR(255) NOT NULL, -- 'contract', 'certificate', 'diploma', etc.
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER,
  contract_number VARCHAR(255), -- для договоров
  contract_date DATE, -- для договоров
  customer_full_name TEXT, -- ФИО заказчика
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE listener_documents
  ALTER COLUMN document_type TYPE VARCHAR(255),
  ALTER COLUMN file_name TYPE VARCHAR(255),
  ALTER COLUMN file_path TYPE VARCHAR(255),
  ALTER COLUMN contract_number TYPE VARCHAR(255);

CREATE INDEX idx_listener_documents_listener_id ON listener_documents(listener_id);
CREATE INDEX idx_listener_documents_group_id ON listener_documents(group_id);
CREATE INDEX idx_listener_documents_type ON listener_documents(document_type);
CREATE INDEX idx_listener_documents_contract_number ON listener_documents(contract_number);
