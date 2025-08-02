import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";

export default function FocusedClaims() {
  // Simulate login: Change role to "doctor", "pharmacy", or "front-office"
  const user = { name: "Dr. Achieng", role: "doctor", isPremium: true };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0e0d3c] via-[#1b1150] to-[#2a1a5e] text-white">
      <Sidebar role={user.role} />
      <main className="flex-1 p-6">
        <Dashboard user={user} />
      </main>
    </div>
  );
}