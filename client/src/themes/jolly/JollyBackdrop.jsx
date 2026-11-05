// Jolly background doodles: two big soft blobs and a scatter of stars,
// squiggles and dots. Placed off-balance on purpose so the page never
// feels perfectly symmetric.

export default function JollyBackdrop() {
  return (
    <div className="backdrop jolly-backdrop" aria-hidden="true">
      <svg className="jolly-blob jolly-blob--sky" viewBox="0 0 200 200">
        <path d="M108 8c40 4 78 34 84 76 6 44-24 92-70 106-46 13-98-8-114-52C-8 94 14 46 46 24 64 12 86 6 108 8z" />
      </svg>
      <svg className="jolly-blob jolly-blob--mint" viewBox="0 0 200 200">
        <path d="M96 12c38-2 82 20 94 60 12 42-10 86-50 106-40 18-96 14-120-24C-2 118 4 66 30 40 48 22 72 13 96 12z" />
      </svg>

      <svg className="jolly-doodle jolly-doodle--star1" viewBox="0 0 40 40">
        <path d="M20 3l4.6 10.4 11.4 1.2-8.6 7.6 2.4 11.2L20 27.6l-9.8 5.8 2.4-11.2L4 14.6l11.4-1.2z" />
      </svg>
      <svg className="jolly-doodle jolly-doodle--star2" viewBox="0 0 40 40">
        <path d="M20 3l4.6 10.4 11.4 1.2-8.6 7.6 2.4 11.2L20 27.6l-9.8 5.8 2.4-11.2L4 14.6l11.4-1.2z" />
      </svg>
      <svg className="jolly-doodle jolly-doodle--squiggle1" viewBox="0 0 120 30">
        <path d="M4 18c10-14 20-14 28 0s18 14 28 0 20-14 28 0 18 14 28 0" />
      </svg>
      <svg className="jolly-doodle jolly-doodle--squiggle2" viewBox="0 0 120 30">
        <path d="M4 18c10-14 20-14 28 0s18 14 28 0 20-14 28 0 18 14 28 0" />
      </svg>
      <span className="jolly-dot jolly-dot--1" />
      <span className="jolly-dot jolly-dot--2" />
      <span className="jolly-dot jolly-dot--3" />
      <span className="jolly-dot jolly-dot--4" />
    </div>
  );
}
