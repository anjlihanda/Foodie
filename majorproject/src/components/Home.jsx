function Home() {
  return (
    <section
      id="home"
      className="min-h-screen bg-[#FAF8F2] flex items-center pt-24 px-6"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* Left Content */}
        <div>
          <h2 className="text-[#E3432E] text-2xl font-semibold mb-4 uppercase tracking-widest">
            🍕 Welcome to Foodie
          </h2>

          <h1 className="text-4xl md:text-6xl font-bold text-[#2D3028] leading-tight">
            Delicious Food,
            <br />
            <span className="text-[#E3432E]">
              Delivered Fresh!
            </span>
          </h1>

          <p className="text-[#77766F] text-base leading-7 mt-5 mb-7 max-w-md">
            Craving something delicious? Explore our tasty burgers,
            cheesy pizzas, crispy fries and more. Order your
            favourite food and enjoy every bite!
          </p>

          <a
            href="#menu"
            className="inline-block bg-[#E3432E] text-white px-7 py-3 rounded-full font-semibold hover:bg-[#C93422] transition"
          >
            Order Now →
          </a>

          <div className="flex flex-wrap gap-5 mt-7 text-sm text-[#2D3028]">
            <span>🍔 Tasty Burgers</span>
            <span>🍕 Cheesy Pizza</span>
            <span>🚚 Fast Delivery</span>
          </div>
        </div>

        {/* Right Food Image */}
        <div>
          <img
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&auto=format&fit=crop&q=85"
            alt="Delicious fresh pizza"
            className="w-full  object-cover rounded-3xl shadow-xl"
          />
        </div>

      </div>
    </section>
  );
}

export default Home;