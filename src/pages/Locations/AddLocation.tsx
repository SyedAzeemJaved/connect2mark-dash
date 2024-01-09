import { useState, useContext } from 'react';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { FireToastEnum, UserContextProps } from '@types';
import { constants } from '@constants';

type CreateLocation = {
  title: string;
  bluetooth_address: string;
  coordinates: string;
};

export default function AddLocation() {
  const { user, setLoading } = useContext(AuthContext) as UserContextProps;

  const [location, setLocation] = useState<CreateLocation>({
    title: '',
    bluetooth_address: '',
    coordinates: '',
  });

  const handleSubmit = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();

      if (
        !location.title ||
        !location.bluetooth_address ||
        !location.coordinates
      ) {
        throw new Error('Please fill all input fields');
      }

      setLoading(true);

      const res = await fetch(constants.LOCATIONS, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          title: location.title,
          bluetooth_address: location.bluetooth_address,
          coordinates: location.coordinates,
        }),
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
        'Lcoation added successfully',
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

  return (
    <>
      <Breadcrumb pageName="Add Location" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Add a new location to Connect2Mark
          </h3>
        </div>
        <form action="#">
          <div className="p-6.5">
            <div className="mb-4.5">
              <label
                className="mb-2.5 block text-black dark:text-white"
                htmlFor="title"
              >
                Title <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter location title"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                name="title"
                id="title"
                onChange={(e) => {
                  setLocation({
                    ...location,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>

            <div className="mb-4.5">
              <label
                className="mb-2.5 block text-black dark:text-white"
                htmlFor="bluetooth_address"
              >
                Bluetooth Address <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter location bluetooth MAC"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                name="bluetooth_address"
                id="bluetooth_address"
                onChange={(e) => {
                  setLocation({
                    ...location,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            </div>

            <div className="mb-4.5">
              <label
                className="mb-2.5 block text-black dark:text-white"
                htmlFor="coordinates"
              >
                Coordinates <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter location coordinates"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                name="coordinates"
                id="coordinates"
                onChange={(e) => {
                  setLocation({
                    ...location,
                    [e.target.name]: e.target.value,
                  });
                }}
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
