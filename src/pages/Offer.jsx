// import { useState } from "react";
// import OfferBanner from "../components/offers/offerBanner";
// import OfferSlider from "../components/offers/offersslide";

// import LoginForm from "../pages/Login";

// export default function Offer() {
//   const [showLoginPopup, setShowLoginPopup] = useState(false);

//   return (
//     <>
//       <div>
//         <OfferBanner />
//         <OfferSlider setShowLoginPopup={setShowLoginPopup} />
//       </div>

//       {showLoginPopup && (
//         <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-4">
//           <div className="relative bg-white w-full max-w-[1062px] rounded-md overflow-hidden">
//             <LoginForm
//               onClose={() => setShowLoginPopup(false)}
//               onSwitch={() => setShowLoginPopup(false)}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import CategoriesSection from '../components/home/CategoriesSection';
import OfferBanner from "../components/offers/offerBanner";
import SizeSection from "../components/offers/SizeSection";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import SectionHeading from '../components/ui/SectionHeading';

export default function Offer() {
  return (
    <div>
      <OfferBanner />
      <Section>
        <Row className="pt-[25px] md:pt-[50px]">
          <CategoriesSection  />
        </Row>
      </Section>
      <Section>
        <Row>
            <SectionHeading page="Offer" order="2" />
        </Row>
        <SizeSection />
      </Section>

    </div>
  );
};