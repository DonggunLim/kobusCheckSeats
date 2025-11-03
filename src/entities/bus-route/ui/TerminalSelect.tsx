import { TERMINALS } from '../model/terminals';

interface TerminalSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

export function TerminalSelect({ value, onChange, label, required = true }: TerminalSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      >
        {TERMINALS.map((terminal) => (
          <option key={terminal.value} value={terminal.value}>
            {terminal.label} ({terminal.region})
          </option>
        ))}
      </select>
    </div>
  );
}
