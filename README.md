# Calendar Split

A React single-page application that displays multiple Google Calendars in side-by-side columns to help coordinate schedules between multiple people.

## Features

- **Multi-Calendar View**: Display calendars for multiple people in side-by-side columns
- **Calendar Aggregation**: Each column can aggregate events from multiple calendar sources
- **Day, Week & Month Views**: Switch between daily, weekly, and monthly calendar views
- **Color-Coded Events**: Events are color-coded by calendar for easy identification
- **Tentative Events**: Toggle visibility of tentative/maybe events
- **Timezone Aware**: Properly handles timezones for event display
- **Current Time Indicator**: Visual indicator showing current time in day/week view
- **Mobile Responsive**: Stacked columns on mobile, side-by-side on desktop
- **Auto-Refresh**: Calendar data automatically refreshes every 5 minutes
- **Secure Authentication**: OAuth 2.0 implicit grant flow (no server-side token storage)

## Prerequisites

- Node.js 18+ and npm
- A Google Cloud Platform account
- One or more Google Calendars to display

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Google Calendar API"
   - Click **Enable**
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Select **Web application**
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your Azure Static Web App URL (e.g., `https://your-app.azurestaticapps.net`)
   - Add authorized redirect URIs:
     - `http://localhost:3000/` (for development)
     - Your Azure Static Web App URL with trailing slash (e.g., `https://your-app.azurestaticapps.net/`)
   - Click **Create**
5. Copy the **Client ID** (you'll need this in the next step)

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

### 3. Configure Your Calendars

There are two ways to configure your calendar columns. The local file method keeps your private calendar IDs out of version control.

#### Option A: Local Configuration File (Recommended for Development)

1. Copy the example file:
   ```bash
   cp src/config/calendars.local.example.ts src/config/calendars.local.ts
   ```

2. Edit `src/config/calendars.local.ts` with your calendar details:
   ```typescript
   import type { ColumnConfig } from './calendar.config';

   const columns: ColumnConfig[] = [
     {
       name: 'Tom',
       calendars: [
         {
           id: 'tom@gmail.com',           // Google Calendar ID
           name: 'Personal',              // Optional: label for this calendar
           color: '#4285f4'               // Optional: custom color
         },
         {
           id: 'tom.work@company.com',
           name: 'Work',
           color: '#34a853'
         },
       ],
     },
     {
       name: 'Wife',
       calendars: [
         {
           id: 'wife@gmail.com',
           name: 'Personal',
           color: '#9c27b0'
         },
       ],
     },
   ];

   export default { columns };
   ```

The `calendars.local.ts` file is gitignored and won't be committed to version control.

#### Option B: Environment Variable (Recommended for Deployment)

Set the `VITE_CALENDAR_COLUMNS` environment variable with your calendar configuration as JSON:

```bash
VITE_CALENDAR_COLUMNS='[{"name":"Tom","calendars":[{"id":"tom@gmail.com","name":"Personal","color":"#4285f4"}]},{"name":"Wife","calendars":[{"id":"wife@gmail.com","name":"Personal","color":"#9c27b0"}]}]'
```

This is useful for Azure/CI deployments where you can set environment variables securely.

#### Finding Calendar IDs

- **Primary calendar**: Your Gmail address (e.g., `user@gmail.com`)
- **Other calendars**:
  1. Go to [Google Calendar Settings](https://calendar.google.com/calendar/r/settings)
  2. Click on the calendar under "Settings for my calendars"
  3. Scroll to "Integrate calendar"
  4. Copy the "Calendar ID"

### 4. Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

MIT (see [LICENSE](LICENSE))
