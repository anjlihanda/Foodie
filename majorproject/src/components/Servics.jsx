import React from "react";

const Services = () => {
  const services = [
    {
      icon: "🚚",
      title: "Fast Delivery",
      description:
        "Get your favourite food delivered fresh and hot right to your doorstep.",
    },
    {
      icon: "🍔",
      title: "Fresh & Tasty Food",
      description:
        "Enjoy delicious meals prepared with fresh ingredients and great taste.",
    },
    {
      icon: "🛒",
      title: "Easy Online Ordering",
      description:
        "Choose your favourite dishes and order your food in just a few clicks.",
    },
    {
      icon: "🎧",
      title: "Customer Support",
      description:
        "We are here to help you with your orders and answer your questions.",
    },
  ];

  return (
    <section
      id="services"
      className="bg-[#FAF8F2] py-24 px-6 md:px-10"
    >
      <div className="max-w-7xl mx-auto">

        {/* Section Heading */}
        <div className="text-center mb-14">
          <p className="text-[#E3432E] font-semibold uppercase text-xs tracking-[0.3em] mb-4">
            • What We Offer
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-[#2D3028] mb-5">
            Our <span className="text-[#E3432E]">Services</span>
          </h2>

          <p className="text-[#77766F] text-base leading-7 max-w-2xl mx-auto">
            From your first click to the last bite, we make your
            food ordering experience simple, fresh and delightful.
          </p>

          <div className="w-20 h-1 bg-[#E3432E] rounded-full mx-auto mt-6"></div>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-3xl text-center border border-[#EAE5DA] shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#E3432E]/40 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#FAF0E8] rounded-2xl text-4xl group-hover:bg-[#E3432E] group-hover:scale-110 transition-all duration-300">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#2D3028] mb-4 group-hover:text-[#E3432E] transition-colors duration-300">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-[#77766F] leading-7 text-sm">
                {service.description}
              </p>

              {/* Bottom Decoration */}
              <div className="w-10 h-1 bg-[#E9EDDF] rounded-full mx-auto mt-6 group-hover:w-16 group-hover:bg-[#E3432E] transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 bg-[#2D3028] rounded-3xl px-7 py-10 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[#E9EDDF] text-sm font-medium mb-2">
              GOOD FOOD, GREAT MOOD ❤️
            </p>

            <h3 className="text-white text-2xl md:text-3xl font-bold">
              Ready to satisfy your cravings?
            </h3>

            <p className="text-gray-300 text-sm mt-3 leading-6">
              Your favourite meals are just one click away.
            </p>
          </div>

          <a
            href="#menu"
            className="inline-block bg-[#E3432E] text-white px-8 py-4 rounded-full font-semibold whitespace-nowrap hover:bg-white hover:text-[#E3432E] transition-all duration-300"
          >
            Order Your Food →
          </a>
        </div>

      </div>
    </section>
  );
};

export default Services;