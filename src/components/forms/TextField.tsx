import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface TextFieldProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  type?: string;
  subLabel?: string;
  // FIX: Add 'disabled' prop to TextFieldProps
  disabled?: boolean;
  // FIX: Add onKeyDown to TextFieldProps for better control
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export default function TextField({
  label,
  value,
  setValue,
  placeholder,
  type = "text",
  subLabel,
  // FIX: Destructure 'disabled' and 'onKeyDown'
  disabled,
  onKeyDown,
}: TextFieldProps) {
  return (
    <div className="grid w-full items-center gap-1.5">
      {/* FIX: Set label text to black */}
      <Label htmlFor={label} className="text-black">{label}</Label>
      <Input
        type={type}
        id={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        // FIX: Pass 'disabled' and 'onKeyDown' to the Input component
        disabled={disabled}
        onKeyDown={onKeyDown}
        // FIX: Ensure input text and placeholder are black
        className="text-black placeholder:text-gray-500"
      />
      {/* FIX: Set subLabel text to black */}
      {subLabel && <p className="text-sm text-black">{subLabel}</p>}
    </div>
  );
}