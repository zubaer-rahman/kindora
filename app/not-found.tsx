 import Image from 'next/image';
 import BackButton from '@/components/buttons/BackButton';
import NotFoundImage from '../public/images/NotFound.svg';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex py-8 flex-col justify-end  space-y-2 items-center rounded-lg w-[290px]">
        <Image src={NotFoundImage} alt="Not found" width={238} height={187} />
        <h1 className="font-semibold">Oops, page is not found!</h1>
        <h3 className="text-gray-500 text-sm">
          This link might be broken or corrupted.
        </h3>
        <div className="flex flex-col mt-2">
          <BackButton /> 
        </div>
      </div>
    </div>
  );
};

export default NotFound;
