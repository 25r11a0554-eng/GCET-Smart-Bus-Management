# GCET Smart Bus Route and Student Transport Management System

A college transport management project for Geethanjali College of Engineering and Technology (GCET).

## Features
- Dashboard for transport overview
- Bus, route, student, driver and schedule management
- Java Spring Boot REST API
- Pickup-point based Smart Route Assistant
- Responsive HTML, CSS and JavaScript frontend

## Technology
- Frontend: HTML5, CSS3, JavaScript
- Backend: Java 17, Spring Boot, Spring Data JPA
- Database: H2 by default; MySQL dependency/configuration available
- Build: Apache Maven

## Project structure
```
frontend/    Web user interface
backend/     Java Spring Boot API
screenshots/ Presentation screenshots
README.md    Project documentation
```

## Run on Windows
1. Install JDK 17 and Apache Maven.
2. Open PowerShell in the `backend` folder.
3. Start the API:
   ```powershell
   mvn spring-boot:run
   ```
4. Open `frontend/index.html` in a browser.
5. Check the API at http://localhost:8080/api/health.

Keep the backend terminal open while using the website. The frontend uses `http://localhost:8080/api` by default. You can change it in browser localStorage with the key `smartbus_api`.

## API endpoints
- `GET /api/health`
- `GET /api/buses`, `POST /api/buses`, `DELETE /api/buses/{id}`
- `GET /api/routes`, `POST /api/routes`, `DELETE /api/routes/{id}`
- `GET /api/students`, `POST /api/students`, `DELETE /api/students/{id}`
- `GET /api/drivers`, `POST /api/drivers`, `DELETE /api/drivers/{id}`
- `GET /api/schedules`, `POST /api/schedules`, `DELETE /api/schedules/{id}`

## Important scope note
The Smart Route Assistant matches a typed pickup location against the route and pickup-point text stored in the system. It does not use live GPS, live traffic feeds, or real-time traffic optimization. Authentication, notifications and live vehicle tracking are not included in this version.

## Screenshots
See the `screenshots/` folder for the dashboard, bus management, route management and Smart Route Assistant screenshots.

## Deployment
The backend includes a Dockerfile. For an online deployment, host the backend and configure the frontend API base URL to the deployed backend address. Configure a persistent production database before relying on hosted data.
