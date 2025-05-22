type AttendanceUser = {
    user_id: number;
    full_name: string;
    email: string;
    is_student: boolean;
    created_at_list: string[];
    first_entry: string;
    total_time_in_class_minutes: number;
    attendance_percentage: number;
};

export type Props = {
    scheduleInstances: { id: number; name: string }[];
    attendanceData: AttendanceUser[];
    selectedScheduleId: number | null;
    onScheduleChange: (id: number) => void;
};
