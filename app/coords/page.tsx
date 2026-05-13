'use client';

import dynamic from 'next/dynamic';

const CoordsPage = dynamic(() => import('../../components/CoordsPage'), { ssr: false });

export default function Coords() {
  return <CoordsPage />;
}
