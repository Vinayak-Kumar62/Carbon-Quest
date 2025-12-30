CarbonQuest – Carbon Footprint Tracking Platform

CarbonQuest is a cloud-based sustainability platform that helps users measure, track, and reduce their carbon footprint. The application focuses on awareness, data-driven insights, and simple actions that encourage environmentally responsible behavior.

The project demonstrates real-world application development with structured data handling, user authentication, and analytics-driven dashboards.

Features
Core Functionality

User Authentication: Secure sign up and login system for personalized tracking

Carbon Footprint Calculation: Calculate emissions based on daily activities such as travel, electricity usage, and consumption habits

Activity Tracking: Log and manage carbon-generating activities over time

Dashboard Analytics: Visual representation of emissions with charts and summaries

Progress Tracking: Monitor emission trends and reduction progress

Recommendations: Actionable tips to reduce carbon footprint

Sustainability Focus

Emission calculations based on standard carbon estimation formulas

Category-wise emission breakdown (transport, energy, lifestyle)

Awareness-driven UI design to promote eco-friendly decisions

User Experience

Simple and intuitive interface

Responsive design for desktop and mobile

Clean dashboards with clear data visualization

Easy activity input and history tracking

Tech Stack
Frontend

React

Tailwind CSS

Chart.js for data visualization

Backend & Cloud

Node.js

Express.js

MongoDB for data storage

JWT-based authentication

Database Schema
Collections

users – User profile and authentication data

activities – Logged user activities related to carbon emissions

emissions – Calculated emission records with timestamps

Getting Started
Prerequisites

Node.js 18+

MongoDB (local or cloud)

Setup Instructions
Clone and Install
git clone https://github.com/Vinayak-Kumar62/Carbon-Quest.git
cd Carbon-Quest
npm install

Configure Environment Variables

Create a .env file in the root directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Run the Application
npm start


The application will start at:

http://localhost:5000

Usage Guide
Sign Up / Login

Create a new account using email and password

Log in to access your personalized dashboard

Add Activities

Enter daily activities such as travel distance or electricity usage

Submit data to calculate emissions instantly

View Dashboard

Track total carbon footprint

View category-wise emission breakdown

Monitor progress over time

Improve Sustainability

Follow suggested tips displayed on the dashboard

Compare historical data to measure improvement

Architecture Highlights
Security

JWT-based authentication

Secure API routes

User data isolation

Performance

Optimized API calls

Lightweight frontend components

Efficient database queries

Scalability

Modular backend architecture

Easily extendable activity categories

Cloud-ready deployment

API Design
User APIs

Register and authenticate users

Manage user sessions securely

Activity APIs

Add, update, and delete activities

Calculate emissions dynamically

Analytics APIs

Fetch aggregated emission data

Provide insights for dashboard charts

Interview Talking Points
What Makes This Project Stand Out

Focuses on real-world sustainability challenges

Combines analytics with environmental awareness

End-to-end full-stack implementation

Clear separation of frontend and backend logic

Technical Decisions

MongoDB for flexible activity-based data

JWT for stateless authentication

React for dynamic UI updates

Modular API design for future scalability

Project Structure
Carbon-Quest/
├── client/               # Frontend React app
│   ├── components/       # UI components
│   ├── pages/            # Application pages
│   └── utils/            # Helper functions
├── server/               # Backend Node.js app
│   ├── routes/           # API routes
│   ├── models/           # Database schemas
│   ├── controllers/      # Business logic
│   └── middleware/       # Auth and validation
└── README.md

Future Enhancements

Carbon offset integration

Goal-based emission reduction tracking

Export reports as PDF

Admin dashboard for analytics

Mobile application

Community challenges and leaderboards

License

MIT License
