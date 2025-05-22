const API_BASE_URL = 'https://safecheck-api-production.up.railway.app';
// const API_BASE_URL = 'http://localhost:8000';

export const constants = {
    TOKEN: `${API_BASE_URL}/token`,
    ME: `${API_BASE_URL}/common/me`,

    STATS: `${API_BASE_URL}/admin/stats`,
    USERS: `${API_BASE_URL}/admin/users`,
    LOCATIONS: `${API_BASE_URL}/admin/locations`,
    SCHEDULES: `${API_BASE_URL}/admin/schedules`,
    SCHEDULE_STUDENTS: `${API_BASE_URL}/admin/schedules/students`,

    SCHEDULE_INSTANCES: `${API_BASE_URL}/admin/schedule-instances`,
    ATTENDANCE_RESULT: `${API_BASE_URL}/admin/attendance-result`,

    ATTENDANCE_TRACKING: `${API_BASE_URL}/admin/attendance-tracking`,

    RESULTS_PER_PAGE: 20,
};
