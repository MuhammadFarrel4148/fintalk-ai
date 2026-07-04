import React from "react";

export default function InputForm({
  label,
  title,
  logoUrl,
  placeholder,
  onChangeInput,
  value,
}: InputFormProps) {
  return (
    <div>
      <label htmlFor={label} className="mb-2 block text-sm font-semibold text-slate-900">
        {title}
      </label>
      <div className="relative">
        {logoUrl}
        <input
          id={label}
          type={label}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pr-4 pl-10 text-slate-900 transition-colors outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          onChange={(e) => onChangeInput(e.target.value)}
          value={value}
        />
      </div>
    </div>
  );
}

interface InputFormProps {
  label: string;
  title: string;
  logoUrl: React.ReactNode;
  placeholder: string;
  onChangeInput: React.Dispatch<React.SetStateAction<string>>;
  value: string;
}
