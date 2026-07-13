def format_cpf(cpf: str) -> str:
    if not cpf:
        return cpf
    digits = ''.join(char for char in cpf if char.isdigit())
    if len(digits) != 11:
        return cpf
    return f"{digits[:3]}.{digits[3:6]}.{digits[6:9]}-{digits[9:]}"