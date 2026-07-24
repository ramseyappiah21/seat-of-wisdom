# Seat of Wisdom School — Afrancho, Kumasi

Public website plus office tools and **results portals** for Seat of Wisdom School, Afrancho, Kumasi.

## Portals (`/portal`)

### Student portal
1. Choose **Primary School** or **Junior High**
2. Pick your class
3. Log in with **full name + password** (from the headmaster)
4. View **published** results only

### Teacher portal
- Log in with full name + password
- Import class names (one per line)
- Import names + results (CSV: `Full Name, Subject, CA, Exam`)
- Enter scores, save draft, then **Publish to pupils**

### Headmaster portal
- Issue / reset pupil and teacher portal passwords
- Demo login: `headmaster` / `SOW-HEAD-2026`

### Demo logins
| Role | Name | Password | Where |
|------|------|----------|-------|
| Pupil | Ama Mensah | SOW-AMA5 | Primary 5 |
| Pupil | Kofi Asante | SOW-KOFI1 | JHS 1 |
| Teacher | Mary Addo | SOW-TCH-ADDO | Teacher portal |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/portal](http://localhost:3000/portal).
