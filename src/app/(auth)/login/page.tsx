import { NextPage } from 'next';
import React from 'react';
import NextImage from 'next/image';
import { LoginPageForm } from '@/components/forms/LoginForm';
import { ShoppingCart, Users, Package, BarChart3, CreditCard, TrendingUp, Shield, Settings, Zap, Globe, Truck } from 'lucide-react';
import ppi_logo from "../../../assets/images/logo.png"
import { iLoginPageProps } from '@/types/login';

const LoginPage: NextPage<iLoginPageProps> = async ({ searchParams }) => {
  const { redirect: redirectPath } = await searchParams;

  const adminIcons = [
    { icon: ShoppingCart, color: 'login-icon-blue text-blue-400' },
    { icon: Users, color: 'login-icon-green text-green-400' },
    { icon: Package, color: 'login-icon-purple text-purple-400' },
    { icon: BarChart3, color: 'login-icon-orange text-orange-400' },
    { icon: CreditCard, color: 'login-icon-indigo text-indigo-400' },
    { icon: TrendingUp, color: 'login-icon-emerald text-emerald-400' },
    { icon: Shield, color: 'login-icon-red text-red-400' },
    { icon: Settings, color: 'login-icon-gray text-gray-400' },
    { icon: Zap, color: 'login-icon-yellow text-yellow-400' },
    { icon: Globe, color: 'login-icon-cyan text-cyan-400' },
    { icon: Truck, color: 'login-icon-pink text-pink-400' },
  ];

  return (
    <div className="login-page-main min-h-screen flex flex-col">
      <div className="login-page-content flex-1 flex flex-col lg:flex-row">
        <div className="login-page-left flex-none lg:flex-[7] h-64 lg:h-auto bg-gradient-to-br from-slate-400 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="login-page-bg-pattern absolute inset-0 opacity-20">
            <div className="login-page-bg-circle-1 absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.4),transparent_50%)] animate-pulse"></div>
            <div className="login-page-bg-circle-2 absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.4),transparent_50%)] animate-pulse [animation-delay:1s]"></div>
            <div className="login-page-bg-circle-3 absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.4),transparent_50%)] animate-pulse [animation-delay:2s]"></div>
          </div>
          
          <div className="login-page-brand-section relative z-10 flex flex-col justify-center items-center h-full p-4 lg:p-8">
            <div className="login-page-brand-content text-center mb-6 lg:mb-12">
              <div className="login-page-logo-wrapper flex items-center justify-center mb-3 lg:mb-6">
                <a
                  href="https://www.promotionalproductinc.com"
                  className="login-page-logo-link bg-white/15 p-3 lg:p-6 rounded-2xl border border-white/30 shadow-2xl hover:bg-white/20 transition-all duration-300"
                >
                  <NextImage
                    src={ppi_logo}
                    alt="Promotional Product Inc"
                    className="login-page-logo-image object-contain"
                    width={200}
                    height={200 * 239 / 1270}
                  />
                </a>
              </div>
              <h1 className="login-page-company-title text-2xl lg:text-4xl font-bold text-white mb-1 lg:mb-2">
                {process.env.NEXT_PUBLIC_COMPANY_NAME || 'Promotional Product Inc'}
              </h1>
              <p className="login-page-company-subtitle text-sm lg:text-xl text-orange-100">Admin Portal</p>
            </div>

            <div className="login-page-icons-container w-full max-w-2xl">
              <div className="login-page-icons-desktop hidden lg:block relative">
                <div className="login-page-icons-circle relative w-80 h-80 mx-auto">
                  {adminIcons.map((item, index) => {
                    const angle = (index * 360) / adminIcons.length;
                    const radius = 120;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    
                    return (
                      <div
                        key={index}
                        className="login-page-icon-item absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        <div 
                          className="login-page-icon-wrapper bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 group-hover:shadow-2xl animate-bounce"
                          style={{animationDelay: `${index * 100}ms`, animationDuration: '2s', animationIterationCount: 'infinite'}}
                        >
                          <item.icon className={`login-page-icon w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="login-page-center-decoration absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="login-page-center-circle w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                      <div className="login-page-center-pulse w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="login-page-icons-mobile lg:hidden grid grid-cols-6 gap-3 justify-items-center max-w-sm mx-auto">
                {adminIcons.slice(0, 12).map((item, index) => (
                  <div
                    key={index}
                    className="login-page-icon-mobile bg-white/10 backdrop-blur-sm p-2.5 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-bounce"
                    style={{ animationDelay: `${index * 50}ms`, animationDuration: '2s', animationIterationCount: 'infinite' }}
                  >
                    <item.icon className={`login-page-mobile-icon w-4 h-4 ${item.color}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="login-page-features hidden lg:block mt-8 text-center">
              <div className="login-page-features-list flex flex-wrap justify-center gap-3 text-orange-100">
                <span className="login-page-feature-tag bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">Product Management</span>
                <span className="login-page-feature-tag bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">Order Processing</span>
                <span className="login-page-feature-tag bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">Staff Analytics</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-page-right flex-1 lg:flex-[3] bg-gray-50 flex items-center justify-center p-4 lg:p-8">
          <div className="login-page-form-container w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="login-page-form-header text-center pb-6 lg:pb-8 pt-6 lg:pt-8 px-4 lg:px-6">
              <h2 className="login-page-form-title text-xl lg:text-2xl font-bold text-gray-900 mb-2">Login</h2>
            </div>
            <div className="login-page-form-wrapper px-4 lg:px-6 pb-6 lg:pb-8">
              <div className="login-page-form-card bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <LoginPageForm redirectTo={redirectPath as string} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;