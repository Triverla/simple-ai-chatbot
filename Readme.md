# Simple AI Chatbot
A simple AI chatbot that can be embedded into your website.

## How to use

```html
<!-- Embed the chatbot into your website -->
<script src="http://YOUR-DOMAIN/x-chatbot.js"></script>

<!-- Chatbot Settings -->
<script>
      initChatbot({
        apiKey: "api-key", // Required
        title: "Triverla AI Assistant", // Optional
        botAvatar: // Optional
          '<img src="https://st5.depositphotos.com/17510360/73700/i/450/depositphotos_737009700-stock-photo-cute-robot-cartoon-icon-character.jpg" width="24" height="24" alt="Bot">', //SVG allowed
        organizationName: "Triverla", //Required
        organizationUrls: [ // optional
          "https://example.com",
          "https://test.com",
        ],
      });
    </script>
```