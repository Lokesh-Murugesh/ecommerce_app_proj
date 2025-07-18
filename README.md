# E-commerce App

A basic e-commerce application built with Next.js and Firebase.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Firebase Setup](#firebase-setup)
- [Running the Development Server](#running-the-development-server)
- [Building for Production](#building-for-production)

## Prerequisites

Before you begin, ensure you have the following installed:

-   Node.js (LTS version recommended)
-   npm or pnpm

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd ecommerce_app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    pnpm install
    ```

## Firebase Setup

This project uses Firebase for backend services. You'll need to set up your Firebase project and configure the application.

1.  **Firebase Admin SDK:**

    Place your Firebase Admin SDK private key file (e.g., `small-shop-ecommerce-firebase-adminsdk-fbsvc-aeb7d43f71.json`) in the project root directory.

2.  **Environment Variables:**

    Create a `.env.local` file in the root of your project and add your Firebase client-side configuration and other necessary environment variables. You can get these from your Firebase project settings.

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

    # For Firebase Admin SDK (used in API routes)
    FIREBASE_ADMIN_PRIVATE_KEY_PATH=./small-shop-ecommerce-firebase-adminsdk-fbsvc-aeb7d43f71.json
    ```

    *Note: Replace `YOUR_...` with your actual Firebase project configuration values.* For the `FIREBASE_ADMIN_PRIVATE_KEY_PATH`, ensure the path to your service account key is correct.

## Running the Development Server

To run the application in development mode:

```bash
npm run dev
# or
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

To build the application for production:

```bash
npm run build
# or
pnpm run build
```

To start the production server:

```bash
npm run start
# or
pnpm run start
```
