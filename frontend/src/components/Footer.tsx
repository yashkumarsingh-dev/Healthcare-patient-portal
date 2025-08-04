import React from "react";
import { Heart, Shield, Lock } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-slate-700/50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Security Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Security First
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Your medical documents are protected with industry-standard
              security measures.
            </p>
          </div>

          {/* Privacy */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Lock className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Privacy Protected
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Your data is encrypted and stored securely. We never share your
              information.
            </p>
          </div>

          {/* Made with Love */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Heart className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Made with Care
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Built for healthcare professionals and patients who deserve the
              best.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700/50 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            © 2024 Healthcare Patient Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
