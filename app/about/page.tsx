import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">About Us</h1>
          <p className="text-lg text-gray-600 mb-4">
            FinTech Platform is a leading financial technology company dedicated
            to transforming how people manage their money.
          </p>
          <p className="text-gray-600 mb-4">
            Our platform combines cutting-edge technology with user-friendly
            design to provide a seamless banking experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-xl text-blue-600 mb-2">
                Our Mission
              </h3>
              <p className="text-gray-600">
                To make financial services accessible to everyone.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-xl text-blue-600 mb-2">
                Our Vision
              </h3>
              <p className="text-gray-600">
                A world where everyone can manage their money with ease.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-xl text-blue-600 mb-2">
                Our Values
              </h3>
              <p className="text-gray-600">
                Trust, innovation, and customer-first approach.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
