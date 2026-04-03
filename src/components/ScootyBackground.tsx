import scootyBg from '@/assets/scooty-bg.png';

export default function ScootyBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: `url(${scootyBg})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px',
        opacity: 0.25,
        filter: 'brightness(0) invert(1)',
      }}
    />
  );
}
