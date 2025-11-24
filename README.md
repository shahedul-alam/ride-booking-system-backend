# Jatra - Ride Booking System Backend

[Live API Link](https://ride-booking-system-backend-eta.vercel.app/)

-----

## 📝 Description

**Jatra** is a robust and scalable backend service designed to power a modern ride-hailing application. It is built to manage user and driver authentication, real-time ride requests, sophisticated fare calculation, and status tracking. The architecture emphasizes modularity, security, and performance, utilizing **Node.js**, **Express**, and **TypeScript** for a reliable foundation.

## ✨ Key Features

This project implements a full suite of features necessary for a functional ride-booking platform:

  * **Role-Based Authentication**: Separate secure authentication flows for **Users**, **Drivers**, and **Admins** using **JSON Web Tokens (JWT)**.
  * **Real-time Ride Management**: Utilizes **Socket.io** to facilitate instantaneous ride requests, driver matching, location updates, and ride status changes.
  * **Advanced Fare Calculation**: Includes a utility to calculate distance and estimated fare based on geographical coordinates (likely Haversine formula based on file name `calculateDistanceAndFare.ts`).
  * **Driver Availability Toggle**: Drivers can easily switch their status to **online** or **offline**.
  * **Secure Credential Management**: Implements secure password hashing via **Bcrypt** and offers a robust password reset flow via **OTP (One-Time Password)** or email links.
  * **Data Persistence & Caching**: Uses **MongoDB** for primary data storage and **Redis** for efficient caching of temporary, high-access data (e.g., sessions, OTPs, real-time driver availability).
  * **Comprehensive Error Handling**: Custom middleware handles common errors, including **Mongoose** validation, cast errors, duplicate key errors, and **Zod** schema validation failures, providing clear API responses.
  * **Modular Architecture**: Organized into distinct modules (Auth, User, Driver, Ride, Admin) for high maintainability and separation of concerns.

-----

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | **Node.js, Express.js** | Server environment and high-performance web framework. |
| **Language** | **TypeScript** | Enhances code quality and stability with static typing. |
| **Database** | **MongoDB (Mongoose)** | Flexible, NoSQL database with powerful object data modeling. |
| **Real-time** | **Socket.io** | Enables low-latency, bidirectional communication for ride updates. |
| **Authentication** | **JWT, Passport.js, Bcrypt** | Secure user sessions and password storage. |
| **Validation** | **Zod** | Schema-based data validation for API requests. |
| **Caching/Broker** | **Redis** | Used for fast-access data storage and potentially coordinating real-time data. |
| **Email Service** | **Nodemailer, EJS** | Handling email sending for verification and password reset notifications. |

-----

## ⚙️ Installation & Setup

### Prerequisites

  * Node.js (LTS version)
  * MongoDB Instance (Local or Hosted)
  * Redis Instance (Local or Hosted)

### Steps

1.  **Clone the Repository:**

    ```bash
    git clone <repository-link>
    cd ride-booking-system-backend
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    Create a file named **`.env`** in the root directory and populate it with the necessary configuration details.

    ```
    # SERVER CONFIG
    NODE_ENV=development
    PORT=5000

    # DATABASE
    DATABASE_URL=<Your MongoDB Connection String>

    # REDIS
    REDIS_URL=<Your Redis Connection String>

    # JWT SECRETS
    JWT_ACCESS_SECRET=<A long, random secret key for access token>
    JWT_REFRESH_SECRET=<A long, random secret key for refresh token>

    # EMAIL CONFIG (Nodemailer)
    EMAIL_HOST=<Your Email Host>
    EMAIL_PORT=<Your Email Port>
    EMAIL_USER=<Your Email User>
    EMAIL_PASS=<Your Email Password>

    # SUPER ADMIN SEEDING (Optional)
    SUPER_ADMIN_PASSWORD=<Initial password for super admin>
    SUPER_ADMIN_EMAIL=<Initial email for super admin>
    ```

4.  **Run the Project:**

      * **Development Mode (with Hot Reload):**
        ```bash
        npm run start:dev
        ```
      * **Production Mode (Build and Start):**
        ```bash
        npm run build
        npm start
        ```

    The API will start running on the configured port (default is `5000`).

-----

## 🗺️ API Endpoints Summary

All endpoints are prefixed with `/api/v1`.

| Module | HTTP Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Register a new user. | Public |
| **Auth** | `POST` | `/auth/login` | Authenticate a user/driver and receive tokens. | Public |
| **Auth** | `POST` | `/auth/refresh-token` | Obtain a new access token. | Public |
| **Auth** | `POST` | `/auth/forgot-password` | Initiate password reset via email/OTP. | Public |
| **User/Profile**| `GET` | `/user/profile` | Retrieve the authenticated user's details. | User, Driver, Admin |
| **Driver** | `PATCH` | `/driver/toggle-status` | Driver updates their online/offline status. | Driver |
| **Ride** | `POST` | `/rides/request` | User requests a ride from a location to a destination. | User |
| **Ride** | `PATCH` | `/rides/:rideId/accept` | Driver accepts an incoming ride request. | Driver |
| **Ride** | `PATCH` | `/rides/:rideId/complete` | Driver marks the ride as complete. | Driver |
| **Ride** | `GET` | `/rides/my-rides` | Fetch the ride history of the authenticated user/driver. | User, Driver |
| **Admin** | `POST` | `/admin/create-driver` | Create a new driver profile. | Admin |
| **Admin** | `GET` | `/admin/drivers` | Fetch a list of all registered drivers. | Admin |

-----

## 🏗️ Project Architecture

The backend implements a clear **Layered/Modular Architecture** to ensure maintainability and scalability:

1.  **Routes Layer**: Defines all API routes and maps them to Controller functions.
2.  **Controller Layer**: Handles incoming HTTP requests, calls the appropriate Service function, and sends the response back to the client. Uses `catchAsync` utility for centralized error handling.
3.  **Service Layer**: Contains the core business logic, interacting with the Database (Models) and other utilities (fare calculation, real-time updates).
4.  **Model Layer**: Defines the Mongoose schemas and database interaction logic for each entity.

Key directories:

  * `src/app/modules`: Contains the segregated code for each feature (Controller, Service, Model, Route, Validation).
  * `src/app/middlewares`: Central place for request processing and error handling middlewares.
  * `src/app/utils`: Reusable helper functions (JWT, responses, email, distance calculation, etc.).
  * `src/app/config`: Environment, database, and Redis configuration setup.