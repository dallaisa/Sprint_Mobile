# SpecRadar — Challenge Ford / FIAP

Plataforma de inteligência competitiva automotiva. Analista consulta veículo concorrente (chat ou formulário) e recebe ficha técnica padronizada em <10s, com confidence score por campo, fonte e data de verificação.

**Caso de teste oficial:** Ford Ranger Raptor.
**Entrega:** 2026-05-24 (Teams: apresentação + link do vídeo no slide 1 + arquivo .archimate).

## Equipe

| Frente | Responsáveis |
|---|---|
| Arquitetura SOA / Web Services (Java) | Renan e Camila |
| **Mobile (React Native + Expo)** | **Pedro e Isabelle** |
| Cybersecurity | Renan e Camila |
| Testing/Compliance/QA (pitch, BMC, Quadro de Valor, TOGAF) | Todos · vídeo: Isabelle |
| IA & ML (Desafio 2 — clustering + classificação) | Nicoli |

**Foco deste repositório:** frente Mobile (Pedro). Backend/Cyber/IA/ML estão em outros repositórios da equipe.

---

## Stack mobile

- **React Native** 0.83 + **Expo SDK 55** + **Expo Router** 6 (file-based)
- **TypeScript** estrito
- **fetch** nativo + AbortController (timeout 15s) — sem axios
- **@react-native-async-storage/async-storage** — persistência das últimas 10 consultas
- `Share` nativo do RN para exportar CSV — sem libs extras

**Não usamos:** Redux/Zustand (escala não justifica), NativeWind (StyleSheet basta), axios.

> ⚠️ Brief original cita FastAPI no TOGAF mas atribui a tarefa de API a Java na tabela. **Backend a ser definido com Renan/Camila + professor.** O mobile não depende dessa decisão — só do contrato JSON.

---

## Estrutura

```
Challenge/
├── CHALLENGE _ FORD.pdf          # brief original (não editar)
├── CLAUDE.md                     # este arquivo
├── .claude/                      # config Claude Code
└── specradar-mobile/             # app Expo (frente do Pedro)
    ├── app/                      # rotas Expo Router
    │   ├── _layout.tsx
    │   └── (tabs)/
    │       ├── _layout.tsx       # 4 tabs, initialRouteName="chat"
    │       ├── chat.tsx          # consulta NL livre
    │       ├── formulario.tsx    # entrada estruturada validada
    │       ├── comparar.tsx      # placeholder (Fase 3)
    │       └── historico.tsx     # placeholder (Fase 3)
    ├── src/
    │   ├── api/
    │   │   ├── client.ts         # fetch wrapper, timeout 15s, USE_MOCK toggle
    │   │   └── mocks/ranger-raptor.ts
    │   ├── components/
    │   │   ├── SpecCard.tsx      # ficha + Exportar CSV (Share API)
    │   │   ├── ConfidenceBadge.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   └── ErrorMessage.tsx  # mapeia 404/422/503/401
    │   ├── hooks/useSpecQuery.ts # data/loading/error + auto-save histórico
    │   ├── storage/history.ts    # AsyncStorage, máx 10, dedupe por id
    │   ├── theme/colors.ts       # paleta + ATRIBUTOS_PADRAO
    │   └── types/spec.ts         # SpecQuery, SpecResponse, Confidence, ApiError
    ├── components/                # boilerplate do template Expo (themed-text, etc)
    ├── hooks/use-color-scheme.{ts,web.ts}  # normalizado p/ 'light' | 'dark'
    └── components/ui/icon-symbol.tsx       # SF Symbols → Material Icons mapping
```

---

## Status das fases

### ✅ Fase 1 — Setup (concluída)
- Projeto Expo criado e migrado para SDK 55 (emulador do Pedro é 55)
- 4 rotas tab criadas como placeholders
- Camada de tipos + API client com mock da Ranger Raptor
- Ícones SF Symbols mapeados para Material Icons
- Hooks de color scheme normalizados (RN 0.83 introduziu `'unspecified'` em `ColorSchemeName`)

### ✅ Fase 2 — Chat + Formulário (concluída)
- Componentes: `SpecCard`, `ConfidenceBadge`, `LoadingSpinner`, `ErrorMessage`
- Hook `useSpecQuery` com loading/error/data + auto-save no AsyncStorage
- Tela **Chat**: input livre, parser simples (1ª palavra=marca, próximas=modelo)
- Tela **Formulário**: campos validados (regex marca, 2-80 chars modelo/versão, 1-20 atributos), chips de atributos
- Botão **Exportar CSV** funcional (Share API)
- Tratamento de erro 404/422/503/401 com mensagens amigáveis e retry

### ⏳ Fase 3 — Comparação + Histórico (próxima)
- Tela **Histórico**: lista os ≤10 do AsyncStorage, offline-first, botão "Comparar com…"
- Tela **Comparar**: seleciona 2 do histórico → `CompareTable` com células **verdes para o vencedor por atributo**
- Rota dinâmica `app/ficha/[id].tsx` para abrir uma ficha do histórico
- Estados vazios ("Nenhuma consulta ainda")

### ⏳ Fase 4 — Integração real + Polish
- Trocar mock pela API real (mudar `EXPO_PUBLIC_API_BASE_URL` no `.env`)
- JWT: tela de login + Bearer no header
- Teste em iOS + Android
- Ensaio da demo com Ranger Raptor

---

## Pontos não-óbvios

- **Tudo roda no mock atualmente.** Qualquer marca/modelo digitado retorna a ficha da Ranger Raptor com cabeçalho substituído. Para diferenciar veículos na demo, precisamos adicionar mocks distintos em `src/api/mocks/`.
- **Toggle mock↔real é automático:** se `EXPO_PUBLIC_API_BASE_URL` estiver vazio (default), `client.ts` usa mock. Quando o backend estiver pronto, basta criar `.env` com a URL.
- **Timeout 15s** já implementado via `AbortController` em `client.ts`. Aborta → lança `HttpError` 503 traduzido para PT-BR.
- **AsyncStorage dedupe por `spec.id`** — refazer a mesma consulta não duplica no histórico, só atualiza o timestamp.
- **Confidence score** vem em 3 níveis: `alta` (verde), `inferida` (laranja), `nao_encontrado` (cinza). Campo nunca é omitido — vem com `valor: null` quando não encontrado, conforme exigência do brief.
- **Exportar CSV** usa o `Share` nativo do RN, **não** salva arquivo. Abre o share sheet do sistema e o usuário escolhe destino (WhatsApp, email, etc).

---

## Comandos úteis

Todos rodados de dentro de `specradar-mobile/`:

```bash
npm start                         # Metro + QR para Expo Go
npm start -- --tunnel             # se PC e celular não compartilham Wi-Fi
npm run android                   # emulador Android
npm run web                       # navegador (limita teste mobile real)
./node_modules/.bin/tsc --noEmit  # typecheck
```

**Não use `npx tsc`** — npx baixa um pacote `tsc` aleatório que não é o TypeScript. Sempre use `./node_modules/.bin/tsc`.

---

## Convenções

- **Português** em código de UI (labels, mensagens) e comentários — alinha com o brief e a banca brasileira.
- **camelCase** para variáveis JS/TS, **snake_case** para campos do JSON da API (segue o brief: `verificado_em`, `potencia_cv`, etc).
- **Importações absolutas** com `@/...` (configurado no `tsconfig.json` paths).
- Pasta `components/` (raiz) = boilerplate do template Expo (não mexer salvo necessidade). Pasta `src/components/` = componentes do SpecRadar.
- Em telas, componentes próprios entram via `@/src/components/...`. Themed primitives entram via `@/components/...`.

---

## Dependências externas bloqueantes

| Bloqueio | Quem destrava | Necessário antes de |
|---|---|---|
| Contrato JSON da resposta `/specs/query` | Renan/Camila | Fase 4 |
| Decisão Java vs FastAPI | Equipe + professor | Fase 4 |
| URL pública da API (ngrok/deploy) | Renan/Camila | Fase 4 |
| JWT de teste | Renan/Camila (Cyber) | Fase 4 |

Mitigação: mock cobre Fases 1–3 sem dependência externa.

---

## Endpoints alvo (do brief — para Fase 4)

| Método | Path | Função |
|---|---|---|
| POST | `/api/v1/specs/query` | Recebe `{marca, modelo, versao, atributos[]}` → ficha com confidence + fonte + verificado_em |
| GET | `/api/v1/specs/compare?v1=X&v2=Y&atributos=a,b` | Comparação com `vencedor` por atributo |
| GET | `/api/v1/specs/history` | Lista registros com filtros marca/modelo |
| POST | `/api/v1/specs/from-pdf` | Upload de catálogo PDF → ficha extraída |

---

## Checklist do brief (frente Mobile)

- [x] React Native + Expo Router explícitos
- [x] 4 tabs como rotas do Expo Router
- [x] `useState` para `data/loading/error` em cada tela de consulta
- [x] Loading spinner durante chamada
- [x] Mensagem de erro amigável (404, timeout, etc)
- [x] Timeout 15s com feedback
- [x] AsyncStorage com últimas 10 (diferencial avaliativo)
- [ ] Tela offline funcionando — falta implementar UI do histórico (Fase 3)
- [ ] Tela comparação lado a lado com células verdes — Fase 3
- [x] Indicador visual de confidence (verde/laranja/cinza)
- [x] Botão exportar CSV
- [x] Validação de input no formulário (estilo Pydantic)
- [ ] App testado em iOS **e** Android — Fase 4
