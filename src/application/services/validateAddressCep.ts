import { Address } from '../../domain/value-objects/Address';
import { UnprocessableEntityError } from '../../shared/errors/AppError';
import { CepLookupProvider } from '../interfaces/CepLookupProvider';

function normalizeForComparison(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Valida existencia do CEP via provedor externo e coerencia de rua/bairro
 * quando o servico retorna esses dados.
 */
export async function validateAddressCep(
  address: Address,
  cepLookup: CepLookupProvider,
): Promise<void> {
  const lookup = await cepLookup.lookup(address.zipCode);

  if (!lookup) {
    throw new UnprocessableEntityError('CEP invalido ou nao encontrado.');
  }

  const errors: string[] = [];

  if (lookup.street) {
    const expectedStreet = normalizeForComparison(lookup.street);
    const providedStreet = normalizeForComparison(address.street);

    if (expectedStreet !== providedStreet) {
      errors.push('Rua informada nao corresponde ao CEP.');
    }
  }

  if (lookup.neighborhood) {
    const expectedNeighborhood = normalizeForComparison(lookup.neighborhood);
    const providedNeighborhood = normalizeForComparison(address.neighborhood);

    if (expectedNeighborhood !== providedNeighborhood) {
      errors.push('Bairro informado nao corresponde ao CEP.');
    }
  }

  if (errors.length > 0) {
    throw new UnprocessableEntityError(
      'Endereco inconsistente com o CEP informado.',
      errors,
    );
  }
}
