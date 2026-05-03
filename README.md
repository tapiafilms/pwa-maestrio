# Chasquilla MVP

Production-ready MVP for a service marketplace that connects clients with technicians via WhatsApp.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (DB + JS client)
- OpenAI API (problem classification)
- Twilio WhatsApp API (send + receive)

## Project Structure

```txt
/app
  /api
    /classify
    /lead
    /webhook/whatsapp
/components
/lib
/services
/types
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy envs:

```bash
cp .env.local.example .env.local
```

3. Fill `.env.local`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
OPENAI_API_KEY=
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

4. Create DB tables:
   - Open Supabase SQL Editor
   - Run `supabase/schema.sql`

5. Run app:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Twilio Webhook

Configure your Twilio WhatsApp Sandbox/Webhook URL to:

`POST https://<your-domain>/api/webhook/whatsapp`

For local development, use a tunnel (for example ngrok):

```bash
ngrok http 3000
```

## API Endpoints

- `POST /api/classify`
  - input: `{ "message": "..." }`
  - output: `{ "category": "...", "urgency": "low|medium|high" }`

- `POST /api/lead`
  - input: `{ "message": "...", "phone": "+51..." }`
  - flow:
    1. classify with OpenAI
    2. store lead in Supabase
    3. find 2-3 technicians
    4. notify by WhatsApp

- `POST /api/webhook/whatsapp`
  - consumes Twilio inbound message (`From`, `Body`)
  - if `Body === YES`: attempts atomic assignment (first reply wins)

## First-To-Win Logic

- Each technician invited for a lead gets a `lead_offers` row (`pending`)
- Webhook gets technician `YES`
- Service finds latest pending offer for that technician
- Atomic update on `leads` row with filters:
  - `status = searching`
  - `technician_id IS NULL`
- Only one request can update successfully
- Winner gets client number, client gets winner technician number

## Notes

- Keep technician phones in E.164 format (e.g. `+51999999999`)
- Twilio payload includes `From` like `whatsapp:+51999999999`; code normalizes this automatically
