const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const suggestionContainer = document.querySelector(".suggestions-container")
const suggestionsElem = document.querySelector(".suggestions")

let userText = null;

window.addEventListener('beforeunload', function() {
  localStorage.removeItem('chatHistory');
});

function editMessage() {
  // Add an event listener to handle the edit button click
chatContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("edit-button")) {
    const custElement = e.target.closest("cust");
    console.log(custElement)
    const pElement = custElement.querySelector("p");
    console.log(pElement)
    const sendButton = custElement.querySelector(".send-button");
    console.log(sendButton)

    // Enable content editing and change button text
    pElement.contentEditable = true;
    sendButton.textContent = "send";

    // Disable other edit buttons
    const editButtons = chatContainer.querySelectorAll(".edit-button");
    editButtons.forEach(function (button) {
      if (button !== e.target) {
        button.disabled = true;
      }
    });
  }
});

// Add an event listener to handle the send button click
chatContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("send-button")) {
    const custElement = e.target.closest("cust");
    const pElement = custElement.querySelector("p");
    const sendButton = custElement.querySelector(".send-button");

    if (sendButton.textContent === "send") {
      // Disable content editing and change button text
      pElement.contentEditable = false;
      sendButton.textContent = "edit";

      // Enable other edit buttons
      const editButtons = chatContainer.querySelectorAll(".edit-button");
      editButtons.forEach(function (button) {
        button.disabled = false;
      });
    } else {
      // Send the edited content
      const editedContent = pElement.textContent;
      handleOutgoingChat(editedContent);

      // Clear the edited content and enable content editing
      pElement.textContent = "";
      pElement.contentEditable = true;

      // Change button text to "send"
      sendButton.textContent = "send";

      // Disable other edit buttons
      const editButtons = chatContainer.querySelectorAll(".edit-button");
      editButtons.forEach(function (button) {
        button.disabled = true;
      });
    }
  }
});
}

function defSugg() { 
  if (!suggestionsElem){
    const defaultSuggestions = ["Hey", "What is GDSC SOU?", "Why GDSC?"];
    
    // Show the default suggestions
    for (let i = 0; i < defaultSuggestions.length; i++) {
      let suggestionElement = document.createElement('div');
      suggestionElement.innerHTML = defaultSuggestions[i];
      suggestionElement.className = "suggestions";
      suggestionElement.addEventListener("click", (e) => {
        handleOutgoingChat(suggestionElement.innerHTML);
        removeDivsWithClassName("suggestions");
      });
      suggestionContainer.appendChild(suggestionElement);
    }
  }
}


function extractDivText(htmlString) {
  const divTexts = [];
  const divs = document.createElement('div');
  divs.innerHTML = htmlString;
  const divElements = divs.querySelectorAll('button');
  for (const divElement of divElements) {
    divTexts.push(divElement.textContent);
  }
  return divTexts;
}

function removeDivsWithClassName(className) {
  const divsToRemove = document.querySelectorAll(`.${className}`);
  for (const div of divsToRemove) {
    div.parentNode.removeChild(div);
  }
}



const loadDataFromLocalstorage = () => {
  // Load saved chats and theme from local storage and apply/add on the page
  const themeColor = localStorage.getItem("themeColor");

  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

  const defaultText = `<div class="default-text">
                            <h1>GDSC SOU</h1>
                            <p>Start a conversation and explore GDSC SOU.<br> Your chat history will be displayed here.</p>
                        </div>`

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
}

const createChatElement = (content, className) => {
  // Create new div and apply chat, specified class and set html content of div
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = content;
  return chatDiv; // Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
  // Initialize an array to store chat history in localStorage
  let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || "[]";
  const chatAPI = async (question, chathis) => {
    const API_URL = `https://gdscsou-cb-api.hf.space/chat?q=${question}&chathistory=${chathis}`;
  // try {
  //   const response = await axios.post(API_URL, 
  //     {
  //       params: {
  //         'q': 'hey',
  //         'chathistory': '[]'
  //       },
  //       headers: {
  //         'accept': 'application/json',
  //         'content-type': 'application/x-www-form-urlencoded'
  //       }
  //     }
  //   );

  //   console.log(response.json())

  //   const responseJson = await response.json();
  //   return responseJson;

  // } catch (error) {
  //     console.error(error);
  //     throw new Error('Error: ' + error);
  // }

 const response = await fetch(API_URL, {
    method: 'POST',
    referrerPolicy: "unsafe_url",
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    },
    // credentials: "include",
    mode: 'cors',
    // body: ''
  });

  // Check the response status code
  if (response.status === 200) {
    // Success!
    const responseJson = await response.json();
    console.log(responseJson);
    return responseJson;
  } else {
    // Error!
    throw new Error('Error: ' + response.statusText);
  }
};

  const pElement = document.createElement("cust");

  console.log('Chat History', chatHistory)

  function markdownToHtml(markdownText) {
    const converter = new showdown.Converter();
    return converter.makeHtml(markdownText);
  }

  // Send request to API, get response and set the reponse as paragraph element text
  try {
    const data = await chatAPI(userText, chatHistory);
    removeDivsWithClassName("suggestions");
    const jsonData = JSON.parse(data);
    // const suggestions = extractDivText(data[1].Rem)
    // const suggestions = extractDivText(jsonData.gen_questions.Rem;)

    for (let i = 0; i < suggestions.length; i++) {
      let suggestionElement = document.createElement('div')
      suggestionElement.innerHTML = defaultSuggestions[i]
      suggestionElement.className = "suggestions"
      suggestionElement.addEventListener("click", (e) => {
        handleOutgoingChat(suggestionElement.innerHTML)
        removeDivsWithClassName("suggestions");
      })
      suggestionContainer.appendChild(suggestionElement)
    }

    // const orgRes = data[0].answer;
    const orgRes = jsonData.gen_answer.answer;;
    const markRes = markdownToHtml(orgRes);
    const pyMark = data[0].markdown;
    
    chatHistory.push({ user: userText, assistant: orgRes });

    // Trim the chat history to keep only the recent 5 entries
    if (chatHistory.length > 5) {
      chatHistory = chatHistory.slice(-5);
    }
  
    // Store the updated chat history in localStorage
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  
    // Display the updated chat history
    // displayChatHistory(chatHistory);
    
    pElement.innerHTML = pyMark;
  } catch (error) { // Add error class to the paragraph element and set error text
    console.error('Error:', error);
    pElement.classList.add("error");
    pElement.textContent = "    Oops! Something went wrong while retrieving the response. Please try again.";
  }

  // Remove the typing animation, append the paragraph element and save the chats to local storage
  incomingChatDiv.querySelector(".typing-animation").remove();
  incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
  localStorage.setItem("all-chats", chatContainer.innerHTML);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
  // Copy the text content of the response to the clipboard
  const reponseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(reponseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
  // Display the typing animation and call the getChatResponse function
  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="https://lh3.googleusercontent.com/a/ACg8ocJRqBXffzlmyTWZIRWbZjG1MQfWII8vQaJMGevHOtiVdA=s96-c-rg-br100" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
  // Create an incoming chat div with typing animation and append it to chat container
  const incomingChatDiv = createChatElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = (prompt) => {
  if (prompt && prompt.length > 0) {
      userText = prompt;
    } 
  else {
    userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces  
  }
  if (!userText) return; // If chatInput is empty return from here

  // Clear the input field and reset its height
  chatInput.value = "";
  chatInput.style.height = `${initialInputHeight}px`;

  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="user.png" alt="user-img">
                        <cust contenteditable="false"><p>${userText}</p></cust>
                    </div>
                </div>`;

  // Create an outgoing chat div with user's message and append it to chat container
  const outgoingChatDiv = createChatElement(html, "outgoing");
  chatContainer.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
  // Remove the chats from local storage and call loadDataFromLocalstorage function
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalstorage();
  }
});

themeButton.addEventListener("click", () => {
  // Toggle body's class for the theme mode and save the updated theme to the local storage 
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themeColor", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
  // Adjust the height of the input field dynamically based on its content
  chatInput.style.height = `${initialInputHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If the Enter key is pressed without Shift and the window width is larger 
  // than 800 pixels, handle the outgoing chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
});

loadDataFromLocalstorage();
defSugg()
// editMessage()
sendButton.addEventListener("click", handleOutgoingChat);
