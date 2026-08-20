export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function hasRepeatedDigits(value: string): boolean {
  return /^(\d)\1+$/.test(value);
}

function calculateCheckDigit(digits: string, weights: number[]): number {
  const sum = digits
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);

  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(raw: string): boolean {
  const cpf = normalizeDigits(raw);

  if (cpf.length !== 11 || hasRepeatedDigits(cpf)) {
    return false;
  }

  const firstCheckDigit = calculateCheckDigit(
    cpf.slice(0, 9),
    [10, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const secondCheckDigit = calculateCheckDigit(
    cpf.slice(0, 10),
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return (
    firstCheckDigit === Number(cpf[9]) && secondCheckDigit === Number(cpf[10])
  );
}

export function isValidCnpj(raw: string): boolean {
  const cnpj = normalizeDigits(raw);

  if (cnpj.length !== 14 || hasRepeatedDigits(cnpj)) {
    return false;
  }

  const firstCheckDigit = calculateCheckDigit(
    cnpj.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const secondCheckDigit = calculateCheckDigit(
    cnpj.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return (
    firstCheckDigit === Number(cnpj[12]) &&
    secondCheckDigit === Number(cnpj[13])
  );
}

export function isValidCpfOrCnpj(raw: string): boolean {
  const digits = normalizeDigits(raw);

  if (digits.length === 11) {
    return isValidCpf(digits);
  }

  if (digits.length === 14) {
    return isValidCnpj(digits);
  }

  return false;
}

function isValidDdd(ddd: number): boolean {
  return ddd >= 11 && ddd <= 99;
}

export function normalizeBrazilianPhone(raw: string): string {
  let digits = normalizeDigits(raw);

  if (
    digits.startsWith('55') &&
    (digits.length === 12 || digits.length === 13)
  ) {
    digits = digits.slice(2);
  }

  return digits;
}

export function isValidBrazilianPhone(raw: string): boolean {
  const digits = normalizeBrazilianPhone(raw);

  if (digits.length === 10) {
    const ddd = Number(digits.slice(0, 2));
    const subscriberFirstDigit = digits[2];

    return (
      isValidDdd(ddd) &&
      ['2', '3', '4', '5'].includes(subscriberFirstDigit)
    );
  }

  if (digits.length === 11) {
    const ddd = Number(digits.slice(0, 2));

    return isValidDdd(ddd) && digits[2] === '9';
  }

  return false;
}
