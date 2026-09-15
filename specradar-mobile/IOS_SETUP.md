# SpecRadar — execução no iOS (macOS)

Este projeto já usa React Native + Expo Router e é multiplataforma. Não foi necessário reescrever as telas em Swift/SwiftUI.

## O que foi ajustado nesta cópia

- `ios.bundleIdentifier`: `com.dallaisa.specradar`
- `ios.buildNumber`: `1`
- sombra da barra de navegação adaptada para propriedades nativas de iOS/Android, pois o projeto está com `newArchEnabled: false`.

## Requisitos no Mac

1. Instale o **Xcode** pela App Store.
2. Abra o Xcode uma vez e aceite os termos.
3. Em **Xcode > Settings > Locations**, selecione a versão atual em **Command Line Tools**.
4. Em **Xcode > Settings > Components**, instale uma versão do **iOS Simulator**.
5. Instale o Node.js (recomendado: versão LTS).
6. Para Expo SDK 55, é recomendado instalar Watchman:

```bash
brew update
brew install watchman
```

## Rodar do jeito mais simples — Expo Go no simulador

No Terminal:

```bash
cd /caminho/para/SpecRadar-iOS-ready
npm install
npx expo start
```

Quando aparecer o menu do Expo, pressione:

```text
i
```

Isso abre o app no iOS Simulator. Para escolher manualmente um modelo de iPhone, use `Shift + i`.

Você também pode iniciar diretamente com:

```bash
npm run ios
```

## Rodar como aplicativo iOS nativo local

Se você quiser gerar o projeto nativo `ios/` e compilar pelo Xcode:

```bash
npm install
npx expo run:ios
```

O Expo gera a pasta `ios/`, compila o app e instala no iOS Simulator.

Depois disso, para abrir o projeto nativo no Xcode:

```bash
xed ios
```

## Login de demonstração

```text
E-mail: admin@spec.com
Senha: 123456
```

Como `EXPO_PUBLIC_API_BASE_URL` não está definido, o projeto usa os mocks locais já existentes no código. Isso é ótimo para demonstrar o app sem depender de backend.

## Se o simulador não abrir

Abra manualmente:

```bash
open -a Simulator
```

Depois rode novamente:

```bash
npx expo start
```

E pressione `i`.

## Observação sobre iPhone físico

Para testar em um iPhone real, o fluxo pode exigir configuração de assinatura/desenvolvimento Apple. Para o **iOS Simulator no Mac**, você pode desenvolver e testar sem publicar na App Store.
