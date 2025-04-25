-- Insert Korean banks with translatable names
INSERT INTO "banks" ("bank_code", "bank_name", "is_active", "created_at", "updated_at")
VALUES
  ('KB', 'banks.kb_kookmin', true, NOW(), NOW()),
  ('SH', 'banks.shinhan', true, NOW(), NOW()),
  ('WR', 'banks.woori', true, NOW(), NOW()),
  ('HN', 'banks.hana', true, NOW(), NOW()),
  ('NH', 'banks.nonghyup', true, NOW(), NOW()),
  ('IBK', 'banks.ibk', true, NOW(), NOW()),
  ('SC', 'banks.sc_first', true, NOW(), NOW()),
  ('KKO', 'banks.kakao', true, NOW(), NOW()),
  ('KBank', 'banks.kbank', true, NOW(), NOW()),
  ('TOSS', 'banks.toss', true, NOW(), NOW()),
  ('BS', 'banks.busan', true, NOW(), NOW()),
  ('DG', 'banks.daegu', true, NOW(), NOW()),
  ('KN', 'banks.kyongnam', true, NOW(), NOW()),
  ('KJ', 'banks.kwangju', true, NOW(), NOW()),
  ('JB', 'banks.jeonbuk', true, NOW(), NOW()),
  ('JJ', 'banks.jeju', true, NOW(), NOW()),
  ('KDB', 'banks.industrial', true, NOW(), NOW()),
  ('SH2', 'banks.suhyup', true, NOW(), NOW()),
  ('MG', 'banks.saemaul', true, NOW(), NOW()),
  ('CU', 'banks.cu', true, NOW(), NOW()),
  ('POST', 'banks.post', true, NOW(), NOW()),
  ('CITI', 'banks.citi', true, NOW(), NOW()),
  ('DB', 'banks.deutsche', true, NOW(), NOW()),
  ('BNP', 'banks.bnp', true, NOW(), NOW()),
  ('BOC', 'banks.china', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING; 