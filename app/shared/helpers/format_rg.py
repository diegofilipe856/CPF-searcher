def format_rg(rg: str) -> str:
    digits = ''.join(char for char in rg if char.isdigit())
    if len(digits) != 9:
        if len(digits) == 8:
            return f"{digits[:2]}.{digits[2:5]}.{digits[5:8]}-0"
        raise ValueError("RG must contain 9 digits.")
    return f"{digits[:2]}.{digits[2:5]}.{digits[5:8]}-{digits[8:]}"