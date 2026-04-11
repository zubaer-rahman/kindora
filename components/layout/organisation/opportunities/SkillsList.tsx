export function SkillsList() {
  const skills = ["Communication", "Teamwork", "Empathy"];
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Skills</h3>
      <ul className="space-y-2">
        {skills.map((skill) => (
          <li key={skill} className="flex items-center gap-2">
            <CheckIcon />
            <span className="text-sm">{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-[#246BFD]"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}