import React, { useState } from 'react';
import { notifyUser } from '../context/UserContext';

import FlowbiteNavBar from '../components/NavBar/FlowbiteNavBar';
import { BoxCard } from '../components/Box/BoxCard';
import BoxReward from '../components/Box/BoxReward';

const Random = () => {
  return (
    <>
      <FlowbiteNavBar />

      <a href='https://theuselessweb.com/' target='_self' className='block text-lg'>
        Go somewhere else
      </a>
      <BoxReward amount={1} pieceId={1} />
    </>
  );
};

export default Random;
