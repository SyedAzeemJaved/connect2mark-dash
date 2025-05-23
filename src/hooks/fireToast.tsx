import toast from 'react-hot-toast';

import { FireToastEnum } from '@enums';

const createToast = (title: string, msg: string, type: FireToastEnum) => {
    toast.custom((t) => (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'}
      w-full max-w-md ${
          type == FireToastEnum.SUCCESS
              ? 'bg-[#04b20c]'
              : type == FireToastEnum.WARNING
                ? 'bg-[#eab90f]'
                : 'bg-[#e13f32]'
      } pointer-events-auto flex rounded-lg shadow-lg ring-1 ring-black ring-opacity-5`}
        >
            <div className="w-0 flex-1 p-4 ">
                <div className="flex items-start">
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white">
                            {title}
                        </p>
                        <p className="mt-1 text-sm text-white">{msg}</p>
                    </div>
                </div>
            </div>
            <div className="flex">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    type="button"
                    className="mr-2 box-content rounded-none border-none text-white opacity-100 hover:no-underline hover:opacity-50 focus:opacity-50 focus:shadow-none focus:outline-none"
                    data-te-toast-dismiss
                    aria-label="Close"
                >
                    <span className="w-[1em] focus:opacity-100 disabled:pointer-events-none disabled:select-none disabled:opacity-25 [&.disabled]:pointer-events-none [&.disabled]:select-none [&.disabled]:opacity-25">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    ));
};

export const fireToast = (title: string, msg: string, type: FireToastEnum) => {
    createToast(title, msg, type);
};
