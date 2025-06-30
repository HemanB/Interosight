# LLM Prompt Selection Chat Page — Implementation Manual

## Goal
Create a chat page where:
- The Stone of Wisdom (system) starts the conversation with a single, fixed prompt as a chat message.
- The user replies in the chat input.
- After the user's first message, the LLM generates 3 follow-up questions, which are displayed as selectable options (buttons) above the input.
- When the user selects a prompt, it is added as a Stone message, and the user can reply again.
- The cycle repeats: user replies, LLM generates new prompt options, etc.
- "End reflection" is always an option.

---

## Step-by-Step Implementation Plan

### 1. Data Model
- `messages: Array<{ id, content, isUser, timestamp }>` — full chat history.
- `prompts: Array<{ id, text }>` — current selectable prompt options.
- `hasUserResponded: boolean` — tracks if the user has replied to the initial prompt.

---

### 2. Provider/State Logic
- On session start, add the fixed Stone prompt as a message (`isUser: false`).
- Do **not** show any prompt options yet.
- When the user sends their first message, call the LLM to generate 3 follow-up prompts.
- Set these as `prompts` and display them as buttons.
- When a prompt is selected, add it as a Stone message, clear prompts, and wait for the user's reply.
- After the user replies, repeat: call LLM for new prompts, display as options.

---

### 3. UI Flow
- **Header:** "Stone of Wisdom"
- **Messages:** Scrollable chat history, alternating user and Stone messages.
- **Prompt Options:** Rendered as buttons above the input, only when `prompts.length > 0`.
- **Input:** User types and sends messages.

---

### 4. Key UI/UX Details
- Prompt options should be visually distinct (e.g., card or button style).
- Only show prompt options when `prompts.length > 0`.
- When a prompt is selected, immediately add it as a Stone message and clear the options.
- Always include an "End reflection" option.

---

### 5. Sample Pseudocode

```typescript
// State
const [messages, setMessages] = useState<Message[]>([]);
const [prompts, setPrompts] = useState<PromptOption[]>([]);
const [hasUserResponded, setHasUserResponded] = useState(false);

// On mount
useEffect(() => {
  setMessages([{ id: uuid(), content: 'What's one thing on your mind today?', isUser: false, timestamp: new Date() }]);
  setPrompts([]);
  setHasUserResponded(false);
}, []);

// On user send
const handleSend = async (userText: string) => {
  setMessages([...messages, { id: uuid(), content: userText, isUser: true, timestamp: new Date() }]);
  if (!hasUserResponded) {
    setHasUserResponded(true);
    const llmPrompts = await fetchLLMPrompts([...messages, { ... }]);
    setPrompts(llmPrompts);
  } else {
    setPrompts([]);
  }
};

// On prompt select
const handlePromptSelect = (prompt: PromptOption) => {
  setMessages([...messages, { id: uuid(), content: prompt.text, isUser: false, timestamp: new Date() }]);
  setPrompts([]);
  // Wait for user reply, then repeat LLM prompt fetch after reply
};
```

---

### 6. LLM Prompt Fetching
- After every user reply (except the very first), call the LLM with the conversation so far and get 3 follow-up questions.
- Parse and set these as `prompts`.

---

### 7. Edge Cases
- If LLM fails, show fallback prompts.
- Always include "End reflection" as a prompt.

---

## Instruction Manual for Cursor Chat

**Copy-paste these instructions into a new Cursor chat:**

---

> **You are to implement a chat page with the following requirements:**
>
> 1. The chat starts with a single, fixed Stone of Wisdom message: "What's one thing on your mind today?"
> 2. The user replies in the chat input.
> 3. After the user's first reply, call the LLM to generate 3 follow-up questions. Display these as selectable buttons above the input. Always include an "End reflection" option.
> 4. When the user selects a prompt, add it as a Stone message, clear the prompt options, and wait for the user's reply.
> 5. After each user reply, repeat: call the LLM for new prompts, display as options.
> 6. The chat history should show all messages (user and Stone) in order.
> 7. If the LLM fails, show fallback prompts.
> 8. The UI should be clean: header, scrollable chat, prompt options as buttons above the input, and a message input at the bottom.
>
> **Do not include any welcome banners or extra UI. Only the chat, prompt options, and input.**
>
> **Use the following state model:**
> - `messages: Array<{ id, content, isUser, timestamp }>`
> - `prompts: Array<{ id, text }>`
> - `hasUserResponded: boolean`
>
> **Implement the logic as described above.**

---

**This will give you a clean, robust, and maintainable implementation.** 