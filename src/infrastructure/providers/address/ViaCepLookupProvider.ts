import {
  CepLookupProvider,
  CepLookupResult,
} from '../../../application/interfaces/CepLookupProvider';
import { Address } from '../../../domain/value-objects/Address';

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

export class ViaCepLookupProvider implements CepLookupProvider {
  private readonly baseUrl: string;

  constructor(baseUrl = 'https://viacep.com.br/ws') {
    this.baseUrl = baseUrl;
  }

  async lookup(zipCode: string): Promise<CepLookupResult | null> {
    const normalizedZipCode = Address.normalizeZipCode(zipCode);

    if (normalizedZipCode.length !== 8) {
      return null;
    }

    const response = await fetch(`${this.baseUrl}/${normalizedZipCode}/json/`);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ViaCepResponse;

    if (data.erro === true || data.erro === 'true') {
      return null;
    }

    return {
      zipCode: normalizedZipCode,
      street: data.logradouro?.trim() ?? '',
      neighborhood: data.bairro?.trim() ?? '',
      city: data.localidade?.trim() ?? '',
      state: data.uf?.trim() ?? '',
    };
  }
}
