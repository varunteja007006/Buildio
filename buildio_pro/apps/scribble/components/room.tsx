import { CreateRoomForm } from "@/components/create-room-form";
import { CreatedRoomsList } from "@/components/created-rooms-list";

import { JoinRoomForm } from "./join-room-form";
import { JoinedRoomsList } from "@/components/joined-rooms-list";

export function Room() {
  return (
    <div className="p-2 md:p-5 space-y-6 min-h-[calc(100vh-10rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 place-items-start">
        <CreateRoomForm />
        <JoinRoomForm />
      </div>
      <div className="space-y-6">
        <CreatedRoomsList />
        <JoinedRoomsList />
      </div>
    </div>
  );
}
