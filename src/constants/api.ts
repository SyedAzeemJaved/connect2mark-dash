const API_BASE_URL = 'http://localhost:8000';

export const constants = {
    TOKEN: `${API_BASE_URL}/token`,
    ME: `${API_BASE_URL}/common/me`,

    STATS: `${API_BASE_URL}/stats`,
    USERS: `${API_BASE_URL}/users`,
    LOCATIONS: `${API_BASE_URL}/locations`,
    SCHEDULES: `${API_BASE_URL}/schedules`,
    SCHEDULE_INSTANCES: `${API_BASE_URL}/schedule-instances`,

    RESULTS_PER_PAGE: 7,
};
