const API_BASE_URL = 'http://localhost:8000';
// const API_BASE_URL = 'https://connect2mark-api-production.up.railway.app';

export const constants = {
    TOKEN: `${API_BASE_URL}/token`,
    ME: `${API_BASE_URL}/common/me`,

    STATS: `${API_BASE_URL}/admin/stats`,
    USERS: `${API_BASE_URL}/admin/users`,
    LOCATIONS: `${API_BASE_URL}/admin/locations`,
    SCHEDULES: `${API_BASE_URL}/admin/schedules`,
    SCHEDULE_STUDENTS: `${API_BASE_URL}/admin/schedules/students/`,

    SCHEDULE_INSTANCES: `${API_BASE_URL}/admin/schedule-instances`,
    ATTENDANCE_RESULT: `${API_BASE_URL}/admin/attendance-result`,

    RESULTS_PER_PAGE: 10,
};
