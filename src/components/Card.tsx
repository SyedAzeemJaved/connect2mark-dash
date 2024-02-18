interface CardOneProps {
    title: string;
    description: string | number;
}

export const Card = ({ title, description }: CardOneProps) => {
    return (
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mt-4 flex items-end justify-between">
                <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                        {description}
                    </h4>
                    <span className="text-sm font-medium">{title}</span>
                </div>
            </div>
        </div>
    );
};
