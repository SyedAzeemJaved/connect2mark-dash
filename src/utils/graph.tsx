import { AttendanceResultProps } from '@types';

export const countTotalClassesForADate = (
    classesArr: AttendanceResultProps[],
): number => {
    return classesArr.length;
};

export const countAttendedClassesForADate = (
    classesArr: AttendanceResultProps[],
): number => {
    return classesArr.map((cls) => cls.attendance_status !== null).length;
};
