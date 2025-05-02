"""
Gmail Connector Setup Walkthrough

This module provides the setup walkthrough instructions for the Gmail connector.
It guides users through the process of creating Google Cloud credentials and OAuth setup.
"""

GMAIL_SETUP_WALKTHROUGH = {
    "name": "Gmail",
    "auth_type": "oauth2",
    "steps": [
        {
            "title": "Create a Google Cloud Project",
            "description": "First, you'll need to create a project in Google Cloud Console to manage your API access.",
            "instructions": [
                "1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/)",
                "2. Click on the project dropdown at the top of the page",
                "3. Select 'NEW PROJECT'",
                "4. Enter a descriptive name (e.g., 'AgentBase Gmail Integration')",
                "5. Click 'CREATE' and wait for the project to be created"
            ],
            "screenshot_url": "/setup/gmail/create_project.png"
        },
        {
            "title": "Enable the Gmail API",
            "description": "Enable the Gmail API for your project to allow secure access to Gmail data.",
            "instructions": [
                "1. In your Google Cloud project, navigate to [API Library](https://console.cloud.google.com/apis/library)",
                "2. In the search bar, type 'Gmail API'",
                "3. Select 'Gmail API' from the search results",
                "4. Click the 'ENABLE' button",
                "5. Wait for confirmation that the API has been enabled"
            ],
            "screenshot_url": "/setup/gmail/enable_api.png"
        },
        {
            "title": "Configure OAuth Consent Screen",
            "description": "Set up the consent screen that users will see when granting access to their Gmail account.",
            "instructions": [
                "1. Navigate to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)",
                "2. For User Type, select 'External' (unless you have a Google Workspace organization)",
                "3. Click 'CREATE'",
                "4. Complete the required app information:",
                "   • App name: Enter 'AgentBase'",
                "   • User support email: Enter your email address",
                "   • Developer contact information: Enter your email address",
                "5. Click 'SAVE AND CONTINUE' to proceed"
            ],
            "screenshot_url": "/setup/gmail/consent_screen.png"
        },
        {
            "title": "Add Required API Scopes",
            "description": "Specify the Gmail API permissions your application will request from users.",
            "instructions": [
                "1. On the 'Scopes' step, click 'ADD OR REMOVE SCOPES'",
                "2. Add the following scopes by finding them in the list or pasting the URLs:",
                "   • https://www.googleapis.com/auth/gmail.readonly",
                "   • https://www.googleapis.com/auth/gmail.send",
                "   • https://www.googleapis.com/auth/gmail.compose",
                "3. Select all required scopes and click 'UPDATE'",
                "4. Click 'SAVE AND CONTINUE' to proceed to the next step"
            ],
            "screenshot_url": "/setup/gmail/add_scopes.png"
        },
        {
            "title": "Create OAuth Client ID",
            "description": "Create OAuth credentials that will allow your application to authenticate with Gmail securely.",
            "instructions": [
                "1. Navigate to [Credentials](https://console.cloud.google.com/apis/credentials)",
                "2. Click 'CREATE CREDENTIALS' at the top of the page",
                "3. Select 'OAuth client ID' from the dropdown menu",
                "4. For Application type, select 'Web application'",
                "5. Enter a name for your OAuth client (e.g., 'AgentBase Gmail Integration')",
                "6. Under 'Authorized redirect URIs', add: 'http://localhost:8000/api/v1/connectors/oauth2/callback'",
                "7. Click 'CREATE' to generate your credentials"
            ],
            "screenshot_url": "/setup/gmail/create_oauth.png"
        },
        {
            "title": "Save Your OAuth Credentials",
            "description": "Copy your OAuth credentials to connect AgentBase with your Gmail account.",
            "instructions": [
                "1. A popup window will display your newly created OAuth client credentials",
                "2. Copy the Client ID (a long string ending with .apps.googleusercontent.com)",
                "3. Copy the Client Secret (a shorter string)",
                "4. Store these values securely - you'll need them in the next step",
                "5. Click 'OK' to close the popup window"
            ],
            "screenshot_url": "/setup/gmail/credentials.png"
        },
        {
            "title": "Connect Your Gmail Account",
            "description": "Enter your OAuth credentials to complete the Gmail connection setup.",
            "instructions": [
                "1. Return to AgentBase and paste your Client ID in the 'Client ID' field",
                "2. Paste your Client Secret in the 'Client Secret' field",
                "3. Click 'Connect' to proceed with the OAuth authentication flow",
                "4. You'll be redirected to Google to authorize access to your Gmail account",
                "5. Select the Google account you want to connect and grant the requested permissions"
            ],
            "screenshot_url": "/setup/gmail/connect_gmail.png"
        }
    ],
    "troubleshooting": [
        {
            "issue": "I'm getting a 'redirect_uri_mismatch' error",
            "solution": "Ensure your redirect URI exactly matches 'http://localhost:8000/api/v1/connectors/oauth2/callback' in your Google Cloud OAuth client settings. Check for typos, extra spaces, or missing characters."
        },
        {
            "issue": "I see a 'This app isn't verified' warning",
            "solution": "This warning is normal for development apps. Click 'Advanced' and then 'Go to [Your App Name] (unsafe)' to proceed with the authentication process."
        },
        {
            "issue": "I can't find my client ID and secret after closing the popup",
            "solution": "You can retrieve your client ID and secret by going to the Credentials page in Google Cloud Console, finding your OAuth client in the list, and clicking the edit icon (pencil)."
        },
        {
            "issue": "I'm getting an authorization error during OAuth flow",
            "solution": "Make sure you've added all the required Gmail API scopes correctly. If the issue persists, try creating a new OAuth client ID with the correct settings."
        }
    ]
} 