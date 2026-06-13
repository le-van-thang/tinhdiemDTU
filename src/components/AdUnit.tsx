import React, { useEffect } from 'react';

interface AdUnitProps {
  client: string;
  slot: string;
  format?: string;
  responsive?: string;
  style?: React.CSSProperties;
}

export default function AdUnit({
  client,
  slot,
  format = 'auto',
  responsive = 'true',
  style = { display: 'block' }
}: AdUnitProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense loading warning:', e);
    }
  }, []);

  return (
    <div className="my-6 flex justify-center items-center overflow-hidden w-full bg-gray-50 border border-gray-200 rounded-xl p-2 min-h-[90px]">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
