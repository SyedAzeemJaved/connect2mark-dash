import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { LocationProps, FireToastEnum, UserContextProps } from '@types';
import { constants } from '@constants';

export default function EditLocation() {
    const { id } = useParams();

    const { user, setLoading } = useContext(AuthContext) as UserContextProps;

    const [currentLocation, setCurrentLocation] = useState<LocationProps>({
        id: 0,
        title: '',
        bluetooth_address: '',
        coordinates: '',
        created_at: '',
        updated_at: null,
    });

    const handleChange = (e: React.ChangeEvent) => {
        const target = e.target as HTMLInputElement;
        setCurrentLocation({
            ...currentLocation,
            [target.name]: target.value,
        });
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        try {
            e.preventDefault;

            if (
                !currentLocation.title ||
                !currentLocation.bluetooth_address ||
                !currentLocation.coordinates
            ) {
                throw new Error('Please fill all required input fields');
            }

            setLoading(true);

            const res = await fetch(`${constants.LOCATIONS}/${id}`, {
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({
                    title: currentLocation.title,
                    bluetooth_address: currentLocation.bluetooth_address,
                    coordinates: currentLocation.coordinates,
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
                'Location edited successfully',
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

    const fetchLocation = async (id: number) => {
        try {
            const res = await fetch(`${constants.LOCATIONS}/${id}`, {
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

            setCurrentLocation({
                id: response.id,
                title: response.title,
                bluetooth_address: response.bluetooth_address,
                coordinates: response.coordinates,
                created_at: response.created_at,
                updated_at: response.updated_at,
            });
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
        }
    };

    useEffect(() => {
        if (id) {
            fetchLocation(parseInt(id));
        }

        return () => {};
    }, [id]);

    return (
        <>
            <Breadcrumb pageName="Edit Location" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Location Information
                    </h3>
                </div>
                <div className="p-7">
                    <form action="#">
                        <div className="mb-5.5">
                            <label
                                className="mb-3 block text-sm font-medium text-black dark:text-white"
                                htmlFor="title"
                            >
                                Title <span className="text-meta-1">*</span>
                            </label>
                            <input
                                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                type="text"
                                name="title"
                                id="title"
                                placeholder="Enter title"
                                value={currentLocation?.title}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>

                        <div className="mb-5.5">
                            <label
                                className="mb-3 block text-sm font-medium text-black dark:text-white"
                                htmlFor="bluetooth_address"
                            >
                                Bluetooth Address{' '}
                                <span className="text-meta-1">*</span>
                            </label>
                            <input
                                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                type="text"
                                name="bluetooth_address"
                                id="bluetooth_address"
                                placeholder="Enter bluetooth address"
                                value={currentLocation?.bluetooth_address}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>

                        <div className="mb-5.5">
                            <label
                                className="mb-3 block text-sm font-medium text-black dark:text-white"
                                htmlFor="coordinates"
                            >
                                Coordinates{' '}
                                <span className="text-meta-1">*</span>
                            </label>
                            <input
                                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                type="text"
                                name="coordinates"
                                id="coordinates"
                                placeholder="Enter coordinates"
                                value={currentLocation?.coordinates}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>

                        <div className="flex justify-end gap-4.5">
                            <button
                                className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:shadow-1"
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
