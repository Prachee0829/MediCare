import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Clock, Users, ArrowRight, CheckCircle, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const features = [
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: 'Digital Prescriptions',
      description: 'Secure, paperless prescriptions with instant access and download capabilities.'
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: 'Secure Platform',
      description: 'HIPAA-compliant security with role-based access and data encryption.'
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: '24/7 Access',
      description: 'Access your medical records and prescriptions anytime, anywhere.'
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: 'Multi-Role Support',
      description: 'Designed for doctors, patients, pharmacists, and administrators.'
    }
  ];

  const benefits = [
    'Streamlined appointment scheduling',
    'Secure digital prescriptions',
    'Comprehensive patient history tracking',
    'Inventory management for pharmacies',
    'Administrative user management',
    'Detailed reporting and analytics'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-800">MediCare</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition-colors">Benefits</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Sign Up
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4 px-4">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors py-2">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition-colors py-2">Benefits</a>
            </div>
          </div>
        )}
      </nav>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Modern Healthcare Management
              <span className="text-blue-600"> Simplified</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              MediCare is a comprehensive healthcare management system designed for doctors, patients, pharmacists, and administrators.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link 
                to="/register" 
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/login" 
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:border-blue-300 transition-colors flex items-center justify-center"
              >
                Login
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:w-1/2"
          >
            <img 
              src="/images/hero-image.svg" 
              alt="Healthcare Management" 
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Key Features</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers a comprehensive suite of tools to streamline healthcare management.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-blue-50 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="benefits" className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose MediCare?</h2>
            <p className="mt-4 text-xl opacity-90 max-w-3xl mx-auto">
              Our platform offers numerous benefits for healthcare providers and patients alike.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0 mt-1" />
                <p className="text-lg">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join thousands of healthcare professionals who are already using MediCare to streamline their practice.
            </p>
            <Link 
              to="/register" 
              className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 text-lg"
            >
              Create Your Account <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">MediCare</span>
              </div>
              <p className="mt-2 text-gray-400">Modern Healthcare Management</p>
            </div>
            <div className="flex flex-wrap gap-8">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="text-gray-300 hover:text-white transition-colors">Register</Link>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} MediCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;