import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/AppIcon";
import Button from "../../components/Button";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Icon name="Wallet" className="text-mint-500 text-2xl" size={28} />
              <span className="ml-2 text-xl font-semibold text-gray-800">ExpenseTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-mint-600 font-medium transition-colors">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-mint-500 text-white px-4 py-2 rounded-lg hover:bg-mint-600 transition-all transform hover:-translate-y-0.5 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-6">
              Split Expenses,<br />
              <span className="text-mint-500">Not Friendships</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Track shared expenses, split bills effortlessly, and manage group finances with ease. Perfect for roommates, trips, and shared households.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                icon="UserPlus"
                onClick={() => window.location.href = '/register'}
              >
                Create Free Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon="Play"
                onClick={() => {/* Add demo video logic */}}
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-12">
            Everything You Need to Track Expenses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="Receipt"
              title="Easy Expense Tracking"
              description="Add expenses quickly and let our smart system handle the splitting calculations automatically."
              iconBg="bg-mint-500"
            />
            <FeatureCard 
              icon="Users"
              title="Group Management"
              description="Create groups for roommates, trips, or events. Track shared expenses and settle up easily."
              iconBg="bg-lavender-500"
            />
            <FeatureCard 
              icon="BarChart2"
              title="Expense Analytics"
              description="Get insights into your spending patterns and track shared expenses over time."
              iconBg="bg-soft-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-gray-600">Join the growing community of users who manage their shared expenses with ease.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              text="ExpenseTracker made managing our apartment expenses so much easier. No more awkward money conversations!"
              author="Sarah K."
              role="Shared Apartment"
            />
            <TestimonialCard 
              text="Perfect for our group trips! We can focus on having fun instead of keeping track of who paid what."
              author="Mike R."
              role="Travel Group"
            />
            <TestimonialCard 
              text="The analytics feature helps us understand our spending patterns and save money as roommates."
              author="Alex M."
              role="Student Housing"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-mint-500 to-mint-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-xl mb-8 text-mint-50">Join thousands of users who make expense sharing easy and stress-free.</p>
          <Button
            variant="secondary"
            size="lg"
            icon="ArrowRight"
            onClick={() => window.location.href = '/register'}
            className="bg-white text-mint-600 hover:bg-mint-50"
          >
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-mint-500 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-mint-500 transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-mint-500 transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="hover:text-mint-500 transition-colors">About</a></li>
                <li><a href="#blog" className="hover:text-mint-500 transition-colors">Blog</a></li>
                <li><a href="#careers" className="hover:text-mint-500 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#help" className="hover:text-mint-500 transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-mint-500 transition-colors">Contact Us</a></li>
                <li><a href="#privacy" className="hover:text-mint-500 transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#twitter" className="hover:text-mint-500 transition-colors">
                  <Icon name="Twitter" size={20} />
                </a>
                <a href="#facebook" className="hover:text-mint-500 transition-colors">
                  <Icon name="Facebook" size={20} />
                </a>
                <a href="#instagram" className="hover:text-mint-500 transition-colors">
                  <Icon name="Instagram" size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} ExpenseTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, iconBg }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
    <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
      <Icon name={icon} size={24} className="text-white" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Testimonial Card Component
const TestimonialCard = ({ text, author, role }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
    <div className="mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon key={star} name="Star" size={20} className="inline text-warning" />
      ))}
    </div>
    <p className="text-gray-600 mb-4">{text}</p>
    <div>
      <p className="font-semibold text-gray-800">{author}</p>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  </div>
);

export default HomePage;
