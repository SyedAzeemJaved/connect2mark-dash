const API_BASE_URL = 'https://connect2mark-api-production.up.railway.app';

export const constants = {
    TOKEN: `${API_BASE_URL}/token`,
    ME: `${API_BASE_URL}/common/me`,

    STATS: `${API_BASE_URL}/stats`,
    USERS: `${API_BASE_URL}/users`,
    STAFF: `${API_BASE_URL}/users/staff`,
    LOCATIONS: `${API_BASE_URL}/locations`,
    SCHEDULES: `${API_BASE_URL}/schedules`,
    SCHEDULE_INSTANCES: `${API_BASE_URL}/schedule-instances`,
    ATTENDANCE_RESULT: `${API_BASE_URL}/attendance-result`,

    RESULTS_PER_PAGE: 7,
};
