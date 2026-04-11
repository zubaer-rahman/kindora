"use client";

const VideoTestimonial = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            See the world. Immerse yourself. Make a difference
          </h2>
          
          <div className="relative mb-8" style={{ paddingBottom: '56.25%', height: '500px' }}>
            <iframe
              src="https://www.youtube.com/embed/fDcbjUTD0co"
              title="Volunteer Experience"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-xl shadow-lg absolute top-0 left-0 w-full h-full"
            />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <blockquote className="text-xl font-medium text-black mb-4">
                &quot;Volunteering has made me who I am in Australia.&quot;
              </blockquote>
              <div>
                <p className="text-base font-semibold mb-1">Krystal C.</p>
                <p className="text-sm text-gray-600">
                  International Student Studying in Australia
                </p>
              </div>
            </div>
            
            <div className="text-[#2563EB]">
              <div className="text-4xl font-bold"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoTestimonial;
