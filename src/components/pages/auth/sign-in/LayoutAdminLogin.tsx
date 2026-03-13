import {SignInEmailPasswordForm} from "./SignInEmailPasswordForm";
import React from "react";
import {AdminLoginFormValues} from "@/types/auth";
import {SubmitHandler} from "react-hook-form";
import logo from "@/assets/app/logo.png";

type Props = {
  onFormSubmit: SubmitHandler<AdminLoginFormValues>
  loading?: boolean
  errorMessage?: string
}

export const LayoutAdminLogin = ({onFormSubmit, loading, errorMessage}: Props) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Centered Professional Login Card */}
        <div className="relative">
          {/* Background Effects */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-15"></div>
          
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-6">
            {/* Compact Header Section */}
            <div className="text-center mb-6">
              {/* Original Logo */}
              <div className="mb-4">
                <img 
                  src={logo} 
                  alt="Intelligo Logo" 
                  className="w-12 h-12 mx-auto mb-3 drop-shadow-lg" 
                />
              </div>
              
              {/* Title Section */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Admin Portal</p>
                <h1 className="text-xl font-black text-slate-900 mb-2">
                  <span className="bg-gradient-to-r from-brand-navy to-brand-orange bg-clip-text">
                    Admin Dashboard
                  </span>
                </h1>
              </div>
            </div>

            {/* Login Form */}
            <SignInEmailPasswordForm onFormSubmit={onFormSubmit} loading={loading} errorMessage={errorMessage} />
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground/70">
          <p>© {new Date().getFullYear()} Intelligo Job Ready Portal</p>
        </div>
      </div>
    </div>
  )
}
