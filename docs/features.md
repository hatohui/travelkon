# Travelkon Features

A collaborative travel expense management and planning application combining Google Calendar, Splitwise, and Google Drive functionality for travel events.

## Core Features

### 1. Authentication

- **Google OAuth Login**
  - Single sign-on with Google accounts
  - Automatic user profile creation
  - Avatar and email sync

### 2. Event Management

- **Create Travel Events**
  - Name, description, start/end dates
  - Cover image upload
  - Default currency setting
  - Member invitation system
- **Event Member Roles**
  - Owner: Full control over event
  - Admin: Manage members and settings
  - Member: View and contribute

### 3. Expense Management

- **Add Expenses**
  - Title, amount, currency, category
  - Specify who paid
  - Date and location tracking
  - Upload receipt images
  - Add notes/comments
- **Expense Splitting**
  - Split expenses among multiple members
  - Custom split amounts per person
  - Track settled/unsettled splits
  - Mark individual splits as settled
- **Settlement Calculations**
  - Real-time debt calculation
  - Show who owes whom
  - Per-person balance summary
  - Optimal settlement suggestions
  - Settlement history tracking

### 4. Timeline & Planning

- **Event Timeline**
  - Drag-and-drop timeline items
  - Chronological activity planning
  - Custom order management
- **Timeline Items**
  - Title, description, location
  - Start time and optional end time
  - Color coding for categories
  - Mark items as completed
  - Attach images and notes
- **Interactive Planning**
  - Reorder items by dragging
  - Visual timeline view
  - Day-by-day breakdown
  - Location-based grouping

### 5. Media Management

- **Image Uploads**
  - Cloudinary integration
  - Attach to events, expenses, or timeline items
  - Image captions
  - Gallery view
  - Full-resolution viewing
- **Storage Organization**
  - Per-event image collections
  - Automatic thumbnail generation
  - Searchable by date/location

### 6. Notes & Comments

- **Collaborative Notes**
  - Add notes to events
  - Comment on expenses
  - Annotate timeline items
  - Author attribution
  - Timestamp tracking

### 7. Dashboard & Analytics

- **Event Overview**
  - Total expenses by category
  - Per-member spending
  - Settlement status
  - Upcoming timeline items
- **Financial Summary**
  - Currency conversion support
  - Expense trends
  - Category breakdown
  - Export capabilities

## Technical Architecture

### Data Model

- **User**: Google OAuth profiles
- **Event**: Travel events with members
- **EventMember**: User-event relationships with roles
- **Expense**: Financial transactions
- **ExpenseSplit**: Individual debt records
- **Timeline**: Event planning structure
- **TimelineItem**: Scheduled activities
- **Note**: Comments and annotations
- **Image**: Media attachments

### API Endpoints (Planned)

```
/api/auth/google - OAuth flow
/api/events - CRUD for events
/api/events/[id]/members - Member management
/api/expenses - CRUD for expenses
/api/expenses/[id]/splits - Split management
/api/expenses/calculate-settlements - Debt calculations
/api/timeline - Timeline CRUD
/api/timeline/[id]/items - Timeline item management
/api/images - Image upload and management
/api/notes - Note CRUD
```

### Technology Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Media**: Cloudinary
- **Auth**: Google OAuth (NextAuth.js planned)
- **State**: TanStack Query

## User Workflows

### Creating a Trip

1. User logs in with Google
2. Creates new event with details
3. Invites friends via email
4. Members join and set up timeline
5. Add activities to timeline
6. Track expenses throughout trip
7. View settlement summary
8. Mark settlements as paid

### Adding an Expense

1. Select event
2. Click "Add Expense"
3. Enter amount, title, category
4. Upload receipt image (optional)
5. Select who paid
6. Choose split method (equal/custom)
7. Select members to split with
8. Submit expense
9. System calculates individual shares
10. Members can view and comment

### Planning Activities

1. Open event timeline
2. Add timeline items
3. Set date, time, location
4. Drag to reorder
5. Attach notes and images
6. Mark as complete during trip
7. Share timeline with members

## Future Enhancements

- Push notifications
- Offline support
- Multi-currency auto-conversion
- Map integration for locations
- Export trip report as PDF
- Recurring expenses
- Budget limits per category
- Split by percentage
- QR code for receipt scanning
