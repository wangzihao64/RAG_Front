# AMemoryI

AMemoryI is the frontend of a Retrieval-Augmented Generation (RAG) knowledge-base application. It helps users upload documents, organize them into personal knowledge collections, and ask questions in natural language. Answers are generated from the user's own documents with cited sources.

## Features

- **Landing page** with product introduction, FAQ, and a typewriter-style "Enter Knowledge Base" button.
- **User authentication** (login / register) backed by JWT tokens.
- **Personal knowledge collections** with create, edit, and delete support.
- **Document management** inside each collection, including upload and deletion.
- **Document preview** supporting text, images, PDFs, and downloads for unsupported formats.
- **AI chat** grounded in selected knowledge collections, with streaming responses and source references.
- **Collapsible panels** for knowledge collections, document list, and document preview.

## Tech Stack

- [Next.js](https://nextjs.org) 16 App Router
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file at the project root and set the backend API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
```

If this variable is not set, the frontend will default to `http://127.0.0.1:8080`.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for production

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## Project Structure

```
app/
├── api/              # Next.js API routes that proxy requests to the backend
├── components/       # Reusable React components
├── knowledge/        # Knowledge base workspace page
├── login/            # Login page
├── register/         # Register page
├── lib/              # Utility functions (auth helpers, etc.)
├── page.tsx          # Landing page
└── layout.tsx        # Root layout
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
