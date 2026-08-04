import { z } from "zod";

export const AreaTipoSchema = z.enum(["cozinha", "salao", "bar"]);
export type AreaTipo = z.infer<typeof AreaTipoSchema>;

export const VagaStatusSchema = z.enum(["aberta", "preenchida", "cancelada"]);
export type VagaStatus = z.infer<typeof VagaStatusSchema>;

export const ContratacaoStatusSchema = z.enum([
  "solicitada",
  "aceita",
  "recusada",
  "concluida",
  "cancelada",
]);
export type ContratacaoStatus = z.infer<typeof ContratacaoStatusSchema>;

export const SeloTipoSchema = z.enum(["pontual", "flexivel"]);
export type SeloTipo = z.infer<typeof SeloTipoSchema>;

// ---------------------------------------------------------------------------
// Responses (shape alinhado ao schema / views)
// ---------------------------------------------------------------------------

export type AreaDto = {
  id: AreaTipo;
  nome: string;
};

export type CargoDto = {
  id: string;
  area_id: AreaTipo;
  nome: string;
  nivel: number;
  ativo: boolean;
};

export type RestauranteDto = {
  id: string;
  nome: string;
  cpf_cnpj: string;
  endereco: string;
  telefone: string;
  nivel_exigencia: number | null;
  ativo: boolean;
};

export type CandidatoDto = {
  id: string;
  nome: string;
  documento: string;
  endereco: string;
  telefone: string;
  cargo_id: string;
  pretensao_salarial: number;
  nota_geral: number;
  bio: string | null;
  ativo: boolean;
};

export type CandidatoBuscaDto = {
  id: string;
  nome: string;
  telefone: string;
  pretensao_salarial: number;
  nota_geral: number;
  bio: string | null;
  cargo_id: string;
  cargo_nome: string;
  cargo_nivel: number;
  area_id: AreaTipo;
  area_nome: string;
  selos: SeloTipo[];
};

export type VagaDto = {
  id: string;
  restaurante_id: string;
  cargo_id: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  qtd_pessoas: number;
  status: VagaStatus;
  observacao: string | null;
};

export type ContratacaoDto = {
  id: string;
  vaga_id: string;
  candidato_id: string;
  restaurante_id: string;
  preco_acordado: number | null;
  status: ContratacaoStatus;
  solicitado_em: string;
  respondido_em: string | null;
  nota_entrega: number | null;
  nota_pontualidade: number | null;
  attr_cancelamento: boolean;
};

// ---------------------------------------------------------------------------
// Request bodies / query
// ---------------------------------------------------------------------------

export const CreateRestauranteSchema = z.object({
  nome: z.string().min(1),
  cpf_cnpj: z.string().min(11),
  endereco: z.string().min(1),
  telefone: z.string().min(8),
  nivel_exigencia: z.number().int().min(1).max(5).optional(),
});

export const CreateCandidatoSchema = z.object({
  nome: z.string().min(1),
  documento: z.string().min(11),
  endereco: z.string().min(1),
  telefone: z.string().min(8),
  cargo_id: z.string().uuid(),
  pretensao_salarial: z.number().nonnegative(),
  bio: z.string().optional(),
  selos: z.array(SeloTipoSchema).optional(),
});

export const ListCandidatosQuerySchema = z.object({
  area: AreaTipoSchema.optional(),
  cargo_id: z.string().uuid().optional(),
  nota_min: z.coerce.number().min(0).max(5).optional(),
});

export const CreateVagaSchema = z.object({
  restaurante_id: z.string().uuid(),
  cargo_id: z.string().uuid(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horario_inicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  horario_fim: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  qtd_pessoas: z.number().int().min(1).default(1),
  observacao: z.string().optional(),
});

export const ListVagasQuerySchema = z.object({
  area: AreaTipoSchema.optional(),
  cargo_id: z.string().uuid().optional(),
  restaurante_id: z.string().uuid().optional(),
  status: VagaStatusSchema.optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const CreateContratacaoSchema = z.object({
  vaga_id: z.string().uuid(),
  candidato_id: z.string().uuid(),
  restaurante_id: z.string().uuid(),
  preco_acordado: z.number().nonnegative().optional(),
});

export const ResponderContratacaoSchema = z.object({
  status: z.enum(["aceita", "recusada"]),
  preco_acordado: z.number().nonnegative().optional(),
});

export const AvaliarContratacaoSchema = z.object({
  nota_entrega: z.number().min(0).max(5),
  nota_pontualidade: z.number().min(0).max(5),
  attr_cancelamento: z.boolean().optional(),
});
