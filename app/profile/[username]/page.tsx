import { useContext } from "react";
import { UserContext } from "@/context/context";
const users = {
  ali: { name: "ali", role: "Software Engineering Intern" },
  hassan: { name: "hassan", role: "Frontend Developer" },
};
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = users[username as keyof typeof users];
  if (!user) {
    return <h1>User Not Found</h1>;
  }
  return (
    <div>
      {" "}
      <h1>{user.name}</h1> <p>{user.role}</p> <p>Username: {username}</p>{" "}
    </div>
  );
}
