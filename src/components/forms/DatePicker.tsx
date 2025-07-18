import React, { useState } from 'react';

interface DatePickerProps {
    label?: string;
    value?: Date;
    setValue?: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, setValue }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        if (setValue) {
            setValue(date || new Date());
        }
    };

    return (
        <div className='mt-5'>
            {label && <label className='mr-3'>{label}</label>}
            <input
                type="date"
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
            />
        </div>
    );
};

export default DatePicker;