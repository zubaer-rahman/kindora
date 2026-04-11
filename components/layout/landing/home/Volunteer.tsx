import Benefits from "./Benefits";

export default function Volunteer() {
  return (
    <div className="px-6 py-32">
      <h1 className="text-md font-semibold text-gray-500 max-w-[540px] mx-auto">
        Join a project or organization and start your volunteering journey!
      </h1>
      <br />
      <h2 className="text-3xl font-bold max-w-[960px] mx-auto">
        {" "}
        Over 5,000 people have volunteered with KINDORA, Here’s why.
      </h2>
      <div className="py-4">
        <Benefits
          title="Perfect for solo volunteers"
          description="Whether you're 18 or 81, you'll gain friends for life by joining a group of like-minded volunteers from around the world."
          linkText="Explore our top opportunities for solo volunteer"
          linkHref="#"
          imageSrc="/v1.png"
          imageAlt="Volunteers"
        />
      </div>

      <div className="py-4">
        <Benefits
          title="Join a community of changemakers"
          description="Connect with people who share your passion for making a difference and create lasting impacts together."
          linkText="See how you can contribute"
          linkHref="#"
          imageSrc="/v2.png"
          imageAlt="Group of volunteers"
          reverse
        />
      </div>

      <div className="py-2">
        <Benefits
          title="Perfect for solo volunteers"
          description="Whether you're 18 or 81, you'll gain friends for life by joining a group of like-minded volunteers from around the world."
          linkText="Explore our top opportunities for solo volunteer"
          linkHref="#"
          imageSrc="/v3.png"
          imageAlt="Volunteers"
        />
      </div>

      <div className="py-2">
        <Benefits
          title="Join a community of changemakers"
          description="Connect with people who share your passion for making a difference and create lasting impacts together."
          linkText="See how you can contribute"
          linkHref="#"
          imageSrc="/v4.png"
          imageAlt="Group of volunteers"
          reverse
        />
      </div>

      <div className="flex justify-center mt-8">
        {/* <button className="bg-[#2563EB] text-white px-8 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors">
          Find the perfect opportunity
        </button> */}
      </div>
    </div>
  );
}
