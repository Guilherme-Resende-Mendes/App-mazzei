export interface CepLookupResult {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CepLookupProvider {
  lookup(zipCode: string): Promise<CepLookupResult | null>;
}
