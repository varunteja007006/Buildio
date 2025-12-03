"use client";

import React, { useState } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Send } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Alice",
      text: "Hey everyone!",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isMe: false,
    },
    {
      id: "2",
      sender: "Bob",
      text: "Ready to draw?",
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      isMe: false,
    },
    {
      id: "3",
      sender: "Me",
      text: "Yes, let's go!",
      timestamp: new Date(),
      isMe: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "Me",
      text: inputValue,
      timestamp: new Date(),
      isMe: true,
    };
    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full border rounded-md bg-background overflow-hidden shadow-sm">
      <div className="p-2 border-b bg-muted/50">
        <h3 className="font-semibold text-sm">Chat</h3>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.isMe ? "self-end items-end" : "self-start items-start"
              )}
            >
              <div
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm",
                  msg.isMe
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                )}
              >
                {!msg.isMe && (
                  <span className="block text-[10px] font-bold opacity-70 mb-0.5">
                    {msg.sender}
                  </span>
                )}
                {msg.text}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-2 border-t flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="h-8 text-sm"
        />
        <Button size="icon" className="h-8 w-8" onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
