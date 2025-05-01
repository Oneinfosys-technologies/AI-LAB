import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  ScrollArea,
  ScrollBar
} from "@/components/ui/scroll-area";
import { Loader2, Send, User, Bot, Check, CheckCheck, Paperclip, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { HealthChatMessage, HealthChatHistory, HealthChatRequest, HealthChatResponse } from "@shared/health-chat";

const QUICK_REPLIES = [
  "What do my test results mean?",
  "Can you explain my CBC report?",
  "What should I eat based on my results?",
  "How can I improve my health?",
  "What tests should I get next?",
];

export default function PatientChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<HealthChatMessage[]>([
    {
      role: "model",
      content: "Hello! I'm your health assistant. I can help you understand your test results and provide health guidance. How can I assist you today?",
      timestamp: new Date(),
      status: "read",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the chat feature",
        variant: "destructive",
      });
      return;
    }

    // Add user message to chat
    const userMessage: HealthChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      status: "sending",
    };
    setMessages((prev: HealthChatMessage[]) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Format chat history for API
      const chatHistory: HealthChatHistory = messages.map(({ role, content }) => ({ role, content }));

      // Handle file uploads if any
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach((file: File) => {
          formData.append("files", file);
        });
        
        const uploadResponse = await apiRequest("POST", "/api/health/upload", formData);
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload attachments");
        }
        
        const uploadData = await uploadResponse.json();
        uploadedAttachments = uploadData.files;
      }

      // Send request to AI service
      const request: HealthChatRequest = {
        history: chatHistory,
        message: inputMessage,
        userId: user.id,
        attachments: uploadedAttachments,
      };

      const response = await apiRequest("POST", "/api/health/chat", request);

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data: HealthChatResponse = await response.json();

      // Update user message status
      setMessages((prev: HealthChatMessage[]) =>
        prev.map((msg: HealthChatMessage) =>
          msg === userMessage ? { ...msg, status: "delivered" } : msg
        )
      );

      // Add AI response to chat
      const aiMessage: HealthChatMessage = {
        role: "model",
        content: data.response,
        timestamp: new Date(),
        status: "sent",
        attachments: data.attachments,
      };
      setMessages((prev: HealthChatMessage[]) => [...prev, aiMessage]);

      // Update user message status to read
      setTimeout(() => {
        setMessages((prev: HealthChatMessage[]) =>
          prev.map((msg: HealthChatMessage) =>
            msg === userMessage ? { ...msg, status: "read" } : msg
          )
        );
      }, 1000);
    } catch (error) {
      console.error("Error in chat:", error);
      toast({
        title: "Error",
        description: "Failed to get response from health assistant",
        variant: "destructive",
      });

      // Add error message
      const errorMessage: HealthChatMessage = {
        role: "model",
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
        status: "sent",
      };
      setMessages((prev: HealthChatMessage[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev: File[]) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev: File[]) => prev.filter((_, i) => i !== index));
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Health Assistant</h2>
      <Card className="flex-grow overflow-hidden">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <CardContent className="p-4">
            <div
              ref={chatContainerRef}
              className="overflow-y-auto max-h-[calc(100vh-20rem)] pr-2"
            >
              {messages.map((message: HealthChatMessage, index: number) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 mb-4 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "model" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bot size={18} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.attachments?.map((attachment, i) => (
                      <div
                        key={i}
                        className="mt-2 p-2 bg-background/50 rounded flex items-center gap-2"
                      >
                        <Paperclip size={14} />
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                    <div className="flex items-center gap-1 mt-1">
                      <div
                        className={`text-xs ${
                          message.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {message.role === "user" && message.status && (
                        <div className="text-xs text-primary-foreground/70">
                          {message.status === "sending" && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                          {message.status === "sent" && (
                            <Check className="h-3 w-3" />
                          )}
                          {message.status === "delivered" && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                          {message.status === "read" && (
                            <CheckCheck className="h-3 w-3 text-blue-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User size={16} className="text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-2 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot size={18} className="text-primary" />
                  </div>
                  <div className="p-3 rounded-lg max-w-[80%] bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <ScrollBar />
        </ScrollArea>
      </Card>

      {/* Quick Replies */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {QUICK_REPLIES.map((reply, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuickReply(reply)}
            className="whitespace-nowrap"
          >
            {reply}
          </Button>
        ))}
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
            >
              <Paperclip size={14} />
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="h-16"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your health question here..."
          className="resize-none h-16"
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
          className="h-16 px-4"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}