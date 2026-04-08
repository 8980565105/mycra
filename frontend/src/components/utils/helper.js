// export const getImageUrl = (path) => {
//   if (!path) return "/placeholder.png"; // fallback
//   if (path.startsWith("http")) return path; // already full URL
//   return `http://localhost:5000${path}`; // append backend URL
// };


export const getImageUrl = (path) => {
  if (Array.isArray(path)) path = path[0];

  if (!path || typeof path !== "string") return "/placeholder.png";

  if (path.startsWith("http") || path.startsWith("data:image")) return path;

  return `http://localhost:5000${path}`;
};
