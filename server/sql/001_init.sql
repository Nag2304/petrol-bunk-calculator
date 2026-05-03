CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);

CREATE TABLE IF NOT EXISTS nozzle_entries (
  id SERIAL PRIMARY KEY,
  daily_record_id INTEGER NOT NULL REFERENCES daily_records(id) ON DELETE CASCADE,
  nozzle_name TEXT NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel')),
  close_reading NUMERIC(12, 3) NOT NULL DEFAULT 0,
  open_reading NUMERIC(12, 3) NOT NULL DEFAULT 0,
  testing_litres NUMERIC(12, 3) NOT NULL DEFAULT 0,
  rate_per_litre NUMERIC(12, 2) NOT NULL DEFAULT 0
);
