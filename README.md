# Maze Séries

Aplicativo **React Native com Expo e JavaScript** que consulta a API pública TVmaze. A tela inicial mostra séries em uma `FlatList` de duas colunas. Ao tocar em uma capa, o Stack Navigator abre o detalhe com o nome da série e uma `FlatList` de episódios.

## Executar

Instale o **Node.js 22.13 ou superior** e o aplicativo Expo Go no celular. Não é necessário cadastrar uma chave de API.

Abra o terminal na pasta que contém `package.json` e execute:

```bash
npm ci
npm start
```

Com o computador e o celular na mesma rede Wi-Fi, abra o QR Code no Expo Go. No Android, use o leitor do Expo Go; no iPhone, use a câmera. O projeto usa Expo SDK 57. Se o Expo Go indicar incompatibilidade de SDK, consulte as orientações oficiais de atualização e a versão compatível do Expo Go.

Para executar no navegador:

```bash
npm run web
```

Para abrir em um emulador Android já instalado e iniciado:

```bash
npm run android
```

O script `npm run ios` requer macOS e um simulador iOS configurado.

## Telas

| Tela    | Conteúdo                                                                             |
| ------- | ------------------------------------------------------------------------------------ |
| Início  | Capa e nome de cada série; gêneros quando disponíveis.                               |
| Detalhe | Nome da série; temporada, número e nome de cada episódio; duração quando disponível. |

As duas telas exibem indicador de carregamento, mensagem de erro, botão **Tentar novamente** e mensagem para listas vazias. Imagens ausentes ou indisponíveis recebem um espaço reservado.

## Onde cada requisito está implementado

| Requisito                           | Arquivo e implementação                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Stack Navigation                    | `App.js`: `NavigationContainer` e `createNativeStackNavigator`, de `@react-navigation/native-stack`.    |
| Listagem com `FlatList`             | `src/screens/HomeScreen.js`.                                                                            |
| Episódios com `FlatList`            | `src/screens/DetailsScreen.js`.                                                                         |
| `useState`                          | As duas telas mantêm dados, carregamento, erro e tentativa de consulta.                                 |
| `fetch` dentro de `useEffect`       | Cada tela declara e executa sua função `async` dentro do efeito.                                        |
| `async/await` e `try/catch/finally` | As duas funções de carregamento verificam o HTTP, leem o JSON, tratam falhas e encerram o carregamento. |
| `ActivityIndicator` nas duas telas  | Componente compartilhado `src/components/RequestState.js`.                                              |
| ID enviado por navegação            | `HomeScreen.js`: `navigation.navigate('Detalhes', { id: item.id, ... })`.                               |
| `route.params` e template literal   | `DetailsScreen.js`: recebe `id` e consulta `https://api.tvmaze.com/shows/${id}/episodes`.               |
| Valores `null`                      | `ShowPoster.js` trata `image`; as telas usam `??` e valores alternativos para campos opcionais.         |
| `.gitignore`                        | Exclui `node_modules`, cache do Expo, exportações e relatórios de teste.                                |

## Organização

| Caminho                           | Responsabilidade                                          |
| --------------------------------- | --------------------------------------------------------- |
| `App.js`                          | Configuração da navegação e tema do Stack.                |
| `index.js`                        | Registro do aplicativo no Expo.                           |
| `src/screens/`                    | Telas de séries e episódios.                              |
| `src/components/`                 | Capa e estados de carregamento/erro reutilizáveis.        |
| `src/utils/requestError.js`       | Mensagens para erros de rede, timeout e demais falhas.    |
| `src/theme.js`                    | Paleta de cores compartilhada.                            |
| `tests/app.spec.js`               | Testes de interface com Playwright e respostas simuladas. |
| `scripts/capture-screenshots.cjs` | Capturas da execução Web com a API real.                  |
| `screenshots/`                    | Os dois prints em PNG.                                    |
| `docs/VALIDACAO.md`               | Registro dos testes e limites da validação.               |

## Fluxo dos dados

1. A tela inicial monta e seu `useEffect` executa `fetch('https://api.tvmaze.com/shows')`.
2. O JSON retornado é armazenado com `setShows` e renderizado pela `FlatList`.
3. O toque envia `id`, nome, imagem e gêneros para o detalhe por parâmetros de navegação.
4. O detalhe recebe o ID em `route.params` e consulta os episódios com uma template literal.
5. A segunda `FlatList` apresenta temporada, número e nome de cada episódio.

Cada consulta tem timeout de 15 segundos. A limpeza do efeito cancela a requisição e evita atualizar estado após a desmontagem. O botão de nova tentativa altera um estado incluído nas dependências do efeito, disparando outra consulta.

O endpoint `/shows` retorna uma página do catálogo. O aplicativo apresenta a resposta solicitada pelo enunciado; não implementa paginação adicional.

## Verificar

```bash
npm run check
npx playwright install chromium
npm run test:web
```

Os testes iniciam o servidor Expo Web automaticamente quando necessário. Usam respostas simuladas para testar falhas de forma reproduzível. As capturas incluídas foram feitas separadamente com a API real.

Para exportar os bundles para Android, iOS e Web:

```bash
npm run export
```

Essa exportação verifica o empacotamento JavaScript; não gera um APK nem substitui um teste em dispositivo.

## Prints

As imagens incluídas são capturas reais do **Expo Web**, com viewport de 390 × 844 e escala 2. Não são prints de Android ou iOS.

- `screenshots/01-inicio-expo-web.png`: listagem com capas e nomes.
- `screenshots/02-detalhe-expo-web.png`: detalhe da série com seus episódios.

Para refazer essas capturas, execute `npm run web -- --port 8081` em um terminal e `npm run prints` em outro. É necessário instalar o Chromium do Playwright com o comando indicado acima e ter acesso à internet.

Se a disciplina exigir prints do aplicativo nativo, abra o projeto no Expo Go, capture a listagem, toque em uma série e capture o detalhe. Envie essas duas imagens no Teams.

## Repositório e histórico

O projeto está publicado em [ArthurBerthi505/tvmaze-series](https://github.com/ArthurBerthi505/tvmaze-series).

Para obter o projeto com o histórico de commits:

```bash
git clone https://github.com/ArthurBerthi505/tvmaze-series.git
cd tvmaze-series
```

Em seguida, execute `npm ci` e `npm start`, conforme as instruções acima.

As quatro etapas do desenvolvimento foram publicadas em commits separados, após o commit inicial criado pelo GitHub. A publicação pela integração gera novos identificadores de commit, mantendo o conteúdo de cada etapa.

O ZIP disponibilizado junto à entrega contém a pasta `.git` com o histórico local original. O ZIP baixado pelo botão **Code** do GitHub contém os arquivos; use `git clone` para obter também o histórico publicado.

Configure sua identidade para seus próximos commits:

```bash
git config user.name "SEU NOME"
git config user.email "SEU EMAIL DO GITHUB"
```

## Entrega no Teams

1. Revise o código, execute o aplicativo e confirme os critérios da disciplina.
2. Abra o repositório público e confira se os arquivos e commits aparecem.
3. Anexe o link do repositório e os dois prints solicitados.

Este projeto foi produzido com auxílio de IA. O enunciado informado prevê possíveis descontos por esse uso; siga as regras da disciplina e compreenda o código antes de entregar.

## Referências e créditos

- [TVmaze API](https://www.tvmaze.com/api): dados de séries e episódios, disponibilizados pela TVmaze sob CC BY-SA. As capas pertencem aos respectivos titulares.
- [Criar um projeto Expo](https://docs.expo.dev/get-started/create-a-project/).
- [Compatibilidade e atualização do Expo](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).
- [Instalação do React Navigation](https://reactnavigation.org/docs/getting-started/).
- [Native Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator/).
