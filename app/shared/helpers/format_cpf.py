def format_cpf(cpf: str) -> str:
    digits = ''.join(char for char in cpf if char.isdigit())
    if len(digits) != 11:
        raise ValueError("CPF must contain 11 digits.")
    return f"{digits[:3]}.{digits[3:6]}.{digits[6:9]}-{digits[9:]}"