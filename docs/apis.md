1. Events API (/api/events)
   GET /api/events - List user's events
   POST /api/events - Create new event
   GET /api/events/[id] - Get event details
   PATCH /api/events/[id] - Update event
   DELETE /api/events/[id] - Delete event
   POST /api/events/[id]/members - Add member
   DELETE /api/events/[id]/members - Remove member
   PATCH /api/events/[id]/members - Update member role
2. Expenses API (/api/expenses)
   GET /api/expenses?eventId=... - List event expenses
   POST /api/expenses - Create expense with splits
   GET /api/expenses/[id] - Get expense details
   PATCH /api/expenses/[id] - Update expense
   DELETE /api/expenses/[id] - Delete expense
   PATCH /api/expenses/[id]/splits/[splitId] - Mark split as settled
   GET /api/expenses/settlements?eventId=... - Calculate settlements
3. Timeline API (/api/timeline)
   GET /api/timeline?eventId=... - Get event timeline
   POST /api/timeline - Create timeline
   GET /api/timeline/[id]/items - List timeline items
   POST /api/timeline/[id]/items - Create timeline item
   PATCH /api/timeline/[id]/items - Reorder items (drag & drop)
   GET /api/timeline/[id]/items/[itemId] - Get item details
   PATCH /api/timeline/[id]/items/[itemId] - Update item
   DELETE /api/timeline/[id]/items/[itemId] - Delete item
4. Notes API (/api/notes)
   GET /api/notes?eventId=... - Get event notes
   GET /api/notes?expenseId=... - Get expense notes
   GET /api/notes?timelineItemId=... - Get timeline item notes
   POST /api/notes - Create note
   GET /api/notes/[id] - Get note details
   PATCH /api/notes/[id] - Update note
   DELETE /api/notes/[id] - Delete note
5. Images API (/api/images)
   GET /api/images?eventId=... - Get event images
   GET /api/images?expenseId=... - Get expense images
   GET /api/images?timelineItemId=... - Get timeline item images
   POST /api/images - Create image record
   GET /api/images/[id] - Get image details
   PATCH /api/images/[id] - Update image caption
   DELETE /api/images/[id] - Delete image
