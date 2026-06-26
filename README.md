# SWAP UMinho

Projeto desenvolvido no âmbito da Unidade Curricular de **Interface Pessoa-Máquina (IPM)**.

## Grupo 15

Aluno1: Pedro Gomes | A104540  
Aluno2: Pedro Teixeira | A103998  
Aluno3: Diogo Fernandes | A104260  
Aluno4: Jorge Fernandes | A104168  
Aluno5: André Ribeiro | A104436  

Figma Link: https://www.figma.com/design/QtOo9RBuAG7KWXqieMuv35/IPM-Project?node-id=0-1&t=t349c5O8YCoFVjBL-1

## SWAP UMinho - Plataforma de Gestão de Turnos

Aplicação web em **Nuxt 3 + Vue** para apoiar a gestão de turnos, horários e Unidades Curriculares da Licenciatura em Engenharia Informática. A plataforma disponibiliza interfaces para alunos e para o Diretor de Curso, facilitando a consulta de horários, a gestão de conflitos e a comunicação entre utilizadores.

## Funcionalidades

- Consulta de horários semanais dos alunos
- Gestão de turnos e Unidades Curriculares
- Deteção de conflitos e horários incompletos
- Dashboard com métricas de ocupação dos turnos
- Edição de horários pelo Diretor de Curso
- Sistema de mensagens entre alunos e Diretor de Curso
- Notificações sobre alterações de horários
- Exportação do horário em PDF
- Interface multilingue

## Pré-requisitos

- Node.js
- npm

## Instalação

```bash
git clone <repository-url>
cd trabalho-pr-tico-gp25_23
npm install
```

## Executar a Aplicação

É necessário correr o backend e o frontend em terminais separados.

### 1. Iniciar o backend JSON Server

```bash
npx json-server --watch database/leiDB.json --port 3001
```

O backend fica disponível em:

```bash
http://localhost:3001
```

### 2. Iniciar o frontend Nuxt

```bash
npm run dev
```

A aplicação fica disponível em:

```bash
http://localhost:3000
```

## Build para Produção

```bash
npm run build
npm run preview
```

## Tech Stack

- **Nuxt 3** e **Vue** - frontend
- **Tailwind CSS** - estilos
- **Axios** - comunicação com a API
- **JSON Server** - backend simulado
- **Chart.js** - gráficos e métricas
- **jsPDF** e **html2canvas** - exportação de horários em PDF
- **@nuxtjs/i18n** - suporte multilingue

## Estrutura do Projeto

```bash
components/     # Componentes da aplicação
pages/          # Páginas principais
layouts/        # Layouts da aplicação
middleware/     # Middleware de autenticação
plugins/        # Configuração de plugins, como Axios
composables/    # Funções reutilizáveis
config/         # Ficheiros de configuração

database/
└── leiDB.json  # Base de dados simulada

i18n/lang/      # Ficheiros de tradução
```
