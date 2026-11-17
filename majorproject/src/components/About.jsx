function About() {
  return (
    <section
      id="about"
      className="min-h-screen bg-[#FAF8F2] py-24 px-6 md:px-10 flex items-center"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Food Image */}
        <div className="relative">
          <img
            src="https://media.istockphoto.com/id/1277835912/photo/fine-dining-restaurant.webp?a=1&b=1&s=612x612&w=0&k=20&c=vS3Syz2U04fGUfWzXKwOQinDHPErBY9F5NgHLnq0es0="
            alt="Foodie restaurant"
            className="w-full h-80  object-cover rounded-3xl shadow-lg"
          />

          <div className="absolute bottom-5 left-5 bg-white px-5 py-3 rounded-xl shadow-md">
            <p className="text-[#E3432E] font-bold text-lg">
              🍕 Made with Love
            </p>
            <p className="text-[#77766F] text-sm">
              Fresh food, happy moments
            </p>
          </div>
        </div>

        {/* About Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D3028] leading-tight">
            We Serve
            <br />
            Delicious Food
            <br />
            <span className="text-[#E3432E]">
              With Love!
            </span>
          </h1>

          <p className="text-[#77766F] text-base leading-7 mt-6">
            Welcome to Foodie! We believe that great food brings
            people together. Our goal is to serve fresh, tasty and
            quality meals that make every moment special.
          </p>

          <p className="text-[#77766F] text-base leading-7 mt-4">
            From delicious pizzas to mouth-watering burgers, we
            prepare every meal with care and passion. Enjoy your
            favourite food with quick and easy delivery!
          </p>
          <a
            href="#menu"
            className="inline-block mt-7 bg-[#E3432E] text-white px-7 py-3 rounded-full font-semibold text-sm hover:bg-[#C93422] transition duration-300 shadow-md"
          >
            Explore Our Menu →
          </a>
        </div>

      </div>
    </section>
  );
}

export default About;