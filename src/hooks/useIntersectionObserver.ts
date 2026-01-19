// import React from "react";

// export const useIntersectionObserver = (callback: () => void, options = {}) => {
//   const observerRef = React.useRef<IntersectionObserver | null>(null);
//   const elementRef = React.useRef<HTMLDivElement | null>(null);

//   React.useEffect(() => {
//     const currentElement = elementRef.current;

//     if (currentElement) {
//       observerRef.current = new IntersectionObserver(([entry]) => {
//         if (entry.isIntersecting) {
//           callback();
//           if (observerRef.current) {
//             observerRef.current.disconnect();
//           }
//         }
//       }, {
//         threshold: 0.1,
//         rootMargin: '50px',
//         ...options
//       });

//       observerRef.current.observe(currentElement);
//     }

//     return () => {
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//       }
//     };
//   }, [callback, options]);

//   return elementRef;
// };