const menuItems = {
  doctor: [
    "Assigned Patients",
    "Confirm Diagnosis",
    "Clinical Claim Review",
    "Submit Claim Packet"
  ],
  pharmacy: [
    "Prescription Mapping",
    "Formulary Check",
    "Drug Cost Review",
    "Submit Claim"
  ],
  "front-office": [
    "Patient Verification",
    "Initiate Claim",
    "Preauthorization",
    "Claim Status"
  ],
};

export default function Sidebar({ role }: { role: string }) {
  return (
    <aside className="w-64 p-4 space-y-4">
      <div className="text-2xl font-bold text-[#78A8FF]">ERLESSED</div>
      <div className="text-sm text-white/60">Focused Claims Interface</div>
      <nav className="mt-6 space-y-2">
        {menuItems[role as keyof typeof menuItems]?.map((item) => (
          <div
            key={item}
            className="p-2 rounded hover:bg-white/10 transition text-white cursor-pointer"
          >
            {item}
          </div>
        ))}
      </nav>
    </aside>
  );
}