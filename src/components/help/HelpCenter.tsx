import {
  Search,
  Book,
  CreditCard,
  Users,
  Settings,
  MessageCircle,
  Mail,
  Phone,
  ChevronRight,
  Clock,
  Star,
} from "lucide-react";
const categories = [
  {
    icon: Book,
    title: "Getting Started",
    articles: 12,
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    articles: 8,
  },
  {
    icon: Users,
    title: "Account Management",
    articles: 10,
  },
  {
    icon: Settings,
    title: "Customization",
    articles: 6,
  },
];
const popularArticles = [
  {
    title: "How to create your first ticket",
    views: "2.4k",
    time: "5 min read",
  },
  {
    title: "Setting up email notifications",
    views: "1.8k",
    time: "3 min read",
  },
  {
    title: "Managing team permissions",
    views: "1.5k",
    time: "4 min read",
  },
  {
    title: "Integrating with Slack",
    views: "1.2k",
    time: "6 min read",
  },
];
export function HelpCenter() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-[#1D364D] text-white px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">How can we help you?</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => (
            <div
              key={category.title}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <category.icon className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-medium mb-1">{category.title}</h3>
                  <p className="text-sm text-gray-500">
                    {category.articles} articles
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Articles */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Popular Articles</h2>
            <div className="bg-white rounded-lg shadow">
              {popularArticles.map((article, index) => (
                <div
                  key={article.title}
                  className={`p-4 ${index !== popularArticles.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50 cursor-pointer`}
                >
                  <h3 className="font-medium text-blue-600 hover:text-blue-700 mb-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      {article.views} views
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Contact Support */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
                  <span>Start a Chat</span>
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Mail className="w-5 h-5 mr-2 text-gray-600" />
                  <span>Email Support</span>
                </button>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>Call us: +1 (555) 123-4567</span>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Available Mon-Fri, 9am-6pm EST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
