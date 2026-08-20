import {
  isValidBrazilianPhone,
  isValidCpf,
  isValidCnpj,
  isValidCpfOrCnpj,
  normalizeBrazilianPhone,
  normalizeDigits,
} from '../../../src/shared/utils/brValidation';
import {
  VALID_CNPJ,
  VALID_CPF,
  VALID_PHONE,
} from '../../support/validTestDocuments';

describe('brValidation', () => {
  describe('CPF', () => {
    it('aceita CPF valido com ou sem mascara', () => {
      expect(isValidCpf(VALID_CPF)).toBe(true);
      expect(isValidCpf('529.982.247-25')).toBe(true);
    });

    it('rejeita CPF com digitos verificadores invalidos', () => {
      expect(isValidCpf('12345678901')).toBe(false);
    });

    it('rejeita CPF com todos os digitos iguais', () => {
      expect(isValidCpf('11111111111')).toBe(false);
    });
  });

  describe('CNPJ', () => {
    it('aceita CNPJ valido com ou sem mascara', () => {
      expect(isValidCnpj(VALID_CNPJ)).toBe(true);
      expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
    });

    it('rejeita CNPJ com digitos verificadores invalidos', () => {
      expect(isValidCnpj('12345678000199')).toBe(false);
    });
  });

  describe('CPF ou CNPJ', () => {
    it('aceita CPF ou CNPJ validos', () => {
      expect(isValidCpfOrCnpj(VALID_CPF)).toBe(true);
      expect(isValidCpfOrCnpj(VALID_CNPJ)).toBe(true);
    });

    it('rejeita documento com tamanho invalido', () => {
      expect(isValidCpfOrCnpj('123')).toBe(false);
    });
  });

  describe('Telefone brasileiro', () => {
    it('aceita celular valido com ou sem mascara', () => {
      expect(isValidBrazilianPhone(VALID_PHONE)).toBe(true);
      expect(isValidBrazilianPhone('(11) 99999-9999')).toBe(true);
      expect(isValidBrazilianPhone('+55 11 99999-9999')).toBe(true);
    });

    it('aceita telefone fixo valido', () => {
      expect(isValidBrazilianPhone('1133334444')).toBe(true);
    });

    it('rejeita telefone com DDD ou formato invalido', () => {
      expect(isValidBrazilianPhone('123')).toBe(false);
      expect(isValidBrazilianPhone('00999999999')).toBe(false);
      expect(isValidBrazilianPhone('11888888888')).toBe(false);
    });

    it('normaliza telefone removendo codigo do pais', () => {
      expect(normalizeBrazilianPhone('+55 (11) 99999-9999')).toBe('11999999999');
      expect(normalizeDigits('529.982.247-25')).toBe('52998224725');
    });
  });
});
