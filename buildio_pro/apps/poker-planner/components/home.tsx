import { UserRegistration } from "./user-registration";

export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 place-items-center h-[500px]">
      <div className="p-5">
        <h1 className="text-primary text-5xl">Welcome to Poker Planner</h1>
      </div>
      <div className="p-5">
        <UserRegistration />
      </div>
    </div>
  );
}
