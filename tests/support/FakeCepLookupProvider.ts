import {
  CepLookupProvider,
  CepLookupResult,
} from '../../src/application/interfaces/CepLookupProvider';
import { Address } from '../../src/domain/value-objects/Address';

export class FakeCepLookupProvider implements CepLookupProvider {
  constructor(
    private readonly results: Record<string, CepLookupResult | null> = {},
    private readonly defaultResult: CepLookupResult | null = null,
  ) {}

  async lookup(zipCode: string): Promise<CepLookupResult | null> {
    const normalizedZipCode = Address.normalizeZipCode(zipCode);

    if (Object.prototype.hasOwnProperty.call(this.results, normalizedZipCode)) {
      return this.results[normalizedZipCode];
    }

    if (this.defaultResult) {
      return this.defaultResult;
    }

    return {
      zipCode: normalizedZipCode,
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      city: 'Sao Paulo',
      state: 'SP',
    };
  }
}
