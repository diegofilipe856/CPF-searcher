-- 1. Sincroniza a tabela de contadores com os registros existentes (caso existam)
INSERT INTO public.criminal_record_code_counters (year, last_number)
SELECT 
    EXTRACT(YEAR FROM created_at)::integer AS year,
    COALESCE(MAX((regexp_match(code, '([0-9]{4})$'))[1]::INTEGER), 0) AS last_number
FROM public.criminal_records
GROUP BY EXTRACT(YEAR FROM created_at)
ON CONFLICT (year)
DO UPDATE SET last_number = GREATEST(public.criminal_record_code_counters.last_number, EXCLUDED.last_number);

-- 2. Atualiza a função do trigger para a nova lógica otimizada e atômica
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

    -- Incrementa de forma atômica o contador do ano corrente
    INSERT INTO public.criminal_record_code_counters (year, last_number)
    VALUES (current_year, 1)
    ON CONFLICT (year)
    DO UPDATE SET last_number = public.criminal_record_code_counters.last_number + 1
    RETURNING last_number INTO next_number;

    NEW.code := 'OCR-' || current_year::text || '-' || LPAD(next_number::text, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
