"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@workspace/ui/components/form";

import { toast } from "sonner";

// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { createRoomSchema } from "@/lib/validators";
import { useMutation } from "convex/react";
import { api } from "@workspace/games-convex-backend/convex/_generated/api";
import { useUserStore } from "@/lib/store/user.store";
import { useRouter } from "next/navigation";

// type CreateRoomSchema = z.infer<typeof createRoomSchema>;

export function CreateRoomForm({
  onSuccess,
}: Readonly<{
  onSuccess?: () => void;
}>) {
  const { userToken } = useUserStore();
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRoomMutation = useMutation(api.rooms.createRoom);

  // const form = useForm<CreateRoomSchema>({
  //   resolver: zodResolver(createRoomSchema),
  //   defaultValues: {
  //     roomName: "",
  //   },
  // });

  // const onSubmit = async (data: CreateRoomSchema) => {
  //   if (!userToken) {
  //     toast.error("Please register first.");
  //     return;
  //   }

  //   try {
  //     const result = await createRoomMutation({
  //       roomName: data.roomName,
  //       userToken,
  //     });

  //     if (result.success) {
  //       toast.success(result.message);
  //       form.reset();
  //       onSuccess?.();
  //       router.push(`/rooms/${result.roomCode}`);
  //     } else {
  //       toast.error(result.message);
  //     }
  //   } catch (error) {
  //     toast.error("Failed to create room. Please try again.");
  //     console.error(error);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    if (!userToken) {
      toast.error("Please register first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createRoomMutation({
        roomName: roomName,
        userToken,
      });

      if (result.success) {
        toast.success(result.message);
        setRoomName("");
        onSuccess?.();
        router.push(`/rooms/${result.roomCode}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to create room. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-sm lg:w-md space-y-2">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary">
          Room Name
        </label>
        <Input
          placeholder="Enter room name"
          className="flex-1"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !userToken || !roomName.trim()}
        className="w-full cursor-pointer"
      >
        Create Room
      </Button>
    </form>
    // <Form {...form}>
    //   <form
    //     onSubmit={form.handleSubmit(onSubmit)}
    //     className="w-sm lg:w-md space-y-2"
    //   >
    //     <FormField
    //       control={form.control}
    //       name="roomName"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormLabel className="text-primary">{`Room Name`}</FormLabel>
    //           <FormControl>
    //             <Input
    //               placeholder="Enter room name"
    //               className="flex-1"
    //               {...field}
    //             />
    //           </FormControl>
    //           <FormMessage />
    //         </FormItem>
    //       )}
    //     />
    //     <Button
    //       type="submit"
    //       disabled={form.formState.isSubmitting || !userToken}
    //       className="w-full cursor-pointer"
    //     >
    //       Create Room
    //     </Button>
    //   </form>
    // </Form>
  );
}
