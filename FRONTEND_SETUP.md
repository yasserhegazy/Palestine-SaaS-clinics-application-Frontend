# 🏥 Palestine Clinics SaaS

A comprehensive multi-tenant healthcare management system for Palestine with role-based authentication, bilingual support (Arabic/English), and modern healthcare workflows.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the login page.

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 3 minutes
- **[LOGIN_SYSTEM_README.md](./LOGIN_SYSTEM_README.md)** - Complete authentication guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## ✨ Features

### ✅ Complete Authentication System
- JWT token-based authentication with secure cookie storage
- Role-based access control (5 roles)
- Auto-redirect based on user permissions
- Session persistence across page refreshes

### 🌍 Bilingual Support
- Arabic & English interfaces
- RTL (Right-to-Left) layout for Arabic
- Real-time language switching
- Culturally appropriate design

### 👥 User Roles & Dashboards
1. **Platform Admin** - Manage all clinics
2. **Clinic Manager** - Clinic operations
3. **Doctor** - Patient care & appointments
4. **Secretary** - Reception & scheduling
5. **Patient** - Personal health records

### 🎨 Modern UI/UX
- Healthcare-themed design with Palestinian colors
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Loading states and error handling

## 🔐 Demo Credentials

| Role | Email |
|------|-------|
| Platform Admin | admin@platform.com |
| Clinic Manager | manager@clinic.com |
| Doctor | doctor@clinic.com |

*Contact backend team for passwords*

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios
- **State:** React Context API

## 📁 Project Structure

```
saas-clinic/
├── app/              # Next.js app directory
│   ├── login/        # Login page
│   ├── platform/     # Platform admin dashboard
│   ├── clinic/       # Clinic manager dashboard
│   ├── doctor/       # Doctor dashboard
│   ├── reception/    # Secretary dashboard
│   └── patient/      # Patient portal
├── context/          # React context (Auth)
├── lib/              # Utilities (API client)
└── types/            # TypeScript definitions
```

## 🔧 API Configuration

Backend API endpoint:
```
http://127.0.0.1:8000/api
```

Configure in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on port 8000

### Installation
```bash
npm install
npm run dev
```

### First Login
1. Navigate to `http://localhost:3000`
2. Enter demo credentials
3. You'll be redirected to your role-based dashboard

## 🔒 Security Features

- Input validation (client & server)
- XSS protection
- CSRF prevention
- Secure token storage
- Auto-logout on token expiration
- Rate limiting support

## 📱 Responsive Design

Works perfectly on:
- 📱 Mobile phones (< 768px)
- 📱 Tablets (768px - 1024px)
- 💻 Desktops (> 1024px)

## 🌍 Language Support

Switch between:
- 🇬🇧 English (LTR)
- 🇵🇸 Arabic (RTL)

Click the language toggle button anytime!

## 🧪 Testing

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📖 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### Project Documentation
- See `LOGIN_SYSTEM_README.md` for authentication details
- See `IMPLEMENTATION_SUMMARY.md` for technical overview

## 🆘 Troubleshooting

**API Connection Issues?**
- Ensure backend is running on port 8000
- Check `.env.local` configuration
- Verify CORS settings on backend

**Build Errors?**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## 🤝 Contributing

This is a healthcare SaaS system for Palestine. Contributions welcome!

## 📄 License

Copyright © 2025 Palestine Clinics SaaS. All rights reserved.

---

**Built with ❤️ for Palestinian Healthcare** 🇵🇸
