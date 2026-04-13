# LIMS - Livestock Inventory Management System

A comprehensive, modern web application designed for managing livestock, tracking inventory, logging transactions, and generating reports. Built with **Angular 21**, **Angular Material**, and powered by a **Supabase** backend.

---

## ✨ Features

- **🔐 Secure Authentication:** Login system to manage access.
- **📊 Interactive Dashboard:** Overview of livestock, inventory, and recent activities.
- **🐄 Livestock Management:** Add, edit, and track individual livestock records (health, status, categories).
- **📦 Inventory Management:** Keep track of supplies, feeds, and equipment.
- **💸 Transaction Logging:** Monitor financial or inventory-related transactions (sales, purchases, usage).
- **📄 Report Generation:** Generate and export monthly reports directly to PDF (powered by `jsPDF`).
- **⚙️ Settings & Customization:** Manage system preferences and custom categories.

---

## 🛠️ Technology Stack

- **Frontend Framework:** [Angular 21](https://angular.dev/)
- **UI Components:** [Angular Material](https://material.angular.io/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** Supabase Auth
- **PDF Export:** `jsPDF` & `jspdf-autotable`
- **Routing/Deployment:** Vercel

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Angular CLI](https://angular.dev/tools/cli) installed globally (`npm install -g @angular/cli`)
- A [Supabase](https://supabase.com/) account and project.

### 1. Clone the Repository

```bash
git clone https://github.com/pogipotie/LIMS.git
cd LIMS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup (Supabase)

You need to set up your Supabase database schema before running the app.
Navigate to your Supabase project dashboard -> **SQL Editor** and run the migration scripts found in the `migration/` folder in this order:

1. `migration/001_initial_schema.sql` - Sets up the base tables and relationships.
2. `migration/002_custom_categories.sql` - Populates initial default categories.
3. `migration/supabase_schema.sql` - (If applicable) applies additional schema constraints or RLS policies.

### 4. Configure Environment Variables

Open the `src/environments/` folder. Ensure your `environment.ts` and `environment.prod.ts` files contain your specific Supabase credentials:

```typescript
export const environment = {
  production: false, // Set to true in environment.prod.ts
  supabaseUrl: 'YOUR_SUPABASE_PROJECT_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY'
};
```
*(Note: It is safe to expose your Supabase `anon` key in these files as long as Row Level Security (RLS) is properly configured in your Supabase database).*

### 5. Run the Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

---

## 🌐 Deployment

This project includes a `vercel.json` file configured for seamless deployment on **Vercel**.

1. Push your code to your GitHub repository.
2. Log in to [Vercel](https://vercel.com/) and create a **New Project**.
3. Import your GitHub repository (`pogipotie/LIMS`).
4. Vercel will automatically detect the Angular framework and configure the build settings.
5. Click **Deploy**.

*(The `vercel.json` ensures that Vercel properly handles Angular's client-side routing by redirecting all paths to `index.html`.)*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/pogipotie/LIMS/issues) if you want to contribute.

## 📝 License

This project is licensed under the MIT License.