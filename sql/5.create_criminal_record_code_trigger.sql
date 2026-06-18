CREATE TABLE IF NOT EXISTS public.criminal_record_code_counters (
    year INTEGER PRIMARY KEY,
    last_number INTEGER NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.generate_criminal_record_code()
RETURNS TRIGGER AS $$
DECLARE
    current_year INTEGER;
    next_number INTEGER;
BEGIN
    IF NEW.code IS NOT NULL AND NEW.code <> '' THEN
        RETURN NEW;
    END IF;

    current_year := EXTRACT(YEAR FROM CURRENT_DATE);

    PERFORM pg_advisory_xact_lock(current_year);

    SELECT COALESCE(
        MAX((regexp_match(code, '([0-9]{4})$'))[1]::INTEGER),
        0
    )
    INTO next_number
    FROM public.criminal_records
    WHERE code LIKE 'OCR-' || current_year::text || '-%';

    INSERT INTO public.criminal_record_code_counters (year, last_number)
    VALUES (current_year, next_number)
    ON CONFLICT (year)
    DO UPDATE SET last_number = GREATEST(public.criminal_record_code_counters.last_number, EXCLUDED.last_number);

    UPDATE public.criminal_record_code_counters
    SET last_number = last_number + 1
    WHERE year = current_year
    RETURNING last_number INTO next_number;

    NEW.code := 'OCR-' || current_year::text || '-' || LPAD(next_number::text, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_criminal_record_code ON public.criminal_records;

CREATE TRIGGER trg_generate_criminal_record_code
BEFORE INSERT ON public.criminal_records
FOR EACH ROW
EXECUTE FUNCTION public.generate_criminal_record_code();
