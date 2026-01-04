# Campus360 🎓  
*A Complete Campus Ecosystem Platform*

Campus360 is a unified digital platform that brings **career guidance, events, projects, sports facilities, and student interaction** into one real-time system. The goal is to replace scattered campus portals with a single powerful application for everything a student needs on campus.

---

## 🚀 Platform Vision

- Centralize all campus services in one place  
- Enable verified mentorship and structured guidance  
- Allow students to discover, register, and manage campus events  
- Digitize sports facility booking & management  
- Create social & collaborative campus communities  

---

## 🧩 Core Modules

### 1. Guidance & Mentorship Wall

A structured Q&A system.

- Students can post career and academic questions  
- Only **verified Guides** can answer  
- Real-time updates using Firestore listeners  
- Helpful (like) system to surface quality answers  
- Prevents spam using role-based permissions  

---

### 2. Events Management System

Complete lifecycle of campus events.

| Feature | Description |
|-------|-------------|
| Event Cards | Name, organizer, timing, tags, seats filled / total |
| Registration | One-click event registration |
| Live Seats | Real-time seat availability |
| Event Details | Rules, description, venue, schedule |
| Google Maps | One-click location view |
| Google Calendar | Add event directly to Google Calendar |

---

### 3. Projects & Innovation Hub

A discovery space for campus projects.

- Projects listed in modern card layout  
- Includes project description, tech stack, contributors  
- Helps juniors find seniors’ projects for inspiration  
- Acts as a campus innovation showcase  

---

### 4. Sports Facility Booking System

Digital booking platform for all campus sports resources.

| Feature | Description |
|--------|-------------|
| Facility Listing | Grounds, courts, gyms, equipment |
| Live Availability | Real-time slot tracking |
| Slot Booking | Book time slots in one click |
| Booking History | View past and upcoming reservations |
| Conflict Prevention | Prevents double booking |
| Admin Control | Add/remove facilities & slots |

---

### 5. Authentication & Roles

Role-based system to maintain platform quality.

| Role | Permissions |
|------|-------------|
| Student | Ask questions, register for events, book sports slots |
| Guide | Answer mentorship questions |
| Admin *(future)* | Verify guides, manage content |

---

### 6. Social & Community Layer *(Upcoming)*

- Campus-specific communities  
- Discussion threads  
- Project collaboration groups  
- Student interaction beyond academics  

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

## 🔐 Security & Access Control

- Only Guides can answer questions  
- Students cannot like the same answer twice  
- Sports slots are locked after booking  
- Role-based Firestore rules on every write  

---

## 📌 Why Campus360?

Campus360 is designed to become the **operating system of a university campus** — combining mentorship, events, projects, sports, and communities into one scalable, real-time platform.
