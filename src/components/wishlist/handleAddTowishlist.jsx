// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { addToWishlist } from "../../features/wishlist/wishlistThunk";
// import toast from "react-hot-toast";

// export const useAddToWishlist = (setShowLoginPopup) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const token = useSelector((state) => state.auth.token);
//   const user_id = useSelector((state) => state.auth.user?._id);
//   const handleAddToWishlist = async (item, activeVariant) => {
//     if (!token) {
//       if (setShowLoginPopup) {
//         setShowLoginPopup(true);
//       } else {
//         toast.error("Please login to add to wishlist", {
//           position: "top-center",
//         });
//       }
//       return;
//     }
//     const product_id = item._id || item.product?._id;
//     const variant_id =
//       activeVariant?._id ||
//       item.variant_id?._id ||
//       item.variant?._id ||
//       item.variants?.[0]?._id;
//     if (!user_id || !product_id || !variant_id) {
//       console.error("Invalid wishlist payload:", {
//         user_id,
//         product_id,
//         variant_id,
//       });
//       toast.error("Product or variant not found!");
//       return;
//     }
//     const payload = { user_id, product_id, variant_id };
//     try {
//       await dispatch(addToWishlist(payload)).unwrap();
//       navigate("/wishlist");
//     } catch (err) {
//       console.error("Add to wishlist failed:", err);
//       toast.error(err || "Failed to add to wishlist");
//     }
//   };
//   return { handleAddToWishlist };
// };

import { useDispatch, useSelector } from "react-redux";
import { addToWishlist } from "../../features/wishlist/wishlistThunk";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useAddToWishlist = (setShowLoginPopup) => {
  const dispatch = useDispatch();
  const navigat = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user_id = useSelector((state) => state.auth.user?._id);
  const wishlistItems = useSelector((state) => state.wishlist.items) || [];

  const handleAddToWishlist = async (item, activeVariant) => {
    if (!token) {
      if (setShowLoginPopup) {
        setShowLoginPopup(true);
      } else {
        toast.error("Please login to add to wishlist", {
          position: "top-center",
        });
      }
      return;
    }

    const product_id = item._id || item.product?._id;
    const variant_id =
      activeVariant?._id ||
      item.variant_id?._id ||
      item.variant?._id ||
      item.variants?.[0]?._id;

    if (!user_id || !product_id || !variant_id) {
      console.error("Invalid wishlist payload:", {
        user_id,
        product_id,
        variant_id,
      });
      toast.error("Product or variant not found!");
      return;
    }

    const alreadyExists = wishlistItems.some(
      (w) =>
        (w.product_id?._id || w.product_id) === product_id &&
        (w.variant_id?._id || w.variant_id) === variant_id,
    );

    if (alreadyExists) {
      toast.success("Already added in wishlist", { position: "top-center" });
      return;
    }

    const payload = { user_id, product_id, variant_id };
    try {
      await dispatch(addToWishlist(payload)).unwrap();

      toast.success("Added to wishlist!", { position: "top-center" });
      navigat("/wishlist");
    } catch (err) {
      console.error("Add to wishlist failed:", err);
      toast.error(err || "Failed to add to wishlist");
    }
  };

  return { handleAddToWishlist };
};
