"use client";

import React from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
import { Sparkles } from "lucide-react";
import { PricingCards } from "./pricing-cards";

export function PricingModal() {
	const [open, setOpen] = React.useState(false);
	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<form>
				<DialogTrigger asChild>
					<DropdownMenuItem
						onClick={(e) => {
							e.preventDefault();
							setOpen(true);
						}}
					>
						<Sparkles />
						Upgrade to Pro
					</DropdownMenuItem>
				</DialogTrigger>
				<DialogContent className="max-w-full min-w-fit">
					<DialogHeader>
						<DialogTitle>Pricing</DialogTitle>
						<DialogDescription>
							Checkout our affordable pricing.
						</DialogDescription>
					</DialogHeader>
					<div className="max-h-[80dvh] min-w-fit overflow-y-auto">
						<PricingCards />
					</div>
				</DialogContent>
			</form>
		</Dialog>
	);
}
