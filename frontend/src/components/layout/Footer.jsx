import React, { useState, useRef, useEffect } from "react";
import { FiFacebook } from "react-icons/fi";
import { TfiTwitter, TfiEmail } from "react-icons/tfi";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { BsTelephone } from "react-icons/bs";
import { ChevronDown, MapPin } from "lucide-react";
import send from "../../assets/send.png";
import visaImg from "../../assets/visa.png";
import mastercardImg from "../../assets/mastercard.png";
import discoverImg from "../../assets/discover.png";
import paypalImg from "../../assets/paypal.png";
import googlePlay from "../../assets/googlePlay.png";
import appleStore from "../../assets/appleStore.png";
import Row from "../ui/Row";
import Section from "../ui/Section";
import { Link } from "react-router-dom";
import mylogo from "../../assets/my_logo.png";
import { fetchFooter } from "../../features/footer/footerThunk";
import { useDispatch, useSelector } from "react-redux";

export default function Footer() {
  const dispatch = useDispatch();
  const { footers = [], loading } = useSelector((state) => state.footer);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    if (isMobile) setIsOpen((prev) => !prev);
  };

  // useEffect(() => {
  //   dispatch(fetchFooter());
  // }, [dispatch]);

  useEffect(() => {
  dispatch(fetchFooter({ isPublic: true }));
}, [dispatch]);
  const reversedFooters = [...footers].reverse();

  const navigationLinks = reversedFooters.slice(0, 4);
  const supportLinks = reversedFooters.slice(4, 9);

  return (
    <footer className="mt-[25px] md:mt-[50px]">
      {/* Mobile Header */}
      <Row
        className="flex items-center justify-between px-[10px] py-[16px] cursor-pointer md:hidden border-t border-[#BCBCBC]"
        onClick={handleToggle}
      >
        <p className="text-[14px] text-black font-medium">
          About MYcra Fashion
        </p>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Row>
      {/* Footer Content */}
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isMobile ? "" : "max-h-none opacity-100"
        }`}
        style={{
          maxHeight: isMobile
            ? isOpen
              ? `${contentRef.current?.scrollHeight}px`
              : "0px"
            : "none",
          opacity: isMobile ? (isOpen ? 1 : 0) : 1,
        }}
      >
        {/* Background */}
        <div
          className="text-light"
          style={{ backgroundColor: "rgba(210, 175, 159, 0.3)" }}
        >
          {/* Main Footer */}
          <Row className="py-[50px] md:py-[80px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo & Contact */}
            <div className="space-y-[22px] max-w-[280px] w-full">
              <Link to="/home">
                <img
                  src={mylogo}
                  alt="MYcra Logo"
                  className="w-[190px] h-[58px] mb-[35px]"
                />
              </Link>

              <div className="flex items-start gap-[20px] text-sm text-light">
                <div className="w-[20px]">
                  <MapPin className="mt-1" size={20} />
                </div>
                <p>215, Dhara Arcade near Lajamani Chowk, Surat</p>
              </div>

              <div className="flex items-start gap-5 text-sm text-light">
                <div className="w-[20px]">
                  <TfiEmail className="mt-1" size={20} />
                </div>
                <Link
                  to="mailto:info@gmail.com"
                  className="underline break-words"
                >
                  info@gmail.com
                </Link>
              </div>

              <div className="flex items-start gap-5 text-sm text-light">
                <div className="w-[20px]">
                  <BsTelephone className="mt-1" size={20} />
                </div>
                <p>+1 [155] 000-01000</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h2 className="font-regular text-20px text-black  mb-[35px] tracking-[3%]">
                NAVIGATION LINKS
                <span className="theme-border-block w-[45px]"></span>
              </h2>
              <ul className="pl-[20px] text-[15px] text-light list-disc marker:text-light space-y-[15px]">
                {!loading &&
                  navigationLinks?.map((item) => (
                    <li key={item._id}>
                      <Link to={item.url}>{item.label}</Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h2 className="font-regular text-20px text-black  mb-[35px] tracking-[3%]">
                CUSTOMER SUPPORT
                <span className="theme-border-block w-[45px]"></span>
              </h2>
              <ul className="pl-[20px] text-[15px] text-light list-disc marker:text-light space-y-[15px]">
                {!loading &&
                  supportLinks?.map((item) => (
                    <li key={item._id}>
                      <Link to={item.url}>{item.label}</Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Join Now */}
            <div>
              <h2 className="font-regular text-20px text-black  mb-[35px] tracking-[3%]">
                JOIN NOW !<span className="theme-border-block w-[45px]"></span>
              </h2>
              <p className="text-sm mb-3 text-light">
                Become a MYcra member and get 10% off your next purchase!
              </p>

              <div className="flex flex-col sm:flex-row mb-4 gap-2">
                <div className="relative w-full">
                  <input
                    type="email"
                    placeholder="Enter Your E-mail Address"
                    className="input-common !py-[7px] !rounded-[3px] turncate"
                  />
                  <img
                    src={send}
                    alt=""
                    className="absolute right-4 top-1/2 h-[20px] w-[20px] transform -translate-y-1/2 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-[15px]">
                <img
                  src={visaImg}
                  alt="Visa"
                  className="w-[62px] h-[36px] object-contain"
                />
                <img
                  src={mastercardImg}
                  alt="Mastercard"
                  className="w-[62px] h-[36px] object-contain"
                />
                <img
                  src={discoverImg}
                  alt="Discover"
                  className="w-[62px] h-[36px] object-contain"
                />
                <img
                  src={paypalImg}
                  alt="Paypal"
                  className="w-[62px] h-[36px] object-contain"
                />
              </div>
            </div>
          </Row>

          {/* App & Social */}
          <Section style={{ backgroundColor: "rgba(210, 175, 159, 30%)" }}>
            <Row>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[50px] md:gap-[30px] items-center">
                <div className="flex flex-col text-center md:text-right items-center md:items-end">
                  <h3 className="font-medium text-black text-[22px] mb-[28px] leading">
                    DOWNLOAD OUR APP
                  </h3>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-[360px]">
                    <img
                      src={googlePlay}
                      alt="Google Play"
                      className="cursor-pointer"
                    />
                    <img
                      src={appleStore}
                      alt="App Store"
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-start">
                  <h3 className="font-medium text-black text-[22px] mb-[28px] leading">
                    FOLLOW US
                  </h3>
                  <div className="flex gap-3 flex-wrap justify-center md:justify-center">
                    <FiFacebook className="w-[50px] h-[50px] p-2 rounded-[5px] bg-color text-white cursor-pointer" />
                    <FaInstagram className="w-[50px] h-[50px] p-2 rounded-[5px] bg-color text-white cursor-pointer" />
                    <FaYoutube className="w-[50px] h-[50px] p-2 rounded-[5px] bg-color text-white cursor-pointer" />
                    <TfiTwitter className="w-[50px] h-[50px] p-2 rounded-[5px] bg-color text-white cursor-pointer" />
                  </div>
                </div>
              </div>
            </Row>
          </Section>

          {/* Copyright */}
          <div className="w-full p-[10px] text-center text-white bg-color">
            © {new Date().getFullYear()} MYcra Fashion Ltd. All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}
