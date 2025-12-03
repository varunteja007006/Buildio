"use client";

import React, { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Send } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";
import { useUserStore } from "@/lib/store/user.store";

interface ChatBoxProps {
	roomCode: string;
}

export function ChatBox({ roomCode }: ChatBoxProps) {
	const { user, userToken } = useUserStore();
	const messages = useQuery(api.chat.getMessages, { roomCode });
	const sendMessage = useMutation(api.chat.sendMessage);
	const [inputValue, setInputValue] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const handleSend = async () => {
		if (!inputValue.trim()) return;

		try {
			await sendMessage({
				roomCode,
				userToken,
				message: inputValue,
			});
			setInputValue("");
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	return (
		<div className="flex flex-col h-full border rounded-md bg-background overflow-hidden shadow-sm">
			<div className="p-2 border-b bg-muted/50">
				<h3 className="font-semibold text-sm">Chat</h3>
			</div>
			<div className="flex-1 min-h-0">
				<ScrollArea className="h-full p-2">
					<div className="flex flex-col gap-2">
						{messages?.map((msg) => {
							const isMe = msg.userId === user?.id;
							const isGuess = msg.isGuess;

							return (
								<div
									key={msg._id}
									className={cn(
										"flex flex-col max-w-[85%]",
										isMe ? "self-end items-end" : "self-start items-start"
									)}
								>
									<div
										className={cn(
											"px-3 py-1.5 rounded-lg text-sm",
											isGuess
												? "bg-green-500 text-white font-bold"
												: isMe
												? "bg-primary text-primary-foreground rounded-br-none"
												: "bg-muted text-foreground rounded-bl-none"
										)}
									>
										{!isMe && !isGuess && (
											<span className="block text-[10px] font-bold opacity-70 mb-0.5">
												{msg.sender}
											</span>
										)}
										{msg.message}
									</div>
									<span className="text-[10px] text-muted-foreground mt-0.5">
										{new Date(msg.created_at).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
							);
						})}
						<div ref={scrollRef} />
					</div>
				</ScrollArea>
			</div>
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
