# Registro de validação

Validação realizada em 21/10/2026. O código usa Expo SDK 57, React Native 0.86 e React Navigation Native Stack 7.

## Resultados

| Verificação                                      | Resultado                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Compatibilidade de dependências: `npm run check` | Aprovada: dependências compatíveis com o SDK.                                      |
| Exportação Android, iOS e Web: `npm run export`  | Aprovada: os três bundles foram gerados.                                           |
| Testes de interface na versão Web                | 10 testes aprovados.                                                               |
| Consulta real de séries                          | HTTP 200; 240 séries recebidas.                                                    |
| Consulta real dos episódios da série selecionada | HTTP 200; 39 episódios de Under the Dome.                                          |
| Capturas                                         | Duas imagens reais, conferidas visualmente, com capas, nomes e episódios legíveis. |

## Cenários dos testes de interface

1. Lista as séries, envia o ID correto para a consulta de episódios e permite voltar pelo cabeçalho.
2. Exibe mensagem e `ActivityIndicator` durante o carregamento da listagem.
3. Exibe mensagem e `ActivityIndicator` durante o carregamento do detalhe.
4. Trata HTTP 500 na listagem e se recupera ao tentar novamente.
5. Trata HTTP 503 nos episódios e se recupera ao tentar novamente.
6. Exibe mensagem em caso de falha de conexão.
7. Trata resposta com formato inesperado.
8. Trata imagem, gêneros e campos opcionais de episódios com valores nulos.
9. Apresenta mensagem para uma lista de séries vazia.
10. Apresenta mensagem para uma série sem episódios.

Os testes automatizados interceptam as duas rotas da API com dados de teste. Isso permite exercitar falhas e valores nulos sem depender da disponibilidade da TVmaze. As duas capturas foram feitas em uma execução separada, sem interceptar ou substituir as respostas da API.

## Ambiente e limites

- As capturas usam a exportação Web do mesmo aplicativo React Native, executada em Chromium, com viewport de 390 × 844 e escala 2; cada PNG tem 780 × 1688 pixels.
- Para a validação automatizada neste ambiente, foi utilizado um servidor local da exportação Web e uma configuração local de Chromium. O projeto inclui a configuração padrão para testar com Expo Web.
- Não houve execução em celular, emulador Android ou simulador iOS. A geração dos bundles verifica o empacotamento, mas não comprova execução nativa.
- Não foi gerado APK ou IPA, e a publicação no GitHub depende da conexão com a conta que receberá o repositório.
- O timeout de 15 segundos está implementado, mas não foi exercitado pelos testes automatizados.

Antes da entrega, abra o projeto no Expo Go e confirme o toque em uma série, o carregamento dos episódios e o retorno à listagem. Se forem exigidos prints nativos, capture as duas telas no próprio dispositivo.
