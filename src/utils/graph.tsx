import { AttendanceResultProps } from '@types';

export const countTotalClassesForADate = (
    classesArr: AttendanceResultProps[],
): number => {
    return classesArr.length;
};

export const countAttendedClassesForADate = (
    classesArr: AttendanceResultProps[],
): number => {
    const valuesArr = classesArr.map((i) => i.attendance_status);
    const countOfNonNullValues = valuesArr.filter(
        (value) => value !== null,
    ).length;
    return countOfNonNullValues;
};
