# E-commerce App for Makeup & Beauty Services

A comprehensive e-commerce platform built with Next.js and Firebase, tailored for the beauty and personal styling industry. This application provides a full suite of features for both customers and administrators, from product browsing to sales analytics.

 <!-- It's highly recommended to add a screenshot of your app's homepage here -->

## ✨ Features

-   **User Features:**
    -   Google & Email/Password Authentication
    -   Server-Side Rendered Product & Category Browsing
    -   Dynamic Shopping Cart
    -   Multi-Step Checkout with Mock Payment Gateway
    -   Order History & PDF Invoice Generation
-   **Admin Features:**
    -   Secure Admin Dashboard
    -   Full CRUD Management for Products & Categories
    -   Live Order Tracking & Status Updates
    -   Inventory Management
    -   Sales Analytics & Reporting Dashboard
    -   User Role Management (Admin/Moderator)

## 🛠️ Technology Stack

-   **Frontend:** Next.js, React, Tailwind CSS
-   **Backend & Database:** Firebase (Authentication, Firestore)
-   **Server-Side Logic:** Next.js API Routes, Firebase Admin SDK
-   **UI & Data Viz:** TanStack Table, Recharts, Embla Carousel
-   **Testing:** Pytest (Database), Cypress/Playwright (E2E)
-   **Deployment:** Docker

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:
-   Node.js (LTS version recommended)
-   npm or pnpm
-   Python (for running database tests)
-   Docker Desktop (for containerized deployment)

### 1. Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Lokesh-Murugesh/ecommerce_app_proj
    cd ecommerce_app_proj
    ```

2.  **Install project dependencies:**
    ```bash
    npm install
    # or if you use pnpm
    pnpm install
    ```

### 2. Firebase & Environment Setup

This project requires both client-side and server-side Firebase credentials.

1.  **Download Firebase Admin SDK Key:**
    -   Go to your Firebase Project Settings > Service accounts.
    -   Click **"Generate new private key"** and save the downloaded JSON file.

2.  **Create Environment File:**
    -   In the root of the project, create a new file named `.env.local`.
    -   Copy the content of `.env.example` (if provided) or use the template below and fill it with your credentials.

    ```env
    # Firebase Client-Side Configuration (from Project Settings > General)
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

    # Firebase Admin SDK Configuration (from your downloaded JSON key file)
    # IMPORTANT: For the private_key, you must format it as a single line with '\n' for newlines.
    FIREBASE_PROJECT_ID="your-project-id"
    FIREBASE_CLIENT_EMAIL="firebase-adminsdk-..."
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"

    # Other Service Keys (if applicable)
    # NEXT_PUBLIC_RAZORPAY_KEY_ID=...
    # RAZORPAY_SECRET=...
    ```

### 3. Running the Application

You can run the app in three different modes:

#### A) Development Mode

This provides hot-reloading and is ideal for active development.
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

#### B) Production Mode (Locally)

This builds the application for production and starts a local server to simulate a live environment.
```bash
# 1. Build the application
npm run build

# 2. Start the production server
npm run start
```

#### C) Using Docker 🐳

This runs the application in a containerized environment, which is great for ensuring consistency.

1.  **Build the Docker image:**
    ```bash
    docker build -t ecommerce-nextjs .
    ```

2.  **Run the Docker container:**
    This command starts the container in detached mode, maps port 3000, and passes your `.env.local` file to the container.
    ```bash
    docker run -d -p 3000:3000 --env-file ./.env.local --name ecommerce-container ecommerce-nextjs
    ```
The application will be available at [http://localhost:3000](http://localhost:3000).

-   To stop the container: `docker stop ecommerce-container`
-   To view logs: `docker logs -f ecommerce-container`

### 4. 🧪 Running Tests

This project includes database-level tests written in Python using `pytest`.

1.  **Place Admin SDK Key for Testing:**
    -   Copy your Firebase Admin SDK private key file (the `.json` file you downloaded) and place it inside the `tests/` folder.

2.  **Install Python Dependencies:**
    -   Navigate to the `tests/` directory and install the required packages.
    ```bash
    cd tests
    pip install -r requirements.txt
    ```

3.  **Run Pytest:**
    -   From within the `tests/` directory, run the tests using `pytest`.
    ```bash
    pytest
    ```
    The test suite will execute, creating and cleaning up test data in your Firestore database.