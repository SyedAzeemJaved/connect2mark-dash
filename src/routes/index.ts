import { lazy } from 'react';

// Staff
const AllStaff = lazy(() => import('../pages/Staff/AllStaff'));
const AddStaff = lazy(() => import('../pages/Staff/AddStaff'));
const EditStaff = lazy(() => import('../pages/Staff/EditStaff'));
// const ManageStudentCourses = lazy(
//   () => import('../pages/Staff/ManageStudentCourses'),
// );

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

// Profile
// const Profile = lazy(() => import('../pages/Profile'));
// const EditProfile = lazy(() => import('../pages/EditProfile'));

const coreRoutes = [
  {
    path: '/staff/all',
    title: 'All Staff',
    component: AllStaff,
  },
  {
    path: '/staff/add',
    title: 'Add Staff',
    component: AddStaff,
  },
  {
    path: '/staff/:id',
    title: 'Edit Staff',
    component: EditStaff,
  },
  // {
  //   path: '/students/manage/:id',
  //   title: 'Manage Student Courses',
  //   component: ManageStudentCourses,
  // },
  {
    path: '/change/password/:id',
    title: 'Manage User Password',
    component: ChangeStudentPassword,
  },
  {
    path: '/locations/all',
    title: 'All Locations',
    component: AllLocations,
  },
  {
    path: '/locations/add',
    title: 'Add Location',
    component: AddLocation,
  },
  {
    path: '/locations/:id',
    title: 'Edit Location',
    component: EditLocation,
  },
  {
    path: '/schedules/all',
    title: 'All Schedules',
    component: AllSchedules,
  },
  {
    path: '/schedules/add',
    title: 'Add Schedule',
    component: AddSchedule,
  },
  {
    path: '/schedules/:id',
    title: 'Edit Schedule',
    component: EditSchedule,
  },
  // {
  //   path: '/profile',
  //   title: 'Profile',
  //   component: Profile,
  // },
  // {
  //   path: '/edit',
  //   title: 'Edit Profile',
  //   component: EditProfile,
  // },
];

export const routes = [...coreRoutes];
