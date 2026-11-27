-- La base se creó con armscii8 (alfabeto armenio): no admite tildes ni ñ
-- ("Pérez", "Ñaña", "Juliaca–Puno" fallaban con ER_TRUNCATED_WRONG_VALUE_FOR_FIELD).
-- Se convierte todo a utf8mb4 (Unicode completo) con collation insensible a mayúsculas.

ALTER DATABASE sicot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE usuarios        CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE conductores     CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE contratos       CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE vehiculos       CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE recorridos      CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE asistencias     CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE ubicaciones_gps CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
