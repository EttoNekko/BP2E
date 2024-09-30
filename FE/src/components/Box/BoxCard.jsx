import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Tooltip,
} from '@material-tailwind/react';
import { useSelector } from 'react-redux';

export function BoxCard({ boxId, onClick }) {
  const currentBoxesOwned = useSelector((state) => state.account.currentBoxesOwned);
  const box = currentBoxesOwned[boxId];

  return (
    <Card className='w-64' onClick={onClick}>
      <CardHeader floated={false} className='m-0 h-56 rounded-b-none'>
        <img
          src={`src/assets/boxes/${boxId}.png`}
          alt='box image'
          className='size-full object-cover'
        />
      </CardHeader>
      <CardBody className='p-4 text-center'>
        <Typography variant='h6' color='blue-gray' className='font-normal'>
          Box No.{boxId + 1}
        </Typography>
        <Typography variant='h6' color='blue-gray' className='font-normal'>
          You have: {box.quantity}
        </Typography>
        <Typography color='blue-gray' variant='h5' className='font-bold'>
          Price: {Math.round((box.boxType.price + Number.EPSILON) * 100) / 100} ETH
        </Typography>
      </CardBody>
    </Card>
  );
}
