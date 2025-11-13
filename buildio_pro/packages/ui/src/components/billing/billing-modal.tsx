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
import { CreditCard } from "lucide-react";

export function BillingModal() {
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
						<CreditCard />
						Billing
					</DropdownMenuItem>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Billing</DialogTitle>
						<DialogDescription>
							Your invoices can be accessed from here.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4 text-sm text-muted-foreground">
						Billing UI goes here.
					</div>
				</DialogContent>
			</form>
		</Dialog>
	);
}
