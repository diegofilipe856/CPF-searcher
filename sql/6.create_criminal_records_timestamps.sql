UPDATE public.criminal_records
SET
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

ALTER TABLE public.criminal_records
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION public.set_criminal_records_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at := COALESCE(NEW.created_at, CURRENT_TIMESTAMP);
        NEW.updated_at := COALESCE(NEW.updated_at, CURRENT_TIMESTAMP);
    ELSE
        NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_criminal_records_timestamps ON public.criminal_records;

CREATE TRIGGER trg_set_criminal_records_timestamps
BEFORE INSERT OR UPDATE ON public.criminal_records
FOR EACH ROW
EXECUTE FUNCTION public.set_criminal_records_timestamps();
