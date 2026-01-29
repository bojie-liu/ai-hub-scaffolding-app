# AI Debate Skills Trainer

A web application built with Next.js that helps university students improve their debate and argumentation skills through AI-powered debate sessions.

## Features

- **Create Debates**: Set up custom debate topics with specific stances for the AI to defend
- **AI Chatbot**: Engage with an AI that takes strong positions on controversial topics
- **Debate History**: Review past debates and conversation history
- **Persistent Storage**: All debates and messages saved to SQLite database

## Tech Stack

- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: SQLite with Drizzle ORM
- **AI**: OpenAI GPT API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ai-hub-scaffolding-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Edit `.env.local` and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_API_URL=https://api.openai.com/v1
DATABASE_URL=./sqlite.db
```

4. **Run database migrations** (already done during setup)

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Debate

1. Click **"Create Debate"** on the home page
2. Enter a debate topic (e.g., "AI should replace teachers")
3. Specify the AI's stance (e.g., "Strongly in favor")
4. Optionally add context or specific angles to explore
5. Click **"Start Debate"** to begin

### Engaging in Debate

1. The AI will respond to your arguments with counterpoints
2. Type your arguments in the text area
3. Press Enter to send (Shift+Enter for new lines)
4. The AI uses the system prompt to take a strong ethical stance
5. All messages are saved automatically

### Viewing History

1. Click **"Browse Debates"** on the home page
2. See all your past debates organized by date
3. Click any debate card to continue the conversation

## Project Structure

```
/app
  /api
    /debates          # Debate CRUD endpoints
    /chat             # Chat with OpenAI endpoint
  /debates
    /[id]             # Individual debate chat page
    /new              # Create new debate page
    page.tsx          # Debate history list
  layout.tsx          # Root layout
  page.tsx            # Home page
/components
  /debate             # Debate-related components
  /ui                 # shadcn/ui components
/lib
  /db                 # Database schema and client
  /openai             # OpenAI client and prompts
  /types              # TypeScript types
drizzle/              # Database migrations
```

## Database Schema

### debates

- `id`: Unique debate identifier
- `topic`: Debate topic
- `stance`: AI's position (pro/con)
- `description`: Additional context
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### messages

- `id`: Unique message identifier
- `debateId`: Foreign key to debates
- `role`: 'user' or 'assistant'
- `content`: Message text
- `createdAt`: Creation timestamp

## API Routes

- `GET /api/debates` - List all debates
- `POST /api/debates` - Create new debate
- `GET /api/debates/[id]` - Get debate details
- `DELETE /api/debates/[id]` - Delete debate
- `GET /api/debates/[id]/messages` - Get all messages
- `POST /api/chat` - Send message and get AI response

## Customization

### Changing the AI Model

Edit `app/api/chat/route.ts`:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview', // Change to gpt-3.5-turbo for lower cost
  // ...
});
```

### Modifying the System Prompt

Edit `lib/openai/client.ts` to customize how the AI behaves:

```typescript
export function buildSystemPrompt(topic: string, stance: string): string {
  return `Your custom system prompt here...`;
}
```

### Upgrading to PostgreSQL

For production deployments, you can switch from SQLite to PostgreSQL:

1. Install PostgreSQL driver: `npm install postgres`
2. Update `lib/db/index.ts` to use PostgreSQL connection
3. Update `drizzle.config.ts` dialect to 'postgresql'
4. Update DATABASE_URL in `.env.local`

## Building for Production

```bash
npm run build
npm start
```

## Deploying to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables (OPENAI_API_KEY, OPENAI_API_URL)
4. For SQLite, consider upgrading to PostgreSQL (Vercel Postgres)
5. Deploy!

## Future Enhancements

- User authentication
- Debate scoring and feedback
- Export debates as PDF
- Voice input/output
- Multi-turn argument tracking
- Debate statistics and analytics

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
