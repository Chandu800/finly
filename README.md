# FinSight

A modern, user-friendly personal finance tracker built with React, Tailwind CSS, Supabase, and React Router.

## 🚀 Features (So Far)

- Secure authentication using Supabase (magic link email login)
- Responsive dashboard layout with sidebar navigation and topbar
- Overview cards for total balance, monthly spend, and income
- Client-side routing for Dashboard, Accounts, Transactions, Budgets, and Settings pages

## 🛠️ Tech Stack

- React
- Vite
- Tailwind CSS
- Supabase
- React Router
- React Icons

## 🏗️ Getting Started

1. Create an application with your desired language (here: React + JavaScript).
2. Install Tailwind CSS for styling ([Tailwind Installation Guide](https://v3.tailwindcss.com/docs/installation/framework-guides)).
3. Install dependencies and start the development server:

# 📂 Folder Structure (so far)

src/
components/
Auth.jsx
Sidebar.jsx
Topbar.jsx
DashboardHome.jsx
Accounts.jsx
Transactions.jsx
Budgets.jsx
Settings.jsx
layouts/
DashboardLayout.jsx
supabaseClient.js
App.jsx
main.jsx

## 🔑 Supabase Auth

- Create an account and new project in Supabase.
- Enable authentication (for MVP, email is enough).
- Create `src/Auth.jsx` with login/logout logic using magic link.
- On clicking "Send Magic Link," you receive a login link to your email.
- Now you can log in and log out securely.

## 🎨 UI Implementation

- Create components: Sidebar, Topbar, DashboardHome, etc.
- Install `react-router-dom` and set up routing for sidebar links using `BrowserRouter`, `Routes`, and `Route`.
- Add placeholder pages for Accounts, Transactions, Budgets, and Settings.

## 🖼️ Preview

_(Add a screenshot or GIF here!)_

## 🚧 Next Steps

- Set up Supabase database tables for accounts and transactions.
- Connect UI to real data.
- Build out Accounts and Transactions pages.

## 🙏 Credits

- [Supabase Docs](https://supabase.com/docs)
- [Tailwind UI](https://tailwindui.com/)
- [React Router Docs](https://reactrouter.com/)

## 📄 License

MIT
