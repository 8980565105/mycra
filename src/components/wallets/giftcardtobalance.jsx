// import React, { useState, useEffect } from "react";
// import { Gift, Info, ChevronRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchWallet, redeemGiftCard } from "../../features/wallet/walletThunk";
// import Row from "../ui/Row";
// import Section from "../ui/Section";
// import Button from "../ui/Button";

// export default function GiftCardToBalance() {
//   const navigation = useNavigate();
//   const dispatch = useDispatch();
//   const { wallet, loading, error } = useSelector((state) => state.wallet);

//   const [giftCardCode, setGiftCardCode] = useState("");
//   const [redeeming, setRedeeming] = useState(false);
//   const [redeemError, setRedeemError] = useState("");
//   const [redeemSuccess, setRedeemSuccess] = useState("");

//   useEffect(() => {
//     dispatch(fetchWallet());
//   }, [dispatch]);

//   const handleAddGiftCard = async () => {
//     setRedeemError("");
//     setRedeemSuccess("");

//     if (!giftCardCode.trim()) {
//       setRedeemError("Please enter a gift card code.");
//       return;
//     }

//     setRedeeming(true);
//     try {
//       const result = await dispatch(
//         redeemGiftCard({ code: giftCardCode.trim() }),
//       );
//       if (redeemGiftCard.fulfilled.match(result)) {
//         setRedeemSuccess("Gift card added to your balance.");
//         setGiftCardCode("");
//         dispatch(fetchWallet());
//       } else {
//         setRedeemError(
//           result.payload?.message || "Invalid or expired gift card code.",
//         );
//       }
//     } catch (e) {
//       setRedeemError("Something went wrong. Please try again.");
//     } finally {
//       setRedeeming(false);
//     }
//   };

//   return (
//     <Section className="bg-gray-100">
//       <Row>
//         <h1 className="text-[28px] font-bold text-gray-900 mb-4">
//           Amazon Pay Gift card
//         </h1>
//       </Row>

//       <Row>
//         <div className="grid grid-cols-1 custom-lg:grid-cols-[3fr_1fr] gap-[30px]">
//           <div className="flex-1 space-y-4">
//             <div className="bg-white rounded-lg shadow-sm flex items-center gap-3 px-5 py-4">
//               <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
//                 <Gift size={20} className="text-amber-500" />
//               </div>
//               <div>
//                 <div className="font-bold text-gray-900">Gift Cards</div>
//                 <div className="text-sm text-gray-500">
//                   Available balance:{" "}
//                   <span className="text-teal-700 font-semibold">
//                     ₹{wallet?.giftCardBalance?.toFixed(2) || "0.00"}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm p-5">
//               <h2 className="font-bold text-gray-900 mb-3">
//                 Add gift card to balance
//               </h2>

//               <input
//                 type="text"
//                 value={giftCardCode}
//                 onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
//                 placeholder="Enter gift card code"
//                 className="w-full max-w-xs border border-teal-600 focus:border-teal-700 rounded-md px-3 py-2 text-sm text-gray-900 outline-none mb-1"
//               />
//               <p className="text-xs text-gray-400 mb-3">
//                 e.g. 8U95-Y3E8CQ-39MPQ
//               </p>

//               <Button
//                 onClick={handleAddGiftCard}
//                 variant="primary"
//                 disabled={redeeming || !giftCardCode.trim()}
//                 className="max-w-xs"
//               >
//                 {redeeming ? "Adding..." : "Add gift card to balance"}
//               </Button>

//               {redeemError && (
//                 <p className="text-red-500 text-xs mt-2">{redeemError}</p>
//               )}
//               {redeemSuccess && (
//                 <p className="text-teal-700 text-xs mt-2">{redeemSuccess}</p>
//               )}

//               <div className="flex items-start gap-2 text-xs text-gray-500 mt-4">
//                 <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
                // <span>
                //   For optimal utilisation, balance expiring the earliest will be
                //   redeemed first.
                // </span>
//               </div>

              // <button
              //   onClick={() => navigation("/help")}
              //   className="text-sm text-blue-600 hover:underline mt-3 block"
              // >
              //   Need more help?
              // </button>
//             </div>

//             <div className="bg-amber-300 rounded-lg overflow-hidden relative p-8 flex items-center justify-between">
//               <div>
//                 <h3 className="text-2xl font-extrabold text-gray-900 leading-snug">
//                   Give a gift of choice
//                 </h3>
//                 <p className="text-lg text-gray-900 mb-4">
//                   Select from a wide range of Gift Cards
//                 </p>
                // <div className="font-bold text-gray-900 text-xl">
                //   amazon <span className="font-normal">pay</span>
                //   <div className="text-base font-medium -mt-1">gift card</div>
                // </div>
//               </div>
//               <div className="hidden sm:block w-40 h-40 rounded-full bg-white/70" />
//             </div>
//           </div>

//           <div className="w-full  space-y-4">
//             <div className="bg-white rounded-lg shadow-sm p-4">
//               <h3 className="font-bold text-gray-900 mb-2">Add money</h3>
//               <p className="text-sm text-gray-600 mb-3">
//                 You can directly add money to your wallet with UPI, Netbanking,
//                 any available cards.
//               </p>
//               <Button
//                 onClick={() => navigation("/wallets")}
//                 variant="secondary"
//               >
//                 Add money to Wallet
//               </Button>
//               <button
//                 onClick={() => navigation("/help")}
//                 className="text-sm text-blue-600 hover:underline mt-3 block"
//               >
//                 Need more help?
//               </button>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm p-4">
//               <RowItem
//                 label="Transaction history"
//                 bold
//                 url="/transectionhistory"
//               />
//             </div>
//           </div>
//         </div>
//       </Row>
//     </Section>
//   );
// }

// function RowItem({ icon, label, bold, url }) {
//   return (
//     <a
//       href={url}
//       className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded"
//     >
//       <div className="flex items-center gap-2">
//         {icon && <span className="text-gray-500">{icon}</span>}
//         <span className={bold ? "font-bold text-gray-900" : "text-gray-800"}>
//           {label}
//         </span>
//       </div>
//       <ChevronRight size={18} className="text-gray-400" />
//     </a>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  Gift,
  Info,
  ChevronDown,
  Plus,
  CheckCircle,
  AlertCircle,
  WalletCards,
  History,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchWallet,
  redeemGiftCard,
} from "../../features/wallet/walletThunk";
import Button from "../ui/Button";


export default function GiftCardToBalance() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { wallet, loading } = useSelector(
    (state) => state.wallet
  );


  const [giftCardCode, setGiftCardCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const [redeemSuccess, setRedeemSuccess] = useState("");
  const [redeemError, setRedeemError] = useState("");

  const [activeTab, setActiveTab] = useState("personal");

  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [gifterName, setGifterName] = useState("");
  const [message, setMessage] = useState("");

  const [cardValue, setCardValue] = useState(500);
  const [numberOfCards, setNumberOfCards] = useState(1);

  const [buying, setBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState("");
  const [buyError, setBuyError] = useState("");
  

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const activeGiftCards =
    wallet?.giftCards?.filter(
      (card) => card.status === "active"
    ) || [];

  const totalGiftCardBalance = activeGiftCards.reduce(
    (total, card) =>
      total + Number(card.remainingBalance || 0),
    0
  );

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const maskGiftCardCode = (code = "") => {
    if (!code) return "—";

    if (code.length <= 4) {
      return code;
    }

    return `${"*".repeat(code.length - 4)}${code.slice(-4)}`;
  };

  const handleAddGiftCard = async () => {
    setRedeemSuccess("");
    setRedeemError("");

    const code = giftCardCode.trim();

    if (!code) {
      setRedeemError("Please enter your gift card number.");
      return;
    }

    try {
      setRedeeming(true);

      await dispatch(
        redeemGiftCard({
          code,
        })
      ).unwrap();

      setRedeemSuccess(
        "Gift Card added to your balance successfully."
      );

      setGiftCardCode("");

      dispatch(fetchWallet());

    } catch (error) {
      setRedeemError(
        error?.message ||
          error ||
          "Unable to redeem gift card."
      );
    } finally {
      setRedeeming(false);
    }
  };

  const totalPurchaseAmount = Number(cardValue || 0) * Number(numberOfCards || 1);

  const handleBuyGiftCard = async () => {
    setBuySuccess("");
    setBuyError("");

    if (!receiverEmail.trim()) {
      setBuyError("Please enter receiver email.");
      return;
    }

    if (!receiverName.trim()) {
      setBuyError("Please enter receiver name.");
      return;
    }

    if (!gifterName.trim()) {
      setBuyError("Please enter gifter name.");
      return;
    }

    try {
      setBuying(true);
      setBuySuccess(
        "Gift card details are ready for purchase."
      );

    } catch (error) {
      setBuyError(
        error?.message ||
          "Unable to purchase gift card."
      );
    } finally {
      setBuying(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#f5f5f5] py-5 sm:py-8">

      <div className="w-full max-w-[1150px] mx-auto px-3 sm:px-5 lg:px-6">

        <div className="bg-white shadow-sm rounded-sm overflow-hidden">

          <div className="px-5 sm:px-7 py-4 border-b border-gray-200">

            <div className="flex items-center justify-between gap-4">

              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Gift Card
              </h1>

              <button
                type="button"
                onClick={() => navigate("/my-account/wallets")}
                className="text-xs sm:text-sm text-[var(--primary-color)] font-medium hover:underline whitespace-nowrap"
              >
                Check Gift Card balance
              </button>

            </div>

          </div>

          <div className="px-4 sm:px-7 pt-5">

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-sm p-4 sm:p-5">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-md flex items-center justify-center shrink-0">
                    <Gift size={22} className="text-green-600" />
                  </div>

                  <div>
                    <h2 className="text-white text-sm sm:text-base font-bold uppercase">
                      {activeGiftCards.length} Active Gift Card
                      {activeGiftCards.length !== 1
                        ? "s"
                        : ""}
                    </h2>

                    <button
                      type="button"
                      className="text-white/90 text-xs flex items-center gap-1 mt-0.5"
                    >
                      Hide all active
                      <ChevronDown size={12} />
                    </button>
                  </div>

                </div>


                <div className="text-white text-xl sm:text-2xl font-bold whitespace-nowrap">
                  {formatCurrency(
                    totalGiftCardBalance
                  )}
                </div>

              </div>

              {activeGiftCards.length > 0 ? (

                <div className="mt-4 bg-white rounded-sm overflow-hidden">

                  {activeGiftCards.map(
                    (card, index) => (

                      <div
                        key={
                          card._id || index
                        }
                        className="grid grid-cols-1 sm:grid-cols-[1.4fr_1.4fr_0.9fr_auto] gap-3 sm:gap-5 px-4 py-3 border-b border-gray-100 last:border-b-0"
                      >

                        <div>

                          <p className="text-[9px] text-gray-400 uppercase">
                            Received from
                          </p>

                          <p className="text-xs text-gray-800 font-medium break-all">
                            {card.receivedFrom ||
                              card.senderEmail ||
                              "Gift Card"}
                          </p>

                        </div>


                        {/* CARD NUMBER */}

                        <div>

                          <p className="text-[9px] text-gray-400 uppercase">
                            Gift Card No.
                          </p>

                          <p className="text-xs text-gray-800 font-medium">
                            {maskGiftCardCode(
                              card.code
                            )}
                          </p>

                        </div>


                        {/* EXPIRY */}

                        <div>

                          <p className="text-[9px] text-gray-400 uppercase">
                            Expires
                          </p>

                          <p className="text-xs text-gray-800 font-medium">
                            {formatDate(
                              card.expiresAt
                            )}
                          </p>

                        </div>


                        {/* AMOUNT */}

                        <div className="sm:text-right">

                          <p className="text-sm sm:text-base font-bold text-gray-900">
                            {formatCurrency(
                              card.remainingBalance
                            )}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="mt-4 bg-white rounded-md px-4 py-6 text-center">

                  <Gift
                    size={28}
                    className="mx-auto text-gray-300 mb-2"
                  />

                  <p className="text-sm text-gray-500">
                    No active gift cards found.
                  </p>

                </div>

              )}

            </div>

          </div>


          {/* ===================================================
              ADD GIFT CARD BUTTON
          ==================================================== */}

          <div className="px-4 sm:px-7 pt-3">

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    "add-gift-card"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
               className="w-full flex items-center gap-2 px-4 py-4 border border-gray-200 bg-white text-xs font-semibold text-[var(--primary-color)] hover:bg-gray-50 transition"
            >

              <Plus size={16} />

              ADD A GIFT CARD

            </button>

          </div>


          {/* ===================================================
              REDEEM GIFT CARD
          ==================================================== */}

          <div
            id="add-gift-card"
            className="px-4 sm:px-7 pt-6"
          >

            <div className="border border-gray-200 rounded-md p-4 sm:p-5">

              <div className="flex items-center gap-2 mb-4">

                <WalletCards
                  size={20}
                  className="text-[var(--primary-color)]"
                />

                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Add Gift Card to Balance
                </h2>

              </div>


              <div className="flex flex-col sm:flex-row gap-3">

                <input
                  type="text"
                  value={giftCardCode}
                  onChange={(e) =>
                    setGiftCardCode(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddGiftCard();
                    }
                  }}
                  placeholder="Enter Gift Card Number"
                  className="flex-1 h-12 px-4 border border-gray-200 rounded-sm text-sm outline-none focus:border-[var(--primary-color)]"
                />

                <Button
                  variant="common"
                  onClick={handleAddGiftCard}
                  disabled={redeeming}

                >
                  {redeeming
                    ? "Adding..."
                    : "ADD GIFT CARD"}
                </Button>

              </div>


              {/* SUCCESS */}

              {redeemSuccess && (

                <div className="mt-4 flex items-center gap-2 text-sm text-green-600">

                  <CheckCircle size={17} />

                  {redeemSuccess}

                </div>

              )}


              {/* ERROR */}

              {redeemError && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle size={17} />
                  {redeemError}
                </div>
              )}

            </div>

          </div>


          <div className="px-4 sm:px-7 py-7">

            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Buy a Gift Card
            </h2>


            <div className="bg-[#f5faff] border border-gray-200 rounded-sm overflow-hidden">

              {/* TABS */}

              <div className="flex border-b border-gray-200 px-4 sm:px-5">

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("personal")
                  }
                  className={`py-4 mr-6 text-[14px] sm:text-xs font-semibold border-b-2 ${
                      activeTab === "personal"
                        ? "text-[var(--primary-color)] border-[var(--primary-color)]"
                        : "text-gray-400 border-transparent"
                    }
                  `}
                >
                  PERSONAL GIFT CARDS
                </button>


                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("corporate")
                  }
                  className={` py-4 text-[14px] sm:text-xs font-semibold border-b-2 ${
                      activeTab === "corporate"
                        ? "text-[var(--primary-color)] border-[var(--primary-color)]"
                        : "text-gray-400 border-transparent"
                    }
                  `}
                >
                  CORPORATE REQUIREMENTS
                </button>

              </div>


              {activeTab === "personal" && (

                <div className="p-4 sm:p-5 lg:p-6">

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* FORM */}

                    <div className="space-y-3">

                      {/* EMAIL */}

                      <input
                        type="email"
                        placeholder="Receiver's Email ID"
                        value={receiverEmail}
                        onChange={(e) =>
                          setReceiverEmail(
                            e.target.value
                          )
                        }
                        // className="w-full h-12 px-4 bg-white border border-gray-200 text-sm outline-none focus:border-[var(--primary-color)]"
                        className="input-common"
                      />


                      {/* NAME */}

                      <input
                        type="text"
                        placeholder="Receiver's Name"
                        value={receiverName}
                        onChange={(e) =>
                          setReceiverName(
                            e.target.value
                          )
                        }
                        className="input-common"
                        // className="w-full h-12 px-4 bg-white border border-gray-200 text-sm outline-none focus:border-[var(--primary-color)]"
                      />


                      {/* CARD VALUE + NUMBER */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <div className="relative">

                          <select
                            value={cardValue}
                            onChange={(e) =>
                              setCardValue(
                                Number(
                                  e.target.value
                                )
                              )
                            }
                            className="input-common appearance-none"
                          >

                            <option value={500}>
                              Card Value ₹500
                            </option>

                            <option value={1000}>
                              Card Value ₹1000
                            </option>

                            <option value={1500}>
                              Card Value ₹1500
                            </option>
                          </select>

                          <ChevronDown
                            size={15}
                            className=" absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 "
                          />

                        </div>


                        <div className="relative">

                          <select
                            value={numberOfCards}
                            onChange={(e) =>
                              setNumberOfCards(
                                Number(
                                  e.target.value
                                )
                              )
                            }
                             className="input-common appearance-none"
                          >

                            <option value={1}> No. of Cards 1 </option>

                            <option value={2}> No. of Cards 2 </option>

                            <option value={3}> No. of Cards 3 </option>

                          </select>

                          <ChevronDown
                            size={15}
                            className=" absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                          />

                        </div>

                      </div>


                      {/* GIFTER */}

                      <input
                        type="text"
                        placeholder="Gifter's Name"
                        value={gifterName}
                        onChange={(e) =>
                          setGifterName(
                            e.target.value
                          )
                        }
                         className="input-common"
                      />


                      {/* MESSAGE */}

                      <textarea
                        placeholder="Write a Message (Optional, 100 characters)"
                        maxLength={100}
                        value={message}
                        onChange={(e) =>
                          setMessage(
                            e.target.value
                          )
                        }
                         className="input-common"
                      />

                      <div className="text-right text-[11px] text-gray-400">
                        {message.length}/100
                      </div>

                      {buyError && (

                        <div className="flex items-center gap-2 text-sm text-red-600">

                          <AlertCircle size={16} />

                          {buyError}

                        </div>

                      )}


                      {/* SUCCESS */}

                      {buySuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle size={16} />
                          {buySuccess}
                        </div>
                      )}

                    </div>

                    <div>

                      <div className=" relative min-h-[235px] sm:min-h-[270px] rounded-lg overflow-hidden bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)] p-5 sm:p-6 text-white shadow-sm">
                        <div className="flex justify-end">

                          <div className="text-lg sm:text-xl font-extrabold">

                            Mycra
                            <span className="font-normal">
                              pay
                            </span>

                          </div>

                        </div>

                        <div className="mt-7">

                          <p className="text-xs text-white/70">
                            Gift Card Value
                          </p>

                          <p className="text-3xl sm:text-4xl font-bold mt-1">
                            ₹
                            {Number(
                              cardValue
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                        <div className=" absolute left-0 right-0 bottom-0 flex justify-center ">

                          <img
                            src="/images/gift-card.png"
                            alt="Gift Card"
                            className=" w-44 sm:w-56 h-24 sm:h-32 object-contain "
                          />

                        </div>

                      </div>

                      <div className="mt-4 space-y-2">

                        <div className="flex justify-between text-sm">

                          <span className="text-gray-500">
                            Number of Cards
                          </span>

                          <span className="font-semibold text-gray-900">
                            {numberOfCards}
                          </span>

                        </div>


                        <div className="flex justify-between text-sm">

                          <span className="text-gray-500">
                            Card Value
                          </span>

                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              cardValue
                            )}
                          </span>

                        </div>


                        <div className="flex justify-between pt-3 border-t border-gray-200">

                          <span className="font-semibold text-gray-800">
                            Gift Card Cost
                          </span>

                          <span className="font-bold text-gray-900">
                            {formatCurrency(
                              totalPurchaseAmount
                            )}
                          </span>

                        </div>

                      </div>


                      <Button
                        variant="common"
                        onClick={handleBuyGiftCard}
                        disabled={buying}
                        className="!w-full mt-[50px] uppercas e"
                      >

                        {buying
                          ? "Processing..."
                          : "BUY GIFT CARD"}

                      </Button>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setReceiverEmail("");
                      setReceiverName("");
                      setGifterName("");
                      setMessage("");
                    }}
                    className=" mt-5 flex items-center gap-2 text-xs font-medium text-[var(--primary-color)] hover:underline "
                  >

                    <Plus size={14} />
                    Buy Another Gift Card
                  </button>

                </div>

              )}

              {activeTab === "corporate" && (

                <div className="p-5 sm:p-7">

                  <div className="bg-white border border-gray-200 rounded-md p-5">

                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Corporate Gift Card Requirements
                    </h3>

                    <p className="text-sm text-gray-600 leading-6">
                      For bulk gift card requirements, please contact our team.
                    </p>

                    <Button
                      variant="common"
                      className="mt-5"
                    >
                      Contact Us
                    </Button>

                  </div>

                </div>

              )}

            </div>

          </div>


          <div className="px-4 sm:px-7 pb-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
              <div className="border border-gray-200 hover:border-[var(--primary-color)] rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">

                  <Info
                    size={20}
                    className="text-[var(--primary-color)]"
                  />

                  <h3 className="text-dark text-20px font-semibold  leading">
                    Gift Card Information
                  </h3>

                </div>

                <p className="text-[#989696] text-14 break">
                  Gift card balance can be used according to the applicable gift card terms and conditions.
                </p>

              </div>

              <div className="border border-gray-200  hover:border-[var(--primary-color)] rounded-md p-4">

                <div className="flex items-center gap-2 mb-3">

                  <WalletCards size={20} className="text-[var(--primary-color)]" />
                  <h3 className="text-dark text-20px font-semibold leading">
                    Wallet Balance
                  </h3>

                </div>

                <p className="text-[#989696] text-14 break">
                  Current Gift Card Balance
                </p>

                <p className="text-xl font-bold text-gray-900 mt-2">
                  {formatCurrency(
                    totalGiftCardBalance
                  )}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/my-account/wallets")
                }
                className=" text-left border border-gray-200 rounded-md p-4 hover:border-[var(--primary-color)] transition"
              >

                <div className="flex items-center gap-2 mb-3">

                  <History size={20} className="text-[var(--primary-color)]" />

                  <h3 className="text-dark text-20px font-semibold leading">
                    Gift Card History
                  </h3>

                </div>

                <p className="text-[#989696] text-14 break">
                  View your gift card transactions and wallet activity.
                </p>

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}