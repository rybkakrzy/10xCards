# 10xCards - Nauka Języka Hiszpańskiego

Aplikacja internetowa do nauki języka hiszpańskiego z wykorzystaniem fiszek generowanych przez AI i systemu powtórek (Spaced Repetition).

## Tech Stack

- [Astro](https://astro.build/) v5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4 - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service (PostgreSQL + Auth)
- [OpenRouter.ai](https://openrouter.ai/) - AI models API for flashcard generation

## Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

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

3. Create `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Configure your environment variables:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase anon/public key
   - `OPENROUTER_API_KEY` - Your OpenRouter API key

5. Run the development server:

```bash
npm run dev
```

6. Build for production:

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```md
.
├── src/
│   ├── layouts/    # Astro layouts
│   ├── pages/      # Astro pages
│   │   └── api/    # API endpoints
│   ├── components/ # UI components (Astro & React)
│   ├── db/         # Supabase clients and types
│   ├── lib/        # Services and helpers
│   ├── types.ts    # Shared types
│   └── assets/     # Static assets
├── public/         # Public assets
└── .ai/            # AI configuration and documentation
```

## Features

- 🤖 **AI-Powered Flashcard Generation** - Generate flashcards from Spanish text using AI
- 📚 **Manual Flashcard Creation** - Create and edit flashcards manually
- 🔄 **Spaced Repetition System** - Leitner box algorithm for effective learning
- 👤 **User Authentication** - Secure login and registration via Supabase
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Built with Tailwind CSS 4 and Shadcn/ui components

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

## License

MIT
