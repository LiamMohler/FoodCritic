# FoodCritic

A modern restaurant discovery and review application built with React and Spring Boot, powered by Google Places API.

## Features

- **Restaurant Discovery**: Search and discover restaurants using Google Places API
- **Location-Based Search**: Find restaurants near your current location
- **User Reviews**: Write and read reviews for restaurants
- **User Profiles**: Manage your profile and view your review history
- **Real-time Data**: Get up-to-date restaurant information including photos, ratings, and hours
- **Responsive Design**: Fully responsive design that works on all devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for server state management
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **Spring Boot 3** with Java 17
- **Spring Security** with JWT authentication
- **Spring Data JPA** with H2 database (development)
- **Spring Web** for REST API
- **Google Places API** integration

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Java 17+
- Maven 3.6+
- Google Places API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/foodcritic.git
   cd foodcritic
   ```

2. **Backend Setup**
   ```bash
   cd foodcritic-backend
   
   # Copy environment file and add your Google Places API key
   cp .env.example .env
   # Edit .env and add your GOOGLE_PLACES_API_KEY
   
   # Run the backend
   mvn spring-boot:run
   ```

3. **Frontend Setup**
   ```bash
   cd foodcritic-frontend
   
   # Install dependencies
   npm install
   
   # Copy environment file
   cp .env.example .env.local
   # Edit .env.local and add your VITE_GOOGLE_PLACES_API_KEY (same as backend)
   
   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

### Google Places API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API (New)
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Add the API key to both backend and frontend environment files

## Project Structure

```
foodcritic/
├── foodcritic-backend/          # Spring Boot backend
│   ├── src/main/java/com/foodcritic/
│   │   ├── controller/          # REST controllers
│   │   ├── service/            # Business logic
│   │   ├── model/              # JPA entities
│   │   ├── repository/         # Data repositories
│   │   ├── dto/                # Data transfer objects
│   │   └── security/           # Security configuration
│   └── src/main/resources/
│       └── application.yml     # Application configuration
├── foodcritic-frontend/         # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── contexts/           # React contexts
│   │   ├── services/           # API services
│   │   └── lib/                # Utilities and API client
│   └── public/                 # Static assets
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Restaurants
- `POST /api/google-places/search` - Search restaurants
- `GET /api/google-places/details/{placeId}` - Get restaurant details
- `POST /api/google-places/suggestions` - Get search suggestions

### Reviews
- `POST /api/reviews/{restaurantId}` - Create review
- `GET /api/reviews/restaurant/{restaurantId}` - Get restaurant reviews
- `GET /api/reviews/user/{userId}` - Get user reviews
- `PUT /api/reviews/{restaurantId}/{reviewId}` - Update review
- `DELETE /api/reviews/{restaurantId}/{reviewId}` - Delete review

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Development

### Frontend Development
```bash
cd foodcritic-frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd foodcritic-backend
mvn spring-boot:run              # Start development server
mvn clean compile               # Compile
mvn clean package              # Build JAR
```

## Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Set environment variables for production

### Backend (Railway/Heroku/AWS)
1. Set environment variables
2. Configure production database (PostgreSQL recommended)
3. Deploy using your platform's guidelines

## Environment Variables

### Backend (.env)
```
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
# Optional production database settings
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/foodcritic
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password
```

### Frontend (.env.local)
```
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
VITE_API_BASE_URL=http://localhost:8080/api
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
