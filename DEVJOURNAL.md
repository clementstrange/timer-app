# Development Journal - 5 August 2025

[] Mobile version log in needs fix
[] Login window auto-populate fix
[] Fix fetch and save with RLS policy

# Development Journal - 17 July 2025

[x] Make progress on the full auth
[x] Turn off RLS on Supabase
[] Mobile version log in needs fix
[] login window auto-populate fix
[] fix fetch and save with RLS policy

Sent the first full-auth message to backend!


# Development Journal - 16 July 2025

[x] Created the localhost version before full auth integration
[x]Fixed database authentication bugs - Resolved delete button functionality by migrating from old API endpoints to Supabase client methods with proper .eq() syntax
[x]Implemented guest user localStorage system - Built complete CRUD operations (create, read, update, delete) for tasks using browser localStorage with JSON serialization
[x]Added authentication state management - Integrated Supabase auth checking with React state to detect logged-in vs guest users throughout the app
[x]Created dual-mode data persistence - Implemented if/else logic in all database functions to route to localStorage for guests and Supabase for authenticated users
[x]Resolved TypeScript deployment errors - Fixed type annotations for user state and localStorage operations to successfully deploy to Vercel


Next time we're building the next stage - full supabase integration. 




# Development Journal - 15 July 2025

[x] Remove the add task button
[x] Finish does not reset the task input and does not reset the timer
[x] Start supabase auth

Supabase needs work, but hey, got the first entry done! Seems like each button now needs work, but that's alright. 

# Development Journal - 14 July 2025

[x] Remove the add task button
[x] Finish does not reset the task input and does not reset the timer
[] Start supabase auth

Need to check next time if these work properly. Did not start Supabase yet. 

# Development Journal - 14 July 2025

[x] Remove the add task button
[x] Finish does not reset the task input and does not reset the timer
[] Start supabase auth

Need to check next time if these work properly. Did not start Supabase yet. 
# Development Journal - 10 July 2025

x Fixed the annoying window stretch issue due to CSS
x Created a localhost version of the app that allows me to check the UI quicker than the production version
x Decided that I will be building the user auth next and will remove the add task button. 
x Found a new Bug. Finish does not reset the task input option and does not reset the timer!


# Development Journal - 8 July 2025
✅ What Was Done Today (Long Break Session!):


Mobile-responsive design - Added responsive breakpoints and separate mobile/desktop layouts with centered web frame for desktop users
Visual design overhaul - Implemented modern card-based UI with shadows, rounded corners, color-coded session types, and professional styling
Layout restructuring - Removed separate task manager pane, moved task input underneath "No task selected" text for cleaner flow
Enhanced typography - Added responsive text sizing using clamp() and improved visual hierarchy with better spacing and colors
Improved UX patterns - Task input only appears when needed, Enter key support, auto-clear input, disabled states for empty submissions
Button and interaction polish - Removed emojis from buttons (kept in headers), improved touch targets, better button grouping and styling
Desktop-specific enhancements - Created centered 600px frame with gray background to prevent timer from taking full screen width
Dynamic browser title - Added timer display in browser tab showing countdown and session type when running
Better task management - Enhanced task editing interface with better form layouts and responsive design for mobile devices
Code organization - Consolidated styles, improved component structure, and separated mobile/desktop render logic for maintainability

📋 Next Time TODOs:

Sound notifications - Add audio alerts when work/break sessions complete to notify users when tab isn't active
Browser notifications - Implement native browser notifications for session transitions even when page is in background
Customizable durations - Allow users to adjust work/break/long break lengths in a settings panel
Keyboard shortcuts - Add spacebar for start/pause, R for reset, Enter for task submission, etc.
Session analytics - Create daily/weekly productivity charts and time tracking summaries
Auto-start functionality - Optional setting to automatically begin next session after breaks complete
Task categories/projects - Add color-coding, tagging, or project grouping for better task organization
Data export features - Allow users to download their productivity data as CSV or generate PDF reports
Offline functionality - Implement local storage backup and sync capabilities for reliability
Performance optimizations - Add lazy loading for large task lists and optimize re-renders for better performance

# Development Journal - 4 July 2025


COMPLETED TODAY:
✅ Fixed major pomodoro timing bugs

Resolved race condition causing double pomo counting
Fixed break sessions not starting after work sessions
Implemented proper session transitions: work → auto-break → stopped work

✅ Learned React useEffect debugging

Used console.log strategically to trace state changes
Identified dependency array issues causing multiple triggers
Fixed ref synchronization between state and refs

✅ Improved pomodoro UX

Work sessions (25sec test) → automatic break (5sec test)
Break ends → work session ready but stopped (user must start)
Proper session type display and pomo counter working

✅ Code architecture improvements

Added currentSessionTypeRef for race condition prevention
Separated timer restart logic from session transition logic
Clean console logging for debugging complex state flows

TO-DO NEXT SESSION:
🔲 Switch to production timings (25min work, 5min break)
🔲 Long break feature - choice between 5min/10min break after 4 pomos
🔲 Clean up code - remove console.logs and commented code
🔲 Deploy updated version to production
🔲 UI polish - better visual feedback for session transitions
Next focus: Long break logic when completedPomos hits 4!

# Development Journal - 3 July 2025

COMPLETED TODAY:
✅ Built working pomodoro app with 25min work → 5min break cycles
✅ Added automatic session transitions and pomo counter (0/4)
✅ Fixed timer duration logic for dynamic work/break sessions
✅ Added visual feedback ("WORK SESSION" vs "BREAK TIME")
✅ Successfully deployed to production
TO-DO NEXT SESSION:
🔲 Fix time display: Show "24:47" instead of "1487 seconds"
🔲 Add long break feature when 4 pomos completed
🔲 UI polish and sound notifications


# Development Journal - 30 June 2025 - Deployment

CODING WINS - Timer App Deployment

Fixed async/await race condition in React timer reset function
Successfully deployed FastAPI backend to Railway with PostgreSQL database
Migrated from SQLite to PostgreSQL for production
Configured environment variables for database connection
Deployed React frontend to Vercel with proper build settings
Fixed CORS configuration for production cross-origin requests
Implemented full-stack communication between live frontend and backend
Debugged and resolved deployment issues (dependencies, build commands, directory structure)

TECHNICAL SKILLS DEVELOPED

Async/await timing and Promise handling in JavaScript
Database migration strategies (SQLite → PostgreSQL)
Cloud deployment workflows (Railway + Vercel)
Environment variable configuration for production
CORS policy management for cross-origin requests
Build system troubleshooting and configuration

SHIPPED

Live, fully functional timer app at https://timer-app-q7nv.vercel.app
Production backend API at https://believable-courage-production.up.railway.app
Complete CRUD functionality working in production environment

MINDSET WIN

Pushed through multiple deployment roadblocks without giving up
Followed the "ship early, ship often" philosophy from your roadmap
Gained real experience with the full development-to-deployment cycle

# Development Journal - 28 June 2025 -Full CRUD Implementation

Attempted to vibecode the whole thing into deployment via vercel, supabase and it burned. Spent hours going back to the old commit. 

# Development Journal - 25 June 2025 -Full CRUD Implementation

 Built complete Update functionality for tasks
 Added edit state management with editingTaskId and temporary edit values
 Implemented conditional rendering for edit/display modes
 Created PUT endpoint in FastAPI for updating tasks
 Added proper form controls with text input and number spinner

Backend Enhancements

 Built PUT route /task/{task_id} for updating existing tasks
 Learned SQLAlchemy object tracking and live updates (task_to_edit.field = new_value)
 Fixed empty task list bug (return [] instead of [{null object}])
 Improved error handling and response messages

Code Quality & Organization

 Refactored messy App.tsx into organized sections with clear headers
 Extracted inline styles to named variables for reusability
 Added helpful comments for complex state management
 Cleaned up backend with proper spacing, docstrings, and function names
 Fixed inconsistent formatting and spacing throughout codebase

Technical Learning

 Mastered conditional JSX rendering patterns (condition ? editMode : displayMode)
 Learned React controlled inputs with temporary state management
 Understood SQLAlchemy ORM object tracking and commit patterns
 Practiced proper state isolation (edit values separate from display values)

Major Milestone

 Completed full CRUD operations - Create, Read, Update, Delete
 Built professional fullstack app with React + TypeScript + FastAPI + SQLite

Status: Ready for deployment or next project phase! 🚀

# Development Journal - 23 June 2025

[x] Restructured app to two-column layout (task entry left, timer right)  
[x] Added task_id to backend API response  
[x] Built DELETE route in FastAPI (/task/{task_id})  
[x] Implemented delete functionality with proper async handling  
[x] Added delete buttons to each task item  
[x] Created dynamic Start/Pause/Resume morphing button  
[x] Added timer state management ("stopped", "running", "paused")  
[x] Fixed React onClick event handling patterns  
[x] Learned SQLAlchemy query methods and template literals  
[x] Completed 3/4 CRUD operations (Create, Read, Delete)  

Next: Add Update functionality to complete full CRUD

# Development Journal - 17 June 2025

[x] started saving on action instead of every second
[x] display the tasks from the db on the page

# Development Journal - 17 June 2025

[x] save task name to backend 
[x] show how many second the task was active
[x] create the database

# Development Journal - 16 June 2025

[x] save task name to backend 
[] show how many second the task was active


# Development Journal - 11 June 2025

[x] Make the reset button work
[x] Add a pause button
[x] Center the counter
[x] Created task entry

# Development Journal - 10 June 2025

[x] Create the backend environment in fastapi
[x] Create the frontend environment in react
[x] Create one useState counter from 60s

# Development Journal - 3 June 2025

## Backend Development (FastAPI)
- Implemented number storage functionality
- Created GET endpoint for retrieving current number
- Added POST endpoint for updating number
- Configured CORS middleware for frontend communication

## Frontend Development (React)
- Created React TypeScript application with number display
- Implemented API integration with backend endpoints
- Added user interface components:
  - Number display component
  - Increment button
  - Reset button
- Set up useEffect hook for initial number fetch

## Next Steps
- Add error handling for API calls
- Improve UI styling
- Add input validation
- Consider adding database persistence

# Development Journal - 2 June 2025

## Project Setup
- Initialized new full-stack project structure for number-saver
- Created comprehensive .gitignore file for both Python and React
- Set up Git repository with initial commit
- Fixed directory structure for Python virtual environment

## Backend Development
- Created basic FastAPI application structure
- Set up Python virtual environment in backend folder
- Created initial endpoint returning "hiya" message

## Environment Configuration
- Fixed Homebrew zsh completion scripts issue
- Set up proper permissions for Homebrew directories

## Next Steps
- Set up React frontend
- Implement additional API endpoints
- Configure database connection

