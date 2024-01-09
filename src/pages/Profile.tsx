import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { TimestampConverter } from '../utils/time';

import { FireToastEnum, UserContextProps } from '@types';
import { constants } from '@constants';

import CoverDefault from '../images/cover/cover.png';
import UserDefault from '../images/user/user.png';

const Profile = () => {
  const { user } = useContext(AuthContext) as UserContextProps;
  const [postsCount, setPostsCount] = useState(0);

  const renderMediaIcons = () => {
    if (
      !user.additional_details.fbProfile &&
      !user.additional_details.instaProfile
    ) {
      return <p>You have not added any social media profiles till now.</p>;
    } else {
      return (
        <>
          {user.additional_details.fbProfile && (
            <a
              href={user.additional_details.fbProfile}
              className="hover:text-primary"
              aria-label="social-icon"
            >
              <svg
                className="fill-current"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_30_966)">
                  <path
                    d="M12.8333 12.375H15.125L16.0416 8.70838H12.8333V6.87504C12.8333 5.93088 12.8333 5.04171 14.6666 5.04171H16.0416V1.96171C15.7428 1.92229 14.6144 1.83337 13.4227 1.83337C10.934 1.83337 9.16663 3.35229 9.16663 6.14171V8.70838H6.41663V12.375H9.16663V20.1667H12.8333V12.375Z"
                    fill=""
                  />
                </g>
                <defs>
                  <clipPath id="clip0_30_966">
                    <rect width="22" height="22" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </a>
          )}
          {user.additional_details.instaProfile && (
            <a
              href={user.additional_details.instaProfile}
              className="hover:text-primary"
              aria-label="social-icon"
            >
              <svg
                className="fill-current"
                width="23"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M11.097 1.515a.75.75 0 01.589.882L10.666 7.5h4.47l1.079-5.397a.75.75 0 111.47.294L16.665 7.5h3.585a.75.75 0 010 1.5h-3.885l-1.2 6h3.585a.75.75 0 010 1.5h-3.885l-1.08 5.397a.75.75 0 11-1.47-.294l1.02-5.103h-4.47l-1.08 5.397a.75.75 0 01-1.47-.294l1.02-5.103H3.75a.75.75 0 110-1.5h3.885l1.2-6H5.25a.75.75 0 010-1.5h3.885l1.08-5.397a.75.75 0 01.882-.588zM10.365 9l-1.2 6h4.47l1.2-6h-4.47z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
        </>
      );
    }
  };

  const fetchPostsCount = async (userId: number) => {
    try {
      const res = await fetch(
        `${constants.ANNOUNCEMENTS}/count/user/${userId}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      const response = await res.json();

      if (res.status !== 200)
        throw new Error(
          typeof response?.detail === 'string'
            ? response.detail
            : 'Something went wrong',
        );

      setPostsCount(response);
    } catch (err: any) {
      fireToast(
        'There seems to be a problem',
        err.message,
        FireToastEnum.DANGER,
      );
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchPostsCount(user.id);
    }

    return () => {};
  }, []);

  return (
    <>
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <img
            src={CoverDefault}
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
          />
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative w-full h-full">
              <img
                src={user.additional_details.profilePictureLink ?? UserDefault}
                alt="profile"
                className="w-full h-full rounded-full overflow-hidden object-fill object-center"
              />
            </div>
          </div>

          <div className="flex flex-row items-center justify-center gap-3">
            <button className="mt-6 my-2 rounded bg-primary p-3 font-medium text-gray">
              <Link to="/edit">Edit my profile</Link>
            </button>
            <button className="mt-6 my-2 rounded bg-primary p-3 font-medium text-gray">
              <Link to={`/change/password/${user.id}`}>Change password</Link>
            </button>
          </div>

          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {user.firstName + ' ' + user.lastName}
            </h3>
            <p className="font-medium">{user.email}</p>
            <div className="mx-auto mt-4.5 mb-5.5 grid max-w-125 grid-cols-3 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  {postsCount}
                </span>
                <span className="text-sm">Post(s)</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  {TimestampConverter(user.created_at)}
                </span>
                <span className="text-sm">Joined</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  {TimestampConverter(user.updated_at)}
                </span>
                <span className="text-sm">Updated</span>
              </div>
            </div>

            <div className="mx-auto max-w-180">
              <h4 className="font-semibold text-black dark:text-white">
                About Me
              </h4>
              <p className="mt-4.5">
                {user?.additional_details?.bio ??
                  'I prefer to stay mysterious, no bio added yet...'}
              </p>
            </div>

            <div className="mt-6.5">
              <h4 className="mb-3.5 font-medium text-black dark:text-white">
                Follow me on
              </h4>
              <div className="flex items-center justify-center gap-3.5">
                {renderMediaIcons()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
