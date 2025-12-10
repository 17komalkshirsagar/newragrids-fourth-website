// src/components/EpcDashboard/EpcDashboard.jsx
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { FiPlus, FiTrash2, FiMapPin, FiUser, FiMail, FiPhone, FiCalendar, FiUpload, FiLogOut, FiHome, FiGrid, FiBarChart2, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { FaSolarPanel, FaIndustry, FaMapMarkerAlt, FaPlug, FaBalanceScale, FaFileContract, FaClock, FaArrowAltCircleDown, FaArrowAltCircleRight } from "react-icons/fa";

import {
  useGetEpcProfileQuery,
  useAddSolarFarmMutation,
} from "../../../Redux/epcDashboard.api"; 
import { useLogoutEpcMutation } from "../../../Redux/Epc.api";
import { Link, useNavigate } from "react-router-dom";

// Empty template matching your schema (frontend-friendly)
const EmptyFarm = () => ({
  projectName: "",
  lat: "",
  lng: "",
  ac: "",
  dc: "",
  substationCategory: "", // "MSEDCL" | "MSETCL"
  taluka: "",
  district: "",
  substation: "",
  distanceFromSubstation: "",
  landOwnership: "", // OWN | LEASE
  statusOfFarm: "",
  statusOfLoan: "",
  regulatoryStatus: "",
  tariffExpected: "",
  expectedCommissioningTimeline: {
    epcWorkStartDate: "",
    injectionDate: "",
    commercialOperationsDate: "",
  },
  landDocument: null, // File
});

const EpcDashboard = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // robustly pick epc user from various places in your Redux state
  const reduxCandidate = useSelector((s) =>
    s?.epc?.user ? s.epc.user : s?.auth?.epc ? s.auth.epc : s?.user?.user ? s.user.user : s?.user ? s.user : null
  );

  // reduxCandidate might itself be { user: { ... } } or direct user object
  const epcUserFromState = reduxCandidate?.user || reduxCandidate;
  const epcId = epcUserFromState?._id || null;

  // fetch fresh profile from backend
  const { data: profileData, isLoading: profileLoading, refetch } = useGetEpcProfileQuery(epcId, {
    skip: !epcId,
  });

  const profile = profileData?.user || epcUserFromState || null;
  const [logoutEpc] = useLogoutEpcMutation();
  
  // mutation
  const [addSolarFarmApi, { isLoading: adding }] = useAddSolarFarmMutation();

  // UI state: list of farms (multiple forms)
  const [farms, setFarms] = useState([EmptyFarm()]);

  // helpers
  const updateFarm = (idx, key, value) => {
    setFarms((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const updateTimeline = (idx, key, value) => {
    setFarms((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        expectedCommissioningTimeline: {
          ...(next[idx].expectedCommissioningTimeline || {}),
          [key]: value,
        },
      };
      return next;
    });
  };

  const updateFile = (idx, file) => {
    setFarms((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], landDocument: file };
      return next;
    });
  };

  const addOne = () => setFarms((p) => [...p, EmptyFarm()]);
  const removeOne = (idx) => setFarms((p) => p.filter((_, i) => i !== idx));

  // basic validation
  const validateAll = () => {
    if (!epcId) return "EPC ID not found in Redux (login required).";
    for (let i = 0; i < farms.length; i++) {
      const f = farms[i];
      if (!f.projectName || !f.projectName.trim()) return `Farm ${i + 1}: projectName required`;
      if (!f.lat || !f.lng) return `Farm ${i + 1}: coordinates required`;
      if (!f.ac) return `Farm ${i + 1}: AC capacity required`;
      if (!f.substation) {
        // If user didn't use dropdown substation (allow manual substation), check substation field
      }
      if (!f.substation && !f.substationCategory) return `Farm ${i + 1}: select substation or category`;
      if (!f.landDocument) return `Farm ${i + 1}: land document required`;
    }
    return null;
  };

  const handleSubmitAll = async () => {
    const err = validateAll();
    if (err) {
      toast.error(err);
      return;
    }

    try {
      toast.loading("Uploading farms...");

      const fd = new FormData();

      const farmsPayload = farms.map((f) => ({
        projectName: f.projectName,
        location: JSON.stringify({
          coordinates: { lat: Number(f.lat), lng: Number(f.lng) },
        }),
        capacity: JSON.stringify({ ac: f.ac, dc: f.dc }),
        substation: JSON.stringify({
          category: f.substationCategory,
          taluka: f.taluka || null,
          district: f.district || null,
          substation: f.substation,
        }),
        distanceFromSubstation: f.distanceFromSubstation,
        landOwnership: f.landOwnership,
        statusOfFarm: f.statusOfFarm,
        statusOfLoan: f.statusOfLoan,
        regulatoryStatus: f.regulatoryStatus,
        tariffExpected: f.tariffExpected,
        expectedCommissioningTimeline: JSON.stringify(
          f.expectedCommissioningTimeline
        ),
      }));

      fd.append("farms", JSON.stringify(farmsPayload));

      farms.forEach((f, idx) => {
        if (f.landDocument) {
          fd.append(`landDocument_${idx}`, f.landDocument);
        }
      });

      // 🔥🔥 Correct API Call 🔥🔥
      const res = await addSolarFarmApi({
        id: epcId,
        data: fd,
      }).unwrap();

      toast.dismiss();
      toast.success(res?.message || "Farms added successfully!");

      refetch?.();
      setFarms([EmptyFarm()]);
    } catch (error) {
      toast.dismiss();
      toast.error(error?.data?.message || "Failed to add farms");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutEpc().unwrap();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalCapacity = farms.reduce((sum, farm) => sum + (parseFloat(farm.ac) || 0), 0);
    const completedFarms = farms.filter(f => f.landDocument).length;
    return {
      totalFarms: farms.length,
      totalCapacity: totalCapacity.toFixed(2),
      completedFarms,
      pendingFarms: farms.length - completedFarms
    };
  }, [farms]);

  if (!profile && profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f0f8f9' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d57a2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading EPC profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f0f8f9' }}>
        <div className="text-center max-w-md">
        
          <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No EPC profile found</h2>
          <p className="text-gray-600 mb-4">Please login to access the dashboard</p>
          <button 
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-[#2d57a2] text-white rounded-lg hover:bg-[#244a8a] transition-colors"
            >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f8f9' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#2d57a2] flex items-center justify-center">
                <FaIndustry className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EPC Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your solar farm projects</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                <p className="text-xs text-gray-500">EPC Contractor</p>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-6">
  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2d57a2] to-blue-600 flex items-center justify-center text-white">
    <FiUser className="w-8 h-8" />
  </div>

  <div>
    <Link to="/epcprofile">
    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>

    {/* 👇 Updated small text */}
    <p className="text-xs text-gray-500">View your EPC profile </p>
    </Link>
  </div>
</div>


              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FiMail className="text-[#2d57a2]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FiPhone className="text-[#2d57a2]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium text-gray-900">{profile.mobile}</p>
                  </div>
                </div>

                {profile.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FiHome className="text-[#2d57a2] mt-1" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{profile.address}</p>
                    </div>
                  </div>
                )}

                {profile.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FiCalendar className="text-[#2d57a2]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">{new Date(profile.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiBarChart2 className="text-[#2d57a2]" />
                Project Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Total Farms</div>
                  <div className="text-xl font-bold text-[#2d57a2]">{stats.totalFarms}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Total Capacity</div>
                  <div className="text-xl font-bold text-[#2d57a2]">{stats.totalCapacity} MW</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-xl font-bold text-green-600">{stats.completedFarms}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="text-xl font-bold text-amber-600">{stats.pendingFarms}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Completion Progress</span>
                  <span>{stats.completedFarms}/{stats.totalFarms}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#2d57a2] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.completedFarms / stats.totalFarms) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={addOne}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2d57a2] text-white rounded-lg hover:bg-[#244a8a] transition-colors"
                >
                  <FiPlus />
                  Add New Farm
                </button>

                <button
                  onClick={() => setFarms([EmptyFarm()])}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiTrash2 />
                  Clear All Forms
                </button>

                <button
                  onClick={handleSubmitAll}
                  disabled={adding || farms.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiUpload />
                  {adding ? "Submitting..." : "Submit All Farms"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Farm Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaSolarPanel className="text-[#2d57a2]" />
                  Solar Farm Projects
                </h2>
                <div className="text-sm text-gray-500">
                  {farms.length} farm{farms.length !== 1 ? 's' : ''} added
                </div>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {farms.map((f, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <span className="font-bold text-[#2d57a2]">{idx + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Farm #{idx + 1}</h3>
                          {f.projectName && (
                            <p className="text-sm text-gray-600">{f.projectName}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {f.landDocument && (
                          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            <FiCheckCircle />
                            <span>Document Uploaded</span>
                          </div>
                        )}
                        {farms.length > 1 && (
                          <button
                            onClick={() => removeOne(idx)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove this farm"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Project Details */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                        <input
                          placeholder="Enter project name"
                          value={f.projectName}
                          onChange={(e) => updateFarm(idx, "projectName", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          Coordinates *
                        </label>
                        <div className="flex gap-2">
                          <input
                            placeholder="Latitude"
                            value={f.lat}
                            onChange={(e) => updateFarm(idx, "lat", e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                          />
                          <input
                            placeholder="Longitude"
                            value={f.lng}
                            onChange={(e) => updateFarm(idx, "lng", e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                          />
                        </div>
                      </div>

                      {/* Capacity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <FaPlug className="text-gray-400" />
                          AC Capacity (MW) *
                        </label>
                        <input
                          placeholder="Enter AC capacity"
                          value={f.ac}
                          onChange={(e) => updateFarm(idx, "ac", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">DC Capacity (MWp)</label>
                        <input
                          placeholder="Enter DC capacity"
                          value={f.dc}
                          onChange={(e) => updateFarm(idx, "dc", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                        />
                      </div>

                      {/* Substation Details */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Substation Category *</label>
                        <select
                          value={f.substationCategory}
                          onChange={(e) => updateFarm(idx, "substationCategory", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                        >
                          <option value="">Select Category</option>
                          <option value="MSEDCL">MSEDCL</option>
                          <option value="MSETCL">MSETCL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <input
                          placeholder="Enter district"
                          value={f.district}
                          onChange={(e) => updateFarm(idx, "district", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Taluka</label>
                        <input
                          placeholder="Enter taluka"
                          value={f.taluka}
                          onChange={(e) => updateFarm(idx, "taluka", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Substation *</label>
                        <input
                          placeholder="Enter substation name"
                          value={f.substation}
                          onChange={(e) => updateFarm(idx, "substation", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                        />
                      </div>

                      {/* Timeline */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          Expected Timeline
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            placeholder="EPC Start (DD/MM/YYYY)"
                            value={f.expectedCommissioningTimeline.epcWorkStartDate}
                            onChange={(e) => updateTimeline(idx, "epcWorkStartDate", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                          />
                          <input
                            placeholder="Injection Date (DD/MM/YYYY)"
                            value={f.expectedCommissioningTimeline.injectionDate}
                            onChange={(e) => updateTimeline(idx, "injectionDate", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                          />
                          <input
                            placeholder="Commercial Ops (DD/MM/YYYY)"
                            value={f.expectedCommissioningTimeline.commercialOperationsDate}
                            onChange={(e) => updateTimeline(idx, "commercialOperationsDate", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d57a2]/20 focus:border-[#2d57a2] outline-none"
                          />
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <FiMapPin className="text-gray-400" />
                          Land Document *
                        </label>
                        <input
                          type="file"
                          onChange={(e) => updateFile(idx, e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2d57a2] file:text-white hover:file:bg-[#244a8a]"
                        />
                        {f.landDocument && (
                          <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                            <FiCheckCircle />
                            Selected: {f.landDocument.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <FiLogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Logout Confirmation</h3>
              <p className="text-gray-600">Are you sure you want to logout?</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpcDashboard;