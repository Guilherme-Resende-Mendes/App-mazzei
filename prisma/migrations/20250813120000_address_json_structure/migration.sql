-- Converte endereco textual legado para JSON estruturado.

ALTER TABLE "restaurantes"
ALTER COLUMN "endereco" TYPE JSONB
USING jsonb_build_object(
  'rua', "endereco",
  'bairro', 'Nao informado',
  'numero', NULL,
  'complemento', NULL,
  'cep', '00000000'
);

ALTER TABLE "candidatos"
ALTER COLUMN "endereco" TYPE JSONB
USING jsonb_build_object(
  'rua', "endereco",
  'bairro', 'Nao informado',
  'numero', NULL,
  'complemento', NULL,
  'cep', '00000000'
);
