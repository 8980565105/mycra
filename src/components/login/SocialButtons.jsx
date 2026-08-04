// import React from 'react';
// import { FaFacebookF } from 'react-icons/fa';
// import google from "../../assets/googl.png";
// import { useDispatch } from 'react-redux';
// import { useGoogleLogin } from '@react-oauth/google';
// import toast from 'react-hot-toast';

// const SocialButtons = () => {
//   const dispatch = useDispatch();

//   const handleGoogleLogin = useGoogleLogin({
//     flow: "auth-code",
//     onSuccess: async (tokenResponse) => {
//       console.log(tokenResponse);
//     },
//     onError: () => toast.error("Google login failed"),
//   });

//   return (
//     <div className="flex flex-col sm:flex-row gap-4 items-center">
//       <button className="flex items-stretch bg-[#3b5998] text-white rounded w-[185px] ">
//         <div className="flex items-center px-2 border-r border-white">
//           <FaFacebookF size={30} />
//         </div>
//         <div className="flex-1 flex items-center justify-center p-[13px] text-[18px]">
//           Facebook
//         </div>
//       </button>
//       <button
//         type="button"
//         onClick={handleGoogleLogin}
//         className="flex items-stretch border light-border  bg-white  rounded w-[185px]">
//         <div className="flex items-center px-2 border-r light-border">
//           <img src={google} />
//         </div>
//         <div className="flex-1 flex items-center justify-center p-[13px] text-[18px]">
//           Google+
//         </div>
//       </button>

//     </div>
//   );
// };

// export default SocialButtons;

import React from "react";
import { FaFacebookF } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { googleLoginUser } from "../../features/auth/authThunk";

const SocialButtons = ({ onClose }) => {
  const dispatch = useDispatch();

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google login failed: no credential received");
      return;
    }

    const res = await dispatch(googleLoginUser(idToken));

    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Google login successful!", { position: "top-center" });
      if (onClose) {
        setTimeout(() => onClose(), 800); 
      }
    } else {
      toast.error(res.payload || "Google login failed", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <button className="flex items-stretch bg-[#3b5998] text-white rounded w-[185px]">
        <div className="flex items-center px-2 border-r border-white">
          <FaFacebookF size={30} />
        </div>
        <div className="flex-1 flex items-center justify-center p-[13px] text-[18px]">
          Facebook
        </div>
      </button>

      <div className="w-[185px]">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google login failed")}
          width="185"
        />
      </div>
    </div>
  );
};

export default SocialButtons;
