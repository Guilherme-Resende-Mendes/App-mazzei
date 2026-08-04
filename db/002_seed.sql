-- Seed: áreas e cargos fechados pela plataforma (régua MVP)

INSERT INTO areas (id, nome) VALUES
  ('cozinha', 'Cozinha'),
  ('salao', 'Salão'),
  ('bar', 'Bar')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cargos (area_id, nome, nivel) VALUES
  -- Cozinha
  ('cozinha', 'Auxiliar de cozinha', 1),
  ('cozinha', 'Cozinheiro', 2),
  ('cozinha', 'Chefe de cozinha', 3),
  -- Salão
  ('salao', 'Auxiliar de salão', 1),
  ('salao', 'Garçom', 2),
  ('salao', 'Maître', 3),
  -- Bar
  ('bar', 'Auxiliar de bar', 1),
  ('bar', 'Bartender', 2),
  ('bar', 'Barman sênior', 3)
ON CONFLICT (area_id, nome) DO NOTHING;
