<div align="center">
    <h1>【 Crunch Time 】</h1>
    <h3></h3>
</div>

<div align="center">

![](https://shields.octopi.ai/github/last-commit/MdAbirhasann/CSE327_Project?&style=for-the-badge&color=8ad7eb&logo=git&logoColor=D9E0EE&labelColor=1E202B)
![](https://shields.octopi.ai/github/stars/MdAbirhasann/CSE327_Project?style=for-the-badge&logo=andela&color=86dbd7&logoColor=D9E0EE&labelColor=1E202B)
![](https://shields.octopi.ai/github/repo-size/MdAbirhasann/CSE327_Project?color=86dbce&label=SIZE&logo=protondrive&style=for-the-badge&logoColor=D9E0EE&labelColor=1E202B)
![](https://shields.octopi.ai/github/forks/MdAbirhasann/CSE327_Project?color=86dbce&label=FORKS&logo=forgejo&style=for-the-badge&logoColor=D9E0EE&labelColor=1E202B)

</div>

<div align="center">

<br />

**Fast · Fresh · Seamless**

A full-stack food ordering and delivery platform connecting customers, chefs, delivery riders, and administrators in a seamless end-to-end workflow.

<br />

[![Next.js](https://img.shields.io/badge/NEXT.JS-16.2.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white&labelColor=000000)](https://nextjs.org)
[![React](https://img.shields.io/badge/REACT-19-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=20232A)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TYPESCRIPT-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=1a1a2e)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TAILWIND_CSS-V4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0f172a)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/SHADCN%2FUI-RADIX--LYRA-18181B?style=for-the-badge&logo=shadcnui&logoColor=white&labelColor=18181B)](https://ui.shadcn.com)

</div>

---

## 🎓 Course Info & Team

| | |
|---|---|
| **Course** | CSE327 · Software Engineering |
| **Faculty** | Suri Dipannita Sayeed (SUS) |
| **Section** | 9 |
| **Institution** | North South University |

## 👥 Team

| Name | ID |
|---|---|
| Talat Mahmud | 1813080642 |
| Fardin Khan | 2411265042 |
| Md. Abir Hasan | 2021833642 |
| Munshi Saif Hossain | 2131139642 |
| Ahamed Osman Asif | TBA |

---

## ✨ Roles & Flows

The platform is built around four distinct user roles, each with a purpose-built experience:

| Role              | Flow |
|-------------------|---|
| 🛒 **Customer**   | Browse the menu, manage cart, checkout, track order progress in real-time |
| 👨‍🍳 **Chef**    | Receive incoming orders, accept or deny, mark individual dishes as ready |
| 🛵 **Delivery**   | Pick up completed orders, deliver, and mark as delivered |
| ⚙️ **Management** | Manage the full dish catalog — add, edit, remove |

---

## 🛠 Tech Stack

| Concern | Choice |
|---|---|
| **Framework** | Next.js 16 App Router + React 19 |
| **Database** | Neon Postgres via Prisma v7 |
| **Auth** | Better Auth — Google OAuth + Passkey |
| **File Storage** | Vercel Blob |
| **UI** | shadcn/ui · style `radix-lyra` · base color `zinc` |
| **Styling** | Tailwind CSS v4 · CSS variables |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
crunch-time/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Sign-in / passkey flows
│   ├── (customer)/         # Customer-facing pages
│   ├── (chef)/             # Chef dashboard
│   ├── (delivery)/         # Delivery dashboard
│   ├── (admin)/            # Admin panel
│   ├── api/                # Route handlers
│   └── theme/              # Theme configuration
├── components/
│   ├── ui/                 # shadcn/ui primitives — do not hand-edit
│   └── reactbits/          # Animation & effect components
├── lib/                    # Shared utilities & Prisma singleton
├── prisma/                 # Database schema & migrations
├── public/
│   └── images/             # Static assets
│
├── .env.example            # Environment variable template
├── components.json         # shadcn/ui configuration
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

**1. Clone and install**

```bash
git clone <repo-url>
cd crunch-time
npm install
```

**2. Set up environment variables**

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, auth secrets, Vercel Blob token, etc.
```

**3. Set up the database**

```bash
npx prisma db push      # Sync schema to Neon
npx prisma generate     # Generate Prisma client
```

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts

```bash
npm run dev            # Start development server (http://localhost:3000)
npm run build          # Production build
npm run lint           # ESLint
npm run format:write   # Prettier — auto-fix formatting
```