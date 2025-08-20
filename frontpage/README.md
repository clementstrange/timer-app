# Harmonic Heights Frontend

Simple business website with contact form functionality.

## Setup

### Backend
1. Navigate to the backend folder:
   ```bash
   cd frontpage/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your email credentials in `.env`:
   - Set EMAIL_USER to your Gmail address
   - Set EMAIL_PASS to your Gmail app password (not regular password)

5. Start the server:
   ```bash
   npm run dev  # for development with nodemon
   # or
   npm start    # for production
   ```

### Frontend
The frontend is served automatically by the backend server at http://localhost:3001

## Email Setup
For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an "App Password" from your Google Account settings
3. Use this app password (not your regular password) in the EMAIL_PASS field

## Features
- ASCII art company logo
- Simple dropdown navigation
- Contact form with email forwarding
- Responsive design
- Clean monospace styling