import { ModeToggle } from "@/components/mode-toggle";

import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import CheckDBConnection from "./check-db";
import { SignUp } from "./sign-up";
import TrpcComponent from "./trpc-component";
import { SendEmailBtn } from "@/app/send-email";

export default function Page() {
  return (
    <div className="flex flex-row items-center justify-start min-h-svh p-10">
      <div className="p-10 space-y-6 max-w-xl">
        <h1 className="text-2xl text-center font-bold">Hello World</h1>

        <div className="flex items-center gap-3 justify-between">
          <Button size="sm">Button</Button>
          <ModeToggle />
          <SendEmailBtn />
        </div>
      </div>

      <div className="flex-1">
        <Tabs defaultValue="db" className="w-2xl mx-auto">
          <TabsList>
            <TabsTrigger value="db">Database - Drizzle & Postgres</TabsTrigger>
            <TabsTrigger value="better-auth">Better Auth</TabsTrigger>
            <TabsTrigger value="trpc">TRPC Setup</TabsTrigger>
          </TabsList>
          <TabsContent value="db">
            <CheckDBConnection />
          </TabsContent>
          <TabsContent value="better-auth">
            <SignUp />
          </TabsContent>
          <TabsContent value="trpc">
            <TrpcComponent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
