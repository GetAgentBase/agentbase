"""
Google Calendar Connector Setup Walkthrough

This module provides the setup walkthrough instructions for the Google Calendar connector.
It guides users through the process of creating Google Cloud credentials and OAuth setup.
"""

GOOGLE_CALENDAR_SETUP_WALKTHROUGH = {
    "name": "Google Calendar",
    "auth_type": "oauth2",
    "steps": [
        {
            "title": "Create a Google Cloud Project",
            "description": "First, you need to create a project in Google Cloud Console.",
            "instructions": [
                "1. Go to the [Google Cloud Console](https://console.cloud.google.com/)",
                "2. Click on the project dropdown at the top of the page",
                "3. Click 'NEW PROJECT'",
                "4. Enter a name for your project (e.g., 'AgentBase Calendar')",
                "5. Click 'CREATE'"
            ],
            "screenshot_url": "/setup/calendar/create_project.png"
        },
        {
            "title": "Enable the Google Calendar API",
            "description": "Enable the Google Calendar API for your project to allow access to calendar data.",
            "instructions": [
                "1. In your Google Cloud project, go to [API Library](https://console.cloud.google.com/apis/library)",
                "2. Search for 'Google Calendar API'",
                "3. Click on 'Google Calendar API' in the results",
                "4. Click 'ENABLE'",
                "5. Wait for the API to be enabled"
            ],
            "screenshot_url": "/setup/calendar/enable_api.png"
        },
        {
            "title": "Configure OAuth Consent Screen",
            "description": "Set up the consent screen that users will see when granting access to their calendar.",
            "instructions": [
                "1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)",
                "2. Select 'External' as the user type (unless you have a Google Workspace organization)",
                "3. Click 'CREATE'",
                "4. Enter your app information:",
                "   - App name: 'AgentBase'",
                "   - User support email: Your email address",
                "   - Developer contact information: Your email address",
                "5. Click 'SAVE AND CONTINUE'"
            ],
            "screenshot_url": "/setup/calendar/consent_screen.png"
        },
        {
            "title": "Add API Scopes",
            "description": "Add the required Calendar API scopes that your application needs.",
            "instructions": [
                "1. On the 'Scopes' step, click 'ADD OR REMOVE SCOPES'",
                "2. Add the following scopes:",
                "   - https://www.googleapis.com/auth/calendar.readonly",
                "   - https://www.googleapis.com/auth/calendar.events",
                "3. Click 'UPDATE'",
                "4. Click 'SAVE AND CONTINUE'"
            ],
            "screenshot_url": "/setup/calendar/add_scopes.png"
        },
        {
            "title": "Create OAuth Client ID",
            "description": "Create OAuth credentials for your application to authenticate with Google Calendar.",
            "instructions": [
                "1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)",
                "2. Click 'CREATE CREDENTIALS' and select 'OAuth client ID'",
                "3. For Application type, select 'Web application'",
                "4. Enter a name for your OAuth client, e.g., 'AgentBase Calendar Client'",
                "5. Under 'Authorized redirect URIs', add: 'http://localhost:8000/api/v1/connectors/oauth2/callback'",
                "6. Click 'CREATE'"
            ],
            "screenshot_url": "/setup/calendar/create_oauth.png"
        },
        {
            "title": "Get Your OAuth Credentials",
            "description": "Get the client ID and client secret for your application.",
            "instructions": [
                "1. A popup will appear with your OAuth client ID and client secret",
                "2. Copy your client ID and client secret",
                "3. Click 'OK' to close the popup",
                "4. Paste these credentials into the AgentBase connector setup form"
            ],
            "screenshot_url": "/setup/calendar/credentials.png"
        }
    ],
    "troubleshooting": [
        {
            "issue": "I'm getting a 'redirect_uri_mismatch' error",
            "solution": "Make sure your redirect URI exactly matches 'http://localhost:8000/api/v1/connectors/oauth2/callback'. Check for typos or extra spaces."
        },
        {
            "issue": "I'm getting a 'This app isn't verified' warning",
            "solution": "This is normal for development apps. Click 'Advanced' and then 'Go to [Your App Name] (unsafe)' to proceed."
        },
        {
            "issue": "I can't access my Calendar after setup",
            "solution": "Make sure you've added the correct scopes. You may need to disconnect and reconnect the Calendar connector with the proper permissions."
        }
    ]
} 