import React from 'react';

interface ToggleSwitchProps {
  labelLeft: string;
  labelRight: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ labelLeft, labelRight, value, onChange }) => {
  const isRight = value;
  return (
    <div className="flex items-center justify-center space-x-3 sm:space-x-4">
      <span className={`font-medium text-sm text-center transition-colors ${!isRight ? 'text-primary' : 'text-text-light'}`}>{labelLeft}</span>
      <button
        type="button"
        role="switch"
        aria-checked={isRight}
        onClick={() => onChange(!isRight)}
        className={`${
          isRight ? 'bg-primary' : 'bg-gray-300'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
      >
        <span
          aria-hidden="true"
          className={`${
            isRight ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
      <span className={`font-medium text-sm text-center transition-colors ${isRight ? 'text-primary' : 'text-text-light'}`}>{labelRight}</span>
    </div>
  );
};
