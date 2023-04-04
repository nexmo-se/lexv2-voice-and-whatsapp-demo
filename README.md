# Vonage Lex V2 Voice and Messaging Demo

This demo shows how to integrate Lex V2 into Vonage's Voice and Messaging API

### Prerequisites
1. Node Js environment (10 up)
2. [A Vonage Account](https://developer.vonage.com/en/account/guides/dashboard-management#create-and-configure-a-vonage-account)
3. A Messaging and Voice enabled Vonage Application (see Creating Application)
4. A Lex V2 application and it's ```aws-config.json``` file
5. Your Vonage application's private key
6. Keys and Secrets (vonage and aws), Region info (aws)
7.  (optional) Link your external Messaging account via [External Accounts](https://dashboard.nexmo.com/messages/social-channels)
	Note: You can test Using [Messages: Sandbox ](https://dashboard.nexmo.com/messages/sandbox) if you are not setting up an external account.
	
### Creating Application

You can create Messages and Voice applications in the  [Dashboard](https://dashboard.nexmo.com/applications).

To create your application using the Dashboard:

1.  Under  [Applications](https://dashboard.nexmo.com/applications)  in the Dashboard, click the  **Create a new application**  button.
    
2.  Under  **Name**, enter the Application name. Choose a name for ease of future reference.
    
3.  Click the button  **Generate public and private key**. This will create a public/private key pair and the private key will be downloaded by your browser. (name it as private.key)
    
4.  Under  **Capabilities**  select the  **Messages** and **Voice** button.
    
5.  In the  **Inbound URL**  box, set method to POST, and enter the URL for your inbound message webhook, for example,  `https://YOUR_APP_URL/webhooks/inbound-messaging`.
6.  In the  **Answer URL**  box, set method to GET, enter the URL for your inbound message webhook, for example,  `https://YOUR_APP_URL/webhooks/inbound-call`.
    
7.  In the  **Status URL**  box, set method to POST, enter the URL for your message status webhook, for example,  `https://YOUR_APP_URL/webhooks/messaging-events`.
8. 7.  In the  **Event URL**  box, set method to GET, enter the URL for your message status webhook, for example,  `https://YOUR_APP_URL/webhooks/call-events`.
    
9.  Click the  **Generate new application**  button. You are now taken to the next step of the Create Application procedure where you can link a Vonage API number to the application, and link external accounts such as Facebook to this application.
    
10.  If there is an external account you want to link this application to, click the  **Linked external accounts**  tab, and then click the corresponding  **Link**  button for the account you want to link to.
    
You have now created your application.

### Configuration
1. Clone this demo
2. Copy your ```private.key``` and ```aws-config.json``` into the  root directory of the demo.
3. Make a ```.env``` file with these content:
	```APPLICATION_ID=<VONAGEvAPPLICATIONID>
		API_KEY=<VONAGE APIKEY>
		API_SECRET=<APP SECRET>
		VONAGE_NUMBER=<LINKED VONAGE NUMBER>
		PRIVATE_KEY='./private.key'
		PORT=<PORT WHERE THIS WILL RUN IE: 3000>
		URL=<THE URL WHERE THIS APP WILL RUN>
		LEX_BOT_ALIAS=<LEX_BOT_ALIAS>
		LEX_BOT_ID=<LEX_BOT_ID>
		LEX_LOCALE_ID=<LEX_LOCALE_ID sample: en_US, en_GB>
	```

### Run
After config, just run using ```node app.js``` and configure your webserver or ngrok. Do not forget to configure your URLs as explained in the **Creating Application** section.

You can now call your LVN number to talk to your LEX bot or interact with it using messaging applications (Whatsapp, Meta Messenger, Viber)
