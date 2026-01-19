# 10xCards - Nauka Języka Hiszpańskiego

Aplikacja internetowa do nauki języka hiszpańskiego z wykorzystaniem fiszek generowanych przez AI i systemu powtórek (Spaced Repetition).

## Tech Stack

### Frontend & Backend
- [Astro](https://astro.build/) v5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19 - UI library for interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4 - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service (PostgreSQL + Auth)
- [Shadcn/ui](https://ui.shadcn.com/) - UI component library
- [OpenRouter.ai](https://openrouter.ai/) - AI models API for flashcard generation

### Testing
- [Vitest](https://vitest.dev/) v4.0+ - Unit and integration testing framework
- [Playwright](https://playwright.dev/) v1.56+ - End-to-end testing framework
- [@testing-library/react](https://testing-library.com/react) v16.3+ - React component testing utilities
- [@axe-core/playwright](https://github.com/dequelabs/axe-core) v4.11+ - Accessibility testing

## Prerequisites

- Node.js v22+ (recommended: v22.14.0 as specified in `.nvmrc`)
- npm (comes with Node.js)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-username/10xCards.git
cd 10xCards
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example file
cp .env.example .env

# For local development with Supabase CLI:
npx supabase start

# This will output credentials - update .env with:
# - API URL as PUBLIC_SUPABASE_URL
# - anon key as PUBLIC_SUPABASE_ANON_KEY
```

4. Run database migrations:

```bash
npx supabase db reset
```

5. Run the development server:

```bash
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run E2E tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:e2e:codegen` - Generate E2E tests
- `npm run dev:e2e` - Run dev server for E2E tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npx astro check` - Check for TypeScript errors

## Project Structure

```md
.
├── src/
│   ├── layouts/         # Astro layouts
│   ├── pages/           # Astro pages (routes)
│   │   └── api/         # API endpoints
│   ├── components/      # UI components (Astro & React)
│   │   ├── ui/          # Shadcn/ui components
│   │   ├── home/        # Home page components
│   │   └── hooks/       # React custom hooks
│   ├── lib/             # Services and utilities
│   │   └── services/    # Business logic services
│   ├── db/              # Supabase client and types
│   ├── middleware/      # Astro middleware (auth)
│   ├── styles/          # Global styles
│   └── types.ts         # Shared TypeScript types
├── supabase/
│   ├── migrations/      # Database migrations
│   └── config.toml      # Supabase configuration
├── tests/               # Test files and documentation
├── public/              # Static assets
└── .ai/                 # AI configuration and documentation
```

## Environment Variables

This project uses Astro's environment variable system. Variables prefixed with `PUBLIC_` are exposed to the client-side code.

**Required variables** (in `.env`):

```bash
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENROUTER_API_KEY=your-openrouter-api-key
```

> ⚠️ **Important**: The `PUBLIC_` prefix makes these variables available in browser JavaScript. This is safe for the Supabase URL and anon key, as they are designed to be public. Never use this prefix for secrets like API keys or service role keys!

## Features

- 🤖 **AI-Powered Flashcard Generation** - Generate flashcards from Spanish text using AI
- 📚 **Manual Flashcard Creation** - Create and edit flashcards manually
- 🔄 **Spaced Repetition System** - Leitner box algorithm for effective learning
- 👤 **User Authentication** - Secure login and registration via Supabase
- ⚙️ **User Settings** - Customize AI difficulty level and preferences
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🎨 **Modern UI** - Built with Tailwind CSS 4 and Shadcn/ui components
- ♿ **Accessible** - ARIA labels, keyboard navigation, screen reader support

## Testing

This project includes comprehensive testing infrastructure:

### Running Tests

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

### Test Structure

- `tests/unit/` - Unit tests for services, hooks, and utilities
- `tests/integration/` - API endpoint and database tests
- `tests/e2e/` - End-to-end user journey tests
- `tests/fixtures/` - Test data and mocks

## Development

### Supabase Local Development

```bash
# Start local Supabase instance
npx supabase start

# Stop local instance
npx supabase stop

# Reset database (apply all migrations)
npx supabase db reset

# Create a new migration
npx supabase migration new migration_name
```

### Type Generation

After making changes to the database schema:

```bash
npx supabase gen types typescript --local > src/db/database.types.ts
```

### Code Quality

```bash
# Check TypeScript errors
npx astro check

# Check for errors and warnings only
npx astro check --minimumSeverity warning
```

## AI Development Support

This project is configured with AI development tools to enhance the development experience, providing guidelines for:

- Project structure
- Coding practices
- Frontend development
- Styling with Tailwind
- Accessibility best practices
- Astro and React guidelines

### Cursor IDE

The project includes AI rules in `.cursor/rules/` directory that help Cursor IDE understand the project structure and provide better code suggestions.

### GitHub Copilot

AI instructions for GitHub Copilot are available in `.github/copilot-instructions.md`

### Windsurf

The `.windsurfrules` file contains AI configuration for Windsurf.

## Contributing

Please follow the AI guidelines and coding practices defined in the AI configuration files when contributing to this project.

## Documentation

Additional project documentation can be found in the `.ai/` directory:
- `prd.md` - Product Requirements Document
- `mvp.md` - MVP Scope and Features
- `tech-stack.md` - Technical Stack Details
- `database-schema.md` - Database Schema
- `api-documentation.md` - API Documentation

## License

MIT
