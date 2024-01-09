import React, { useState, useEffect, useContext } from 'react';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { constants } from '@constants';
import {
  StaffProps,
  LocationProps,
  FireToastEnum,
  UserContextProps,
} from '@types';

type CreateScheduleProps = {
  title: string;

  start_time_in_utc: string;
  end_time_in_utc: string;

  is_reoccurring: boolean;

  staff_member_id: number;
  location_id: number;

  date: string | null;
  day:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
    | null;
};

export default function AddSchedule() {
  const { user, setLoading } = useContext(AuthContext) as UserContextProps;
  const [allStaff, setAllStaff] = useState<StaffProps[]>([]);
  const [allLocations, setAllLocations] = useState<LocationProps[]>([]);

  const [schedule, setSchedule] = useState<CreateScheduleProps>({
    title: '',
    start_time_in_utc: '',
    end_time_in_utc: '',
    is_reoccurring: true,
    staff_member_id: 0,
    location_id: 0,
    date: null,
    day: null,
  });

  const convertTo24HourUTC = (time12Hour: string): string => {
    const date = new Date();
    const [time, meridiem] = time12Hour.split(' ');

    let [hours, minutes] = time.split(':').map(Number);

    if (meridiem.toLowerCase() === 'pm') {
      hours = hours === 12 ? 12 : hours + 12;
    } else {
      hours = hours === 12 ? 0 : hours;
    }

    date.setHours(hours, minutes, 0, 0);
    return date.toISOString().split('T')[1].substring(0, 8); // Extracting HH:MM:SS
  };

  const convertToUTCDate = (inputDate: string): string => {
    const date = new Date(inputDate);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString().split('T')[0]; // Extracts YYYY-MM-DD from the ISO string
  };

  const handleStartOrEndTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][mM]$/; // Regular expression pattern
    const inputValue = e.target.value;

    if (!inputValue) {
      return;
    }

    if (timeRegex.test(inputValue)) {
      setSchedule({
        ...schedule,
        [e.target.name]: convertTo24HourUTC(inputValue),
      });
    } else {
      e.target.value = '';
      fireToast(
        'Invalid time format',
        'Please enter time in HH:MM AM/PM format',
        FireToastEnum.WARNING,
      );
    }
  };

  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const inputDate = e.target.value;

    if (!inputDate) {
      return;
    }

    // If the format doesn't match 'YYYY-MM-DD'
    if (!dateRegex.test(inputDate)) {
      e.target.value = '';
      fireToast(
        'Invalid date format',
        'Please enter date in YYYY-MM-DD format',
        FireToastEnum.WARNING,
      );
      return;
    }

    // If it's an invalid date (e.g., February 31)
    const dateParts = inputDate.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JavaScript (0 - 11)
    const day = parseInt(dateParts[2]);

    const dateObject = new Date(year, month, day);

    if (
      dateObject.getFullYear() !== year ||
      dateObject.getMonth() !== month ||
      dateObject.getDate() !== day
    ) {
      e.target.value = '';
      fireToast(
        'Invalid date format',
        'Please enter date in YYYY-MM-DD format',
        FireToastEnum.WARNING,
      );
      return;
    }

    // All checks were true
    setSchedule({ ...schedule, [e.target.name]: convertToUTCDate(inputDate) });
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();

      if (
        !schedule.title ||
        !schedule.start_time_in_utc ||
        !schedule.end_time_in_utc ||
        !schedule.staff_member_id ||
        !schedule.location_id
      ) {
        throw new Error('Please fill all input fields');
      }

      if (schedule.is_reoccurring) {
        if (!schedule.day) {
          throw new Error('Reoccurring schedules must have a day');
        }
      } else {
        if (!schedule.date) {
          throw new Error('Non-reoccurring schedules must have a date');
        }
      }

      setLoading(true);

      let url = schedule.is_reoccurring ? '/reoccurring' : '/non-reoccurring';
      let body: CreateScheduleProps = {
        title: schedule.title,
        start_time_in_utc: schedule.start_time_in_utc,
        end_time_in_utc: schedule.end_time_in_utc,
        is_reoccurring: schedule.is_reoccurring,
        staff_member_id: schedule.staff_member_id,
        location_id: schedule.location_id,
        day: null,
        date: null,
      };
      if (schedule.is_reoccurring) {
        body.day = schedule.day;
      } else {
        body.date = schedule.date;
      }

      const res = await fetch(constants.SCHEDULES + url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const response = await res.json();

      if (res.status !== 200)
        throw new Error(
          typeof response?.detail === 'string'
            ? response.detail
            : 'Something went wrong',
        );

      fireToast(
        'Success',
        'Schedule added successfully',
        FireToastEnum.SUCCESS,
      );
    } catch (err: any) {
      fireToast(
        'There seems to be a problem',
        err.message,
        FireToastEnum.DANGER,
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStaff = async () => {
    try {
      const res = await fetch(constants.USERS + '/staff', {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      const response = await res.json();

      if (res.status !== 200)
        throw new Error(
          typeof response?.detail === 'string'
            ? response.detail
            : 'Something went wrong',
        );

      const staffArr: StaffProps[] = response.items.map((staff: StaffProps) => {
        return {
          id: staff.id,
          full_name: staff.full_name,
          email: staff.email,
          additional_details: staff.additional_details,
          created_at: staff.created_at,
          updated_at: staff.updated_at,
        };
      });

      setAllStaff(staffArr);
    } catch (err: any) {
      fireToast(
        'There seems to be a problem',
        err.message,
        FireToastEnum.DANGER,
      );
    }
  };

  const fetchAllLocations = async () => {
    try {
      const res = await fetch(constants.LOCATIONS, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      const response = await res.json();

      if (res.status !== 200)
        throw new Error(
          typeof response?.detail === 'string'
            ? response.detail
            : 'Something went wrong',
        );

      const locationArr: LocationProps[] = response.items.map(
        (item: LocationProps) => {
          return {
            id: item.id,
            title: item.title,
            bluetooth_address: item.bluetooth_address,
            coordinates: item.coordinates,
            created_at: item.created_at,
            updated_at: item.updated_at,
          };
        },
      );

      setAllLocations(locationArr);
    } catch (err: any) {
      fireToast(
        'There seems to be a problem',
        err.message,
        FireToastEnum.DANGER,
      );
    }
  };

  useEffect(() => {
    fetchAllStaff();
    fetchAllLocations();

    return () => {};
  }, []);

  return (
    <>
      <Breadcrumb pageName="Add Schedule" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Add a new schedule to Connect2Mark
          </h3>
        </div>
        <form action="#">
          <div className="p-6.5">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Title <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter schedule title"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                name="title"
                id="title"
                onChange={(e) => {
                  setSchedule({
                    ...schedule,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full">
                <label className="mb-2.5 block text-black dark:text-white">
                  Start time <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter schedule start time [HH:MM AM/PM]"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  pattern="^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][mM]$"
                  name="start_time_in_utc"
                  id="start_time_in_utc"
                  onBlur={handleStartOrEndTime}
                />
              </div>
              <div className="w-full">
                <label className="mb-2.5 block text-black dark:text-white">
                  End time <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter schedule end time [HH:MM AM/PM]"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  pattern="^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][mM]$"
                  name="end_time_in_utc"
                  id="end_time_in_utc"
                  onBlur={handleStartOrEndTime}
                />
              </div>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full">
                <label className="mb-2.5 block text-black dark:text-white">
                  Staff member <span className="text-meta-1">*</span>
                </label>
                <div className="relative z-20">
                  <select
                    className="w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    onChange={(e) => {
                      setSchedule((prev) => ({
                        ...prev,
                        staff_member_id: parseInt(e.target.value),
                      }));
                    }}
                  >
                    <option value="0">Select staff member</option>
                    {allStaff.map((staff: StaffProps) => {
                      return (
                        <option key={staff.id} value={staff.id}>
                          {staff.full_name}
                        </option>
                      );
                    })}
                  </select>
                  <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g opacity="0.8">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                          fill=""
                        ></path>
                      </g>
                    </svg>
                  </span>
                </div>
              </div>
              <div className="w-full">
                <label className="mb-2.5 block text-black dark:text-white">
                  Location <span className="text-meta-1">*</span>
                </label>
                <div className="relative z-20">
                  <select
                    className="w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    onChange={(e) => {
                      setSchedule((prev) => ({
                        ...prev,
                        location_id: parseInt(e.target.value),
                      }));
                    }}
                  >
                    <option value="0">Select location</option>
                    {allLocations.map((location: LocationProps) => {
                      return (
                        <option key={location.id} value={location.id}>
                          {location.title}
                        </option>
                      );
                    })}
                  </select>
                  <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g opacity="0.8">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                          fill=""
                        ></path>
                      </g>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Status <span className="text-meta-1">*</span>
              </label>
              <div
                className="inline-flex rounded-md shadow-sm w-full text-sm text-gray-900"
                role="group"
              >
                <button
                  type="button"
                  className={`w-1/2 px-5 py-3 font-medium rounded-s-lg custom-btn-group border border-t border-b border-r-0 ${
                    schedule.is_reoccurring && 'custom-btn-group-selected'
                  }`}
                  onClick={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      is_reoccurring: true,
                      date: null,
                    }))
                  }
                >
                  Reoccurring
                </button>
                <button
                  type="button"
                  className={`w-1/2 px-5 py-3 font-medium rounded-e-lg custom-btn-group border border-t border-b border-l-0 ${
                    !schedule.is_reoccurring && 'custom-btn-group-selected'
                  }`}
                  onClick={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      is_reoccurring: false,
                      day: null,
                    }))
                  }
                >
                  Non-reoccurring
                </button>
              </div>
            </div>

            <div className={`mb-4.5 ${!schedule.is_reoccurring && 'hidden'}`}>
              <label className="mb-2.5 block text-black dark:text-white">
                Day
                <span className="text-meta-1">*</span>
              </label>
              <div
                className="inline-flex rounded-md shadow-sm w-full text-sm text-gray-900"
                role="group"
              >
                <button
                  type="button"
                  className={`w-50 px-5 py-3 font-medium rounded-s-lg custom-btn-group border border-t border-b border-r-0 ${
                    schedule.day === 'monday' && 'custom-btn-group-selected'
                  }`}
                  onClick={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      day: 'monday',
                    }))
                  }
                >
                  Monday
                </button>
                <button
                  type="button"
                  className={`w-50 px-5 py-3 font-medium custom-btn-group border border-t border-b border-r-0 ${
                    schedule.day === 'tuesday' && 'custom-btn-group-selected'
                  }`}
                  onClick={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      day: 'tuesday',
                    }))
                  }
                >
                  Tuesday
                </button>
                <button
                  type="button"
                  className={`w-50 px-5 py-3 font-medium custom-btn-group border border-t border-b border-r-0 ${
                    schedule.day === 'wednesday' && 'custom-btn-group-selected'
                  }`}
                  onClick={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      day: 'wednesday',
                    }))
                  }
                >
                  Wednesday
                </button>
                <button
                  type="button"
                  className={`w-50 px-5 py-3 font-medium custom-btn-group border border-t border-b border-r-0 ${
                    schedule.day === 'thursday' && 'custom-btn-group-selected'
                  }`}
                  onClick={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      day: 'thursday',
                    }))
                  }
                >
                  Thursday
                </button>
                <button
                  type="button"
                  className={`w-50 px-5 py-3 font-medium custom-btn-group border border-t border-b border-r-0 ${
                    schedule.day === 'friday' && 'custom-btn-group-selected'
                  }`}
                  onClick={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      day: 'friday',
                    }))
                  }
                >
                  Friday
                </button>
                <button
                  type="button"
                  className={`w-50 px-5 py-3 font-medium custom-btn-group border border-t border-b border-r-0 ${
                    schedule.day === 'saturday' && 'custom-btn-group-selected'
                  }`}
                  onClick={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      day: 'saturday',
                    }))
                  }
                >
                  Saturaday
                </button>
                <button
                  type="button"
                  className={`w-50 px-5 py-3 font-medium rounded-e-lg custom-btn-group border border-t border-b border-r-0 ${
                    schedule.day === 'sunday' && 'custom-btn-group-selected'
                  }`}
                  onClick={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      day: 'sunday',
                    }))
                  }
                >
                  Sunday
                </button>
              </div>
            </div>

            <div className={`mb-4.5 ${schedule.is_reoccurring && 'hidden'}`}>
              <label className="mb-2.5 block text-black dark:text-white">
                Date
                <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter schedule date [YYYY-MM-DD]"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                name="date"
                id="date"
                pattern="\d{4}-\d{2}-\d{2}"
                onBlur={handleDate}
              />
            </div>
            <button
              onClick={handleSubmit}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
