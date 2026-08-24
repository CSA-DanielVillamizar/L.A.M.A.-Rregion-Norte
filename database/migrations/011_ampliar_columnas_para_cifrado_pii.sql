-- Cifrado de PII en reposo (condicion_medica, emergencia_nombre,
-- emergencia_telefono, eps, telefono_celular): el valor cifrado
-- (formato v1:iv:authTag:ciphertext en base64) es sensiblemente más largo
-- que el texto plano original. emergencia_telefono, telefono_celular y eps
-- eran VARCHAR(50)/VARCHAR(100), demasiado angostos para un telefono o EPS
-- cifrados (~60-90 caracteres). Se amplian a VARCHAR(500), igual que
-- emergencia_nombre, para dar margen amplio sin riesgo de truncamiento.
-- condicion_medica ya es NVARCHAR(MAX), no requiere cambio.

ALTER TABLE dbo.InscripcionesCampeonato ALTER COLUMN emergencia_nombre VARCHAR(500) NOT NULL;
GO

ALTER TABLE dbo.InscripcionesCampeonato ALTER COLUMN emergencia_telefono VARCHAR(500) NOT NULL;
GO

ALTER TABLE dbo.InscripcionesCampeonato ALTER COLUMN eps VARCHAR(500) NOT NULL;
GO

ALTER TABLE dbo.InscripcionesCampeonato ALTER COLUMN telefono_celular VARCHAR(500) NULL;
GO
