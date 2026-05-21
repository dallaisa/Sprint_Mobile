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

### ✅ Fase 0 — Inicialização do projeto (concluída em 2026-05-17)
- Projeto Expo criado com `create-expo-app` (template blank-typescript)
- Atualizado para **Expo SDK 55** (55.0.24) + React Native 0.81.5
- `expo-router ~55.0.14`, `@react-native-async-storage/async-storage 2.2.0`, `@expo/vector-icons` instalados
- `package.json` → `main: "expo-router/entry"`
- `app.json` → `scheme: "specradar"`, `userInterfaceStyle: "automatic"`, nome "SpecRadar"
- `tsconfig.json` → `paths: { "@/*": ["./*"] }` para imports absolutos
- Boilerplate removido (`App.tsx`, `index.ts`, `AGENTS.md`)
- Estrutura de pastas criada: `app/(tabs)/`, `app/ficha/`, `src/api/mocks/`, `src/components/`, `src/hooks/`, `src/storage/`, `src/theme/`, `src/types/`

### ✅ Fase 1 — Setup (concluída em 2026-05-17)
- `src/types/spec.ts` — tipos `SpecQuery`, `SpecResponse`, `SpecField`, `Confidence`, `ApiError`
- `src/theme/colors.ts` — paleta Ford + `ATRIBUTOS_PADRAO`
- `src/api/client.ts` — fetch wrapper, timeout 15s via AbortController, toggle mock automático (`EXPO_PUBLIC_API_BASE_URL` vazio = mock)
- `src/api/mocks/ranger-raptor.ts` — mock completo com 13 atributos, confidence, fonte e verificado_em
- `src/storage/history.ts` — AsyncStorage, máx 10, dedupe por id
- `src/hooks/useSpecQuery.ts` — loading/error/data + auto-save no histórico
- `app/_layout.tsx` — Stack root com rota `ficha/[id]`
- `app/(tabs)/_layout.tsx` — 4 tabs com ícones MaterialIcons, initialRouteName="chat"
- `app/(tabs)/chat.tsx` — consulta por texto livre (parser: 1ª palavra=marca, resto=modelo), ficha inline
- `app/(tabs)/formulario.tsx` — campos validados (regex marca, 2-80 chars modelo/versão), chips de atributos, ficha inline
- `app/(tabs)/historico.tsx` — placeholder (Fase 3)
- `app/(tabs)/comparar.tsx` — placeholder (Fase 3)
- `app/ficha/[id].tsx` — rota dinâmica, placeholder (Fase 3)
- `hooks/use-color-scheme.ts` + `.web.ts` — normaliza `'unspecified'` do RN 0.83 → `'light' | 'dark'`
- `components/ui/icon-symbol.tsx` — mapeia SF Symbols → MaterialIcons
- **TypeScript: 0 erros** em todos os arquivos

> ⚠️ **npm install:** usar `--legacy-peer-deps` se houver conflito (react-dom vs react 19.1.0)

### ✅ Fase 2 — Componentes reutilizáveis (concluída em 2026-05-18)
- `src/components/ConfidenceBadge.tsx` — badge verde/laranja/cinza por nível de confiança
- `src/components/LoadingSpinner.tsx` — spinner com mensagem durante fetch
- `src/components/ErrorMessage.tsx` — caixa de erro em PT-BR + botão "Tentar novamente"
- `src/components/SpecCard.tsx` — ficha técnica completa + botão **Exportar CSV** (Share API nativa)
- `chat.tsx` e `formulario.tsx` já usam os componentes

### ✅ Fase 3 — Comparação + Histórico (concluída em 2026-05-18)
- `app/(tabs)/historico.tsx` — lista ≤10 do AsyncStorage, `useFocusEffect` p/ recarregar, seleção de 2 para comparar, estado vazio
- `app/(tabs)/comparar.tsx` — tabela lado a lado, células verdes para vencedor por atributo (lógica: maior é melhor para potencia/torque/consumo/carga; menor é melhor para peso/preço), estado vazio
- `app/ficha/[id].tsx` — rota dinâmica carrega spec do histórico, exibe `SpecCard`
- **Fluxo de comparação:** Histórico → toque "Comparar" no 1º veículo (marca azul "✓ 1º") → toque em outro → navega para aba Comparar com params `v1` e `v2`

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
- [x] 4 tabs como rotas do Expo Router (com ícones MaterialIcons)
- [x] `useState` para `data/loading/error` em cada tela de consulta (`useSpecQuery`)
- [x] Loading spinner durante chamada (inline em chat.tsx e formulario.tsx; componente dedicado na Fase 2)
- [x] Mensagem de erro amigável (404, timeout, etc) — inline; componente `ErrorMessage` na Fase 2
- [x] Timeout 15s com feedback (AbortController em `client.ts`)
- [x] AsyncStorage com últimas 10 (diferencial avaliativo — `storage/history.ts` + auto-save no hook)
- [x] Tela offline funcionando — UI do histórico (Fase 3)
- [x] Tela comparação lado a lado com células verdes — Fase 3
- [x] Indicador visual de confidence (verde/laranja/cinza) — inline; `ConfidenceBadge` na Fase 2
- [x] Botão exportar CSV — `SpecCard` na Fase 2 (Share API)
- [x] Validação de input no formulário (regex marca, 2-80 chars modelo/versão, chips atributos)
- [ ] App testado em iOS **e** Android — Fase 4
