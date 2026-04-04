import scootyBg from '@/assets/scooty-bg.png';

export default function ScootyBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center"
      style={{
        opacity: 0.04,
      }}
    >
      <img
        src={scootyBg}
        alt=""
        className="w-full h-full object-contain"
        style={{
          filter: 'brightness(0) invert(1)',
          maxWidth: '60vw',
          maxHeight: '60vh',
        }}
      />
    </div>
  );
}
