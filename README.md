# SynthChat

A TypeScript application that generates synthetic chat data for in-house legal teams, specifically focusing on privacy and commercial contracts. The application analyzes the generated data and creates formatted emails using React-Email to provide qualitative insights into what legal team members are asking about and time saved.

## Project Overview

SynthChat generates realistic synthetic chat interactions to measure the value of AI usage for legal teams in terms of time saved and key takeaways. This enables analysis without using actual user chat data.

### Features

- Generate 10 synthetic privacy lawyer chats
- Generate 10 synthetic commercial contracts lawyer chats
- Analyze chat data for insights (topics, time saved, patterns)
- Generate formatted emails with insights using React-Email
- Calculate estimated time savings

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Architecture

- **API Routes**: `/api/generate-and-analyze` - Generates chats and analyzes insights
- **LLM Integration**: Uses Anthropic Claude for chat generation
- **Analysis**: Extracts topics, FAQs, and calculates time savings
- **Email**: React-Email templates for formatted reports
- **UI**: Next.js App Router with TypeScript and Tailwind CSS
