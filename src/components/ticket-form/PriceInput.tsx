import { Input } from "@/components/ui/input";

type PriceInputProps = {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
};

export default function PriceInput({
  id,
  name,
  value,
  onChange,
  placeholder,
}: PriceInputProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={value ? "pr-10" : ""}
      />
      {value && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 pointer-events-none">
          원
        </span>
      )}
    </div>
  );
}
