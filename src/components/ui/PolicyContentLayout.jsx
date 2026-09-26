import React, { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import Section from "./Section";
import Row from "./Row";

const PolicyContentLayout = ({ description }) => {
  const [activeHeading, setActiveHeading] = useState("");

  const createHeadingId = (text, index) => {
    let id = text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (!id) {
      id = `policy-heading-${index}`;
    }

    return id;
  };

  const { headings, html } = useMemo(() => {
    if (!description) {
      return {
        headings: [],
        html: "",
      };
    }

    const parser = new DOMParser();

    const document = parser.parseFromString(
      description,
      "text/html"
    );
    
    const headingElements = Array.from(
        document.querySelectorAll("h2") //  ("h2, h3")
    );

    const usedIds = new Set();


    headingElements.forEach((heading, index) => {
      const text = heading.textContent?.trim() || "";

      let id = createHeadingId(text, index);

      const originalId = id;
      let counter = 1;

      while (usedIds.has(id)) {
        id = `${originalId}-${counter}`;
        counter++;
      }

      usedIds.add(id);

      heading.setAttribute("id", id);
       heading.setAttribute(
        "class", "text-[rgba(0,0,0,0.8)] text-[26px] md:text-[28px] leading-[1.25] font-bold pt-[20px] pb-[15px] first:pt-0 scroll-mt-[110px]"
    );
    });

    document.querySelectorAll("h3").forEach((heading) => {
        heading.setAttribute(
          "class", "text-[rgba(0,0,0,0.8)] text-[20px] md:text-[22px] leading-[1.25] font-bold py-[13px] first:pt-0 "  //scroll-mt-[110px]
        );
    });

    document.querySelectorAll("h4,h5,h6").forEach((heading) => {
        heading.setAttribute(
          "class", "text-[rgba(0,0,0,0.8)] text-[18px] md:text-[20px] leading-[1.25] font-bold py-[13px] first:pt-0 "  //scroll-mt-[110px]
        );
    });

    document.querySelectorAll("p").forEach((paragraph) => {
      paragraph.setAttribute(
        "class", "mt-0 mb-[20px] last:mb-[0px] sec-text-color text-[18px]"
      );
    });

    document.querySelectorAll("ul").forEach((ul) => {
      ul.setAttribute(
        "class", "list-disc pl-[25px] mt-[15px] mb-[25px]"
      );
    });

    document.querySelectorAll("ol").forEach((ol) => {
      ol.setAttribute(
        "class", "list-decimal pl-[25px] mt-[15px] mb-[25px]"
      );
    });

    document.querySelectorAll("li").forEach((li) => {
      li.setAttribute(
        "class", "last:mb-0 mb-[8px]  sec-text-color"
      );
    });

    document.querySelectorAll("a").forEach((link) => {
      link.setAttribute(
        "class", "text-[var(--primary-color)] underline"
      );
    });


    document.querySelectorAll("table").forEach((table) => {
      table.setAttribute(
        "class", "w-full border-collapse my-[25px]"
      );
    });

    document.querySelectorAll("th, td").forEach((cell) => {
      cell.setAttribute(
        "class", "border border-light p-[10px] text-left"
      );
    });

    const headingData = headingElements.map((heading) => ({
        id: heading.getAttribute("id"),
        text: heading.textContent?.trim() || "",
        level: heading.tagName.toLowerCase(),
    }));

    const cleanHtml = DOMPurify.sanitize(
      document.body.innerHTML,
      {
        ADD_ATTR: ["id", "class"],
      }
    );

    return { headings: headingData, html: cleanHtml };
  }, [description]);

    useEffect(() => {
        if (headings.length > 0) {
            setActiveHeading(headings[0].id);
        } else {
            setActiveHeading("");
        }
    }, [headings]);


  useEffect(() => {
    if (!headings.length) {
      return;
    }

    const headingNodes = headings.map((heading) =>
        document.getElementById(heading.id)
      )
      .filter(Boolean);

    if (!headingNodes.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length) {
          setActiveHeading(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0,
      }
    );

    headingNodes.forEach((node) => {
      observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);



  const handleHeadingClick = (event, headingId) => {
    event.preventDefault();

    const element = document.getElementById(headingId);

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth", block: "start",
    });

    setActiveHeading(headingId);

    window.history.replaceState(null, "", `#${headingId}`);
  };


  if (!description) {
    return null;
  }

  return (
    <Section >
      <Row className="py-[25px] md:py-[50px] !max-w-[1280px]">

        <div className="w-full grid grid-cols-1 custom-lg:grid-cols-[1.2fr_2.8fr] gap-[40px] bg-white  ">

          {/* LEFT SIDEBAR */}
          <aside className="w-full lg:sticky lg:top-[110px] self-start shadow-[0_0_4px_0_rgba(0,0,0,0.25)] py-8 px-6 rounded-[10px] relative 
                          lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto no-scrollbar">
            <nav aria-label="Privacy Policy Navigation">
              <ul className="list-none m-0 p-0">

                {headings.map((heading, index) => (
                  <li key={heading.id}
                //    className={heading.level === "h3" ? "pl-[15px]" : ""}
                   >
                    <a 
                        href={`#${heading.id}`} 
                        onClick={(event) => handleHeadingClick(event, heading.id)} 
                        className={`block  text-gray-800 text-[20px] leading-[1.55] font-medium no-underline border-b-[2px] border-transparent cursor-pointer transition-colors 
                            duration-200 hover:text-[var(--primary-color)]  
                            ${index !== headings.length - 1 ? "mb-[24px] pb-[8px]" : "mb-0 "}
                            ${
                            activeHeading === heading.id ? "border-b-[var(--primary-color)]" : ""
                            }`}
                        >
                        {heading.text}
                    </a>

                  </li>
                ))}

              </ul>
            </nav>
          </aside>

          {/* RIGHT CONTENT */}

          <main className="min-w-0">
            <article dangerouslySetInnerHTML={{ __html: html }} />
          </main>

        </div>
      </Row>
    </Section>
  );
};

export default PolicyContentLayout;