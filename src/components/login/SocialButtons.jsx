
import React from 'react';
import { FaFacebookF } from 'react-icons/fa';
import google from "../../assets/googl.png";
import { useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const SocialButtons = () => {
  const dispatch = useDispatch();

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);
    },
    onError: () => toast.error("Google login failed"),
  });

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <button className="flex items-stretch bg-[#3b5998] text-white rounded w-[185px] ">
        <div className="flex items-center px-2 border-r border-white">
          <FaFacebookF size={30} />
        </div>
        <div className="flex-1 flex items-center justify-center p-[13px] text-[18px]">
          Facebook
        </div>
      </button>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex items-stretch border light-border  bg-white  rounded w-[185px]">
        <div className="flex items-center px-2 border-r light-border">
          <img src={google} />
        </div>
        <div className="flex-1 flex items-center justify-center p-[13px] text-[18px]">
          Google+
        </div>
      </button>

    </div>
  );
};

export default SocialButtons;
