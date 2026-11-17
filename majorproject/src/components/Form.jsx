import React from "react";

const Form = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Food added successfully!");
  };

  return (
    <section
      id="contact"
      className="min-h-screen bg-[#FAF8F2] flex items-center justify-center px-5 py-20"
    >
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-[#EAE5DA]">

        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-[#E3432E] text-xs font-semibold tracking-[0.3em] uppercase">
            Foodie Restaurant
          </p>

          <h2 className="text-3xl font-bold text-[#2D3028] mt-3">
            Add New <span className="text-[#E3432E]">Food</span>
          </h2>

          <p className="text-[#77766F] mt-3 text-sm">
            Enter the details of your delicious food item.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="block text-[#2D3028] font-semibold mb-2">
            Food Name
          </label>

          <input
            type="text"
            placeholder="e.g. Cheese Burger"
            required
            className="w-full p-3 mb-5 border border-[#EAE5DA] rounded-xl bg-[#FAF8F2] text-[#2D3028] focus:outline-none focus:border-[#E3432E] focus:ring-2 focus:ring-[#E3432E]/20 transition"
          />

          <label className="block text-[#2D3028] font-semibold mb-2">
            Description
          </label>

          <textarea
            placeholder="Enter food description..."
            rows="4"
            required
            className="w-full p-3 mb-6 border border-[#EAE5DA] rounded-xl bg-[#FAF8F2] text-[#2D3028] resize-none focus:outline-none focus:border-[#E3432E] focus:ring-2 focus:ring-[#E3432E]/20 transition"
          />

          <button
            type="submit"
            className="w-full bg-[#E3432E] text-white p-3.5 rounded-xl font-semibold hover:bg-[#C93422] hover:shadow-lg active:scale-95 transition-all duration-300"
          >
            + Add Food
          </button>
        </form>

        <p className="text-center text-[#77766F] text-xs mt-6">
          Made with ❤️ for food lovers
        </p>
      </div>
    </section>
  );
};

export default Form;