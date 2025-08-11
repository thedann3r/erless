interface DashboardProps {
  user: {
    name: string;
    role: string;
    isPremium?: boolean;
  };
}

export default function Dashboard({ user }: DashboardProps) {
  const notes = {
    doctor: "Erlessed pulls vitals, prescriptions & patient info from your hospital system. If diagnosis is missing, please enter manually to complete the claim.",
    pharmacy: "Inventory & dispensing records are managed in-house. Erlessed helps you map prescriptions to insurer benefit rules only.",
    "front-office": "Registration, walk-ins, and appointments are managed in your hospital's system. Erlessed begins from patient verification and claim initiation only.",
  };

  return (
    <div className="bg-white/5 p-6 rounded-xl space-y-6">
      <h2 className="text-2xl font-semibold mb-2">
        Welcome, {user.name}
      </h2>
      <p className="text-sm text-white/70 max-w-xl">{notes[user.role as keyof typeof notes]}</p>

      <div className="mt-4 text-white/80 text-sm bg-white/10 p-4 rounded">
        <strong>Reminder:</strong> Erlessed is a claims and clearinghouse platform. It does not handle:
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Inventory or stock management</li>
          <li>Triage or appointment booking</li>
          <li>New patient registration</li>
          <li>Detailed prescription writing</li>
        </ul>
      </div>
    </div>
  );
}