interface BasicUser {
    readonly id: number;
    readonly full_name: string;
    readonly email: string;
    readonly created_at_in_utc: string;
    readonly updated_at_in_utc: string | null;
}

export interface AdditionalDetail {
    readonly phone: string | null;
    readonly department:
        | 'biomedical'
        | 'computer_science'
        | 'electronics'
        | 'software'
        | 'telecom'
        | 'not_specified';
    readonly designation:
        | 'chairman'
        | 'professor'
        | 'associate_professor'
        | 'assistant_professor'
        | 'lecturer'
        | 'junior_lecturer'
        | 'visiting'
        | 'not_specified';
}

export interface AdminProps extends BasicUser {
    accessToken: string;
    authenticated: boolean;
    readonly additional_details: null;
}

export interface StaffProps extends BasicUser {
    readonly additional_details: AdditionalDetail;
}

export interface LocationProps {
    readonly id: number;
    readonly title: string;
    readonly bluetooth_address: string;
    readonly coordinates: string;
    readonly created_at_in_utc: string;
    readonly updated_at_in_utc: string | null;
}

export interface ScheduleProps {
    readonly id: number;
    readonly title: string;

    readonly start_time_in_utc: string;
    readonly end_time_in_utc: string;

    readonly is_reoccurring: boolean;

    readonly staff_member: StaffProps;
    readonly location: LocationProps;

    readonly date: string | null;
    readonly day:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday';

    readonly created_at_in_utc: string;
    readonly updated_at_in_utc: string | null;
}

export interface ScheduleInstanceProps {
    readonly id: number;

    readonly start_time_in_utc: string;
    readonly end_time_in_utc: string;

    readonly schedule: ScheduleProps;

    readonly staff_member: StaffProps;
    readonly location: LocationProps;

    readonly date: string;

    readonly created_at_in_utc: string;
    readonly updated_at_in_utc: string | null;
}

export type AttendanceResultProps = {
    schedule_instance: ScheduleInstanceProps;
    attendance_status: 'present' | 'late' | null;
    created_at_in_utc_in_utc: string | null;
};

// API
export type ApiResponse = {
    total: number;
    page: number;
    size: number;
    pages: number;
    items: [];
};

// Pagination
export type HasPages = {
    has_next: boolean;
    has_prev: boolean;
};
