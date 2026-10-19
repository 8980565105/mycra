// import React, { useEffect, useState } from "react";
// import {
//   Gift,
//   Info,
//   ChevronDown,
//   Plus,
//   CheckCircle,
//   AlertCircle,
//   WalletCards,
//   History,
//   Copy,
//   Check,
// } from "lucide-react";

// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";

// import { fetchWallet } from "../../features/wallet/walletThunk";
// import Button from "../ui/Button";
// import { getGiftCardProducts, getMyGiftCards, purchaseGiftCard } from "../../features/giftCards/giftCardThunk";
// import Section from "../ui/Section";
// import Row from "../ui/Row";
// import giftcard from "../../assets/gift-card.jpg";

// export default function GiftCardToBalance() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   // const { giftCards } = useSelector((state) => state.giftCards);
//   const { giftCards, giftCardBalance, loading, error } =
//   useSelector((state) => state.giftCards);
 
// const { user } = useSelector(
//   (state) => state.auth
// );
//   // useEffect(() => {
//   //   dispatch(getMyGiftCards());
//   // }, [dispatch]);

//   const [giftCardCode, setGiftCardCode] = useState("");
//   const [giftCardPin, setGiftCardPin] = useState("");
//   const [checkingGiftCard, setCheckingGiftCard] = useState(false);

//   const [redeemSuccess, setRedeemSuccess] = useState("");
//   const [redeemError, setRedeemError] = useState("");
//   const [checkedGiftCard, setCheckedGiftCard] = useState(null);
//   const [copiedCardNumber, setCopiedCardNumber] = useState(null);
//   const [activeTab, setActiveTab] = useState("personal");

//   const [receiverEmail, setReceiverEmail] = useState("");
//   const [receiverName, setReceiverName] = useState("");
//   const [gifterName, setGifterName] = useState("");
//   const [message, setMessage] = useState("");

//   // const [cardValue, setCardValue] = useState(500);
//   // const [numberOfCards, setNumberOfCards] = useState(1);
//   const [purchaseProducts, setPurchaseProducts] = useState([]);
//   const [selectedProductId, setSelectedProductId] = useState("");
//   const [numberOfCards, setNumberOfCards] = useState(1);
//   const [productsLoading, setProductsLoading] = useState(false);
//   const [productsError, setProductsError] = useState("");
//   const [buying, setBuying] = useState(false);
//   const [buySuccess, setBuySuccess] = useState("");
//   const [buyError, setBuyError] = useState("");
//   const selectedGiftCard = purchaseProducts.find(
//     (product) => product._id === selectedProductId
//   );

//   const selectedCardValue = Number(
//     selectedGiftCard?.amount ?? selectedGiftCard?.originalAmount ?? 0
//   );
//   useEffect(() => {
//   if (!user) return;

//   const fullName = [ user.firstName, user.lastName ].filter(Boolean).join(" ");
//   const dynamicName = user.name || user.fullName || fullName || user.username || "";

//   setGifterName(dynamicName);
// }, [user]);

//   // useEffect(() => {
//   //   if (!user) return;
//   //   dispatch(getMyGiftCards());
//   //   dispatch(fetchWallet());
//   // }, [dispatch, user]);
//   useEffect(() => {
//   dispatch(getMyGiftCards());
//   dispatch(fetchWallet());

//   let mounted = true;

//   const loadProducts = async () => {
//     setProductsLoading(true);
//     setProductsError("");

//     try {
//       const products = await dispatch(
//         getGiftCardProducts()
//       ).unwrap();

//       if (mounted) {
//         const list = Array.isArray(products) ? products : [];

//         setPurchaseProducts(list);
//         setSelectedProductId(list[0]?._id || "");
//       }
//     } catch (error) {
//       if (mounted) {
//         setProductsError(
//           typeof error === "string"
//             ? error
//             : "Unable to load Gift Card products."
//         );
//       }
//     } finally {
//       if (mounted) {
//         setProductsLoading(false);
//       }
//     }
//   };

//   loadProducts();

//   return () => {
//     mounted = false;
//   };
// }, [dispatch]);
//   // const activeGiftCards = giftCards?.filter((card) => card.status === "Active" && Number(card.remainingBalance || 0) > 0 ) || [];
//   const activeGiftCards = (giftCards || []).filter(
//   (card) =>
//     card.status === "Active" &&
//     Number(card.remainingBalance || 0) > 0 &&
//     (!card.expiresAt || new Date(card.expiresAt) > new Date())
// );
//   const totalGiftCardBalance = activeGiftCards.reduce((total, card) => total + Number(card.remainingBalance || 0), 0);

//   const formatCurrency = (amount) => {
//     return `₹${Number(
//       amount || 0
//     ).toLocaleString("en-IN")}`;
//   };

//   const formatDate = (date) => {
//     if (!date) {
//       return "—";
//     }

//     const parsedDate = new Date(date);

//     if (Number.isNaN(parsedDate.getTime())) {
//       return "—";
//     }

//     return parsedDate.toLocaleDateString(
//       "en-GB", {
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//       }
//     );
//   };

//   const maskGiftCardCode = (code = "") => {
//     if (!code) { return "—"; }

//     if (code.length <= 4) { return code; }

//     return `${"*".repeat(code.length - 4)}${code.slice(-4)}`;
//   };

//   const handleCopyCardNumber = async (cardNumber) => {
//     try {
//       await navigator.clipboard.writeText(cardNumber);

//       setCopiedCardNumber(cardNumber);

//       setTimeout(() => {
//         setCopiedCardNumber(null);
//       }, 2000);
//     } catch (error) {
//       console.error("Failed to copy gift card number:", error);
//     }
//   };

//   const handleClearGiftCardForm = () => {
//     setGiftCardCode("");
//     setGiftCardPin("");
//     setCheckedGiftCard(null);
//     setRedeemError("");
//     setRedeemSuccess("");
//   };

//   // const totalPurchaseAmount = Number(cardValue || 0) * Number(numberOfCards || 1);
//   const selectedProduct = purchaseProducts.find(
//     (product) => product._id === selectedProductId
//   );
//   const maxCards = Math.max(
//   1,
//   Number(selectedProduct?.maxQuantity ?? 3)
// );
//   const cardValue = Number(
//     selectedProduct?.amount ??
//     selectedProduct?.originalAmount ??
//     0
//   );

//   const totalPurchaseAmount = cardValue * Number(numberOfCards || 1);

//   const handleBuyGiftCard = async () => {
//     setBuySuccess("");
//     setBuyError("");

//     if (!selectedProductId) {
//       setBuyError("Please select a Gift Card product.");
//       return;
//     }

//     if (!receiverEmail.trim()) {
//       setBuyError("Please enter receiver email.");
//       return;
//     }

//     if (!receiverName.trim()) {
//       setBuyError("Please enter receiver name.");
//       return;
//     }

//     if (!gifterName.trim()) {
//       setBuyError("Please enter gifter name.");
//       return;
//     }

//     try {
//       setBuying(true);

//       const result = await dispatch(
//         purchaseGiftCard({
//           productId: selectedProductId,
//           quantity: Number(numberOfCards),
//           receiverEmail: receiverEmail.trim(),
//           receiverName: receiverName.trim(),
//           gifterName: gifterName.trim(),
//           message: message.trim(),
//         })
//       ).unwrap();

//       setBuySuccess(
//         result?.message || "Gift Card purchased successfully."
//       );

//       setReceiverEmail("");
//       setReceiverName("");
//       setMessage("");
//       setNumberOfCards(1);

//       const refreshes = await Promise.allSettled([
//         dispatch(getMyGiftCards()).unwrap(),
//         dispatch(fetchWallet()).unwrap(),
//         dispatch(getGiftCardProducts()).unwrap(),
//       ]);

//       refreshes.forEach((item) => {
//         if (item.status === "rejected") {
//           console.error("Refresh failed:", item.reason);
//         }
//       });
//     } catch (error) {
//       setBuyError(
//         typeof error === "string"
//           ? error
//           : error?.message || "Unable to purchase Gift Card."
//       );
//     } finally {
//       setBuying(false);
//     }
//   };

//   return (
//     <Section className="min-h-screen bg-[#f5f5f5] ">

//       <Row className="!max-w-[1150px]">

//         <div className="bg-white shadow-sm rounded-sm overflow-hidden p-6">

//           <div className="pb-4 border-b border-gray-200">

//             <div className="flex items-center justify-between gap-4">

//               <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
//                 Gift Card
//               </h1>

//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate(
//                     "/my-account/wallets"
//                   )
//                 }
//                 className="text-xs sm:text-sm text-[var(--primary-color)] font-medium hover:underline whitespace-nowrap"
//               >
//                 Check Gift Card balance
//               </button>

//             </div>

//           </div>

//           <div className="pt-5">

//             <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-sm p-4 sm:p-5">

//               <div className="flex items-start justify-between gap-4">

//                 <div className="flex items-center gap-3">

//                   <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-md flex items-center justify-center shrink-0">

//                     <Gift
//                       size={22}
//                       className="text-green-600"
//                     />

//                   </div>

//                   <div>
//                     <h2 className="text-white text-sm sm:text-base font-bold uppercase">

//                       {activeGiftCards.length}

//                       {" "}

//                       Active Gift Card
//                       {activeGiftCards.length !== 1
//                         ? "s"
//                         : ""}
//                     </h2>

//                     <div className="text-white/90 text-xs mt-0.5">
//                       Available Gift Card Balance
//                     </div>

//                   </div>

//                 </div>

//                 <div className="text-white text-xl sm:text-2xl font-bold whitespace-nowrap">
//                   {formatCurrency(
//                     totalGiftCardBalance
//                   )}
//                 </div>

//               </div>

//               {activeGiftCards.length > 0 ? (

//                 <div className="mt-4 bg-white rounded-sm overflow-hidden">

//                   {activeGiftCards.map(
//                     (card, index) => (

//                       <div
//                         key={
//                           card._id || card.cardNumber || index
//                         }
//                         className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_0.9fr_0.5fr] gap-3 sm:gap-7 px-4 py-4 border-b border-gray-100 last:border-b-0"
//                       >

//                         <div>

//                           <p className="text-[9px] text-gray-400 uppercase">
//                             Received from
//                           </p>

//                           <p className="text-xs text-gray-800 font-medium break-all mt-1">
//                             {card.receivedFrom ||
//                               card.senderEmail ||
//                               "Gift Card"}
//                           </p>

//                         </div>

//                         {/* CARD NUMBER */}

//                         <div className="flex flex-col gap-2">

//                         <p className="text-[9px] text-gray-400 uppercase">
//                           Gift Card No.
//                         </p>

//                         <div className="flex items-center  gap-4 w-full">
//                           <p className="text-xs text-gray-800 font-medium break-all">
//                             {maskGiftCardCode(card.cardNumber)}
//                           </p>

//                           <button
//                             type="button"
//                             onClick={() => handleCopyCardNumber(card.cardNumber)}
//                             className="shrink-0 text-[var(--primary-color)] hover:text-theme"
//                             title="Copy Gift Card Number"
//                           >
//                             {copiedCardNumber === card.cardNumber ? (
//                               <Check size={14} />
//                             ) : (
//                               <Copy size={14} />
//                             )}
//                           </button>
//                         </div>

//                       </div>
//                         <div>

//                           <p className="text-[9px] text-gray-400 uppercase">
//                             Expires
//                           </p>

//                           <p className="text-xs text-gray-800 font-medium mt-1">
//                             {formatDate(
//                               card.expiresAt
//                             )}
//                           </p>

//                         </div>

//                         <div className="sm:text-right">

//                           <p className="text-[9px] text-gray-400 uppercase ">
//                             Gift Card Amount
//                           </p>

//                           <p className="text-sm sm:text-base font-bold text-gray-900">
//                             {formatCurrency(Number(card.remainingBalance || 0))}
//                           </p>

//                         </div>

//                       </div>

//                     )
//                   )}

//                 </div>

//               ) : (

//                 <div className="mt-4 bg-white rounded-md px-4 py-6 text-center">

//                   <Gift
//                     size={28}
//                     className="mx-auto text-gray-300 mb-2"
//                   />

//                   <p className="text-sm text-gray-500">
//                     No active gift cards found.
//                   </p>

//                 </div>

//               )}

//             </div>

//           </div>

//           <div className=" pt-3">

//             <button
//               type="button"
//               onClick={() =>
//                 document.getElementById("add-gift-card")
//                   ?.scrollIntoView({
//                     behavior: "smooth",
//                   })
//               }
//               className="w-full flex items-center gap-2 px-4 py-4 border border-gray-200 bg-white text-xs font-semibold text-[var(--primary-color)] hover:bg-gray-50 transition"
//             >

//               <Plus size={16} />

//               ADD A GIFT CARD

//             </button>

//           </div>

//           <div id="add-gift-card" className="pt-6" >

//             <div className="border border-gray-200 rounded-md p-4 sm:p-5">

//               <div className="flex items-center gap-2 mb-4">

//                 <WalletCards
//                   size={20}
//                   className="text-[var(--primary-color)]"
//                 />

//                 <h2 className="text-base sm:text-lg font-semibold text-gray-900">
//                   Check Gift Card
//                 </h2>

//               </div>

//               <p className="text-xs text-gray-500 mb-4">
//                 Enter your Gift Card Number and 6-digit PIN to check the available balance.
//               </p>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <input
//                   type="text"
//                   value={giftCardCode}
//                   onChange={(e) =>
//                     setGiftCardCode(e.target.value.toUpperCase())
//                   }
//                   placeholder="Enter Gift Card Number"
//                   className="w-full h-12 px-4 border border-gray-200 rounded-sm text-sm text-gray-900 outline-none focus:border-[var(--primary-color)]"
//                 />
//                 <input
//                   type="password"
//                   value={giftCardPin}
//                   onChange={(e) =>
//                     setGiftCardPin(e.target.value.replace(/\D/g, "").slice(0, 6))
//                   }
//                   placeholder="Enter 6-digit PIN"
//                   inputMode="numeric"
//                   maxLength={6}
//                   className="w-full h-12 px-4 border border-gray-200 rounded-sm text-sm text-gray-900 outline-none focus:border-[var(--primary-color)]"
//                 />
//               </div>
//               <p className="text-[11px] text-gray-400 mt-2">
//                 Example: GC-ABCD-EFGH-IJKL
//               </p>
//               <div className="flex flex-wrap gap-3 mt-4">

//                 <Button
//                   variant="common"
//                   disabled={checkingGiftCard || !giftCardCode.trim() || !giftCardPin.trim()}
//                 >

//                   {checkingGiftCard ? "Checking..." : "CHECK GIFT CARD"}

//                 </Button>

//                 {(giftCardCode || giftCardPin || checkedGiftCard) && (
//                   <button
//                     type="button"
//                     onClick={handleClearGiftCardForm}
//                     className="h-11 px-4 border border-gray-200 rounded-sm text-xs font-semibold text-gray-600 hover:bg-gray-50"
//                   >
//                     CLEAR
//                   </button>
//                 )}
//               </div>

//               {redeemSuccess && (

//                 <div className="mt-4 flex items-center gap-2 text-sm text-green-600">

//                   <CheckCircle size={17} />

//                   <span>{redeemSuccess}</span>

//                 </div>

//               )}

//               {redeemError && (
//                 <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
//                   <AlertCircle size={17} />
//                   <span>{redeemError}</span>
//                 </div>
//               )}

//               {checkedGiftCard && (
//                 <div className="mt-5 border border-green-200 bg-green-50 rounded-md p-4">
//                   <div className="flex items-center gap-2 mb-4">
//                     <CheckCircle size={19} className="text-green-600" />
//                     <h3 className="text-sm font-semibold text-green-700">
//                       Gift Card Verified
//                     </h3>
//                   </div>

//                   <div className="space-y-3">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
//                       <span className="text-xs text-gray-500">
//                         Gift Card Number
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <span className="text-xs font-semibold text-gray-900 break-all">
//                           {checkedGiftCard.cardNumber}
//                         </span>
//                         <button
//                           type="button"
//                           onClick={() => handleCopyCardNumber(checkedGiftCard.cardNumber)}
//                           className="text-blue-600 hover:text-blue-800 shrink-0"
//                           title="Copy Gift Card Number"
//                         >
//                           {copiedCardNumber ? (
//                             <Check size={14} />
//                           ) : (
//                             <Copy size={14} />
//                           )}

//                         </button>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <span className="text-xs text-gray-500">
//                         Original Amount
//                       </span>

//                       <span className="text-xs font-semibold text-gray-900">
//                         {formatCurrency(checkedGiftCard.originalAmount)}
//                       </span>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <span className="text-xs text-gray-500">
//                         Available Balance
//                       </span>

//                       <span className="text-base font-bold text-green-700">
//                         {formatCurrency(checkedGiftCard.remainingBalance)}
//                       </span>
//                     </div>

//                     <div className="flex items-center justify-between">

//                       <span className="text-xs text-gray-500">
//                         Status
//                       </span>

//                       <span className="text-xs font-semibold text-green-600">
//                         {checkedGiftCard.status}
//                       </span>

//                     </div>

//                     <div className="flex items-center justify-between">

//                       <span className="text-xs text-gray-500">
//                         Expires
//                       </span>

//                       <span className="text-xs font-semibold text-gray-900">
//                         {formatDate(checkedGiftCard.expiresAt)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="mt-4 pt-4 border-t border-green-200">
//                     <p className="text-xs text-green-700 leading-5">
//                       This gift card is available for use at checkout. Your balance will be deducted when you use the gift card for an order.
//                     </p>
//                   </div>

//                 </div>

//               )}
//               <div className="flex items-start gap-2 text-xs text-gray-500 mt-5">
//                 <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
//                 <span>
//                   Gift card balance can be used during checkout. The earliest expiring balance can be used first.
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className=" py-7">

//             <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
//               Buy a Gift Card
//             </h2>


//             <div className="bg-[#f5faff] border border-gray-200 rounded-sm overflow-hidden">


//               <div className="flex border-b border-gray-200 px-4 sm:px-5">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setActiveTab("personal")
//                   }
//                   className={`py-4 mr-6 text-[14px] sm:text-xs font-semibold border-b-2 ${
//                     activeTab === "personal"
//                       ? "text-[var(--primary-color)] border-[var(--primary-color)]"
//                       : "text-gray-400 border-transparent"
//                   }`}
//                 >
//                   PERSONAL GIFT CARDS
//                 </button>


//                 <button
//                   type="button"
//                   onClick={() =>
//                     setActiveTab("corporate")
//                   }
//                   className={`py-4 text-[14px] sm:text-xs font-semibold border-b-2 ${
//                       activeTab === "corporate"
//                         ? "text-[var(--primary-color)] border-[var(--primary-color)]"
//                         : "text-gray-400 border-transparent"
//                     }`}
//                 >
//                   CORPORATE REQUIREMENTS
//                 </button>

//               </div>


//               {activeTab === "personal" && (

//                 <div className="p-4 sm:p-5 lg:p-6 mt-4">

//                   <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">


//                     <div className="space-y-3">
//                       <input
//                         type="email"
//                         placeholder="Receiver's Email ID"
//                         value={receiverEmail}
//                         // onChange={(e) => setReceiverEmail(e.target.value)}
//                         onChange={(e) => {
//                           setReceiverEmail(e.target.value);
//                           setBuyError("");
//                         }}
//                         className="input-common"
//                       />

//                       <input
//                         type="text"
//                         placeholder="Receiver's Name"
//                         value={receiverName}
//                         onChange={(e) =>
//                           setReceiverName(
//                             e.target.value
//                           )
//                         }
//                         className="input-common"
//                       />
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                         <div className="relative">

//                           <select
//                             value={selectedProductId}
//                             onChange={(event) => {
//                               const productId = event.target.value;
//                               setSelectedProductId(productId);
//                               const selectedIndex = purchaseProducts.findIndex(
//                                 (product) => product._id === productId
//                               );

//                               const automaticQuantity = selectedIndex >= 0 ? selectedIndex + 1 : 1;

//                               setNumberOfCards(
//                                 Math.min(automaticQuantity, maxCards)
//                               );
//                             }}
//                             disabled={productsLoading || purchaseProducts.length === 0}
//                             className="input-common appearance-none"
//                           >
//                             <option value="">Select Gift Card</option>

//                             {purchaseProducts.map((product) => (
//                               <option key={product._id} value={product._id}>
//                                 {product.productName} — ₹
//                                 {Number(
//                                   product.amount ?? product.originalAmount ?? 0
//                                 ).toLocaleString("en-IN")}
//                               </option>
//                             ))}
//                           </select>
//                           <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
//                         </div>

//                         {productsError && (
//                           <p className="text-sm text-red-600">{productsError}</p>
//                         )}

//                         {!productsLoading && !productsError && purchaseProducts.length === 0 && (
//                             <p className="text-sm text-gray-500">
//                               No Gift Card products are available right now.
//                             </p>
//                           )}
                              
//                         <div className="relative">

//                         <select
//                           value={numberOfCards}
//                           onChange={(event) => setNumberOfCards(Number(event.target.value))}
//                           disabled={!selectedProductId || productsLoading}
//                           className="input-common appearance-none"
//                         >
//                           {Array.from({ length: maxCards }, (_, index) => index + 1).map((quantity) => (
//                             <option key={quantity} value={quantity}>
//                               No. of Cards {quantity}
//                             </option>
//                           ))}
//                         </select>
//                           <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
//                         </div>
//                       </div>

//                       <input
//                         type="text"
//                         placeholder="Gifter's Name"
//                         value={gifterName}
//                         onChange={(e) =>
//                           setGifterName(
//                             e.target.value
//                           )
//                         }
//                         className="input-common"
//                       />

//                       {/* MESSAGE */}

//                       <textarea
//                         placeholder="Write a Message (Optional, 100 characters)"
//                         maxLength={100}
//                         value={message}
//                         onChange={(e) =>
//                           setMessage(
//                             e.target.value
//                           )
//                         }
//                         className="input-common min-h-[100px]"
//                       />

//                       <div className="text-right text-[11px] text-gray-400">
//                         {message.length}/100
//                       </div>

//                       {buyError && (

//                         <div className="flex items-center gap-2 text-sm text-red-600">

//                           <AlertCircle size={16} />

//                           {buyError}

//                         </div>

//                       )}

//                       {buySuccess && (
//                         <div className="flex items-center gap-2 text-sm text-green-600">
//                           <CheckCircle size={16} />
//                           {buySuccess}
//                         </div>
//                       )}

//                     </div>

//                     <div>

                      // <div className="relative min-h-[235px] sm:min-h-[270px] rounded-lg overflow-hidden bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)] p-5 sm:p-6 text-white shadow-sm">
                      //   <div className="flex justify-end">

                      //     <div className="text-lg sm:text-xl font-extrabold">

                      //       Mycra
                      //       <span className="font-normal">
                      //         pay
                      //       </span>

                      //     </div>

                      //   </div>

                      //   <div className="mt-7">

                      //     <p className="text-xs text-white/70">
                      //       Gift Card Value
                      //     </p>

                      //     <p className="text-3xl sm:text-4xl font-bold mt-1">
                      //       {/* ₹
                      //       {Number(
                      //         cardValue
                      //       ).toLocaleString(
                      //         "en-IN"
                      //       )} */}₹{selectedCardValue.toLocaleString("en-IN")}
                      //     </p>

                      //   </div>

                      //   <div className="mt-8  ">
                      //     <img
                      //         src={
                      //           selectedGiftCard?.productImage
                      //             ? selectedGiftCard.productImage.startsWith("http")
                      //               ? selectedGiftCard.productImage
                      //               : `${process.env.REACT_APP_API_URL_IMAGE}${selectedGiftCard.productImage}`
                      //             : giftcard
                      //         }
                      //         alt={selectedGiftCard?.productName || "Gift Card"}
                      //         className="w-full rounded-[10px] lg:h-[200px] "
                      //       />
                      //   </div>

                      // </div>

//                       <div className="mt-4 space-y-2">

//                         <div className="flex justify-between text-sm">

//                           <span className="text-gray-500">
//                             Number of Cards
//                           </span>

//                           <span className="font-semibold text-gray-900">
//                             {numberOfCards}
//                           </span>

//                         </div>


//                         <div className="flex justify-between text-sm">

//                           <span className="text-gray-500">
//                             Card Value
//                           </span>

//                           <span className="font-semibold text-gray-900">
//                             {formatCurrency(
//                               cardValue
//                             )}
//                           </span>

//                         </div>


//                         <div className="flex justify-between pt-3 border-t border-gray-200">

//                           <span className="font-semibold text-gray-800">
//                             Gift Card Cost
//                           </span>

//                           <span className="font-bold text-gray-900">
//                             {formatCurrency(
//                               totalPurchaseAmount
//                             )}
//                           </span>

//                         </div>

//                       </div>


//                       <Button
//                         variant="common"
//                         onClick={handleBuyGiftCard}
//                         // disabled={buying}
//                         disabled={
//                           buying ||
//                           productsLoading ||
//                           !selectedProductId ||
//                           purchaseProducts.length === 0
//                         }
//                         className="!w-full mt-[50px] uppercase"
//                       >
// {/* 
//                         {buying
//                           ? "Processing..."
//                           : "BUY GIFT CARD"} */}
//                          {buying
//     ? "Purchasing..."
//     : `Buy Gift Card — ${formatCurrency(totalPurchaseAmount)}`}
//                       </Button>

//                     </div>

//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => {
//                       setReceiverEmail("");
//                       setReceiverName("");
//                       setGifterName("");
//                       setMessage("");
//                       setBuySuccess("");
//                       setBuyError("");
//                     }}
//                     className="mt-5 flex items-center gap-2 text-xs font-medium text-[var(--primary-color)] hover:underline"
//                   >

//                     <Plus size={14} />
//                     Buy Another Gift Card
//                   </button>

//                 </div>

//               )}

//               {activeTab === "corporate" && (

//                 <div className="p-5 sm:p-7">

//                   <div className="bg-white border border-gray-200 rounded-md p-5">

//                     <h3 className="text-base font-semibold text-gray-900 mb-2">
//                       Corporate Gift Card Requirements
//                     </h3>

//                     <p className="text-sm text-gray-600 leading-6">
//                       For bulk gift card requirements, please contact our team.
//                     </p>
                  
//                     <Button
//                       variant="common"
//                       className="mt-5"
//                     >
//                       <Link to="/contact-us">
//                       Contact Us
//                       </Link>
//                     </Button>
//                   </div>

//                 </div>

//               )}

//             </div>

//           </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="border border-gray-200 hover:border-[var(--primary-color)] rounded-md p-4">
//                 <div className="flex items-center gap-2 mb-3">

//                   <Info
//                     size={20}
//                     className="text-[var(--primary-color)]"
//                   />

//                   <h3 className="text-dark text-[20px] font-semibold leading">
//                     Gift Card Information
//                   </h3>

//                 </div>

//                 <p className="text-[#989696] text-[14px] break leading-6">
//                   Gift card balance can be used according to the applicable gift card terms and conditions.
//                 </p>

//               </div>

//               <div className="border border-gray-200 hover:border-[var(--primary-color)] rounded-md p-4">

//                 <div className="flex items-center gap-2 mb-3">

//                   <WalletCards size={20} className="text-[var(--primary-color)]" />
//                   <h3 className="text-dark text-[20px] font-semibold leading">
//                     Wallet Balance
//                   </h3>

//                 </div>

//                 <p className="text-[#989696] text-[14px] break">
//                   Current Gift Card Balance
//                 </p>

//                 <p className="text-xl font-bold text-gray-900 mt-2">
//                   {formatCurrency(
//                     totalGiftCardBalance
//                   )}
//                 </p>

//               </div>

//               <div className="text-left border border-gray-200 rounded-md p-4 hover:border-[var(--primary-color)] transition">
//                 <Link to="/my-account/wallets" className="block w-full h-full" >
//                   <div className="flex items-center gap-2 mb-3">
//                     <History size={20} className="text-[var(--primary-color)]" />
//                     <h3 className="text-dark text-[20px] font-semibold leading">
//                       Gift Card History
//                     </h3>
//                   </div>
//                   <p className="text-[#989696] text-[14px] break leading-6">
//                     View your gift card transactions and wallet activity.
//                   </p>
//                 </Link>
//               </div>
//             </div>
//         </div>
//       </Row>

//     </Section>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import {
  Gift,
  Info,
  CheckCircle,
  AlertCircle,
  WalletCards,
  History,
  ShieldCheck,
  Mail,
  CalendarDays,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchWallet } from "../../features/wallet/walletThunk";
import { getGiftCardProducts, getMyGiftCards, purchaseGiftCard } from "../../features/giftCards/giftCardThunk";
import giftcard from "../../assets/gift-card.jpg";
import Row from "../ui/Row";
import Button from "../ui/Button";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const giftCardInformation = [
  {
    id: 1, 
    title: "Official Gift Card Product",
    description: "Choose from gift card products made available by the administrator.",
    Icon: CheckCircle,
    iconColor: "text-green-600",
  },
  {
    id: 2,
    title: "Wallet Payment",
    description:  "The confirmed purchase total is deducted from your wallet.",
    Icon: WalletCards,
    iconColor: "text-purple-600",
  },
  {
    id: 3,
    title: "Multiple Cards",
    description: "Purchase up to 3 cards per transaction, subject to backend validation.",
    Icon: CreditCard,
    iconColor: "text-blue-600",
  },
  {
    id: 4,
    title: "Recipient Details",
    description: "Enter the recipient's name and email. Email delivery requires a configured backend email service.",
    Icon: Mail,
    iconColor: "text-orange-600",
  },
  {
    id: 5,
    title: "Validity",
    description: "Gift card validity depends on the expiry settings returned by your backend.",
    Icon: CalendarDays,
    iconColor: "text-red-500",
  },
];

const AmountPrevArrow = ({ onClick, currentSlide }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={currentSlide === 0}
    aria-label="Previous gift card amounts"
    className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#ef3a96]/20 bg-white text-[#ef3a96] shadow-md transition hover:bg-[#ef3a96] hover:text-white sm:-left-4"
  >
    <ChevronLeft size={20} />
  </button>
);

const AmountNextArrow = ({ onClick, currentSlide, slideCount, slidesToShow }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={currentSlide >= slideCount - slidesToShow}
    aria-label="Next gift card amounts"
    className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#ef3a96]/20 bg-white text-[#ef3a96] shadow-md transition hover:bg-[#ef3a96] hover:text-white  sm:-right-4"
  >
    <ChevronRight size={20} />
  </button>
);
const MAX_CARDS = 3;

const GiftCardToBalance = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const walletState = useSelector((state) => state.wallet || {});
  const giftCardState = useSelector((state) => state.giftCards || {});

  const wallet = walletState.wallet || {};
  const giftCards = Array.isArray(giftCardState.giftCards)
    ? giftCardState.giftCards
    : [];

  // Gift card product state
  const [purchaseProducts, setPurchaseProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [numberOfCards, setNumberOfCards] = useState(1);
  const [customAmount, setCustomAmount] = useState(1000);

  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // Recipient information
  const [receiverName, setReceiverName] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [gifterName, setGifterName] = useState("");
  const [message, setMessage] = useState("");

  // Purchase feedback
  const [buying, setBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState("");
  const [buyError, setBuyError] = useState("");

  const [activeTab, setActiveTab] = useState("purchase");
  const [copiedCardNumber, setCopiedCardNumber] = useState("");

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  // Support boolean values returned by the API.
  const isCustomProduct = (product) =>
    product?.allowCustomAmount === true ||
    product?.allowCustomAmount === "true";

  const getProductPrice = (product) => {
    if (!product) return 0;

    const price = Number(
      product.amount ??
        product.originalAmount ??
        (isCustomProduct(product) ? product.minAmount : 0)
    );

    return Number.isFinite(price) ? price : 0;
  };

  const getAmountSettings = (product) => {
    const minAmount = Number(product?.minAmount);
    const maxAmount = Number(product?.maxAmount);
    const amountStep = Number(product?.amountStep);

    const valid =
      Number.isSafeInteger(minAmount) &&
      Number.isSafeInteger(maxAmount) &&
      Number.isSafeInteger(amountStep) &&
      minAmount > 0 &&
      maxAmount >= minAmount &&
      amountStep > 0 &&
      (maxAmount - minAmount) % amountStep === 0;

    return {
      minAmount, maxAmount, amountStep, valid,
    };
  };
 const selectedGiftCard = useMemo(() =>
      purchaseProducts.find(
        (product) => product._id === selectedProductId
      ),
    [purchaseProducts, selectedProductId]
  );

  // Generate selectable amounts using the admin's saved settings.
  const customAmountOptions = useMemo(() => {
    if (!selectedGiftCard || !isCustomProduct(selectedGiftCard)) {
      return [];
    }

    const { minAmount, maxAmount, amountStep, valid } = getAmountSettings(selectedGiftCard);

    if (!valid) return [];

    const options = [];

    for (
      let amount = minAmount;
      amount <= maxAmount;
      amount += amountStep
    ) {
      options.push(amount);
    }

    return options;
  }, [selectedProductId, purchaseProducts]);

  const getGiftCardImage = (product) => {
    const image = product?.productImage || product?.image || product?.productImageUrl;

    if (!image) return giftcard;

    if (
      typeof image === "string" &&
      /^(https?:\/\/|data:)/i.test(image)
    ) {
      return image;
    }

    const baseUrl = process.env.REACT_APP_API_URL_IMAGE || "";

    return `${baseUrl.replace(/\/$/, "")}/${String(image).replace(
      /^\//, ""
    )}`;
  };

 
  const allowCustomAmount = isCustomProduct(selectedGiftCard);
  const amountSettings = getAmountSettings(selectedGiftCard);

  const cardValue = allowCustomAmount
    ? Number(customAmount)
    : getProductPrice(selectedGiftCard);

  const quantity = Math.min(
    MAX_CARDS,
    Math.max(1, Number(numberOfCards) || 1)
  );

  const totalPurchaseAmount = cardValue * quantity;

 const getEnabledProducts = (response) => {
  const products = Array.isArray(response)
    ? response
    : response?.products || response?.giftCards || [];

  const today = new Date().toLocaleDateString("en-CA");

  return products.filter((product) => {
    if (!product || product.isPurchaseEnabled !== true) return false;
    if (product.status?.toLowerCase() === "inactive") return false;

    if (product.productExpiresAt) {
      const expiryDate = String(product.productExpiresAt).slice(0, 10);
      if (today > expiryDate) return false;
    }

    const validCustom =
      isCustomProduct(product) && getAmountSettings(product).valid;

    return validCustom || getProductPrice(product) > 0;
  });
};

  // Load catalog, user's gift cards, and wallet.
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setProductsLoading(true);
      setProductsError("");

      try {
        const [productResult] = await Promise.all([
          dispatch(getGiftCardProducts()).unwrap(),
          dispatch(getMyGiftCards()),
          dispatch(fetchWallet()),
        ]);

        if (!mounted) return;

        const enabledProducts = getEnabledProducts(productResult);

        setPurchaseProducts(enabledProducts);

        setSelectedProductId((currentId) => {
          if (
            currentId &&
            enabledProducts.some((product) => product._id === currentId)
          ) {
            return currentId;
          }

          return enabledProducts[0]?._id || "";
        });

        // Set the initial denomination for the first custom product.
        const initialProduct = enabledProducts.find(
          (product) => product._id === selectedProductId
        ) || enabledProducts[0];

        if (initialProduct && isCustomProduct(initialProduct)) {
          const settings = getAmountSettings(initialProduct);

          if (settings.valid) {
            setCustomAmount(settings.minAmount);
          }
        }
      } catch (error) {
        if (mounted) {
          setProductsError(
            typeof error === "string"
              ? error
              : error?.message || "Unable to load gift card products."
          );
        }
      } finally {
        if (mounted) setProductsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    const defaultName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.name ||
          user?.fullName ||
          user?.username ||
          "";

    if (defaultName) {
      setGifterName((currentName) => currentName || defaultName);
    }
  }, [user]);

  const activeGiftCards = useMemo(() => {
    const now = Date.now();

    return giftCards.filter((card) => {
      const isActive = card?.status?.toLowerCase() === "active";
      const hasBalance = Number(card?.remainingBalance || 0) > 0;
      const notExpired =
        !card?.expiresAt || new Date(card.expiresAt).getTime() > now;

      return isActive && hasBalance && notExpired;
    });
  }, [giftCards]);

  const totalGiftCardBalance = activeGiftCards.reduce(
    (total, card) => total + Number(card.remainingBalance || 0),
    0
  );

  const walletBalance = Number(wallet?.balance || 0);

  const clearPurchaseFeedback = () => {
    setBuyError("");
    setBuySuccess("");
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;
    const product = purchaseProducts.find(
      (item) => item._id === productId
    );

    setSelectedProductId(productId);
    setNumberOfCards(1);
    clearPurchaseFeedback();

    if (product && isCustomProduct(product)) {
      const settings = getAmountSettings(product);

      if (settings.valid) {
        setCustomAmount(settings.minAmount);
      }
    } else {
      setCustomAmount(0);
    }
  };

  const handleAmountChange = (event) => {
    setCustomAmount(Number(event.target.value));
    clearPurchaseFeedback();
  };
  
  const validatePurchase = () => {
    if (!selectedGiftCard) {
      return "Please select a gift card.";
    }

    const requiredFields = [
      [receiverName, "Please enter the receiver's name."],
      [receiverEmail, "Please enter receiver email."],
      [gifterName, "Please enter the gifter's name."],
    ];

    const missingField = requiredFields.find(([value]) => !value.trim());

    if (missingField) return missingField[1];

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiverEmail.trim())) {
      return "Please enter a valid receiver email address.";
    }

    if (message.trim().length > 100) {
      return "The gift message cannot exceed 100 characters.";
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CARDS) {
      return `You can purchase between 1 and ${MAX_CARDS} cards.`;
    }

    if (allowCustomAmount) {
      if (!amountSettings.valid) {
        return "The custom amount settings are invalid. Please contact the administrator.";
      }

      if (!customAmountOptions.includes(Number(customAmount))) {
        return "Please select a valid gift card denomination.";
      }
    }

    if (
      !Number.isFinite(cardValue) ||
      cardValue <= 0 ||
      !Number.isFinite(totalPurchaseAmount) ||
      totalPurchaseAmount <= 0
    ) {
      return "The selected gift card has an invalid price.";
    }

    if (walletBalance < totalPurchaseAmount) {
      return "Your wallet balance is insufficient. Please add money to your wallet.";
    }

    return "";
  };

  const handlePurchase = async (event) => {
    event.preventDefault();
    clearPurchaseFeedback();

    const validationError = validatePurchase();

    if (validationError) {
      setBuyError(validationError);
      return;
    }

    try {
      setBuying(true);

      const purchasePayload = {
        productId: selectedGiftCard._id,
        quantity,
        receiverName: receiverName.trim(),
        receiverEmail: receiverEmail.trim(),
        gifterName: gifterName.trim(),
        message: message.trim(),
        ...(allowCustomAmount && {
          customAmount: Number(customAmount),
        }),
      };

      const result = await dispatch(
        purchaseGiftCard(purchasePayload)
      ).unwrap();

      setBuySuccess(result?.message || "Gift Card purchased successfully.");

      setReceiverName("");
      setReceiverEmail("");
      setGifterName("");
      setMessage("");
      setNumberOfCards(1);

      const refreshResults = await Promise.allSettled([
        dispatch(getMyGiftCards()).unwrap(),
        dispatch(fetchWallet()).unwrap(),
        dispatch(getGiftCardProducts()).unwrap(),
      ]);

      const catalogResult = refreshResults[2];

      if (catalogResult.status === "fulfilled") {
        const enabledProducts = getEnabledProducts(catalogResult.value);

        setPurchaseProducts(enabledProducts);

        setSelectedProductId((currentId) =>
          enabledProducts.some((product) => product._id === currentId)
            ? currentId
            : enabledProducts[0]?._id || ""
        );
      }
    } catch (error) {
      setBuyError(
        typeof error === "string"
          ? error
          : error?.message || "Unable to purchase the gift card."
      );
    } finally {
      setBuying(false);
    }
  };

  const handleCopyCardNumber = async (cardNumber) => {
    if (!cardNumber) return;

    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopiedCardNumber(cardNumber);
      setTimeout(() => {
      setCopiedCardNumber((currentCard) =>
          currentCard === cardNumber ? "" : currentCard
        );
      }, 2000);
    } catch {
      setBuyError("Unable to copy the card number. Please copy it manually.");
    }
  };

  return (
    <div className="w-full space-y-6 pt-[30px]">
      <Row className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#ef3a96]/5 p-3 text-[var(--primary-color)]">
              <Gift size={27} />
            </div>

            <div>
              <h1 className="text-2xl font-bold ">
                Gift Cards
              </h1>
              <p className="mt-1 text-14 sec-text-color">
                Purchase gift cards and manage your available gift card balance.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/my-account/wallets"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <WalletCards size={18} />
          My Wallet
        </Link>
      </Row>

      <Row className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium sec-text-color">
              Wallet Balance
            </p>
            <WalletCards className="text-blue-600" size={23} />
          </div>

          <p className="mt-3 text-2xl font-bold">
            {formatCurrency(walletBalance)}
          </p>

          <Link
            to="/my-account/wallets"
            className="mt-3 inline-block text-sm font-semibold text-theme hover:underline"
          >
            View wallet
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium sec-text-color">
              Active Gift Card Balance
            </p>
            <Gift className="text-purple-600" size={23} />
          </div>

          <p className="mt-3 text-2xl font-bold ">
            {formatCurrency(totalGiftCardBalance)}
          </p>

          <p className="mt-2 text-sm sec-text-color">
            {activeGiftCards.length} active gift card
            {activeGiftCards.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium sec-text-color">
              Gift Cards Available
            </p>
            <ShoppingBag className="text-green-600" size={23} />
          </div>

          <p className="mt-3 text-2xl font-bold">
            {productsLoading ? "Loading..." : purchaseProducts.length}
          </p>

          <p className="mt-2 text-sm sec-text-color">
            Available gift card products
          </p>
        </div>
      </Row>

      <Row className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("purchase")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "purchase"
              ? "border-[var(--primary-color)] text-[var(--primary-color)]"
              : "border-transparent sec-text-color hover:text-black"
          }`}
        >
          <Gift size={17} />
          Buy Gift Card
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mycards")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "mycards"
              ? "border-[var(--primary-color)] text-[var(--primary-color)]"
              : "border-transparent sec-text-color hover:text-black"
          }`}
          
        >
          <History size={17} />
          My Gift Cards ({activeGiftCards.length})
        </button>
      </Row>

      {activeTab === "purchase" && (
        <Row className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-lg p-2.5 bg-[#ef3a96]/5 text-[var(--primary-color)]">
                <CreditCard size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Purchase a Gift Card
                </h2>
                <p className="mt-1 text-14 sec-text-color">
                  Select a gift card, choose its denomination, enter the
                  recipient details, and pay using your wallet balance.
                </p>
              </div>
            </div>

            {productsLoading && (
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <RefreshCw className="animate-spin" size={18} />
                Loading available gift cards...
              </div>
            )}

            {!productsLoading && productsError && (
              <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={19} />
                <div>
                  <p className="font-semibold">Unable to load gift cards</p>
                  <p className="mt-1">{productsError}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-2 font-semibold underline"
                  >
                    Reload page
                  </button>
                </div>
              </div>
            )}

            {!productsLoading &&
              !productsError &&
              purchaseProducts.length === 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                  <p className="font-semibold">No gift cards available</p>
                  <p className="mt-1">
                    An administrator must create and enable gift card products
                    before customers can purchase them.
                  </p>
                </div>
              )}

            {!productsLoading &&
              !productsError &&
              purchaseProducts.length > 0 && (
                <form onSubmit={handlePurchase} className="space-y-5">
                  <div>
                    <label
                      htmlFor="giftCardProduct"
                      className="mb-2 block font-medium text-black"
                    >
                      Select Gift Card *
                    </label>

                    <select
                      id="giftCardProduct"
                      value={selectedProductId}
                      onChange={handleProductChange}
                      disabled={buying}
                      required
                      className="w-full rounded-[5px] border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:ring-1 focus:ring-[var(--primary-color)]"
                    >
                      <option value="">Select a gift card</option>

                      {purchaseProducts.map((product) => {
                        const custom = isCustomProduct(product);
                        const settings = getAmountSettings(product);

                        const productPriceLabel = custom && settings.valid
                            ? `${formatCurrency(settings.minAmount)} - ${formatCurrency(settings.maxAmount)}`
                            : formatCurrency(getProductPrice(product));

                        return (
                          <option key={product._id} value={product._id}>
                            {product.productName || product.name || "Gift Card"}{" "}
                            — {productPriceLabel}
                          </option>
                        );
                      })}
                    </select>

                    <p className="mt-2 text-14 sec-text-color">
                      Select a product first, then choose your preferred amount.
                    </p>
                  </div>

                  {selectedGiftCard && allowCustomAmount && (
                    // <div className="rounded-xl border border-[var(--primary-color)] bg-[#ef3a96]/5 p-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <label
                        htmlFor="giftCardAmount"
                        className="mb-2 block text-sm font-semibold text-black"
                      >
                        Select Gift Card Amount *
                      </label>

                      {amountSettings.valid ? (
                        <>
                          <select
                            id="giftCardAmount"
                            value={customAmount}
                            onChange={handleAmountChange}
                            disabled={buying}
                            required
                            className="w-full rounded-lg border border-[var(--primary-color)] bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-[var(--primary-color)]  focus:ring-[var(--primary-color)]"
                          >
                            {customAmountOptions.map((amount) => (
                              <option key={amount} value={amount}>
                                {formatCurrency(amount)}
                              </option>
                            ))}
                          </select>

                          <p className="mt-2 text-14 sec-text-color">
                            Choose an amount from{" "}
                            <strong>
                              {formatCurrency(amountSettings.minAmount)}
                            </strong>{" "}
                            to{" "}
                            <strong>
                              {formatCurrency(amountSettings.maxAmount)}
                            </strong>
                            . You can select amounts in{" "}
                            <strong>
                              {formatCurrency(amountSettings.amountStep)}
                            </strong>{" "}
                            increments.
                          </p>

                          {/* <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                            {customAmountOptions.map((amount) => (
                              <button
                                key={amount}
                                type="button"
                                disabled={buying}
                                onClick={() => {
                                  setCustomAmount(amount);
                                  clearPurchaseFeedback();
                                }}
                                className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                                  Number(customAmount) === amount
                                    ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                                    : "border-[#ef3a96] bg-[#ef3a96]/2 text-gray-700 hover:border-[var(--primary-color)] hover:bg-[#ef3a96]/5"
                                }`}
                              >
                                {formatCurrency(amount)}
                              </button>
                            ))}
                          </div> */}

                        <div className="mt-3">
                          <Slider
                            prevArrow={<AmountPrevArrow />}
                            nextArrow={<AmountNextArrow />}
                            infinite={false}
                            speed={400}
                            slidesToShow={Math.min(4, customAmountOptions.length)}
                            slidesToScroll={1}
                            arrows={customAmountOptions.length > 1}
                            dots={false}
                            responsive={[
                              {
                                breakpoint: 1024,
                                settings: {
                                  slidesToShow: Math.min(3, customAmountOptions.length),
                                  slidesToScroll: 1,
                                  arrows: customAmountOptions.length > 3,
                                },
                              },
                              {
                                breakpoint: 640,
                                settings: {
                                  slidesToShow: Math.min(2, customAmountOptions.length),
                                  slidesToScroll: 1,
                                  arrows: customAmountOptions.length > 2,
                                },
                              },
                            ]}
                          >
                            {customAmountOptions.map((amount) => (
                              <div key={amount} className="px-1.5 py-2">
                                <button
                                  type="button"
                                  disabled={buying}
                                  onClick={() => {
                                    setCustomAmount(amount);
                                    clearPurchaseFeedback();
                                  }}
                                  className={`w-full rounded-lg border px-2 py-3 text-sm font-semibold transition ${
                                    Number(customAmount) === amount
                                      ? "border-[#ef3a96] bg-[#ef3a96] text-white shadow-md shadow-[#ef3a96]/20"
                                      : "border-[#ef3a96]/20 bg-white text-gray-700 hover:border-[#ef3a96] hover:bg-[#ef3a96]/5"
                                  } disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                  {formatCurrency(amount)}
                                </button>
                              </div>
                            ))}
                          </Slider>
                        </div>

                        </>
                      ) : (
                        <p className="text-sm text-red-700">
                          The administrator's custom amount settings are invalid.
                          Please contact the administrator.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedGiftCard && (
                    <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-xl border border-[#ef3a96]/20 bg-gradient-to-r from-pink-800 to-pink-500  p-6 text-white shadow-lg shadow-[#ef3a96]/10 sm:grid-cols-2">

                      {/* Gift Card Image */}
                      <div>
                        <img
                          src={getGiftCardImage(selectedGiftCard)}
                          alt={selectedGiftCard.productName || "Gift Card"}
                          className=" w-full rounded-2xl object-fit overflow-hidden border border-white/20 bg-white/10 p-1 backdrop-blur-sm"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = giftcard;
                          }}
                        />
                      </div>

                      {/* Gift Card Details */}
                      <div className="flex flex-col  py-2 ">
                        
                        <div className="text-lg sm:text-[20px] font-medium text-right  mb-4 lg:mb-6">
                          Mycra
                          <span className="font-normal text-[16px]">pay</span>
                        </div>
                        <div>
                        <h3 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                          {selectedGiftCard.productName ||
                            selectedGiftCard.name ||
                            "Gift Card"}
                        </h3>

                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs font-medium uppercase tracking-wider text-white/75">
                            Gift Card Value
                          </p>

                          <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">
                            {formatCurrency(cardValue)}
                          </p>

                        </div>

                        <div className="mt-4 flex items-center gap-2 border-t border-white/20 pt-3 text-xs font-medium text-white/90">
                          <ShieldCheck size={17} className="shrink-0 text-white" />
                          Secure wallet payment
                        </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="mb-6 font-bold text-gray-900 text-[20px]">
                      Recipient Details
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <input
                          id="receiverName"
                          type="text"
                          value={receiverName}
                          onChange={(event) =>
                            setReceiverName(event.target.value)
                          }
                          placeholder="Enter receiver name"
                          maxLength={100}
                          required
                          disabled={buying}
                          className="input-common"
                        />
                      </div>

                      <div>

                        <input
                          id="receiverEmail"
                          type="email"
                          value={receiverEmail}
                          onChange={(event) =>
                            setReceiverEmail(event.target.value)
                          }
                          placeholder="receiver@example.com"
                          required
                          disabled={buying}
                          className="input-common"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          id="gifterName"
                          type="text"
                          value={gifterName}
                          onChange={(event) =>
                            setGifterName(event.target.value)
                          }
                          placeholder="Enter your name"
                          maxLength={100}
                          required
                          disabled={buying}
                          className="input-common"
                        />
                      </div>

                      <div className="sm:col-span-2">

                        <textarea
                          id="giftMessage"
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          placeholder="Write a personal message..."
                          rows={3}
                          maxLength={100}
                          disabled={buying}
                          className="input-common"
                        />

                        <p className=" text-right text-14 sec-text-color">
                          {message.length}/100 characters
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="font-bold text-gray-900">Order Summary</h3>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">Price per card</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(cardValue)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">
                          Available wallet balance
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(walletBalance)}
                        </span>
                      </div>

                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-gray-900">
                            Total Purchase
                          </span>
                          <span className="text-xl font-bold text-[var(--primary-color)]">
                            {formatCurrency(totalPurchaseAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {walletBalance < totalPurchaseAmount && (
                      <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p>
                          Your wallet balance is lower than this total. Add money
                          to your wallet before purchasing.
                        </p>
                      </div>
                    )}
                  </div>

                  {buySuccess && (
                    <div
                      role="status"
                      className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                      <CheckCircle size={20} className="shrink-0" />
                      <div>
                        <p className="font-semibold">Purchase successful</p>
                        <p className="mt-1">{buySuccess}</p>
                      </div>
                    </div>
                  )}

                  {buyError && (
                    <div
                      role="alert"
                      className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                      <AlertCircle size={20} className="shrink-0" />
                      <p>{buyError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="common"
                    disabled={
                      buying ||
                      !selectedProductId ||
                      !receiverName.trim() ||
                      !receiverEmail.trim() ||
                      !gifterName.trim() ||
                      cardValue <= 0 ||
                      (allowCustomAmount &&
                        (!amountSettings.valid ||
                          !customAmountOptions.includes(Number(customAmount))))
                    }
                    className="flex w-full"
                  >
                    {buying ? (
                      <>
                        <RefreshCw className="animate-spin" size={19} />
                        Processing Purchase...
                      </>
                    ) : (
                      <>
                        <Gift size={19} />
                        Buy Gift Card — {formatCurrency(totalPurchaseAmount)}
                      </>
                    )}
                  </Button>

                </form>
              )}
          </div>

          <div className="space-y-5 custom-lg:sticky custom-lg:top-[110px] z-[10]">

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <Info size={21} className="text-purple-700" />

                <h2 className="text-[18px] font-bold text-gray-900">
                  Gift Card Information
                </h2>
              </div>

              <ul className="space-y-5">
                {giftCardInformation.map((item) => {
                  const Icon = item.Icon;

                  return (
                    <li key={item.id} className="flex items-start gap-3">
                      <Icon
                        size={19}
                        className={`mt-0.5 shrink-0 ${item.iconColor}`}
                      />

                      <div>
                        <p className="text-sm font-semibold text-black/90">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs sec-text-color">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5 text-blue-700">
                  <WalletCards size={22} />
                </div>

                <div>
                  <h3 className="font-bold ">Need More Balance?</h3>
                  <p className="mt-1 text-14 sec-text-color">
                    Add money to your wallet to purchase gift cards.
                  </p>
                </div>
              </div>

              <Link
                to="/my-account/wallets"
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
              >
                Go to Wallet
              </Link>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={22}
                  className="mt-0.5 shrink-0 text-purple-700"
                />

                <div>
                  <h3 className="font-bold text-gray-900">
                    Secure Gift Card Purchase
                  </h3>
                  <p className="mt-2 text-[16px] sec-text-color">
                    Product prices, denominations, quantity limits, gift card
                    creation, and wallet deductions must be verified by your
                    backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Row>
      )}

      {activeTab === "mycards" && (
        <Row className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold ">
                My Active Gift Cards
              </h2>
              <p className="mt-1 text-14 sec-text-color">
                View the remaining balance on your active gift cards.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                Promise.allSettled([
                  dispatch(getMyGiftCards()).unwrap(),
                  dispatch(fetchWallet()).unwrap(),
                ])
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {activeGiftCards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-12 text-center">
              <Gift size={40} className="mx-auto text-gray-400" />

              <h3 className="mt-4 font-bold text-gray-900">
                No active gift cards
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your active gift cards will appear here when returned by the
                backend.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("purchase")}
                className="mt-5 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
              >
                Buy Gift Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-[20px] lg:gap-[30px] md:grid-cols-2 lg:grid-cols-3">
              {activeGiftCards.map((card) => {
                const cardNumber = card.cardNumber || card.code || "";
                const maskedNumber = cardNumber
                  ? `•••• •••• ${cardNumber.slice(-4)}`
                  : "Card number unavailable";

                return (
                  <div key={card._id} className="overflow-hidden rounded-2xl border border-gray-200">
                    <div className="bg-gradient-to-r from-pink-800 to-pink-500 p-5 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-purple-100">
                            Gift Card
                          </p>
                          <h3 className="mt-2 text-2xl font-bold">
                            {formatCurrency(card.remainingBalance)}
                          </h3>
                          <p className="mt-1 text-xs text-purple-100">
                            Remaining balance
                          </p>
                        </div>

                        <Gift size={30} />
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-purple-100">Card Number</p>
                          <p className="mt-1 font-mono text-sm tracking-wider">
                            {maskedNumber}
                          </p>
                        </div>

                        {cardNumber && (
                          <button
                            type="button"
                            title={
                              copiedCardNumber === cardNumber
                                ? "Copied!" : "Copy full card number"
                            }
                            aria-label={
                              copiedCardNumber === cardNumber
                                ? "Gift card number copied" : "Copy gift card number"
                            }
                            onClick={() => handleCopyCardNumber(cardNumber)}
                            className="rounded-lg bg-white/15 p-2 hover:bg-white/25"
                          >
                            {copiedCardNumber === cardNumber ? (
                              <Check size={17} />
                            ) : (
                              <Copy size={17} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="sec-text-color">Original Value</span>
                        <span >
                          {formatCurrency(card.originalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="sec-text-color">Status</span>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-14 text-green-700">
                          {card.status}
                        </span>
                      </div>

                      {card.recipientName && (
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="sec-text-color">Recipient</span>
                          <span >
                            {card.recipientName}
                          </span>
                        </div>
                      )}

                      {card.expiresAt && (
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="sec-text-color">Expires</span>
                          <span>
                            {new Date(card.expiresAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Row>
      )}
    </div>
  );
};

export default GiftCardToBalance;
