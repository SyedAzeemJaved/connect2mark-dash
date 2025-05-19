import { lazy } from 'react';

import { AcademicUserTypeEnum } from '@enums';

// Academic Users
const AllAcademicUsers = lazy(
    () => import('../pages/AcademicUsers/AllAcademicUsers'),
);
const AddAcademicUser = lazy(
    () => import('../pages/AcademicUsers/AddAcademicUser'),
);
const EditAcademicUser = lazy(
    () => import('../pages/AcademicUsers/EditAcademicUser'),
);

// Password
const ChangeStudentPassword = lazy(
    () => import('../pages/Password/ChangePassword'),
);

// Locations
const AllLocations = lazy(() => import('../pages/Locations/AllLocations'));
const AddLocation = lazy(() => import('../pages/Locations/AddLocation'));
const EditLocation = lazy(() => import('../pages/Locations/EditLocation'));

// Schedules
const AllSchedules = lazy(() => import('../pages/Schedules/AllSchedules'));
const AddSchedule = lazy(() => import('../pages/Schedules/AddSchedule'));
const EditSchedule = lazy(() => import('../pages/Schedules/EditSchedule'));
const FilterSchedules = lazy(
    () => import('../pages/Schedules/FilterSchedules'),
);
const StaffSpecificSchedules = lazy(
    () => import('../pages/Schedules/StaffSpecificSchedules'),
);

// Schedule Instances / Classes
const AllScheduleInstances = lazy(
    () => import('../pages/Classes/AllScheduleInstances'),
);
const EditScheduleInstance = lazy(
    () => import('../pages/Classes/EditScheduleInstance'),
);
const FilterScheduleInstance = lazy(
    () => import('../pages/Classes/FilterScheduleInstances'),
);
const StaffSpecificTodayScheduleInstances = lazy(
    () => import('../pages/Classes/StaffSpecificTodayScheduleInstances'),
);

const coreRoutes = [
    {
        path: '/teachers/all',
        title: 'All Teachers',
        component: AllAcademicUsers,
        props: {
            type: 'teacher' as AcademicUserTypeEnum,
        },
    },
    {
        path: '/teachers/add',
        title: 'Add Teacher',
        component: AddAcademicUser,
        props: {
            type: 'teacher' as AcademicUserTypeEnum,
        },
    },
    {
        path: '/teachers/:id',
        title: 'Edit Teacher',
        component: EditAcademicUser,
        props: {
            type: 'teacher' as AcademicUserTypeEnum,
        },
    },
    {
        path: '/students/all',
        title: 'All Students',
        component: AllAcademicUsers,
        props: {
            type: 'student' as AcademicUserTypeEnum,
        },
    },
    {
        path: '/students/add',
        title: 'Add Student',
        component: AddAcademicUser,
        props: {
            type: 'student' as AcademicUserTypeEnum,
        },
    },
    {
        path: '/students/:id',
        title: 'Edit Student',
        component: EditAcademicUser,
        props: {
            type: 'student' as AcademicUserTypeEnum,
        },
    },
    {
        path: '/change/password/:id',
        title: 'Manage User Password',
        component: ChangeStudentPassword,
        props: {},
    },
    {
        path: '/locations/all',
        title: 'All Locations',
        component: AllLocations,
        props: {},
    },
    {
        path: '/locations/add',
        title: 'Add Location',
        component: AddLocation,
        props: {},
    },
    {
        path: '/locations/:id',
        title: 'Edit Location',
        component: EditLocation,
        props: {},
    },
    {
        path: '/schedules/all',
        title: 'All Schedules',
        component: AllSchedules,
        props: {},
    },
    {
        path: '/schedules/add',
        title: 'Add Schedule',
        component: AddSchedule,
        props: {},
    },
    {
        path: '/schedules/:id',
        title: 'Edit Schedule',
        component: EditSchedule,
        props: {},
    },
    {
        path: '/schedules/filter',
        title: 'Filter Schedules',
        component: FilterSchedules,
        props: {},
    },
    {
        path: '/schedules/staff/:id',
        title: 'Staff Schedules',
        component: StaffSpecificSchedules,
        props: {},
    },
    {
        path: '/classes/all',
        title: 'All Classes',
        component: AllScheduleInstances,
        props: {},
    },
    {
        path: '/classes/:id',
        title: 'Edit Class',
        component: EditScheduleInstance,
        props: {},
    },
    {
        path: '/classes/filter',
        title: 'Filter Classes',
        component: FilterScheduleInstance,
        props: {},
    },
    {
        path: '/classes/staff/today/:id',
        title: 'Staff Today Classes',
        component: StaffSpecificTodayScheduleInstances,
        props: {},
    },
];

export const routes = [...coreRoutes];
