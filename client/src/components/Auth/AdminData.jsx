import React, { useState, useEffect } from "react";
import { useGetAllAssociatesQuery, useGetAllEpcQuery, useGetAllPartnersQuery } from "../../Redux/admindashApi";
import { Toaster, toast } from "react-hot-toast";
import { useSignOutMutation } from "../../Redux/admin.api";
import { 
  FiUser, FiUsers, FiSun, FiFileText, FiDownload, 
  FiExternalLink, FiChevronDown, FiChevronUp, FiGrid,
  FiList, FiSearch, FiFilter, FiLogOut, FiRefreshCw,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiMapPin,
  FiCalendar, FiPhone, FiMail, FiHome, FiDollarSign,
  FiBarChart2, FiTrendingUp
} from 'react-icons/fi';
import { 
  MdBusinessCenter, MdLocationOn, MdAttachMoney,
  MdElectricBolt, MdAccountBalance, MdOutlineSpeed,
  MdDateRange, MdDashboard, MdPerson, MdSolarPower
} from 'react-icons/md';
import { GiSolarPower } from 'react-icons/gi';

const AdminData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState('partners');
  const [expandedItem, setExpandedItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const { data: partnersData, isLoading: partnersLoading } = useGetAllPartnersQuery();
  const { data: associatesData, isLoading: associatesLoading } = useGetAllAssociatesQuery();
  const { data: epcData, isLoading: epcLoading } = useGetAllEpcQuery();
  const [signOut] = useSignOutMutation();

  const partners = partnersData?.data || [];
  const associates = associatesData?.associates || [];
  const epcUsers = epcData?.users || [];

  // Stats calculations
  const totalPartners = partners.length;
  const totalAssociates = associates.length;
  const totalEPC = epcUsers.length;
  const totalUsers = totalPartners + totalAssociates + totalEPC;

 const totalSolarFarms =
  partners.length +
  associates.flatMap(a => a.onboard?.solarFarms || []).length +
  epcUsers.flatMap(e => e.solarFarms || []).length;

const totalCapacity = [
  ...partners.map(p => parseFloat(p.capacity?.ac) || 0),
  ...associates.flatMap(a =>
    (a.onboard?.solarFarms || []).map(s => parseFloat(s.capacity?.ac) || 0)
  ),
  ...epcUsers.flatMap(e =>
    (e.solarFarms || []).map(s => parseFloat(s.capacity?.ac) || 0)
  )
].reduce((a, b) => a + b, 0);

  // Status color mapping
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('clear') || statusLower.includes('farm')) 
      return 'bg-green-100 text-green-800';
    if (statusLower.includes('pending') || statusLower.includes('submitted') || statusLower.includes('under')) 
      return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('rejected') || statusLower.includes('cancelled')) 
      return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Status icon mapping
  const getStatusIcon = (status) => {
    if (!status) return <FiAlertCircle className="w-4 h-4" />;
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('clear') || statusLower.includes('farm')) 
      return <FiCheckCircle className="w-4 h-4" />;
    if (statusLower.includes('pending') || statusLower.includes('submitted') || statusLower.includes('under')) 
      return <FiAlertCircle className="w-4 h-4" />;
    if (statusLower.includes('rejected') || statusLower.includes('cancelled')) 
      return <FiXCircle className="w-4 h-4" />;
    return <FiAlertCircle className="w-4 h-4" />;
  };

  // Filter data based on search term and status
  const getFilteredData = () => {
    let data = [];
    if (currentTab === 'partners') data = partners;
    else if (currentTab === 'associates') data = associates;
    else if (currentTab === 'epc') data = epcUsers;

    return data.filter(item => {
      // Search filter
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mobile?.toString().includes(searchTerm) ||
        item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (currentTab === 'partners') {
          matchesStatus = item.statusOfFarm?.toLowerCase().includes(statusFilter) ||
                         item.regulatoryStatus?.toLowerCase().includes(statusFilter);
        } else if (currentTab === 'associates') {
          const farms = item.onboard?.solarFarms || [];
          matchesStatus = farms.some(farm => 
            farm.statusOfFarm?.toLowerCase().includes(statusFilter) ||
            farm.regulatoryStatus?.toLowerCase().includes(statusFilter)
          );
        } else if (currentTab === 'epc') {
          const farms = item.solarFarms || [];
          matchesStatus = farms.some(farm => 
            farm.statusOfFarm?.toLowerCase().includes(statusFilter) ||
            farm.regulatoryStatus?.toLowerCase().includes(statusFilter)
          );
        }
      }

      return matchesSearch && matchesStatus;
    });
  };

  const filteredData = getFilteredData();

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut().unwrap();
      toast.success("Logged out successfully!");
      setTimeout(() => {
        window.location.href = "/admin-login";
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed!");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Loading state
  const isLoading = partnersLoading || associatesLoading || epcLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              <span className="text-blue-600">NewRa</span> Grids Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage Partners, Associates & EPC Users
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiLogOut />
              <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<MdPerson className="w-6 h-6 text-blue-500" />}
              title="Total Users"
              value={totalUsers}
              color="blue"
              subItems={[
                { label: "Partners", value: totalPartners, color: "bg-blue-100 text-blue-800" },
                { label: "Associates", value: totalAssociates, color: "bg-green-100 text-green-800" },
                { label: "EPC", value: totalEPC, color: "bg-purple-100 text-purple-800" }
              ]}
            />
            
            <StatCard
              icon={<GiSolarPower className="w-6 h-6 text-amber-500" />}
              title="Solar Farms"
              value={totalSolarFarms}
              color="amber"
            />
            
            <StatCard
              icon={<MdElectricBolt className="w-6 h-6 text-green-500" />}
              title="Total Capacity"
              value={`${totalCapacity.toFixed(1)} MW`}
              color="green"
            />
            
            <StatCard
              icon={<FiTrendingUp className="w-6 h-6 text-purple-500" />}
              title="Active Projects"
              value={partners.filter(p => 
                p.statusOfFarm?.toLowerCase().includes('clear') || 
                p.statusOfFarm?.toLowerCase().includes('farm') ||
                p.regulatoryStatus?.toLowerCase().includes('approved')
              ).length}
              color="purple"
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs and Controls */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              <TabButton 
                active={currentTab === 'partners'} 
                onClick={() => setCurrentTab('partners')}
                icon={<MdBusinessCenter />}
                badge={partners.length}
              >
                Partners
              </TabButton>
              <TabButton 
                active={currentTab === 'associates'} 
                onClick={() => setCurrentTab('associates')}
                icon={<FiUsers />}
                badge={associates.length}
              >
                Associates
              </TabButton>
              <TabButton 
                active={currentTab === 'epc'} 
                onClick={() => setCurrentTab('epc')}
                icon={<FiSun />}
                badge={epcUsers.length}
              >
                EPC Users
              </TabButton>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
                >
                  <FiGrid className="inline w-4 h-4 mr-1" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
                >
                  <FiList className="inline w-4 h-4 mr-1" /> List
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="clear">Clear</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredData.length}</span> {currentTab}
              {filteredData.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>
        </div>

        {/* Data Display */}
        <div className="p-4 md:p-6">
          {filteredData.length === 0 ? (
            <EmptyState 
              currentTab={currentTab} 
              searchTerm={searchTerm} 
              statusFilter={statusFilter}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item, index) => (
                <UserCard 
                  key={item._id || index}
                  user={item}
                  type={currentTab}
                  isExpanded={expandedItem === item._id}
                  onToggle={() => setExpandedItem(expandedItem === item._id ? null : item._id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((item, index) => (
                <UserCard 
                  key={item._id || index}
                  user={item}
                  type={currentTab}
                  isExpanded={expandedItem === item._id}
                  onToggle={() => setExpandedItem(expandedItem === item._id ? null : item._id)}
                  viewMode="list"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== COMPONENTS ==========

// Loading Spinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
    </div>
    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, title, value, color, subItems }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    amber: 'bg-amber-50 border-amber-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-3 rounded-xl bg-white shadow-sm">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{title}</div>
        </div>
      </div>
      {subItems && (
        <div className="flex gap-2 mt-4">
          {subItems.map((item, index) => (
            <span key={index} className={`text-xs px-2 py-1 rounded-full ${item.color}`}>
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, children, badge }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    {children}
    {badge !== undefined && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
        active ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

// Empty State Component
const EmptyState = ({ currentTab, searchTerm, statusFilter }) => (
  <div className="text-center py-12">
    <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No {currentTab} found</h3>
    <p className="text-gray-600">
      {searchTerm ? `No results for "${searchTerm}"` : 
       statusFilter !== 'all' ? `No ${currentTab} with status "${statusFilter}"` :
       `No ${currentTab} available`}
    </p>
  </div>
);

// User Card Component (Handles all types)
const UserCard = ({ user, type, isExpanded, onToggle, viewMode = 'grid' }) => {
  // Get solar farms based on user type
  const getSolarFarms = () => {
    if (type === 'partners') return [user];
    if (type === 'associates') return user.onboard?.solarFarms || [];
    if (type === 'epc') return user.solarFarms || [];
    return [];
  };

  // Get consumers (for associates)
  const getConsumers = () => {
    if (type === 'associates') return user.onboard?.consumers || [];
    return [];
  };

  // Get bank details (for associates)
  const getBankDetails = () => {
    if (type === 'associates') return user.bankDetails;
    return null;
  };

  const solarFarms = getSolarFarms();
  const consumers = getConsumers();
  const bankDetails = getBankDetails();

  return (
    <div className={`${viewMode === 'grid' ? 'bg-gradient-to-br from-gray-50 to-blue-50' : 'bg-gray-50'} border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div 
        className={`p-4 ${isExpanded ? 'border-b border-gray-200' : ''} cursor-pointer`}
        onClick={onToggle}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-lg ${
                type === 'partners' ? 'bg-blue-100' :
                type === 'associates' ? 'bg-green-100' :
                'bg-purple-100'
              }`}>
                {type === 'partners' ? <MdBusinessCenter className="w-5 h-5 text-blue-600" /> :
                 type === 'associates' ? <FiUsers className="w-5 h-5 text-green-600" /> :
                 <FiSun className="w-5 h-5 text-purple-600" />}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    type === 'partners' ? 'bg-blue-100 text-blue-800' :
                    type === 'associates' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role || type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FiMail className="w-4 h-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiPhone className="w-4 h-4" />
                    {user.mobile}
                  </span>
                  {type === 'partners' && user.projectName && (
                    <span className="flex items-center gap-1">
                      <FiHome className="w-4 h-4" />
                      {user.projectName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-gray-400 ml-2">
            {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 bg-white">
          {/* Basic Info */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Email" value={user.email} icon={<FiMail />} />
              <DetailRow label="Mobile" value={user.mobile} icon={<FiPhone />} />
              <DetailRow label="Address" value={user.address} icon={<FiMapPin />} />
              <DetailRow 
                label="Created" 
                value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} 
                icon={<FiCalendar />}
              />
            </div>
          </div>

          {/* Solar Farms Section */}
          {solarFarms.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <GiSolarPower /> Solar Farms ({solarFarms.length})
              </h4>
              <div className="space-y-3">
                {solarFarms.slice(0, 3).map((farm, index) => (
                  <SolarFarmMiniCard key={farm._id || index} farm={farm} type={type} />
                ))}
                {solarFarms.length > 3 && (
                  <div className="text-sm text-gray-600 text-center">
                    + {solarFarms.length - 3} more solar farms
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Consumers Section (Associates only) */}
          {type === 'associates' && consumers.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Consumers ({consumers.length})</h4>
              <div className="space-y-2">
                {consumers.slice(0, 3).map((consumer, index) => (
                  <div key={consumer._id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{consumer.consumerName}</span>
                    <span className="text-sm text-gray-600">{consumer.consumerLoadCapacity}</span>
                  </div>
                ))}
                {consumers.length > 3 && (
                  <div className="text-sm text-gray-600 text-center">
                    + {consumers.length - 3} more consumers
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bank Details (Associates only) */}
          {type === 'associates' && bankDetails && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Bank Details</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <DetailRow label="Bank" value={bankDetails.bankName} />
                <DetailRow label="Account" value={`•••• ${bankDetails.accountNumber?.slice(-4)}`} />
                <DetailRow label="IFSC" value={bankDetails.ifsc} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                View Details
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Solar Farm Mini Card Component (Updated)
const SolarFarmMiniCard = ({ farm, type }) => {
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('clear') || statusLower.includes('farm')) 
      return 'bg-green-100 text-green-800';
    if (statusLower.includes('pending') || statusLower.includes('submitted') || statusLower.includes('under')) 
      return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('rejected') || statusLower.includes('cancelled')) 
      return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Check file type
  const getFileType = (url) => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'document';
    return 'unknown';
  };

  // Get file icon
  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'document': return '📝';
      default: return '📎';
    }
  };

  // Get file preview URL (for images)
  const getPreviewUrl = (url) => {
    const fileType = getFileType(url);
    if (fileType === 'image') return url;
    return null; // For non-images, we'll show a preview modal
  };

  const [showPreview, setShowPreview] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(null);

  const handlePreviewClick = (url) => {
    const fileType = getFileType(url);
    
    if (fileType === 'image') {
      // Direct open in new tab for images
      window.open(url, '_blank');
    } else if (fileType === 'pdf') {
      // PDF ke liye embedded viewer
      setCurrentPreview(url);
      setShowPreview(true);
    } else {
      // Other files - open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className="p-3 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="font-medium text-gray-900">{farm.projectName || 'Unnamed Project'}</div>
            <div className="text-sm text-gray-600">
              {farm.capacity?.ac || 'N/A'} | {farm.location?.taluka || 'N/A'}
            </div>
          </div>
          {farm.statusOfFarm && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(farm.statusOfFarm)}`}>
              {farm.statusOfFarm}
            </span>
          )}
        </div>
        
        {/* Document Display Section - No download required */}
        {farm.landDocument?.fileUrl && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded">
                  <FiFileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Land Document</div>
                  <div className="text-xs text-gray-500">
                    Type: {farm.landDocument.fileType || 'Document'} | 
                    File: {getFileType(farm.landDocument.fileUrl)}
                  </div>
                </div>
              </div>
              
              {/* View Button - No download */}
              <button
                onClick={() => handlePreviewClick(farm.landDocument.fileUrl)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <FiExternalLink className="w-3.5 h-3.5" />
                View
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {showPreview && currentPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-gray-900">Document Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 h-[70vh]">
              <iframe 
                src={currentPreview} 
                className="w-full h-full border-0"
                title="Document Preview"
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => window.open(currentPreview, '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Detail Row Component
const DetailRow = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
    {icon && <div className="text-gray-500">{icon}</div>}
    <div className="flex-1">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{value || 'N/A'}</div>
    </div>
  </div>
);

export default AdminData;