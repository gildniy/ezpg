-- Script to insert Korean banks with translatable i18n keys
-- This format is compatible with direct psql execution

-- KB국민은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('KB', 'banks.kb_kookmin', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 신한은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('SH', 'banks.shinhan', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 우리은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('WR', 'banks.woori', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 하나은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('HN', 'banks.hana', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 농협은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('NH', 'banks.nonghyup', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 기업은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('IBK', 'banks.ibk', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- SC제일은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('SC', 'banks.sc_first', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 카카오뱅크
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('KKO', 'banks.kakao', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 케이뱅크
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('KB2', 'banks.kbank', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 토스뱅크
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('TOSS', 'banks.toss', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 부산은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('BS', 'banks.busan', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 대구은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('DG', 'banks.daegu', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 경남은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('KN', 'banks.kyongnam', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 광주은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('KJ', 'banks.kwangju', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 전북은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('JB', 'banks.jeonbuk', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 제주은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('JJ', 'banks.jeju', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 산업은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('KDB', 'banks.industrial', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 수협은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('SHB', 'banks.suhyup', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 새마을금고
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('MG', 'banks.saemaul', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 신협
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('CU', 'banks.cu', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 우체국
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('POST', 'banks.post', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 씨티은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('CITI', 'banks.citi', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 도이치은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('DB', 'banks.deutsche', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- BNP파리바은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('BNP', 'banks.bnp', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING;

-- 중국은행
INSERT INTO banks (bank_code, bank_name, is_active, created_at, updated_at)
VALUES ('BOC', 'banks.china', true, NOW(), NOW())
ON CONFLICT (bank_code) DO NOTHING; 