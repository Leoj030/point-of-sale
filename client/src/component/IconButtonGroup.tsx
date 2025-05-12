import clsx from 'clsx';
import { ReactNode } from 'react';

interface Option {
  value: string;
  label: string;
  icon: ReactNode;
}

interface IconButtonGroupProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
}

export default function IconButtonGroup({ value, onChange, options }: IconButtonGroupProps) {
  return (
    <div className="mb-4">
      <div className="flex gap-4 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "flex flex-col items-center pt-4 w-20 h-20 px-3 py-2 rounded-lg transition drop-shadow-lg",
              value === opt.value
                ? "bg-[#f15734] text-white border-[#f15734]"
                : "bg-white text-gray-600 hover:bg-[#fcefe9] hover:border-[#f15734] hover:text-[#f15734]"
            )}
          >
            <div>{opt.icon}</div>
            <span className="text-[15px] font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
