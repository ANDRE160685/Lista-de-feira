# FeiraApp - Gerenciador de Lista de Feira (React Native)

Um aplicativo simples de gerenciamento de lista de compras (feira) desenvolvido em React Native. Utiliza o padrão MVC (Model-View-Controller) e armazena os dados localmente usando AsyncStorage, além de permitir a exportação do relatório final em formato CSV.

## Tecnologias Utilizadas

* **React Native**
* **React Hooks** (`useState`, `useEffect`)
* **AsyncStorage** (`@react-native-async-storage/async-storage`) - Para persistência de dados.
* **UUID** (`uuid`) - Para gerar identificadores únicos para os itens.
* **Expo Sharing** (`expo-sharing`) e **File System** (`expo-file-system/legacy`) - Para gerar e compartilhar o relatório CSV.

## Estrutura do Projeto

A aplicação segue uma arquitetura baseada em pastas para separar as responsabilidades (Model, View, Controller):

. ├── App.js # Ponto de entrada principal ├── controller/ │ └── ListaController.js # Lógica de negócio, estado e persistência (Controller) ├── model/ │ └── ItemFeira.js # Definição da estrutura e lógica do Item (Model) └── view/ └── ListaScreen.js # Componentes da interface do usuário (View)


## Instalação e Execução

### Pré-requisitos

Certifique-se de ter o Node.js, npm/yarn e o Expo CLI instalados.

### 1. Dependências

Você precisará instalar as seguintes dependências no seu projeto React Native:

```bash
# Dependências principais
npm install @react-native-async-storage/async-storage uuid

# Dependências do Expo para compartilhamento e arquivos
# Nota: expo-file-system/legacy é usado na view
expo install expo-sharing expo-file-system

2. Configuração do UUID

Para evitar um erro comum com o uuid no React Native, é necessário incluir o polyfill no seu arquivo principal (App.js):
JavaScript

import 'react-native-get-random-values'; 
// ...

3. Execução

Inicie o aplicativo com o Expo:
Bash

npx expo start

App.js

Este é o componente raiz, responsável por incluir o polyfill do uuid e renderizar a tela principal.
JavaScript



model/ItemFeira.js

Define a classe ItemFeira, o Model da aplicação. Ele encapsula os dados de um item e a lógica de cálculo (valor total).
JavaScript

controller/ListaController.js

O Controller da aplicação. É um custom hook que gerencia o estado da lista, a persistência via AsyncStorage e expõe as funções de CRUD (Adicionar, Remover, Atualizar) e de Relatório.
JavaScript

view/ListaScreen.js

É o View (interface do usuário) da aplicação, que inclui a tela principal e os componentes modais e de item.

    Cálculo Automático: O valor total de cada item e o total geral da lista são calculados automaticamente.

    Persistência: A lista é salva localmente usando AsyncStorage (os dados persistem entre as sessões).

    Exportação CSV: Possibilidade de visualizar, salvar e compartilhar o relatório completo da lista no formato CSV (padrão brasileiro com vírgula).