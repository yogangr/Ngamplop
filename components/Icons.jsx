const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};
const make = (children) =>
  function Icon(props) {
    return (
      <svg {...base} {...props}>
        {children}
      </svg>
    );
  };

export const Plus = make(<path d="M12 5v14M5 12h14" />);
export const Close = make(<path d="M6 6l12 12M18 6 6 18" />);
export const Search = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
);
export const Sliders = make(
  <>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </>
);
export const Pin = make(
  <>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </>
);
export const Pencil = make(
  <>
    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
    <path d="m13.5 6.5 4 4" />
  </>
);
export const Trash = make(<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />);
export const Envelope = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </>
);

export const UserPlus = make(
  <>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    <path d="M19 8v6M16 11h6" />
  </>
);
export const Logout = make(
  <>
    <path d="M10 4H5v16h5" />
    <path d="m15 8 4 4-4 4M19 12H9" />
  </>
);
export const Eye = make(
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </>
);
export const EyeOff = make(
  <>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.5 6.6C3.6 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" />
  </>
);
