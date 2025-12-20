# How to Run the Meme Generator Project

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Environment Setup

1. Create a `.env.local` file in the project root with the following variables:

```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

```bash
# Navigate to project directory
cd meme-generator

# Install dependencies
npm install
```

## Running the Project

### Development Mode

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### Production Build

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Features

- **AI Image Generation** - Generate meme backgrounds using AI
- **Telugu & English Memes** - Switch between languages for meme suggestions
- **Upload/URL Background** - Use your own images
- **Draggable Text Layers** - Add and position text anywhere
- **Social Sharing** - Generate captions and share to Instagram
