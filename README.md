<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b0b94068-2b94-410a-8bdd-e4d87b280480

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Firebase and Gemini credentials.
   - macOS/Linux: `cp .env.example .env.local`
   - Windows PowerShell: `Copy-Item .env.example .env.local`
3. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
4. Set the `VITE_FIREBASE_*` variables in [.env.local](.env.local) to your Firebase project values.
5. Run the app:
   `npm run dev`

## Security note

- Do not commit `.env.local` or any file containing real API keys or Firebase credentials.
- `firebase-applet-config.json` is now ignored by Git. If you still have it locally, keep it out of version control.
- If this file was already pushed to a remote repository, rotate the Firebase keys and use a history-cleaning tool such as `git filter-repo` or `BFG Repo-Cleaner`.
