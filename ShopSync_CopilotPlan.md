# 🛍️ ShopSync — Smart E-Commerce Admin Dashboard
## VSCode Copilot Implementation Master Plan

---

## 📌 Project Overview

**ShopSync** is a full-stack admin dashboard for managing an online store.
It covers user auth, inventory management, order processing, team roles, analytics, and advanced UI patterns.

**Tech Stack:**
- **Frontend:** React + Vite + TailwindCSS + React Router v6 + Context API + React Hook Form + Zod
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Auth:** Bcrypt + JWT (HttpOnly Cookie)
- **Dev Tools:** Git (branch strategy enforced), Axios, dotenv

---

## 🗂️ Folder Structure

```
shopsync/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React Context (Auth, Theme, Form)
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Route-level page components
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Axios instances + API calls
│   │   └── utils/              # Helpers, rank logic
├── server/                     # Node/Express backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
└── .env
```

---

## 🔧 PHASE 0 — Project Bootstrap

### Copilot Prompt:
```
Create a monorepo project called "shopsync" with two folders:
- client: Vite + React + TailwindCSS. Install: react-router-dom, axios, react-hook-form, zod, @hookform/resolvers
- server: Node + Express. Install: mongoose, bcryptjs, jsonwebtoken, dotenv, cookie-parser, cors, express-rate-limit

Add a .env file in server/ with:
  PORT=5000
  MONGODB_URI=<placeholder>
  JWT_SECRET=<placeholder>
  JWT_EXPIRES_IN=15m
```

**Git setup after:**
```bash
git init
git add .
git commit -m "feat: initial project bootstrap"
```

---

## 🔧 PHASE 1 — Git Branching Strategy (Function 1.3)

### Rules to follow throughout the project:
- `main` — stable production branch
- `feature/<name>` — for each new feature
- Never commit directly to `main`
- Merge via Pull Request with descriptive commit messages

### Copilot Prompt:
```
Set up Git branching. Create a branch called feature/auth-system.
All future features follow this pattern: feature/<feature-name>.
Provide a .gitignore for Node and React projects.
```

### Commit message format:
```
feat: implement user registration with bcrypt
fix: correct JWT expiry comparison logic
style: add dark mode toggle to navbar
chore: resolve merge conflict between dark-mode and color-picker
docs: update readme with student info
```

---

## 🔧 PHASE 2 — Backend: Database Models

### 2.1 User Model (Function 5.1, 5.2, 5.3, 4.2)

### Copilot Prompt:
```
In server/models/userModel.js, create a Mongoose schema for User with:
- username: String, required, unique
- email: String, required, unique
- password: String, required, select: false
- role: String, enum: ['admin', 'editor', 'staff'], default: 'staff'
- isDeleted: Boolean, default: false
- deletedAt: Date, default: null
- passwordChangedAt: Date

Add a Mongoose pre-save middleware that:
1. Hashes password with bcrypt (saltRounds: 12) ONLY if password was modified
2. Sets passwordChangedAt to Date.now() when password changes

Add an instance method correctPassword(candidatePassword) using bcrypt.compare().
Add an instance method changedPasswordAfter(JWTTimestamp) that compares passwordChangedAt to token iat.
```

### 2.2 Product Model (Function 4.1, 4.3, 4.5)

### Copilot Prompt:
```
In server/models/productModel.js, create a Mongoose schema with:
- name: String, required, unique
- price: Number, required, min: 0
- originalPrice: Number, required
- discountPercent: Number, default: 0 (0-100)
- category: String, enum: ['Electronics', 'Home', 'Fashion', 'Food'], required
- stock: Number, default: 0, min: 0
- tags: [String]
- isDeleted: Boolean, default: false
- timestamps: true

Add a Mongoose virtual field called salePrice:
  formula: originalPrice * ((100 - discountPercent) / 100)
  Set { toJSON: { virtuals: true } } to include it in API responses.
```

### 2.3 Order Model (Function 4.3)

### Copilot Prompt:
```
In server/models/orderModel.js, create a Mongoose schema with:
- productId: ObjectId ref Product, required
- quantity: Number, required, min: 1
- totalPrice: Number, required (server-side calculated only)
- status: String, enum: ['pending', 'processing', 'completed'], default: 'pending'
- timestamps: true
```

### 2.4 Post/Review Model (Function 1.4, 4.4)

### Copilot Prompt:
```
In server/models/commentModel.js, create a recursive Mongoose schema for comments with:
- content: String, required
- authorId: ObjectId ref User
- productId: ObjectId ref Product
- replies: [this schema] (self-referencing sub-document array)
- timestamps: true
```

---

## 🔧 PHASE 3 — Backend: Auth System (Functions 5.1–5.5)

### Copilot Prompt:
```
In server/utils/rateLimiter.js, create an express-rate-limit config:
- windowMs: 15 minutes
- max: 5 attempts per IP
- message: "Too many login attempts. Please try again later."

In server/utils/tokenBlacklist.js, create an in-memory Set to store blacklisted tokens.
Add functions: addToBlacklist(token), isBlacklisted(token).

In server/controllers/authController.js, create:

1. register(req, res):
   - Validate body (username, email, password)
   - Create user (password auto-hashed by pre-save middleware)
   - Return 201 with user data (no password field)

2. login(req, res):
   - Find user by email using .select('+password')
   - Add artificial delay: await new Promise(r => setTimeout(r, 2000)) on failure
   - Compare password with correctPassword()
   - Sign JWT: { id: user._id, role: user.role } with JWT_SECRET, expiresIn: JWT_EXPIRES_IN
   - Set cookie: res.cookie('jwt', token, { httpOnly: true, secure: false, maxAge: 15*60*1000 })
   - Return 200 with user info (no password)

3. logout(req, res):
   - Extract token from cookie
   - Add token to blacklist using addToBlacklist()
   - Clear cookie
   - Return 200

In server/middleware/authMiddleware.js, create:

1. protect middleware:
   - Extract JWT from cookies or Authorization: Bearer header
   - Verify JWT signature (handle TokenExpiredError with 401)
   - Check if token is in blacklist
   - Find user by decoded.id (exclude deleted users: isDeleted: false)
   - Check changedPasswordAfter(decoded.iat) — if true, return 401
   - Attach user to req.user

2. restrictTo(...roles) factory function:
   - Returns middleware that checks req.user.role is in allowed roles
   - If not allowed: return 403 Forbidden
   - Admin role implicitly passes all role checks
```

**Commit:**
```bash
git add . && git commit -m "feat: implement JWT auth with bcrypt and role-based access"
```

---

## 🔧 PHASE 4 — Backend: Product & Order APIs (Functions 4.1–4.5)

### Copilot Prompt:
```
In server/controllers/productController.js, implement:

1. createProduct(req, res) — POST /api/products
   - Validate required fields
   - Create and return product (201)

2. getProducts(req, res) — GET /api/products
   - Support query param ?minPrice=xxx to filter by price >= minPrice
   - Support ?category=xxx for category filter
   - Exclude isDeleted: true products

3. softDeleteProduct(req, res) — DELETE /api/products/:id
   - Update isDeleted: true and deletedAt: new Date()
   - Do NOT remove from DB

4. getProductStats(req, res) — GET /api/products/stats
   Use MongoDB Aggregation Pipeline to return:
   {
     maxSalePrice: <highest discounted price>,
     avgSalePrice: <average discounted price>,
     totalByCategory: [{ _id: 'Electronics', count: N }, ...]
   }
   Note: salePrice virtual doesn't work in aggregation — recalculate inline with $project

In server/controllers/orderController.js:

createOrder(req, res) — POST /api/orders
  Logic sequence (MUST follow this exact order):
  1. Find product by productId
  2. Check product.stock >= quantity — if not, return 400 "Insufficient stock"
  3. Use findOneAndUpdate with $inc: { stock: -quantity } (atomic operation)
  4. Calculate totalPrice = product.price * quantity (server-side only, never from req.body)
  5. Create new Order document
  6. Return 201 with order
```

**Commit:**
```bash
git add . && git commit -m "feat: implement product CRUD, soft delete, and atomic order processing"
```

---

## 🔧 PHASE 5 — Backend: Advanced Features

### 5.1 Multi-Tag Search + Pagination (Function 4.4)

### Copilot Prompt:
```
In server/controllers/postController.js, implement:

GET /api/products/search
  Accept query params:
  - tags: comma-separated string (e.g. "node,express")
  - page: number (default 1)
  - limit: number (default 5)
  
  Logic:
  - If tags provided: use MongoDB $all operator to match products containing ALL listed tags
  - Calculate skip = (page - 1) * limit
  - Use Product.find().skip(skip).limit(limit)
  - Return { data: [...], totalCount, page, totalPages }
```

### 5.2 User Soft Delete + Activity Tracking (Function 4.2)

### Copilot Prompt:
```
In server/controllers/userController.js:

1. GET /api/users — return only users where isDeleted: false
2. DELETE /api/users/:id — soft delete: set isDeleted: true, deletedAt: new Date()
   - Do NOT use findByIdAndDelete
   - Return 200 with { message: "User soft deleted", user }
3. PATCH /api/users/:id/restore — restore user: set isDeleted: false, deletedAt: null
```

---

## 🔧 PHASE 6 — Backend: Queue System (Function 1.5)

### Copilot Prompt:
```
In server/utils/taskQueue.js, implement a concurrency-controlled task queue:
- MAX_PARALLEL = 2 (constant at top of file)
- Queue stores tasks as { id, status: 'pending'|'running'|'completed', progress: 0 }
- processTasks() function:
  1. Find all tasks with status 'pending'
  2. Start up to MAX_PARALLEL tasks simultaneously
  3. Each task simulates work with setInterval (increment progress every 200ms)
  4. When progress reaches 100, mark status: 'completed' and start next pending task
  5. Use a runningCount tracker to never exceed MAX_PARALLEL

Expose via:
  POST /api/queue/start — add 10 tasks and begin processing
  GET /api/queue/status — return current task list with statuses and progress
```

---

## 🔧 PHASE 7 — Frontend: Setup + Auth (Functions 5.1–5.5)

### Copilot Prompt:
```
In client/src/services/axiosInstance.js:
- Create Axios instance with baseURL: 'http://localhost:5000'
- withCredentials: true (to send cookies)
- Add request interceptor that logs each request
- Add response interceptor with retry logic:
  On network error or 5xx, retry up to 3 times with increasing delay (1s, 2s, 3s)
  Log "Retrying... (attempt N)" to console each retry
  After 3 failures, reject and propagate error

In client/src/context/AuthContext.jsx:
- Create AuthContext with: { user, login, logout, isLoading }
- login(email, password): calls POST /api/auth/login, stores user in state
- logout(): calls POST /api/auth/logout, clears user state
- On mount: call GET /api/auth/me to restore session from cookie
```

### 7.1 Multi-Step Registration Form (Function 6.3)

### Copilot Prompt:
```
In client/src/pages/RegisterPage.jsx, build a 3-step form using Context API + React Hook Form + Zod:

Step 1: Account Setup
  Fields: email, password, username
  Async validation for username: 
    - Simulate 500ms debounce check
    - If username is "admin", "root", or "superuser" — show error "Username not available"
    - Block proceeding to Step 2 while checking

Step 2: Professional Profile
  Fields: occupation (select: Developer/Designer/Manager), company, githubUrl
  Conditional Zod validation:
    - If occupation === 'Developer', githubUrl is required and must be valid URL format

Step 3: Summary & Confirm
  Display all collected data for review before submitting

Architecture requirements:
  - Use FormContext (React Context) to store all form data across steps
  - Persist to localStorage with useEffect so data survives page refresh
  - Navigation Guard: block Next button if current step has validation errors
  - On final submit: POST /api/auth/register with combined form data
```

---

## 🔧 PHASE 8 — Frontend: Dashboard + Inventory (Functions 1.1, 1.2, 4.x)

### 8.1 Seller Rank Badge System (Function 1.1)

### Copilot Prompt:
```
In client/src/utils/rankUtils.js:
Create a getRank(power) function:
  - power < 50: return { rank: 'Bronze', color: '#CD7F32', borderColor: '#8B5A2B' }
  - power < 100: return { rank: 'Silver', color: '#A8A9AD', borderColor: '#6E6E6E' }
  - power >= 100: return { rank: 'Gold', color: '#FFD700', borderColor: '#B8860B' }

In client/src/components/SellerCard.jsx:
  - Accept: { name, power }
  - Display rank badge computed from getRank(power)
  - "Level Up" button that adds a RANDOM amount between 5-15 using Math.random()
  - Card border color changes dynamically based on current rank
  - Power number updates on screen immediately (useState)
  - Use useEffect to log rank change whenever rank transitions
```

### 8.2 User Search + Filter System (Function 1.2)

### Copilot Prompt:
```
In client/src/pages/UsersPage.jsx:
  - Fetch all users on mount via GET /api/users (store in state as allUsers)
  - Create derived state: filteredUsers computed from allUsers based on search input
  - Search bar filters by BOTH name AND email (case-insensitive)
  - Filter is client-side: do NOT re-fetch on every keystroke
  - If filteredUsers.length === 0, show: "No results found for 'xyz'"
  - Show user count

IMPORTANT architecture rules:
  - Store original users in allUsers state — never modify it
  - Use a separate filteredUsers state derived in useEffect with [searchTerm] dependency
  - Keep searchTerm in useState
```

### 8.3 Product Inventory with Optimistic UI (Function 6.4)

### Copilot Prompt:
```
In client/src/pages/InventoryPage.jsx:

Implement Optimistic UI for delete and toggle:

1. deleteProduct(id):
   - Immediately remove from UI: setProducts(prev => prev.filter(p => p._id !== id))
   - Show toast: "Deleting product..."
   - Call DELETE /api/products/:id
   - On success: show "Product deleted"
   - On failure (after 3 retries): 
     a. Rollback: restore previous products state using saved backup
     b. Show error toast: "Failed — product restored"

2. Backup pattern:
   const previousItems = [...items]  // backup BEFORE optimistic update
   setItems(optimisticUpdate)
   try { await api.call() }
   catch { setItems(previousItems); showErrorToast() }

3. Progress tracking: When deleting, show inline loading indicator on that specific item
   NOT a page-wide spinner
```

---

## 🔧 PHASE 9 — Frontend: Recursive Comments (Function 1.4)

### Copilot Prompt:
```
In client/src/components/CommentItem.jsx:
Create a recursive component that renders a comment and its nested replies:

Props: { comment, onAddReply }
  - Render comment.content
  - Render "Reply" button
  - Render comment.replies by mapping each reply as <CommentItem> (recursion)
  - Indent replies visually with marginLeft: depth * 20px
  - Avoid infinite loop: base case is when comment.replies is empty or undefined

In client/src/utils/commentUtils.js:
Create addReply(comments, targetId, newReply) function:
  - Recursively traverse comments array
  - Find comment with _id === targetId
  - Return NEW array (do NOT mutate with .push())
  - Pattern: return { ...c, replies: [...c.replies, newReply] }

In client/src/pages/ProductReviewsPage.jsx:
  - Show comment thread for a product
  - "Add Reply" on any comment uses addReply() to update state immutably
  - Support at least 4 levels of nested replies
```

---

## 🔧 PHASE 10 — Frontend: Theme + Dark Mode (Function 1.3)

### Branch: `feature/dark-mode` and `feature/color-picker` — merge both

### Copilot Prompt:
```
In client/src/context/ThemeContext.jsx:
  - State: { theme: 'light'|'dark', primaryColor: '#3B82F6' }
  - Use setConfig(prev => ({ ...prev, theme: 'dark' })) pattern (NOT object replacement)
  - Persist to localStorage

In client/src/components/Navbar.jsx:
  - Dark Mode toggle button
  - Color Picker input (type="color") for primaryColor

Apply dark mode using TailwindCSS dark: classes or CSS variables.

After implementing both features on separate branches:
  1. Merge feature/dark-mode into main
  2. Merge feature/color-picker — resolve conflict if any
  3. Final commit: "chore: resolve conflict between dark-mode and color-picker"
  4. Verify both features work simultaneously on the merged result
```

---

## 🔧 PHASE 11 — Frontend: Dynamic Form Builder (Function 6.5)

### Copilot Prompt:
```
In client/src/components/DynamicFormBuilder.jsx:
  - Accept a JSON schema as props (fieldConfig array)
  - Each field definition has: { name, label, type, required, min, max, options, showIf }
  - Dynamically render input types: text, number, select, checkbox, group/section
  - Use useMemo to build Zod schema dynamically from fieldConfig
  - Conditional rendering: if field has showIf, only show when condition matches current form values
  - Recursive: if type === 'group', render DynamicFormBuilder recursively for nested fields
  - Payload: on submit, build nested object matching the schema structure

Example fieldConfig:
[
  { name: "productName", type: "text", required: true, min: 3 },
  { name: "role", type: "select", options: ["admin","guest"] },
  { name: "adminCode", type: "text", showIf: { role: "admin" }, required: true },
  { name: "specs", type: "group", fields: [
    { name: "weight", type: "number" },
    { name: "color", type: "text" }
  ]}
]
```

---

## 🔧 PHASE 12 — Frontend: Task Queue UI (Function 1.5)

### Copilot Prompt:
```
In client/src/pages/TaskQueuePage.jsx:
  - Show 10 task cards, each with: task ID, status badge, progress bar
  - "Start Processing" button calls POST /api/queue/start
  - Poll GET /api/queue/status every 500ms with useEffect + setInterval
  - Rules:
    * Only 2 tasks show 'running' at any time
    * Tasks 3-10 start as 'pending'
    * When a running task completes, next pending task auto-starts
    * Progress bars animate smoothly
  - Cleanup: return () => clearInterval(id) in useEffect

useEffect dependencies: [tasks, runningCount]
Explain in a comment why these two values are needed as dependencies.
```

---

## 🔧 PHASE 13 — Dashboard & Analytics Page (Function 4.5)

### Copilot Prompt:
```
In client/src/pages/DashboardPage.jsx:
  - Fetch GET /api/products/stats on mount
  - Display:
    * Max sale price card
    * Average sale price card
    * Bar chart showing totalByCategory (use a simple div-based chart or Recharts)
  - Show loading skeleton while fetching
  - Handle partial API failure: if stats fail but products load, show stats error inline
    without crashing the whole page
```

---

## 🔧 PHASE 14 — Routes & Navigation

### Copilot Prompt:
```
In client/src/App.jsx, set up React Router v6 with these routes:
  /                     → DashboardPage (protected)
  /register             → RegisterPage (multi-step, public)
  /login                → LoginPage (public)
  /inventory            → InventoryPage (protected, role: admin/editor)
  /users                → UsersPage (protected, role: admin)
  /orders               → OrdersPage (protected)
  /sellers              → SellersPage (protected)
  /reviews/:productId   → ProductReviewsPage (protected)
  /tasks                → TaskQueuePage (protected, role: admin)
  /form-builder         → DynamicFormBuilderPage (protected)

Create a ProtectedRoute component that:
  - Reads user from AuthContext
  - If not authenticated: redirect to /login
  - If authenticated but wrong role: show 403 Forbidden page
  - If authenticated and authorized: render children

Set up the server routes:
  app.use('/api/auth', authRoutes)       // register, login, logout, me
  app.use('/api/products', protect, productRoutes)
  app.use('/api/orders', protect, orderRoutes)
  app.use('/api/users', protect, restrictTo('admin'), userRoutes)
  app.use('/api/queue', protect, restrictTo('admin'), queueRoutes)
```

---

## ✅ Final Checklist for Copilot Verification

Run these manually to verify each function:

### Git History Check:
```bash
git log --oneline
# Should show 10+ commits with feat:/fix:/style:/chore: prefixes

git log --graph --oneline --all
# Should show branches splitting from main and merging back
```

### Backend API Tests (use Postman or Thunder Client):

| Test | Expected |
|------|----------|
| POST /api/auth/register | 201 + user (no password field) |
| POST /api/auth/login wrong password | 401 (after ~2s delay) |
| POST /api/auth/login correct | 200 + jwt cookie set |
| GET /api/users (no token) | 401 Unauthorized |
| GET /api/users (staff token) | 403 Forbidden |
| GET /api/users (admin token) | 200 + user list |
| POST /api/products (price: -50) | 400 Bad Request |
| POST /api/orders (qty > stock) | 400 "Insufficient stock" |
| DELETE /api/users/:id | isDeleted:true in MongoDB |
| GET /api/products/stats | aggregation data |

### Frontend Checklist:

| Feature | Check |
|---------|-------|
| Seller Level Up | Power increases randomly (not by 1) |
| Rank badge color | Changes at 50 and 100 power |
| User search | Filters by both name AND email |
| Search empty state | Shows "No results found for '...'" |
| Delete product | Disappears instantly (optimistic) |
| Delete fail | Product reappears with error toast |
| Multi-step form | Data persists on F5 refresh |
| Recursive comments | Replies nest 4+ levels deep |
| Dark mode + color picker | Both work simultaneously |
| Task queue | Only 2 tasks run at a time |
| Retry interceptor | Console shows "Retrying... (1)" etc |

---

## 🧠 Key Architecture Decisions to Explain to Copilot

When asking Copilot to generate code, always include these constraints as comments:

```javascript
// IMPORTANT: Never use comments.push() — mutates state, breaks React re-render
// IMPORTANT: Always return new object: { ...c, replies: [...c.replies, newReply] }

// IMPORTANT: Atomic stock deduction — use $inc operator in findOneAndUpdate
// NEVER subtract in JavaScript then save() — race condition if 2 requests arrive together

// IMPORTANT: useEffect dependency array must include [allUsers, searchTerm]
// Removing [] causes infinite loop; missing deps causes stale closure bug

// IMPORTANT: totalPrice must be calculated server-side (price * quantity)
// Never accept totalPrice from req.body — users can manipulate it in Postman

// IMPORTANT: protect middleware must run BEFORE restrictTo
// req.user is undefined without protect, causing crash in restrictTo
```

---

## 📁 Key Files Summary

```
server/
├── models/
│   ├── userModel.js       (bcrypt pre-save, instance methods)
│   ├── productModel.js    (virtual salePrice, soft delete)
│   └── orderModel.js      (atomic stock)
├── middleware/
│   └── authMiddleware.js  (protect, restrictTo, ghost check)
├── controllers/
│   ├── authController.js  (register, login with delay, logout+blacklist)
│   ├── productController.js (CRUD, stats aggregation)
│   ├── orderController.js  (atomic order creation)
│   └── userController.js   (soft delete, restore)
└── utils/
    ├── rateLimiter.js
    ├── tokenBlacklist.js
    └── taskQueue.js

client/src/
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── components/
│   ├── SellerCard.jsx      (rank badge, level up)
│   ├── CommentItem.jsx     (recursive)
│   └── DynamicFormBuilder.jsx (recursive form)
├── pages/
│   ├── RegisterPage.jsx    (multi-step + persistence)
│   ├── InventoryPage.jsx   (optimistic UI)
│   ├── UsersPage.jsx       (search + filter)
│   ├── DashboardPage.jsx   (aggregation stats)
│   └── TaskQueuePage.jsx   (queue + progress)
└── services/
    └── axiosInstance.js    (retry interceptor)
```
