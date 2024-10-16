(function () {
    function initChatbot(customSettings = {}) {
      // Default settings
      const defaultSettings = {
        apiKey: "",
        title: "Chat with AI Assistant",
        primaryColor: "#00A0E3",
        secondaryColor: "#e1f5fe",
        fontFamily: "Arial, sans-serif",
        botAvatar:
          '<img src="https://st5.depositphotos.com/17510360/73700/i/450/depositphotos_737009700-stock-photo-cute-robot-cartoon-icon-character.jpg" width="24" height="24" alt="Bot">',
        placeholderText: "Ask me anything...",
        sendButtonText: "➤",
        footerText:
          'Powered by <a href="https://wootlab.ng" target="_blank">Codeminds</a>',
        showPoweredBy: false,
        defaultPrompts: [
          "Tell me about Wootlab",
          "What is the company's mission?",
          "What are the services offered by Wootlab?",
        ],
        organizationName: "Wootlab",
        organizationUrls: ["https://wootlab.ng"],
        systemInstruction: (orgName, orgUrls) => {
          const urlString =
            orgUrls.length > 1
              ? `Get information from the following sources: ${orgUrls.join(
                  ", "
                )}`
              : `Get information from ${orgUrls[0]}`;
          return `You are a professional virtual assistant for ${orgName}. Provide accurate and concise information about ${orgName}'s services, mission, and initiatives. Maintain a formal and helpful tone in all interactions. ${urlString}`;
        },
      };
  
      // Merge default settings with user-provided settings
      const settings = { ...defaultSettings, ...customSettings };
  
      // Check for missing API key
      if (!settings.apiKey) {
        console.error(
          "Chatbot initialization failed: API key is missing. Please provide a valid API key."
        );
        return;
      }
  
      // Validate color values
      const isValidColor = (color) => /^#[0-9A-F]{6}$/i.test(color);
      if (
        !isValidColor(settings.primaryColor) ||
        !isValidColor(settings.secondaryColor)
      ) {
        console.warn("Invalid color format. Using default colors.");
        settings.primaryColor = defaultSettings.primaryColor;
        settings.secondaryColor = defaultSettings.secondaryColor;
      }
  
      // Ensure defaultPrompts is an array
      if (!Array.isArray(settings.defaultPrompts)) {
        console.warn("Invalid defaultPrompts format. Using default prompts.");
        settings.defaultPrompts = defaultSettings.defaultPrompts;
      }
  
      // Trim long titles
      settings.title =
        settings.title.length > 50
          ? settings.title.substring(0, 47) + "..."
          : settings.title;
  
      // // Sanitize HTML in footerText
      // const sanitizeHTML = (html) => {
      //     const temp = document.createElement('div');
      //     temp.textContent = html;
      //     return temp.innerHTML;
      // };
      // settings.footerText = sanitizeHTML(settings.footerText);
  
      const API_KEY = settings.apiKey;
  
      let openAIConfig = {
        baseURL:
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=",
        apiKey: API_KEY,
      };
  
      const conversationHistory = [];
  
      const styles = `
          #chatbot-container {
              position: fixed;
              bottom: 20px;
              right: 20px;
              width: 300px;
              height: 600px;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              display: none;
              flex-direction: column;
              overflow: hidden;
              font-family: ${settings.fontFamily};
              resize: both;
              min-width: 200px;
              min-height: 300px;
              max-width: 800px;
              max-height: 600px;
          }
          #chatbot-resize-handle {
              position: absolute;
              bottom: 0;
              right: 0;
              width: 15px;
              height: 15px;
              cursor: se-resize;
              background: linear-gradient(135deg, transparent 50%, ${settings.primaryColor} 50%);
          }
          #chatbot-header {
              background-color: ${settings.primaryColor};
              color: white;
              padding: 10px;
              font-weight: bold;
              cursor: pointer;
          }
          #chatbot-close {
          position: absolute;
          top: 10px;
          right: 10px;
          cursor: pointer;
          color: white;
          font-size: 18px;
          }
          #chatbot-messages {
              flex-grow: 1;
              overflow-y: auto;
              padding: 10px;
          }
          #chatbot-input-area {
              display: flex;
              padding: 10px;
              border-top: 1px solid #e0e0e0;
          }
          #chatbot-input {
              flex-grow: 1;
              margin-right: 10px;
              padding: 5px;
              border: 1px solid #ccc;
              border-radius: 5px;
          }
          #chatbot-send {
              background-color: ${settings.primaryColor};
              color: white;
              border: none;
              padding: 5px 10px;
              cursor: pointer;
              border-radius: 3px;
          }
          #chatbot-footer {
              padding: 5px;
              text-align: center;
              font-size: 10px;
              color: #888;
              border-top: 1px solid #e0e0e0;
          }
          #chatbot-footer a {
              color: ${settings.primaryColor};
              text-decoration: none;
          }
          #chatbot-footer a:hover {
              text-decoration: underline;
          }
          #chatbot-toggle {
              position: fixed;
              bottom: 20px;
              right: 20px;
              width: 60px;
              height: 60px;
              background-color: ${settings.primaryColor};
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .message {
              display: flex;
              margin-bottom: 10px;
          }
          .message-content {
              padding: 8px 12px;
              border-radius: 18px;
              max-width: 80%;
              word-wrap: break-word;
              line-height: 1.5;
              position: relative;
          }
          .user-message .message-content {
              background-color: ${settings.secondaryColor};
              margin-left: auto;
          }
          .bot-message .message-content {
              background-color: #f5f5f5;
          }
          .bot-logo {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: ${settings.primaryColor};
              display: flex;
              justify-content: center;
              align-items: center;
              margin-right: 8px;
          }
          .message-content pre {
              background-color: #f4f4f4;
              border-radius: 4px;
              padding: 10px;
              overflow-x: auto;
              white-space: pre-wrap;
              position: relative;
              margin-bottom: 20px;
          }
          .message-content code {
              font-family: monospace;
              background-color: #f4f4f4;
              padding: 2px 4px;
              border-radius: 4px;
          }
          .message-content h1, .message-content h2, .message-content h3,
          .message-content h4, .message-content h5, .message-content h6 {
              margin-top: 10px;
              margin-bottom: 5px;
          }
          .message-content blockquote {
              border-left: 3px solid #ccc;
              margin: 0;
              padding-left: 10px;
              color: #666;
          }
          .message-content a {
              color: #0066cc;
              text-decoration: none;
          }
          .message-content a:hover {
              text-decoration: underline;
          }
          .copy-button {
              position: absolute;
              top: -25px;
              right: 10px;
              background-color: rgba(255, 255, 255, 0.7);
              border: none;
              border-radius: 4px;
              padding: 2px 5px;
              font-size: 12px;
              cursor: pointer;
          }
          .copy-button:hover {
              background-color: rgba(255, 255, 255, 0.9);
          }
      `;
  
      const styleElement = document.createElement("style");
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
  
      const chatContainer = document.createElement("div");
      chatContainer.id = "chatbot-container";
  
      const resizeHandle = document.createElement("div");
      resizeHandle.id = "chatbot-resize-handle";
      chatContainer.appendChild(resizeHandle);
  
      const chatHeader = document.createElement("div");
      chatHeader.id = "chatbot-header";
      chatHeader.innerHTML = `
          ${settings.title}
          <span id="chatbot-close">&times;</span>
      `;
  
      const chatMessages = document.createElement("div");
      chatMessages.id = "chatbot-messages";
  
      const inputArea = document.createElement("div");
      inputArea.id = "chatbot-input-area";
  
      const input = document.createElement("input");
      input.id = "chatbot-input";
      input.type = "text";
      input.placeholder = settings.placeholderText;
  
      const sendButton = document.createElement("button");
      sendButton.id = "chatbot-send";
      sendButton.textContent = settings.sendButtonText;
  
      inputArea.appendChild(input);
      inputArea.appendChild(sendButton);
  
      const chatFooter = document.createElement("div");
      chatFooter.id = "chatbot-footer";
  
      if (settings.showPoweredBy) {
        chatFooter.innerHTML =
          'Powered by <a href="https://spaces.pulze.ai/s?utm_source=Chatbot" target="_blank">Spaces</a> from <a href="https://pulze.ai" target="_blank">Pulze.ai</a>';
      } else if (settings.footerText) {
        chatFooter.innerHTML = settings.footerText;
      } else {
        chatFooter.style.display = "none"; // Hide footer if no text is provided
      }
  
      const { promptsContainer, hidePrompts } = renderDefaultPrompts();
      chatContainer.appendChild(chatHeader);
      chatContainer.appendChild(chatMessages);
      chatContainer.appendChild(promptsContainer);
      chatContainer.appendChild(inputArea);
      chatContainer.appendChild(chatFooter);
  
      const toggleButton = document.createElement("div");
      toggleButton.id = "chatbot-toggle";
      toggleButton.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  
      document.body.appendChild(chatContainer);
      document.body.appendChild(toggleButton);
  
      function displayDefaultMessage() {
        const defaultMessage = "Hello! How can I assist you today?";
        addMessage("bot", defaultMessage);
      }
  
      // Toggle Button Click Event
      toggleButton.onclick = function () {
        const chatContainerDisplay =
          window.getComputedStyle(chatContainer).display;
        if (chatContainerDisplay === "none") {
          chatContainer.style.display = "flex";
          toggleButton.style.display = "none";
          if (chatMessages.children.length === 0) {
            displayDefaultMessage();
          }
        } else {
          chatContainer.style.display = "none";
          toggleButton.style.display = "flex";
        }
      };
  
      // Chat Header Click Event
      chatHeader.onclick = function () {
        chatContainer.style.display = "none";
        toggleButton.style.display = "flex";
      };
  
      function sendMessage() {
        const message = input.value.trim();
        if (message) {
          addMessage("user", message);
          conversationHistory.push({ role: "user", content: message });
          input.value = "";
          streamResponse(message);
          hidePrompts();
        }
      }
  
      sendButton.onclick = sendMessage;
      input.onkeypress = function (e) {
        if (e.key === "Enter") {
          sendMessage();
        }
      };
  
      function MarkdownRenderer(text) {
        if (typeof text !== "string") {
          return text ?? "";
        }
  
        // Code blocks with copy button
        text = text.replace(
          /```(\w+)?\n([\s\S]*?)```/g,
          function (match, language, code) {
            const uniqueId = "code-" + Math.random().toString(36).substr(2, 9);
            return `
                  <div style="position: relative;">
                      <pre><code class="language-${
                        language || ""
                      }" id="${uniqueId}">${code.trim()}</code></pre>
                      <button class="copy-button" onclick="copyCode('${uniqueId}')">Copy</button>
                  </div>
              `;
          }
        );
  
        // Inline code
        text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
        // Italic
        text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  
        // Links
        text = text.replace(
          /\[(.*?)\]\((.*?)\)/g,
          '<a href="$2" target="_blank">$1</a>'
        );
  
        // Headers
        text = text.replace(/^# (.*$)/gm, "<h1>$1</h1>");
        text = text.replace(/^## (.*$)/gm, "<h2>$1</h2>");
        text = text.replace(/^### (.*$)/gm, "<h3>$1</h3>");
        text = text.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
        text = text.replace(/^##### (.*$)/gm, "<h5>$1</h5>");
        text = text.replace(/^###### (.*$)/gm, "<h6>$1</h6>");
  
        // Blockquotes
        text = text.replace(/^\> (.*$)/gm, "<blockquote>$1</blockquote>");
  
        // Line breaks
        text = text.replace(/\n/g, "<br>");
  
        return text;
      }
  
      function addMessage(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${sender}-message`;
  
        if (sender === "bot") {
          const logoElement = document.createElement("div");
          logoElement.className = "bot-logo";
          logoElement.innerHTML = settings.botAvatar;
          messageElement.appendChild(logoElement);
        }
  
        const contentElement = document.createElement("div");
        contentElement.className = "message-content";
        contentElement.innerHTML = MarkdownRenderer(text); // Use MarkdownRenderer here
        messageElement.appendChild(contentElement);
  
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return contentElement;
      }
  
      function streamResponse(prompt) {
        const messageElement = addMessage("bot", "");
        let fullResponse = "";
  
        const custom_labels = { "ai-chat-bot-widget": "true" };
  
        fetch(`${openAIConfig.baseURL}${openAIConfig.apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
                role: "user",
              },
            ],
            systemInstruction: {
              role: "user",
              parts: [
                {
                  text: settings.systemInstruction(
                    settings.organizationName,
                    settings.organizationUrls
                  ),
                },
              ],
            },
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            if (data.candidates && data.candidates.length > 0) {
              const content = data.candidates[0].content.parts[0].text;
              fullResponse = content;
              messageElement.innerHTML = MarkdownRenderer(fullResponse);
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          })
          .catch((error) => {
            console.error("Fetch error:", error);
            messageElement.innerHTML = "Error: Unable to connect to the server.";
          })
          .finally(() => {
            conversationHistory.push({
              role: "assistant",
              content: fullResponse,
            });
          });
      }
  
      function renderDefaultPrompts() {
        const promptsContainer = document.createElement("div");
        promptsContainer.id = "chatbot-default-prompts";
        promptsContainer.style.cssText = `
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              padding: 10px;
              border-top: 1px solid #e0e0e0;
          `;
  
        settings.defaultPrompts.forEach((prompt) => {
          const promptButton = document.createElement("button");
          promptButton.textContent = prompt;
          promptButton.style.cssText = `
                  background-color: ${settings.secondaryColor};
                  border: none;
                  padding: 5px 10px;
                  border-radius: 15px;
                  cursor: pointer;
                  font-size: 12px;
              `;
          promptButton.onclick = () => {
            input.value = prompt;
            sendMessage();
            hidePrompts();
          };
          promptsContainer.appendChild(promptButton);
        });
  
        const hidePrompts = () => {
          promptsContainer.style.display = "none";
        };
  
        return { promptsContainer, hidePrompts };
      }
  
      // Function to copy code to clipboard
      window.copyCode = function (elementId) {
        const codeElement = document.getElementById(elementId);
        const textArea = document.createElement("textarea");
        textArea.value = codeElement.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Code copied to clipboard!");
      };
  
      const closeButton = chatHeader.querySelector("#chatbot-close");
      closeButton.onclick = function () {
        chatContainer.style.display = "none";
        toggleButton.style.display = "flex";
      };
  
      // Add resize functionality
      let isResizing = false;
      let lastDownX, lastDownY;
  
      resizeHandle.addEventListener("mousedown", (e) => {
        isResizing = true;
        lastDownX = e.clientX;
        lastDownY = e.clientY;
        e.preventDefault();
      });
  
      document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;
  
        const newWidth = chatContainer.offsetWidth + (e.clientX - lastDownX);
        const newHeight = chatContainer.offsetHeight + (e.clientY - lastDownY);
  
        chatContainer.style.width = `${newWidth}px`;
        chatContainer.style.height = `${newHeight}px`;
  
        lastDownX = e.clientX;
        lastDownY = e.clientY;
      });
  
      document.addEventListener("mouseup", () => {
        isResizing = false;
      });
    }
  
    window.initChatbot = initChatbot;
  })();
  