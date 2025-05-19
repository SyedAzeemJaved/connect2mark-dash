import type { AcademicUserTypeEnum } from '@types';

type BaseProps = {
    type?: AcademicUserTypeEnum;
};

type ListingPageProps = {} & BaseProps;

type CreatePageProps = {} & BaseProps;

type EditPageProps = {} & BaseProps;
