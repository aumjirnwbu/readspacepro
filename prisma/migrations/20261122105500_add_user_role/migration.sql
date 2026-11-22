ALTER TABLE "User"
ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';

UPDATE "User"
SET "role" = 'ADMIN'
WHERE "email" = 'demo@example.com';
