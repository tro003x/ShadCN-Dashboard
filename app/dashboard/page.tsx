export default async function Dashboard() {
  const res = await fetch("http://localhost:3000/api/users");
  const users = await res.json();

  return (
    <div>
      {users.map((user: any) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}