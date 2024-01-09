import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { AuthContext } from '@context';
import { ScheduleProps, FireToastEnum, UserContextProps } from '@types';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { TimestampConverter } from '../../utils/time';
import { constants } from '@constants';

export default function EditSchedule() {
  const { id } = useParams();

  const { user, setLoading } = useContext(AuthContext) as UserContextProps;

  const [currentSchedule, setCurrentSchedule] = useState<ScheduleProps>({
    id: 0,
    title: '',
    start_time_in_utc: '',
    end_time_in_utc: '',
    is_reoccurring: false,
    staff_member: {
      id: 0,
      full_name: '',
      email: '',
      additional_details: {
        phone: null,
        department: 'not_specified',
        designation: 'not_specified',
      },
      created_at: '',
      updated_at: null,
    },
    location: {
      id: 0,
      title: '',
      bluetooth_address: '',
      coordinates: '',
      created_at: '',
      updated_at: null,
    },
    date: null,
    day: 'monday',
    created_at: '',
    updated_at: null,
  });

  const handleSubmit = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();

      if (!currentCourse.title || !currentCourse.description) {
        throw new Error('Please fill all input fields');
      }

      setLoading(true);

      const res = await fetch(`${constants.COURSES}/${id}`, {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          title: currentCourse.title,
          description: currentCourse.description,
        }),
      });

      const response = await res.json();

      if (res.status !== 200)
        throw new Error(
          typeof response?.detail === 'string'
            ? response.detail
            : 'Something went wrong',
        );

      fireToast('Success', 'Course edited successfully', FireToastEnum.SUCCESS);
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

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`${constants.SCHEDULES}/${id}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
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

      setCurrentSchedule({
        id: response.id,
        title: response.title,
        description: response.description,
        imageLink: response.image_link,
        created_at: response.created_at,
        updated_at: response.updated_at,
      });
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

  useEffect(() => {
    if (id) {
      fetchSchedule();
    }

    return () => {};
  }, [id]);

  return (
    <>
      <Breadcrumb pageName="Edit Schedule" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Course Information
          </h3>
        </div>
        <div className="p-7">
          <form action="#">
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="title"
              >
                Title
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="text"
                name="title"
                id="title"
                placeholder="Enter course title"
                value={currentCourse.title}
                onChange={(e) => {
                  setCurrentCourse({
                    ...currentCourse,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>

            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="created_at"
                >
                  Created
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="created_at"
                    id="created_at"
                    readOnly
                    value={TimestampConverter(currentCourse.created_at)}
                  />
                </div>
              </div>

              <div className="w-full sm:w-1/2">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="updated_at"
                >
                  Last update
                </label>
                <div className="relative">
                  <span className="absolute left-4.5 top-4"></span>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="updated_at"
                    id="updated_at"
                    readOnly
                    value={TimestampConverter(currentCourse?.updated_at)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4.5">
              <button
                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:shadow-1"
                type="button"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
