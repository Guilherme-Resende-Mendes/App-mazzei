import { Email } from '../../../src/domain/value-objects/Email';
import { InvalidEmailError } from '../../../src/domain/exceptions/InvalidEmailError';

describe('Email value object', () => {
  it('normaliza para minusculas e remove espacos', () => {
    const email = Email.create('  Foo@Bar.COM ');
    expect(email.value).toBe('foo@bar.com');
  });

  it('considera iguais dois e-mails com o mesmo valor', () => {
    expect(Email.create('a@b.com').equals(Email.create('A@B.com'))).toBe(true);
  });

  it.each(['invalido', 'sem@dominio', '@semlocal.com', 'espaco @b.com'])(
    'rejeita e-mail invalido: %s',
    (raw) => {
      expect(() => Email.create(raw)).toThrow(InvalidEmailError);
    },
  );
});
