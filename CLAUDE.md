# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EZTools is a developer tools aggregator website built with Next.js 16 (App Router), React 19, Tailwind CSS 4, and TypeScript. It features a bento-style dashboard UI, internationalization (English/Vietnamese), dark/light theme support, and a scalable tool registration system.

## Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Create production build
npm start            # Start production server
npm run lint         # Run ESLint
```

## Architecture Overview

### Folder Structure
```
eztools/
├── app/[locale]/          # i18n-aware App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage (dashboard)
│   └── tools/[toolSlug]/  # Dynamic tool pages
├── components/
│   ├── layout/            # Sidebar, Header, ThemeToggle
│   ├── dashboard/         # Hero, SearchBar, BentoGrid, BentoCard
│   ├── tools/             # ToolLayout, BackLink, TwoPanel
│   ├── ui/                # Button, Icon, Badge (primitives)
│   └── providers/         # ThemeProvider, Providers
├── tools/                 # Tool implementations
│   ├── types.ts           # Tool metadata types
│   ├── registry.ts        # Central tool registry
│   └── [tool-name]/       # Individual tool folders
├── config/                # Categories, navigation, site config
├── i18n/                  # next-intl routing, request, navigation
├── messages/              # Translation files (en.json, vi.json)
├── lib/                   # Utilities, hooks
└── styles/                # Design tokens (tokens.css)
```

### Key Systems

**Tool Registration System** (`tools/registry.ts`):
- Tools are registered via metadata configs
- Each tool has: slug, category, icon, i18nKey, gridSize, isPro, etc.
- Dynamic imports for lazy loading
- Add new tools by creating folder + config + importing in registry

**Internationalization** (next-intl):
- URL structure: `/[locale]/tools/[toolSlug]` (e.g., `/en/tools/json-formatter`)
- Supported locales: English (`en`), Vietnamese (`vi`)
- Translations in `messages/` folder
- Use `useTranslations()` hook in components

**Theme System**:
- Modes: `light`, `dark`, `system`
- Uses `useSyncExternalStore` for proper hydration
- CSS variables in `styles/tokens.css`
- Persisted in localStorage

### Adding a New Tool

1. Create folder `tools/[tool-name]/`
2. Create `index.tsx` (tool component)
3. Add tool config to `tools/registry.ts`:
   ```typescript
   {
     slug: 'tool-name',
     i18nKey: 'toolName',
     category: 'developers',
     icon: 'IconName',
     gridSize: 'medium',
     // ... other config
     component: () => import('./tool-name'),
   }
   ```
4. Add translations to `messages/en.json` and `messages/vi.json`:
   ```json
   "tools": {
     "toolName": {
       "title": "Tool Name",
       "description": "Tool description"
     }
   }
   ```

### Path Aliases

- `@/*` maps to project root
- Example: `import { Button } from '@/components/ui/Button'`

### Design Tokens

All colors, shadows, radii, and spacing are defined as CSS variables in `styles/tokens.css`. Both light and dark mode variants are supported using the `.dark` class.

### Categories

Defined in `config/categories.ts`:
- qr-code, developers, network, design, text, image

### Current Tools

- JSON Formatter (`/tools/json-formatter`)
- UUID Generator (`/tools/uuid-generator`)
- HTTP Client (`/tools/http-client`)
- VietQR Generator (`/tools/vietqr-generator`)
