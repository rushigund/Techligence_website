import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; // Keep import for now, but not directly used in the scrollable part
import { Loader2, Send, Bot, User, MessageCircle, X } from "lucide-react"; // Added MessageCircle and X for toggle
import { toast } from "sonner";
import { chatbotAPI } from "@/services/api"; // Ensure this path is correct
import { Badge } from "./ui/badge"; // Ensure Badge is imported
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Added Avatar components

// Define message types
interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State to control popup visibility
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial bot message when the popup opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "initial-bot",
          sender: "bot",
          text: "Hello! I'm your Techligence AI assistant. How can I help you today?",
          timestamp: formatTimestamp(new Date()),
        },
      ]);
    }
  }, [isOpen]); // Only run when isOpen changes

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to render messages with citation parsing
  const renderMessageContent = (messageText: string) => {
    // Separate the main message from the sources section
    const sourceSectionIndex = messageText.indexOf('**Sources:**');
    if (sourceSectionIndex !== -1) {
      const mainMessage = messageText.substring(0, sourceSectionIndex);
      const sourcesSection = messageText.substring(sourceSectionIndex);

      return (
        <>
          {/* Render main message content with citations */}
          {mainMessage.split(/(\[\d+\])/g).map((part, index) => {
            const match = part.match(/^\[(\d+)\]$/);
            if (match) {
              // If it's a citation, render it as plain text (as per requirement)
              return <span key={index} className="font-semibold text-primary/80 ml-1">{part}</span>;
            }
            return <span key={index}>{part}</span>;
          })}
          {/* Render sources section as pre-formatted text */}
          <pre className="mt-4 p-2 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono">
            {sourcesSection.replace(/\*\*/g, '')} {/* Remove bold markdown from sources */}
          </pre>
        </>
      );
    }

    // If no source section, just render the message with citations
    // Regex to find footnote patterns like [1], [2], etc.
    // This regex captures the number inside the brackets.
    const parts = messageText.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        // If it's a citation, render it as plain text (as per requirement)
        return <span key={index} className="font-semibold text-primary/80 ml-1">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "" || isSending) return;

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputMessage,
      timestamp: formatTimestamp(new Date()),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await chatbotAPI.sendMessage(inputMessage);
      if (response.data.success) {
        const botResponseText = response.data.data.response;

        const newBotMessage: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botResponseText, // The raw response from the backend
          timestamp: formatTimestamp(new Date()),
        };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
      } else {
        toast.error(response.data.message || "Failed to get a response from the bot. Please try again.");
      }
    } catch (error: any) {
      console.error("Error sending message to chatbot API:", error);
      toast.error(error.response?.data?.message || error.message || "An error occurred. Please try again later.");
      const errorMessage: Message = {
        id: `bot-${Date.now()}-error`, // Unique ID for error message
        sender: "bot",
        text: "Oops! I encountered an error. Please try again or rephrase your question.",
        timestamp: formatTimestamp(new Date()),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </Button>

      {/* Chatbot Popup Container */}
      {isOpen && (
        // Adjusted dimensions: max-w-md for wider, max-h-[700px] for taller
        <div className="fixed bottom-24 right-8 z-[999] w-[calc(100vw-4rem)] max-w-md h-[70vh] max-h-[700px] flex flex-col bg-background text-foreground shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          <Card className="flex flex-col flex-1 border-none shadow-none">
            <CardHeader className="bg-primary text-primary-foreground py-3 px-4 flex flex-row items-center justify-between rounded-t-xl">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Bot className="w-5 h-5" /> Techligence Chatbot
              </CardTitle>
              <span className="text-xs opacity-80">Online</span>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1">
              {/* Replaced ScrollArea with a div and applied scrolling directly */}
              {/* Added h-0 to ensure flex-1 correctly calculates height for scrolling */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto h-0">
                <div className="space-y-4 p-4">
                  {messages.length === 0 && ( // Display initial message only if no other messages
                    <div className="text-center text-muted-foreground py-5">
                      <Bot className="w-10 h-10 mx-auto mb-2" />
                      <p>Hi there! How can I help you today?</p>
                      <p className="text-xs">Ask me anything about Techligence, our products, or robotics!</p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.sender === "bot" && (
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            <Bot className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] p-2 rounded-lg shadow-sm ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-accent text-accent-foreground rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">
                          {renderMessageContent(message.text)} {/* Use the helper function here */}
                        </p>
                        <span className={`block text-xs mt-1 ${message.sender === "user" ? "text-primary-foreground/80" : "text-muted-foreground"} text-right`}>
                          {message.timestamp}
                        </span>
                      </div>
                      {message.sender === "user" && (
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} /> {/* For auto-scrolling */}
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="p-3 border-t bg-card">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 rounded-md text-sm"
                    disabled={isSending}
                  />
                  <Button type="submit" className="gap-1 rounded-md h-9 w-9" size="icon" disabled={isSending}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default Chatbot;
