# SWAP UMinho

Project developed as part of the **Human-Computer Interaction (HCI)** course.

## Group 15

Student 1: Pedro Gomes | A104540  
Student 2: Pedro Teixeira | A103998  
Student 3: Diogo Fernandes | A104260  
Student 4: Jorge Fernandes | A104168  
Student 5: André Ribeiro | A104436  

Figma Link: https://www.figma.com/design/QtOo9RBuAG7KWXqieMuv35/IPM-Project?node-id=0-1&t=t349c5O8YCoFVjBL-1

## SWAP UMinho - Shift Management Platform

Web application developed with **Nuxt 3 + Vue** to support the management of shifts, schedules and Course Units for the Bachelor's Degree in Computer Engineering.

The platform provides interfaces for students and for the Course Director, making it easier to check schedules, manage conflicts and support communication between users.

## Features

- Weekly schedule consultation for students
- Management of shifts and Course Units
- Detection of conflicts and incomplete schedules
- Dashboard with shift occupancy metrics
- Schedule editing by the Course Director
- Messaging system between students and the Course Director
- Notifications about schedule changes
- Schedule export to PDF
- Multilingual interface

## Prerequisites

- Node.js
- npm

## Installation

```bash
git clone <repository-url>
cd trabalho-pr-tico-gp25_23
npm install
```

## Running the Application

The backend and frontend must be run in separate terminals.

### 1. Start the JSON Server backend

```bash
npx json-server --watch database/leiDB.json --port 3001
```

The backend will be available at:

```bash
http://localhost:3001
```

### 2. Start the Nuxt frontend

```bash
npm run dev
```

The application will be available at:

```bash
http://localhost:3000
```

## Production Build

```bash
npm run build
npm run preview
```

## Tech Stack

- **Nuxt 3** and **Vue** - frontend
- **Tailwind CSS** - styling
- **Axios** - API communication
- **JSON Server** - simulated backend
- **Chart.js** - charts and metrics
- **jsPDF** and **html2canvas** - schedule export to PDF
- **@nuxtjs/i18n** - multilingual support

## Project Structure

```bash
components/     # Application components
pages/          # Main pages
layouts/        # Application layouts
middleware/     # Authentication middleware
plugins/        # Plugin configuration, such as Axios
composables/    # Reusable functions
config/         # Configuration files

database/
└── leiDB.json  # Simulated database

i18n/lang/      # Translation files
```

## Note

This is an academic project developed at the University of Minho.
