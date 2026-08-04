# Checklist — mapeamento de áreas e cargos (Danilo + restaurantes)

**Objetivo:** fechar a lista controlada de `áreas` e `cargos` antes de congelar enum/seed e filtros do app.  
**Participantes sugeridos:** Guilherme, Xande, **Danilo** (bares / restaurantes / choperia).  
**Referências de casa:** Bar do Bolso, Cervejeiro, Thaís, Reserva, Darcy.  
**Método:** quadro com colunas = áreas; células = cargos (≥ 4 exemplos por área).

---

## 1. Quadro ao vivo (fazer na reunião)

| Área (nome oficial) | Cargos (do júnior ao sênior) | Esse cargo existe em outra área? | Nome que as casas usam hoje |
|---------------------|------------------------------|----------------------------------|-----------------------------|
|                     |                              |                                  |                             |
|                     |                              |                                  |                             |
|                     |                              |                                  |                             |

**Regra da sessão:** se duas casas usam nomes diferentes para a mesma função, escolher **um nome de plataforma** e anotar os sinônimos (não viram linhas separadas).

---

## 2. Perguntas — áreas

1. Quais áreas existem de fato nas casas de referência? (ex.: cozinha, salão, bar — falta limpeza, estoque, caixa, delivery, eventos?)
2. Alguma “área” é só apelido local e deveria virar **cargo** dentro de outra área?
3. Área precisa aparecer no app como filtro do restaurante e do candidato? (confirma lista fechada, sem texto livre)
4. Há área que só existe em um tipo de estabelecimento (ex.: choperia vs fine dining)? Se sim, entra no MVP ou fica fora?

## 3. Perguntas — cargos

5. Para cada área, quais cargos são contratados **por diária/turno** (escopo do app) vs só CLT fixo?
6. Ordem de nível faz sentido? (1 auxiliar → 2 pleno → 3 sênior) — ou precisamos de mais/menos níveis?
7. O mesmo cargo aparece em mais de uma área? (ex.: “limpeza” em salão e cozinha) → se sim, modelamos N:N ou cargo + especialização na vaga
8. Candidato pode se cadastrar em **mais de um cargo**? (hoje o schema assume 1 cargo)
9. Vaga sempre pede **um cargo** ou às vezes “qualquer um da área X”?
10. Precisamos de cargo genérico tipo “apoio / multifunção”?

## 4. Perguntas — operação da vaga (impacta filtros)

11. Ao publicar vaga, o restaurante escolhe área → cargo, ou só cargo?
12. Filtros mínimos no MVP: área, cargo, nota — falta algo crítico? (turno, distância, experiência em tipo de casa)
13. Há diferença de nomenclatura entre bar, restaurante e choperia que quebre busca se unificarmos?
14. Danilo valida a lista seed atual?

   - Áreas: Cozinha, Salão, Bar  
   - Cargos: Auxiliar / pleno / sênior em cada uma  

   O que **falta**, o que **sobra**, o que **renomear**?

## 5. Fechamento da reunião (saída esperada)

- [ ] Lista oficial de áreas (nomes finais da plataforma)
- [ ] Lista oficial de cargos por área + nível
- [ ] Sinônimos descartados (nomes locais → nome oficial)
- [ ] Decisão: candidato com 1 cargo ou N cargos
- [ ] Decisão: cargo só em 1 área ou pode cruzar áreas
- [ ] O que fica **fora do MVP**
- [ ] Próximo passo: atualizar `db/002_seed.sql` (+ enum se novas áreas) e liberar filtros da API

---

## Seed atual (para confrontar na reunião)

```
cozinha → Auxiliar de cozinha (1), Cozinheiro (2), Chefe de cozinha (3)
salao   → Auxiliar de salão (1), Garçom (2), Maître (3)
bar     → Auxiliar de bar (1), Bartender (2), Barman sênior (3)
```
