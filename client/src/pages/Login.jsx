import React, { useState } from "react";
import { useFormik } from "formik";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { 
  Mail, Lock, LogIn, Eye, EyeOff, 
  User, Building, Shield, HammerIcon, 
  Zap, Leaf, Battery, Cloud, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Lottie from "lottie-react";
import loginAnimation from "../assets/Login.json";

import { useLoginUserMutation } from "../Redux/user.api";
import { useAuth } from "@/contexts/AuthContext";
import { useAssociateLoginMutation, usePartnerLoginMutation } from "../Redux/associates.api";
import { useLoginEpcMutation } from "../Redux/Epc.api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("consumer");
  const navigate = useNavigate();
  const { login } = useAuth();
const [loginEpc] = useLoginEpcMutation();

  const [associateLogin] = useAssociateLoginMutation();
  const [partnerLogin] = usePartnerLoginMutation();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit: async (values) => {
      try {
        if (userType === "partner") {
          await partnerLogin(values).unwrap();
          toast.success("Partner Login Successful");
          navigate("/partner-dash");
          return;
        }

        if (userType === "associate") {
          await associateLogin(values).unwrap();
          toast.success("Associate Login Successful");
          navigate("/Associate-Dash");
          return;
        }

      if (userType === "epc") {
  try {
    const res = await loginEpc(values).unwrap();
    toast.success("EPC Login Successful");
    navigate("/epc-dashboard");
    return;
  } catch (error) {
    toast.error(error?.data?.message || "Invalid EPC login credentials");
    return;
  }
}


        const res = await loginUser(values).unwrap();
        login(res.data, res.token);
        toast.success("Login Successful");
        navigate("/UserProfile");

      } catch (error) {
        toast.error("Invalid Email or Password");
      }
    }
  });

  // Handle quick login for different user types
  const handleQuickLogin = (type) => {
    setUserType(type);
    const demoCredentials = {
      consumer: { email: "consumer@example.com", password: "demo123" },
      partner: { email: "partner@newra.com", password: "demo123" },
      associate: { email: "associate@newra.com", password: "demo123" },
      epc: { email: "epc@example.com", password: "demo123" }
    };
    
    if (demoCredentials[type]) {
      formik.setValues(demoCredentials[type]);
    }
  };

  // Step 1: Show 4 boxes with JSON animation
  const renderAccountTypeSelection = () => (
    <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      {/* Left Side - JSON Animation */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden">
          <Lottie 
            animationData={loginAnimation} 
            loop 
            className="w-full h-64"
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Interactive Animation</span>
            </div>
            <div className="text-xs text-gray-500">Real-time Preview</div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-bold text-gray-900">24/7</span>
            </div>
            <p className="text-sm text-gray-600">Platform Access</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-green-500" />
              <span className="text-lg font-bold text-gray-900">100%</span>
            </div>
            <p className="text-sm text-gray-600">Secure</p>
          </div>
        </div>
      </div>

      {/* Right Side - 4 Boxes */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Select your account type to continue</p>
        </div>

        {/* 4 Boxes Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { 
              value: "consumer", 
              label: "Consumer", 
              icon: <User className="w-8 h-8" />,
              color: "bg-blue-500",
              hoverColor: "hover:bg-blue-600"
            },
            { 
              value: "partner", 
              label: "Partner", 
              icon: <Building className="w-8 h-8" />,
              color: "bg-green-500",
              hoverColor: "hover:bg-green-600"
            },
            { 
              value: "associate", 
              label: "Associate", 
              icon: <Shield className="w-8 h-8" />,
              color: "bg-purple-500",
              hoverColor: "hover:bg-purple-600"
            },
            { 
              value: "epc", 
              label: "EPC", 
              icon: <HammerIcon className="w-8 h-8" />,
              color: "bg-amber-500",
              hoverColor: "hover:bg-amber-600"
            }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => handleQuickLogin(type.value)}
              className="group flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-200"
            >
              <div className={`w-16 h-16 rounded-2xl ${type.color} ${type.hoverColor} flex items-center justify-center text-white mb-4 transition-colors duration-200 group-hover:scale-105`}>
                {type.icon}
              </div>
              <span className="font-semibold text-gray-900 text-lg">{type.label}</span>
              <span className="text-sm text-gray-500 mt-1">Click to login</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">New to NewRa Energy?</p>
          <Link 
            to="/choose-account-type" 
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );

  // Step 2: Show login form after selection
  const renderLoginForm = () => (
    <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      {/* Left Side - JSON Animation */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden">
          <Lottie 
            animationData={loginAnimation} 
            loop 
            className="w-full h-64"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Cloud Powered</span>
            </div>
            <div className="text-xs text-gray-500">Real-time Sync</div>
          </div>
        </div>
        
        {/* User Type Info */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl ${
              userType === "consumer" ? "bg-blue-500" :
              userType === "partner" ? "bg-green-500" :
              userType === "associate" ? "bg-purple-500" :
              "bg-amber-500"
            } flex items-center justify-center text-white`}>
              {userType === "consumer" && <User className="w-6 h-6" />}
              {userType === "partner" && <Building className="w-6 h-6" />}
              {userType === "associate" && <Shield className="w-6 h-6" />}
              {userType === "epc" && <HammerIcon className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {userType === "consumer" && "Consumer Account"}
                {userType === "partner" && "Partner Account"}
                {userType === "associate" && "Associate Account"}
                {userType === "epc" && "EPC Account"}
              </h3>
              <p className="text-sm text-gray-600">Secure login with encrypted connection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div>
        {/* Back Button */}
        <button
          onClick={() => setUserType("consumer")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-gray-400 transition-colors">
            ←
          </div>
          <span className="font-medium">Back to account selection</span>
        </button>

        {/* Login Card */}
        <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${
                userType === "consumer" ? "bg-blue-500" :
                userType === "partner" ? "bg-green-500" :
                userType === "associate" ? "bg-purple-500" :
                "bg-amber-500"
              } text-white mb-4`}>
                {userType === "consumer" && <User className="w-8 h-8" />}
                {userType === "partner" && <Building className="w-8 h-8" />}
                {userType === "associate" && <Shield className="w-8 h-8" />}
                {userType === "epc" && <HammerIcon className="w-8 h-8" />}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {userType === "consumer" && "Consumer Login"}
                {userType === "partner" && "Partner Login"}
                {userType === "associate" && "Associate Login"}
                {userType === "epc" && "EPC Login"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to access your dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-8 px-8">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    disabled={isLoading}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                    disabled={isLoading}
                    className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Demo Note */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Demo Credentials:</span> {formik.values.email} / demo123
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className={`w-full py-3 text-white font-medium rounded-lg transition-all duration-200 ${
                  userType === "consumer" ? "bg-blue-500 hover:bg-blue-600" :
                  userType === "partner" ? "bg-green-500 hover:bg-green-600" :
                  userType === "associate" ? "bg-purple-500 hover:bg-purple-600" :
                  "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>

              {/* Create Account Link */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/choose-account-type" className="text-blue-600 font-medium hover:underline">
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      {userType === "consumer" && !formik.values.email ? 
        renderAccountTypeSelection() : 
        renderLoginForm()
      }
    </div>
  );
};

export default Login;