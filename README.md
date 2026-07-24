# School website template

Public website plus results portals. Customise branding and content for **any school** without rewriting code.

## Customise for another school

**Easiest path — School setup** (developer only: open `/setup` directly)

1. Open `/setup` (password = headmaster password).
2. Download the **blank CSV template**, fill in the school’s details.
3. **Upload** the filled CSV (or Excel / `school.json`).
4. Download **school.json** → replace `public/school.json` → redeploy.

Optional: Headmaster → **Site settings** for fine-tuning copy after upload (if enabled).

## Portals (`/portal`)

### Student portal
1. Choose **Primary School** or **Junior High**
2. Pick your class
3. Log in with **full name + password** (from the headmaster)
4. View **published** results only

### Teacher portal
- Log in with full name + password
- Import class names / results, enter scores, send to class teacher

### Headmaster portal
- Manage classes, pupils, teachers, passwords
- **Site settings** — school name, brand colours, website copy (optional)

Pupil and teacher records live in the browser (`localStorage`). Site branding lives in `public/school.json` (plus optional browser preview).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
