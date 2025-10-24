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

export default function Page() {

  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <div className="p-10 space-y-6 min-h-[250px]">
        <h1 className="text-2xl text-center font-bold">Hello World</h1>

        <div className="flex items-center gap-3 justify-between">
          <Button size="sm">Button</Button>
          <ModeToggle />
        </div>
      </div>

      <div className="min-h-[400px]">
        <Tabs defaultValue="db" className="w-2xl">
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
