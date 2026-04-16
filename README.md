# KidPoints

## Overview
KidPoints is a comprehensive platform designed to help parents and caregivers manage and monitor children's activities, rewards, and educational progress. This web application provides a user-friendly interface that allows users to set goals, track points earned through various activities, and encourage positive behavior in a fun and engaging way.

## Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Express.js, TypeScript
- **Database**: Firebase/Firestore
- **AI Integration**: Google Gemini API
- **Email Service**: Resend
- **UI Components**: Base UI, Lucide Icons, shadcn

## Features
- **Activity Tracking**: Users can log activities that contribute to earning points, whether it's completing chores, reading books, or achieving specific developmental milestones.
- **Reward System**: Families can establish a points-based reward system, making it easy to motivate children with incentives.
- **Progress Monitoring**: The platform allows parents to review and analyze their children's progress over time using interactive charts and analytics.
- **Customizable Goals**: Parents can set and customize personal goals for each child, aligning with their individual needs and interests.
- **Neurodivergence Support**: Built with accessibility in mind to support children with different learning styles and neurodivergent needs.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/carlosdamota/kidpoints.git
   cd kidpoints
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env.local`:
     ```bash
     # macOS/Linux
     cp .env.example .env.local
     
     # Windows PowerShell
     Copy-Item .env.example .env.local
     ```
   
   - Fill in your credentials in `.env.local`:
     - `RESEND_API_KEY`: Your Resend email service API key
     - `VITE_FIREBASE_*`: Your Firebase project credentials
     - `APP_URL`: The application URL

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run start` - Start the production server
- `npm run lint` - Run TypeScript type checking
- `npm run clean` - Remove build artifacts

## Project Structure

```
kidpoints/
├── src/               # Source code
├── public/            # Static assets
├── server.ts          # Express server configuration
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
├── index.html         # HTML entry point
├── package.json       # Project dependencies
└── firestore.rules    # Firestore security rules
```

## Security Considerations

⚠️ **Important**: 
- Never commit `.env.local` or any files containing API keys or Firebase credentials to version control
- `firebase-applet-config.json` is automatically ignored by Git
- If sensitive credentials were accidentally committed, immediately rotate your API keys and use `git filter-repo` or `BFG Repo-Cleaner` to remove them from history

## Accessibility & Neurodivergence

This project includes support for neurodivergent users. For detailed information about accessibility features and inclusive design considerations, see [NEURODIVERGENCE_GUIDE.md](NEURODIVERGENCE_GUIDE.md).

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## Troubleshooting

### Port already in use
If port 5173 is already in use, Vite will automatically use the next available port.

### Firebase connection issues
Ensure all `VITE_FIREBASE_*` environment variables are correctly set in `.env.local`.

### Build fails
Run `npm run clean` and then `npm run build` to clear any cached build artifacts.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Support

For questions, issues, or suggestions, please open an issue on the [GitHub repository](https://github.com/carlosdamota/kidpoints/issues).