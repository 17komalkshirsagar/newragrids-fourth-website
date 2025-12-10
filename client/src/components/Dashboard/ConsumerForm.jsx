
import autoTable from 'jspdf-autotable';
import React, { useState } from "react";
import { useOnboardUserMutation } from "../../Redux/associateUpdate.api"; 
import { useSelector } from "react-redux";
import { useLogoutAssociateMutation } from "../../Redux/user.api";
import { Link, useNavigate } from "react-router-dom";
import { 
  LogOut, 
  Users, 
  UserPlus, 
  CheckCircle, 
  Loader2, 
  Building2,
  Zap,
  Trash2,
  AlertCircle,
  Home,
  FileText,
  User
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from 'sonner';

const ConsumerForm = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState([
    { consumerName: "", consumerLoadCapacity: "" }
  ]);

  const addConsumer = () => {
    setConsumers([
      ...consumers,
      { consumerName: "", consumerLoadCapacity: "" }
    ]);
  };

  const removeConsumer = (index) => {
    if (consumers.length > 1) {
      const updated = consumers.filter((_, i) => i !== index);
      setConsumers(updated);
    }
  };

  const associate = useSelector((state) => state.associatePartner?.user);
  const associateId = associate?._id;
  const associateName = associate?.name || "Associate";

  const [onboardUser, { isLoading }] = useOnboardUserMutation();
  const [logoutAssociate, { isLoading: isLoggingOut }] = useLogoutAssociateMutation();


  const handleLogout = async () => {
    try {
      await logoutAssociate().unwrap();
      localStorage.removeItem("AssociatePartnerAuth");
      alert("Logged out successfully!");
      navigate("/UserLogin");
    } catch (err) {
      console.error("Logout Error:", err);
      alert("Logout failed!");
    }
  };


const handleSubmit = async () => { 
  // Validate all fields
  const emptyFields = consumers.some(
    c => !c.consumerName.trim() || !c.consumerLoadCapacity.trim()
  );

  if (emptyFields) {
    toast.error("Please fill all consumer details before submitting!");
    return;
  }

  try {
    const payload = {
      onboardType: "CONSUMER",
      consumers: JSON.stringify(consumers),
    };

    const res = await onboardUser({
      id: associateId,
      payload,
    }).unwrap();

    console.log("API SUCCESS RESPONSE:", res);

    // 🟢 JAB unwrap ho gaya → 100% API SUCCESS
    toast.success("Consumer details submitted!");

    // 💥 Direct navigate – NO success check needed
    navigate("/assoceproflle");
    

    setConsumers([{ consumerName: "", consumerLoadCapacity: "" }]);

  } catch (error) {
    console.log("ERROR:", error);
    const msg = error?.data?.message || error?.error || "Something went wrong!";
    toast.error(msg);
  }
};




  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f7f9] to-gray-100 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-[#3197b0] to-[#a855f7] rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#3197b0] to-[#a855f7] bg-clip-text text-transparent">
                  Consumer Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Associate: <span className="font-semibold text-[#3197b0]">{associateName}</span> | 
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-sm md:text-base">
              Add and manage consumer details efficiently
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 self-start sm:self-center">
            {/* Associate Dashboard Button */}

            {/* Profile Button */}
            <button
              onClick={() => navigate("/assoceproflle")}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">My Profile</span>
              <span className="sm:hidden">Profile</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

      

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f0f9ff] rounded-lg">
                  <Users className="w-5 h-5 text-[#3197b0]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Consumer Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Enter consumer information below
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0f9ff] rounded-full border border-[#dbeafe]">
                  <span className="text-sm font-semibold text-[#3197b0]">
                    {consumers.length} {consumers.length === 1 ? 'Consumer' : 'Consumers'}
                  </span>
                </div>
                
                {/* Download PDF Button */}
             
              </div>
            </div>
          </div>

          {/* Consumers List */}
          <div className="p-6 space-y-4">
            {consumers.map((consumer, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-[#a855f7]/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#a855f7] to-[#3197b0] rounded-full">
                      <span className="text-white text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-700">
                      Consumer #{index + 1}
                    </h3>
                  </div>
                  
                  {consumers.length > 1 && (
                    <button
                      onClick={() => removeConsumer(index)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors duration-200"
                      title="Remove consumer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Consumer Name Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Building2 className="w-4 h-4 text-[#3197b0]" />
                      Consumer Name
                    </label>
                    <input
                      type="text"
                      value={consumer.consumerName}
                      onChange={(e) => {
                        const updated = [...consumers];
                        updated[index].consumerName = e.target.value;
                        setConsumers(updated);
                      }}
                      placeholder="Enter consumer name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50 focus:border-[#a855f7] transition-all duration-200 bg-white text-gray-800 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Load Capacity Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Zap className="w-4 h-4 text-[#3197b0]" />
                      Load Capacity (kW)
                    </label>
                    <input
                      type="text"
                      value={consumer.consumerLoadCapacity}
                      onChange={(e) => {
                        const updated = [...consumers];
                        updated[index].consumerLoadCapacity = e.target.value;
                        setConsumers(updated);
                      }}
                      placeholder="Enter load capacity"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50 focus:border-[#a855f7] transition-all duration-200 bg-white text-gray-800 placeholder:text-gray-400"
                    />
                  </div>
                </div>
                
                {/* Consumer added timestamp (for display only) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Will be added on: {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Consumer Button */}
        <div className="p-6 border-t border-gray-100">

  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

    {/* Add Consumer Button */}
    <button
      onClick={addConsumer}
      className="flex items-center justify-center gap-2 w-full sm:w-auto 
      px-6 py-3 border-2 border-dashed border-[#93c5fd] text-[#3197b0] 
      bg-[#f0f9ff] hover:bg-[#e0f2fe] rounded-xl font-medium 
      transition-all duration-200 hover:border-solid hover:border-[#3197b0] 
      active:scale-95 shadow-sm"
    >
      <UserPlus className="w-5 h-5" />
      Add Another Consumer
    </button>

    {/* Submit Button */}
    <button
      type="button"
      onClick={handleSubmit}
      className="w-full sm:w-auto px-6 py-3 
      bg-gradient-to-r from-[#3197b0] to-[#2a859c] 
      text-white font-semibold rounded-xl shadow-md 
      hover:shadow-lg active:scale-95 transition-all duration-200"
    >
      Submit
    </button>

  </div>

</div>

        </div>


       
      </div>
    </div>
  );
};

export default ConsumerForm;