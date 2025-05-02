"""
Web Search Connector Setup Walkthrough

This module provides the setup walkthrough instructions for the Web Search connector.
It guides users through the process of obtaining API keys for different search engines.
"""

WEB_SEARCH_SETUP_WALKTHROUGH = {
    "name": "Web Search",
    "auth_type": "api_key",
    "steps": [
        {
            "title": "Choose a Search Engine",
            "description": "Decide which search engine provider you want to use with AgentBase.",
            "instructions": [
                "1. AgentBase supports multiple search engines: Google and Bing",
                "2. Each search engine requires a different API key setup process",
                "3. Choose the provider that best suits your needs",
                "4. Follow the instructions for your chosen provider in the next steps"
            ],
            "screenshot_url": "/setup/web_search/search_options.png"
        },
        {
            "title": "Google Search Setup (Option 1)",
            "description": "Set up a Google Programmable Search Engine and get your API key.",
            "instructions": [
                "1. Go to the [Google Programmable Search Engine](https://programmablesearchengine.google.com/)",
                "2. Click 'Get Started' or 'Create a Programmable Search Engine'",
                "3. Enter a name for your search engine",
                "4. Choose 'Search the entire web' or specific sites to search",
                "5. Click 'Create'",
                "6. On the next page, click 'Control Panel'",
                "7. Copy your 'Search engine ID' (cx value) - you'll need this later"
            ],
            "screenshot_url": "/setup/web_search/google_cse.png"
        },
        {
            "title": "Get Google API Key",
            "description": "Obtain a Google API Key to use with your Programmable Search Engine.",
            "instructions": [
                "1. Go to the [Google Cloud Console](https://console.cloud.google.com/)",
                "2. Create a new project if you don't have one already",
                "3. Navigate to 'APIs & Services' > 'Library'",
                "4. Search for 'Custom Search API' and enable it",
                "5. Go to 'APIs & Services' > 'Credentials'",
                "6. Click 'Create Credentials' > 'API Key'",
                "7. Copy your new API key"
            ],
            "screenshot_url": "/setup/web_search/google_api_key.png"
        },
        {
            "title": "Bing Search Setup (Option 2)",
            "description": "Get a Bing Search API key from Microsoft Azure.",
            "instructions": [
                "1. Go to the [Microsoft Azure Portal](https://portal.azure.com/)",
                "2. Sign in or create a new account if needed",
                "3. Click 'Create a resource'",
                "4. Search for 'Bing Search' and select 'Bing Search v7'",
                "5. Click 'Create'",
                "6. Fill in the required details:",
                "   - Subscription: Choose your subscription",
                "   - Resource group: Create new or use existing",
                "   - Name: Enter a name for your resource",
                "   - Pricing tier: Select an appropriate tier (F0 is free)",
                "   - Legal terms: Review and agree to the terms",
                "7. Click 'Review + create', then 'Create'"
            ],
            "screenshot_url": "/setup/web_search/bing_setup.png"
        },
        {
            "title": "Get Bing API Key",
            "description": "Retrieve your Bing API key from the Azure portal.",
            "instructions": [
                "1. Once your Bing Search resource is deployed, click 'Go to resource'",
                "2. In the left menu, under 'Resource Management', select 'Keys and Endpoint'",
                "3. Copy either 'Key 1' or 'Key 2' - both work the same",
                "4. Also note the endpoint URL provided (you may need this)"
            ],
            "screenshot_url": "/setup/web_search/bing_api_key.png"
        },
        {
            "title": "Configure in AgentBase",
            "description": "Add your search engine API key to AgentBase.",
            "instructions": [
                "1. Return to AgentBase and select 'Web Search' connector",
                "2. Choose your search provider (Google or Bing)",
                "3. Enter your API key",
                "4. If using Google, also enter your Search Engine ID (cx)",
                "5. Click 'Connect' to save your configuration"
            ],
            "screenshot_url": "/setup/web_search/agentbase_config.png"
        }
    ],
    "troubleshooting": [
        {
            "issue": "Invalid API key error",
            "solution": "Double-check that you've copied the API key correctly. Make sure there are no extra spaces or characters."
        },
        {
            "issue": "Quota exceeded error",
            "solution": "Free tier APIs have usage limits. Consider upgrading to a paid tier, or try again after the quota resets (usually the next day)."
        },
        {
            "issue": "Search not returning results",
            "solution": "For Google, verify your search engine ID (cx) is correct. For both providers, check if your search query is within the terms of service guidelines."
        },
        {
            "issue": "API key not working after creation",
            "solution": "Some APIs take a few minutes to activate. Wait 5-10 minutes after creating your key before trying again."
        }
    ]
} 