import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '@context';
import { StaffProps, ApiResponse, UserContextProps } from '@types';

import { fireToast } from '@hooks';
import { Breadcrumb, Pagination } from '@components';

import { TimestampConverter } from '../../utils/time';

import { FireToastEnum } from '../../types/enums';
import { constants } from '@constants';

export default function AllStaff() {
    const { user } = useContext(AuthContext) as UserContextProps;

    const [staff, setStaff] = useState<StaffProps[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [apiResponse, setApiResponse] = useState<ApiResponse>({
        total: 0,
        page: 0,
        size: constants.RESULTS_PER_PAGE,
        pages: 0,
        items: [],
    });

    const navigate = useNavigate();

    const handleEditClick = (id: number) => {
        navigate(`/staff/${id}`);
    };

    const handleStaffSchedules = (id: number) => {
        navigate(`/schedules/staff/${id}`);
    };

    const handleStaffTodayScheduleInstances = (id: number) => {
        navigate(`/classes/staff/today/${id}`);
    };

    const handleChangePassword = (id: number) => {
        navigate(`/change/password/${id}`);
    };

    const handleDeleteClick = async (id: number) => {
        let r = confirm('Are you sure you want to delete this staff member?');
        if (r === true) {
            try {
                const res = await fetch(`${constants.USERS}/${id}`, {
                    method: 'DELETE',
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

                fireToast(
                    'Success',
                    'Staff member deleted successfully',
                    FireToastEnum.SUCCESS,
                );
            } catch (err: any) {
                fireToast(
                    'There seems to be a problem',
                    err.message,
                    FireToastEnum.DANGER,
                );
            } finally {
                fetchStaffMembers();
            }
        }
    };

    const fetchStaffMembers = async () => {
        try {
            let url = `${constants.USERS}/staff?page=${pageNumber}&size=${constants.RESULTS_PER_PAGE}`;

            const res = await fetch(url, {
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

            const staffArr: StaffProps[] = response.items.map(
                (staff: StaffProps) => {
                    return {
                        id: staff.id,
                        full_name: staff.full_name,
                        email: staff.email,
                        created_at_in_utc: staff.created_at_in_utc,
                        updated_at_in_utc: staff.updated_at_in_utc,
                        additional_details: {
                            phone: staff.additional_details.phone,
                            department: staff.additional_details.department,
                            designation: staff.additional_details.designation,
                        },
                    };
                },
            );

            setApiResponse({
                total: response?.total,
                page: response?.page,
                size: response?.size,
                pages: response?.pages,
                items: response?.items,
            });

            setStaff(staffArr);
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
        }
    };

    useEffect(() => {
        fetchStaffMembers();

        return () => {};
    }, [pageNumber]);

    return (
        <>
            <Breadcrumb pageName="Staff Members" />
            <div className="flex flex-col gap-6">
                <div className="flex flex-row justify-end align-bottom">
                    <Link
                        to="/staff/add"
                        className="inline-flex items-center justify-center gap-2.5 bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                    >
                        <span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                className="h-5 w-5 fill-current"
                            >
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                        </span>
                        Add new
                    </Link>
                </div>

                <Pagination
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    apiResponse={apiResponse}
                >
                    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                        <div className="max-w-full overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                            Full name
                                        </th>
                                        <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                            Phone
                                        </th>
                                        <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                            Joined
                                        </th>
                                        <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                            Last update
                                        </th>
                                        <th className="px-4 py-4 font-medium text-black dark:text-white">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map((staff) => {
                                        return (
                                            <tr key={staff.id}>
                                                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                                                    <h5 className="font-medium text-black dark:text-white">
                                                        {staff.full_name}
                                                    </h5>
                                                    <p className="text-sm">
                                                        {staff.email}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {staff
                                                            .additional_details
                                                            ?.phone ??
                                                            'Not specified'}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {TimestampConverter(
                                                            staff.created_at_in_utc,
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {TimestampConverter(
                                                            staff?.updated_at_in_utc,
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <div className="flex items-center space-x-3.5">
                                                        <button
                                                            className="hover:text-primary"
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    staff.id,
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                className="fill-current"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 18 18"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                                                                    fill=""
                                                                />
                                                                <path
                                                                    d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                                                                    fill=""
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="hover:text-primary"
                                                            onClick={() =>
                                                                handleStaffSchedules(
                                                                    staff.id,
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                className="fill-tranparent stroke-current stroke-[1.5px]"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="hover:text-primary"
                                                            onClick={() =>
                                                                handleStaffTodayScheduleInstances(
                                                                    staff.id,
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                className="fill-tranparent stroke-current stroke-[1.5px]"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="hover:text-primary"
                                                            onClick={() =>
                                                                handleChangePassword(
                                                                    staff.id,
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                className="fill-tranparent stroke-current stroke-[1.5px]"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="hover:text-primary"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    staff?.id,
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                className="fill-current"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 18 18"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                                                                    fill=""
                                                                />
                                                                <path
                                                                    d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                                                                    fill=""
                                                                />
                                                                <path
                                                                    d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                                                                    fill=""
                                                                />
                                                                <path
                                                                    d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                                                                    fill=""
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Pagination>
            </div>
        </>
    );
}
