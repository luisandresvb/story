# Historias Interactivas

Aplicación web creada con React, TypeScript y Tailwind CSS que utiliza OpenAI Responses (GPT-4.1/4o) e Imágenes (DALL·E 3) para componer relatos ilustrados con decisiones interactivas.

## Requisitos

- Node.js 18+
- Clave de API de OpenAI en la variable de entorno `OPENAI_API_KEY`

## Instalación

```bash
npm install
```

Crea un archivo `.env` con tu clave:

```
OPENAI_API_KEY=sk-...
```

## Desarrollo

Ejecuta cliente y servidor en paralelo:

```bash
npm run dev
```

- Cliente Vite: http://localhost:5173
- API Express: http://localhost:8787

## Scripts adicionales

- `npm run build`: genera la versión de producción del frontend.
- `npm run preview`: sirve el build localmente.

## Flujo principal

1. Onboarding para idioma, rango de edad, género y tema.
2. Sugerencias de tramas generadas con GPT.
3. Configuración opcional de personajes con rasgos y pistas visuales.
4. Generación de la primera página (texto + imagen) con gancho final.
5. Creación en segundo plano de dos continuaciones posibles, cada una con texto resumido e imagen miniatura.
6. Selección de caminos, manteniendo coherencia narrativa y visual.

El estado completo de la historia se puede exportar e importar en formato JSON.
