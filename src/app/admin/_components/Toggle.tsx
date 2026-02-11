"use client";


interface ToggleProps {
    label: string;
    subLabel?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    color?: 'blue' | 'purple' | 'green';
}

export const Toggle = ({ label, subLabel, checked, onChange, color = 'blue' }: ToggleProps) => {
    const colorClasses = {
        blue: 'peer-checked:bg-blue-600 peer-checked:after:border-white',
        purple: 'peer-checked:bg-purple-600 peer-checked:after:border-white',
        green: 'peer-checked:bg-green-600 peer-checked:after:border-white'
    };

    const shadowClasses = {
        blue: 'peer-checked:shadow-[0_0_15px_rgba(37,99,235,0.4)]',
        purple: 'peer-checked:shadow-[0_0_15px_rgba(147,51,234,0.4)]',
        green: 'peer-checked:shadow-[0_0_15px_rgba(22,163,74,0.4)]'
    };

    return (
        <label className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-white tracking-widest">{label}</span>
                {subLabel && <span className="text-[8px] font-bold text-gray-500 uppercase italic">{subLabel}</span>}
            </div>
            <div className="relative inline-flex items-center">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                />
                <div className={`w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer transition-all duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full ${colorClasses[color]} ${shadowClasses[color]}`}></div>
            </div>
        </label>
    );
};
