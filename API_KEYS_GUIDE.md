# API Keys and Secrets Management Guide for OIS LabPro

This guide provides detailed information on obtaining, configuring, and securing the API keys and other secrets required for the OIS LabPro platform.

## Required API Keys

The OIS LabPro platform requires the following API key for full functionality:

### Google Gemini API Key

The Google Gemini API key is used for powering all AI features in the application, including:
- Health insights generation from test results
- Test result analysis and recommendations
- Health chat assistant
- Personalized diet plan generation

#### How to Obtain:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

Alternatively, through Google Cloud Platform:
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for and enable "Generative Language API"
5. Navigate to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "API Key"
7. Copy the API key

#### Pricing:
- Google offers a free tier for Gemini with generous limits
- Paid usage is based on the model used and tokens processed
- Estimated usage for a small to medium lab: $0-30/month depending on chat volume

#### Configuration:
Add the API key to your `.env` file:
```
GOOGLE_API_KEY=your_google_api_key
```

## Database Credentials

### PostgreSQL Database

The application requires a PostgreSQL database for storing all data.

#### Required Credentials:
- Database host
- Database username
- Database password
- Database name
- Database port

#### Configuration:
Add the database credentials to your `.env` file:
```
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=host
PGUSER=username
PGPASSWORD=password
PGDATABASE=database
PGPORT=port
```

## Session Secret

A session secret is required for secure cookie management and user sessions.

#### How to Generate:
Generate a random string using a secure method, such as:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

#### Configuration:
Add the session secret to your `.env` file:
```
SESSION_SECRET=your_generated_secret
```

## Environment Variables Template

Create a `.env` file in the root directory of your project with the following template:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=host
PGUSER=username
PGPASSWORD=password
PGDATABASE=database
PGPORT=port

# API Keys
GOOGLE_API_KEY=your_google_api_key

# Application Configuration
NODE_ENV=production  # or 'development' for local environment
PORT=5000  # The port on which the application will run
SESSION_SECRET=your_session_secret
```

## Securing API Keys and Secrets

### Best Practices for API Key Management

1. **Never commit secrets to version control**
   - Use `.env` files for local development
   - Add `.env` to your `.gitignore` file

2. **Use environment variables for production deployments**
   - Set environment variables through your hosting provider's dashboard
   - For self-hosted deployments, use a process manager like PM2 to set environment variables

3. **Restrict API key permissions**
   - Use minimal IAM permissions for Google API keys
   - Restrict the key to only the Gemini API if using Google Cloud Console

4. **Rotate keys regularly**
   - Change API keys every 6-12 months
   - Update keys immediately if you suspect they've been compromised

5. **Monitor API usage**
   - Set up billing alerts in Google Cloud Console
   - Regularly review usage patterns for anomalies

### Handling Secrets in Different Environments

#### Development
- Use a `.env.local` file that is not committed to Git
- Each developer should have their own API keys for testing

#### Staging/Testing
- Use separate API keys for testing environments
- Consider setting lower usage limits for testing keys

#### Production
- Use production API keys with appropriate usage limits
- Store secrets in a secure environment variable management system
- Consider using a secrets manager like AWS Secrets Manager, HashiCorp Vault, or similar

## Troubleshooting API Key Issues

### Google Gemini API Issues

1. **API Key Invalid**
   - Verify the key is correct
   - Check that you've enabled the Generative Language API

2. **Quota Exceeded**
   - Check your quota in the Google Cloud Console
   - Implement retries with exponential backoff

3. **API Not Enabled**
   - Ensure the Generative Language API is enabled for your project

## Security Considerations

### Key Exposure Prevention

1. **Environment Variables**
   - Never hardcode API keys in your application code
   - Don't log environment variables or include them in error reports

2. **Backend-Only Access**
   - Always make API calls from your backend, never from the client-side
   - Use your server as a proxy for API requests

3. **Network Security**
   - Use HTTPS for all communications
   - Consider IP restrictions for API access where available

### Monitoring for Key Misuse

1. **Usage Dashboards**
   - Regularly check your Google Cloud usage dashboard
   - Set up alerts for unusual activity

2. **Logging**
   - Log API request counts and types (but not the actual content)
   - Monitor for unusual patterns or spikes in usage

## Emergency Procedures

### If an API Key is Compromised

1. **Immediate Actions**
   - Revoke the compromised key immediately
   - Generate a new API key
   - Update the key in all environments
   - Assess the potential damage (e.g., unusual API usage)

2. **Investigation**
   - Determine how the key was compromised
   - Check for other potential security breaches
   - Review and update security practices

3. **Documentation**
   - Document the incident, including timeline and response
   - Update security procedures as needed