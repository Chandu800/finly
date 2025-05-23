import { FaWhatsapp } from "react-icons/fa";
import Chandu from "../assets/images/Chandu.JPG";
import FeedbackForm from "./FeedbackForm";

export default function FeedbackPage() {
  // WhatsApp chat link (replace with your number)
  const whatsappNumber = "918008105808";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20Finly%20team!%20I%20have%20a%20question%20or%20feedback.`;

  return (
    <div className="w-full">
      {/* Meet the Developer */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-white rounded-xl shadow p-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">Meet the Developer</h2>
          <p className="text-gray-700 font-semibold mb-1">
            Hi user, I’m <span className="text-gray-600">Chandra sekhar Gorrepati</span> 👋
          </p>
          <p className="text-gray-600 mb-1">
            I built <span className="font-bold">Finly</span> to help people manage their money smarter, track expenses, and reach their financial goals with ease.
          </p>
          <p className="text-gray-500 text-sm">
            This project was born out of a passion for personal finance and technology. Your feedback helps make it better!
          </p>
        </div>
        <img
          src={Chandu}
          alt="Developer"
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-200 object-cover"
        />
      </div>

      {/* Feedback Form */}
      <div className="mb-8">
        <FeedbackForm />
      </div>

      {/* Chat with Finly Team */}
      <div className="bg-blue-50 rounded-xl shadow p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold mb-1">Need help or want to chat?</h4>
          <p className="text-gray-600">You can chat directly with the Finly team on WhatsApp.</p>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition text-sm whitespace-nowrap"
        >
          <FaWhatsapp size={20} /> Chat with Finly Team
        </a>
      </div>
    </div>
  );
}
