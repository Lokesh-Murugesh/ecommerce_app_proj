import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface TextAreaProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  subLabel?: string;
}

export default function TextArea({
  label,
  value,
  setValue,
  placeholder,
  subLabel,
}: TextAreaProps) {
  return (
    <div className="grid w-full gap-1.5">
      {/* FIX: Set label text to black */}
      <Label htmlFor={label} className="text-black">{label}</Label>
      <Textarea
        placeholder={placeholder}
        id={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        // FIX: Ensure textarea text and placeholder are black
        className="text-black placeholder:text-gray-500"
      />
      {/* FIX: Set subLabel text to black */}
      {subLabel && <p className="text-sm text-black">{subLabel}</p>}
    </div>
  );
}