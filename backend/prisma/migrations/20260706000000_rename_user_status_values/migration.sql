DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM pg_enum e
		JOIN pg_type t ON t.oid = e.enumtypid
		WHERE t.typname = 'UserStatus' AND e.enumlabel = 'ACTIVATED'
	) THEN
		ALTER TYPE "UserStatus" RENAME VALUE 'ACTIVATED' TO 'ACTIVE';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM pg_enum e
		JOIN pg_type t ON t.oid = e.enumtypid
		WHERE t.typname = 'UserStatus' AND e.enumlabel = 'DEACTIVATED'
	) THEN
		ALTER TYPE "UserStatus" RENAME VALUE 'DEACTIVATED' TO 'INACTIVE';
	END IF;
END $$;