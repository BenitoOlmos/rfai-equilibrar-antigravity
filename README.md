# Reprogramación Foca (RFAI) - Clínico Equilibrar

Plataforma web progresiva (PWA) para la gestión del programa clínico "Reprogramación Focalizada de Alto Impacto" para el tratamiento de la Culpa.

## 🏗 Stack Tecnológico

### Frontend
- **Framework:** React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Visualización de Datos:** Recharts
- **Iconografía:** Lucide React

### Backend (Dockerizado)
- **Base de Datos:** PostgreSQL 16 (Alpine)
- **Driver:** `pg` (node-postgres)
- **Identidad:** UUID v4 nativo

## 📂 Estructura del Proyecto

```
/
├── components/         # Componentes React (Dashboards, Modales, UI)
├── database/           # Scripts SQL
│   ├── schema.pg.sql   # Esquema PostgreSQL (UUIDs, Triggers)
│   └── schema.sql      # (Legacy) Esquema MySQL
├── docker-compose.yml  # Orquestación de BD
├── constants.ts        # Datos Mock y configuración estática
├── types.ts            # Definiciones de tipos TypeScript
├── App.tsx             # Componente raíz y enrutamiento lógico
└── index.html          # Punto de entrada (Configurado para Mobile)
```

## 🚀 Despliegue de Base de Datos (Local)

1.  **Levantar el servicio:**
    ```bash
    docker-compose up -d
    ```

2.  **Conexión (DBeaver / TablePlus):**
    - **Host:** localhost
    - **Port:** 5432
    - **Database:** reprogramacion_foca
    - **User:** admin
    - **Password:** secure_password_123

3.  **Gestión de Dependencias (Node.js):**
    Para conectar la aplicación Node.js a esta nueva base de datos, ejecuta:
    ```bash
    npm uninstall mysql2
    npm install pg
    npm install --save-dev @types/pg
    ```

## 🔐 Roles de Usuario

1.  **ADMIN:** Acceso total, gestión de usuarios, configuración global del sistema y servidores.
2.  **COORDINATOR:** Gestión operativa, asignación de pacientes a profesionales, monitoreo de capacidad.
3.  **PROFESSIONAL:** Atención clínica, seguimiento de evolución (tests, audios), agenda de pacientes.
4.  **CLIENT:** Acceso al programa paso a paso (4 semanas), guías interactivas, audios y tests.

## 📱 Optimización Móvil

La aplicación está diseñada con un enfoque "Mobile-First", utilizando Tailwind para breakpoints responsivos y metaetiquetas específicas en `index.html` para simular una experiencia nativa en iOS y Android.
