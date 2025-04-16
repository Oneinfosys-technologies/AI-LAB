# OIS LabPro System Requirements

This document outlines the technical requirements, dependencies, and external service integrations needed to run the OIS LabPro platform.

## Hardware Requirements

### Minimum Requirements (Development/Testing)
- **CPU**: 1 core
- **RAM**: 1GB
- **Storage**: 10GB

### Recommended Requirements (Production)
- **CPU**: 2+ cores
- **RAM**: 4GB+
- **Storage**: 20GB+
- **Network**: 100Mbps+ connection

## Software Requirements

### Operating System
- Linux (Ubuntu 20.04 LTS or newer recommended)
- macOS for development
- Windows with WSL for development

### Runtime Environment
- **Node.js**: v20.x or newer
- **npm**: v9.x or newer

### Database
- **PostgreSQL**: v14.x or newer

### Web Server (Production)
- **Nginx**: v1.18.0 or newer
  - Alternatively, Apache with proxy capabilities

### Process Manager (Production)
- **PM2**: Latest version

## External Services & API Keys

### Required
1. **OpenAI API Key**
   - Used for generating AI-powered health insights and test result analysis
   - Pricing: Pay-as-you-go based on token usage
   - Obtain from: [OpenAI Platform](https://platform.openai.com/)

2. **Google Gemini API Key**
   - Used for powering the health chat assistant and diet recommendations
   - Pricing: Varies based on model and usage
   - Obtain from: [Google AI Studio](https://makersuite.google.com/app/apikey)

### Optional (for Future Integrations)
1. **SMS Service (e.g., Twilio)**
   - For appointment reminders and notifications
   - Pricing: Pay-as-you-go based on message volume

2. **Email Service (e.g., SendGrid, Mailgun)**
   - For transactional emails and report delivery
   - Pricing: Typically tier-based on email volume

## Environment Variables

The following environment variables must be configured for the application to function properly:

### Database Configuration
```
DATABASE_URL=postgresql://{username}:{password}@{host}:{port}/{database}
PGHOST={host}
PGUSER={username}
PGPASSWORD={password}
PGDATABASE={database}
PGPORT={port}
```

### API Keys
```
OPENAI_API_KEY={your_openai_api_key}
GOOGLE_API_KEY={your_google_api_key}
```

### Application Configuration
```
NODE_ENV=production  # Use 'development' for local development
PORT=5000  # The port the application should run on
SESSION_SECRET={secure_random_string}  # For session management
```

## Development Environment Setup

### Required Tools
- Git
- Node.js v20.x
- npm v9.x+
- PostgreSQL 14+
- Code editor (VS Code recommended)

### Recommended Extensions for VS Code
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- PostgreSQL
- Tailwind CSS IntelliSense

## Browser Support

The OIS LabPro web application is tested and supported on:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

Mobile browsers are supported on:
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

## Security Requirements

### Authentication
- Secure password storage using bcrypt
- Session management with express-session
- Role-based access control

### Data Protection
- HTTPS for all production deployments
- Database encryption for sensitive fields
- Input validation using Zod schemas

### API Security
- Rate limiting for public API endpoints
- JWT or session-based authentication for API requests
- CORS configuration for production environments

## Network Requirements

### Ports
- **HTTP**: 80 (redirected to HTTPS in production)
- **HTTPS**: 443
- **Application Server**: 5000 (default, configurable)
- **PostgreSQL**: 5432

### Firewall Rules
- Allow incoming connections on ports 80, 443
- Restrict direct access to port 5000 (should be accessed via reverse proxy)
- Restrict PostgreSQL access to local connections only

## Scalability Considerations

For high-traffic deployments, consider:
- Load balancing across multiple application servers
- Database read replicas
- Redis for session storage and caching
- CDN for static assets

## Dependencies License Requirements

The OIS LabPro application uses various open-source libraries and frameworks. Key dependencies include:

- **React**: MIT License
- **Express**: MIT License
- **PostgreSQL**: PostgreSQL License (similar to MIT)
- **Drizzle ORM**: MIT License
- **Tailwind CSS**: MIT License
- **shadcn/ui**: MIT License

A complete list of dependencies and their licenses can be found in the package.json file.

## Minimum Skills Required for Installation

- Basic Linux server administration
- Node.js application deployment
- PostgreSQL database management
- Nginx configuration (for production)
- Understanding of environment variables
- Basic networking and DNS configuration