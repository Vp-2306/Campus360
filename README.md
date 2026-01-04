# Campus360 🎓  
*A Unified Campus Experience Platform*

Campus360 is a full-stack campus platform that centralizes **career guidance, events, projects, and student interaction** into a single real-time ecosystem.

---

## 🚀 Objectives

- Create one digital hub for all campus activities  
- Ensure quality mentorship using **verified guide roles**  
- Enable real-time interaction with scalable architecture  
- Support future expansion into sports bookings and social communities  

---

## 🧩 Core Modules

### 1. Guidance Wall

- Students post questions publicly  
- Only verified **Guides** can answer  
- Real-time updates using Firestore snapshot listeners  
- Helpful (like) system with atomic updates  

---

### 2. Events Module

Card-based event system with detailed views.

| Feature | Description |
|-------|-------------|
| Event Cards | Name, organizer, timing, tags, seats filled / total |
| Detailed View | Full description, venue, and rules |
| Google Maps | One-click venue navigation |
| Google Calendar | Add event to personal calendar |
| Live Seat Count | Auto-updates when users register |

---

### 3. Projects Module

- Displays campus projects as cards  
- Each project includes description, tech stack & contributors  
- Unified landing page allows switching between **Projects** and **Events**

---

### 4. Authentication & Roles

| Role | Permissions |
|------|-------------|
| Student | Ask questions, view events, like answers |
| Guide | Answer questions |
| Admin *(future)* | Verify guides, moderate content |

Firebase Authentication is used for login and role management.

---

### 5. Helpful System

- Users can mark answers as helpful  
- Duplicate likes prevented  
- Firestore `arrayUnion()` ensures atomic updates  

---

## 🛠 Tech Stack

| Layer | Tech |
|------|------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Backend | Firebase Firestore |
| Auth | Firebase Authentication |

---

MVP link : https://campus360-34d71.web.app/
