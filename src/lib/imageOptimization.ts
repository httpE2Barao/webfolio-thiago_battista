// export const getOptimizedImageUrl = (url: string, width = 1200) => {
//   if (!url) return '';
  
//   // Already an optimized URL
//   if (url.includes('?w=')) return url;

//   // Add width parameter for next/image optimization
//   return `${url}?w=${width}&q=75`;
// };

// export const preloadImage = (src: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => resolve();
//     img.onerror = reject;
//     img.src = src;
//   });
// };

// export const preloadImages = async (images: string[], count = 3): Promise<void> => {
//   const imagesToPreload = images.slice(0, count);
//   await Promise.all(imagesToPreload.map(src => preloadImage(getOptimizedImageUrl(src))));
// };