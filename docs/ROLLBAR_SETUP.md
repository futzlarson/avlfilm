# Rollbar Error Tracking Setup

This document explains how Rollbar is configured and how to use it in the AVL Film project.

## Configuration

### 1. Get Your Rollbar Access Tokens

1. Go to [Rollbar](https://rollbar.com) and sign in (or create an account)
2. Create a project or select your existing project
3. Navigate to: **Settings → Project Access Tokens**
4. Copy your access tokens:
   - **post_server_item** - for server-side error tracking
   - **post_client_item** - for client-side error tracking (optional)

### 2. Add Tokens to Environment Variables

Add the following to your `.env.local` file:

```bash
# Rollbar Error Tracking
ROLLBAR_ACCESS_TOKEN="your_server_token_here"
ROLLBAR_CLIENT_ACCESS_TOKEN="your_client_token_here"  # Optional
```

For production (Vercel), add these as environment variables in your project settings.

## Features

### Automatic Error Tracking

Rollbar is configured to automatically track:

- **Server-side errors** in API routes (5xx status codes)
- **Uncaught exceptions** in server code
- **Unhandled promise rejections**
- **Client-side JavaScript errors** (production only)
- **Client-side unhandled promise rejections** (production only)

### Environment-Specific Behavior

- **Development**: Rollbar is disabled, errors only log to console
- **Production**: Rollbar is fully enabled and reports all errors

## Usage

### In API Routes

The error handling is already integrated into the `errorResponse` helper:

```typescript
import { errorResponse } from "../../lib/api";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Your code here
  } catch (error) {
    // This automatically logs to Rollbar if status is 5xx
    return errorResponse("Failed to process request", 500, error, request);
  }
};
```

### Manual Error Logging

For custom error logging, import the Rollbar utilities:

```typescript
import { logError, logWarning, logInfo } from "../../lib/rollbar";

// Log an error with context
logError(error, request, {
  userId: user.id,
  action: "submit-filmmaker",
  customData: "anything you want",
});

// Log a warning
logWarning("Deprecated API endpoint used", {
  endpoint: "/api/old-endpoint",
  caller: request.headers.get("user-agent"),
});

// Log an info message
logInfo("User completed onboarding", {
  userId: user.id,
  timestamp: new Date().toISOString(),
});
```

### Client-Side Error Tracking

Client-side errors are automatically captured by the `RollbarClient` component included in `BaseLayout.astro`. No additional code is needed.

## Deployment Version Tracking

Rollbar is configured to track code versions using Vercel's Git commit SHA:

```typescript
codeVersion: import.meta.env.PUBLIC_VERCEL_GIT_COMMIT_SHA;
```

This allows you to:

- See which deployment version caused errors
- Track error trends across deployments
- Use Rollbar's deploy tracking feature

## Source Maps (Optional)

For better error stack traces in production, you can upload source maps to Rollbar:

1. Install the Rollbar CLI:

   ```bash
   npm install --save-dev rollbar-cli
   ```

2. Add to your build script:
   ```bash
   rollbar-cli deploy --access-token=$ROLLBAR_ACCESS_TOKEN --environment=production
   ```

## Monitoring

### Rollbar Dashboard

Access your error dashboard at: https://rollbar.com/your-account/your-project

Key features:

- **Real-time error feed**
- **Error grouping** by similar stack traces
- **Occurrence tracking** over time
- **People tracking** to see affected users
- **Deployment tracking** to correlate errors with releases

### Alert Configuration

Configure alerts in Rollbar to notify you via:

- Email
- Slack
- PagerDuty
- Webhook

Recommended alert rules:

- New error types detected
- Error rate spikes
- Critical errors (errors with level "critical")

## Testing

### Test Server-Side Error Logging

Create a test API route:

```typescript
// src/pages/api/test-rollbar.ts
import type { APIRoute } from "astro";
import { logError } from "../../lib/rollbar";

export const GET: APIRoute = async ({ request }) => {
  const testError = new Error("Test error for Rollbar");
  logError(testError, request, { test: true });

  return new Response("Error logged to Rollbar", { status: 200 });
};
```

Visit `/api/test-rollbar` and check your Rollbar dashboard.

### Test Client-Side Error Logging

Add this to any page to test client-side tracking:

```html
<button onclick="throw new Error('Test client error')">
  Test Client Error
</button>
```

## Troubleshooting

### Errors Not Appearing in Rollbar

1. **Check environment**: Rollbar is disabled in development mode
2. **Verify tokens**: Ensure `ROLLBAR_ACCESS_TOKEN` is set correctly
3. **Check console**: Look for Rollbar-related errors in server logs
4. **Verify status codes**: Only 5xx errors are automatically logged via `errorResponse`

### Client-Side Errors Not Tracked

1. **Production only**: Client-side tracking is disabled in development
2. **Token required**: Ensure `ROLLBAR_ACCESS_TOKEN` or `ROLLBAR_CLIENT_ACCESS_TOKEN` is set
3. **Browser console**: Check for Rollbar snippet errors

## Best Practices

1. **Don't log sensitive data**: Avoid logging passwords, tokens, or PII
2. **Add context**: Include relevant metadata with errors
3. **Use appropriate levels**: error for exceptions, warning for issues, info for events
4. **Group errors**: Use consistent error messages for better grouping
5. **Monitor regularly**: Set up alerts and check dashboard weekly

## Resources

- [Rollbar Documentation](https://docs.rollbar.com/)
- [Rollbar Node.js SDK](https://docs.rollbar.com/docs/nodejs)
- [Source Maps Guide](https://docs.rollbar.com/docs/source-maps)
