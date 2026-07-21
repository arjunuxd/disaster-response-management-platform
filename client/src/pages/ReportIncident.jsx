import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import reportService from '../services/reportService';
import disasterTypeService from '../services/disasterTypeService';
import { useToast } from '../context/ToastContext';
import { SEVERITY_LEVELS } from '../utils/constants';
import LocationPickerModal from '../components/map/LocationPickerModal';

const STEPS = [
  { id: 1, label: 'Type & Location', description: 'What & where' },
  { id: 2, label: 'Details', description: 'What happened' },
  { id: 3, label: 'Review', description: 'Confirm & submit' },
];

const ReportIncident = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const mapLocation = location.state;

  const [currentStep, setCurrentStep] = useState(1);
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [formData, setFormData] = useState({
    reportType: '',
    title: '',
    description: '',
    latitude: mapLocation?.latitude?.toString() || '',
    longitude: mapLocation?.longitude?.toString() || '',
    address: mapLocation?.address || '',
    district: '',
    state: '',
    severity: 'Medium',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [typeSearch, setTypeSearch] = useState('');

  const filteredTypes = useMemo(() => {
    if (!typeSearch.trim()) return disasterTypes;
    const q = typeSearch.toLowerCase();
    return disasterTypes.filter((t) => t.name.toLowerCase().includes(q));
  }, [disasterTypes, typeSearch]);

  const selectedType = disasterTypes.find((t) => t._id === formData.reportType);
  const hasLocation = formData.latitude && formData.longitude;

  const autoTitle = useMemo(() => {
    if (!selectedType) return '';
    const parts = [selectedType.name];
    if (formData.district) parts.push(formData.district);
    return parts.join(' - ');
  }, [selectedType, formData.district]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await disasterTypeService.getDisasterTypes();
        setDisasterTypes(res.data.data || []);
      } catch {
        setDisasterTypes([]);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (autoTitle && !formData.title) {
      setFormData((prev) => ({ ...prev, title: autoTitle }));
    }
  }, [autoTitle]);

  const validateStep = (step) => {
    const errs = {};
    switch (step) {
      case 1:
        if (!formData.reportType) errs.reportType = 'Please select a disaster type';
        if (!formData.latitude) errs.latitude = 'Location is required';
        else {
          const lat = parseFloat(formData.latitude);
          if (isNaN(lat) || lat < -90 || lat > 90) errs.latitude = 'Invalid latitude';
        }
        if (!formData.longitude) errs.longitude = 'Location is required';
        else {
          const lng = parseFloat(formData.longitude);
          if (isNaN(lng) || lng < -180 || lng > 180) errs.longitude = 'Invalid longitude';
        }
        if (!formData.district) errs.location = 'District is required — pick a specific location on the map';
        if (!formData.state) errs.location = 'State is required — pick a specific location on the map';
        break;
      case 2:
        if (!formData.title.trim()) errs.title = 'Title is required';
        else if (formData.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
        if (!formData.description.trim()) errs.description = 'Description is required';
        else if (formData.description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
        if (!formData.severity) errs.severity = 'Severity is required';
        break;
      case 3:
        for (const file of images) {
          if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            errs.images = 'Only JPEG, PNG, and WebP images are allowed';
            break;
          }
          if (file.size > 5 * 1024 * 1024) {
            errs.images = 'Each image must be less than 5MB';
            break;
          }
        }
        if (images.length > 5) errs.images = 'Maximum 5 images allowed';
        break;
      default:
        break;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLocationPick = useCallback((loc) => {
    setFormData((prev) => ({
      ...prev,
      latitude: loc.lat.toString(),
      longitude: loc.lng.toString(),
      address: loc.address || prev.address,
      district: loc.district || prev.district,
      state: loc.state || prev.state,
    }));
    if (errors.latitude) setErrors((prev) => ({ ...prev, latitude: '' }));
    if (errors.longitude) setErrors((prev) => ({ ...prev, longitude: '' }));
    setShowMapPicker(false);
  }, [errors]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setErrors((prev) => ({ ...prev, images: '' }));
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => fd.append(key, val));
      images.forEach((file) => fd.append('images', file));
      await reportService.createReport(fd);
      toast.success('Report submitted successfully!');
      navigate('/reports');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit report.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">What happened?</h3>
              <p className="text-sm text-gray-500">Select the disaster type</p>
              {errors.reportType && <p className="text-sm text-danger-600 mt-2">{errors.reportType}</p>}
              {disasterTypes.length > 4 && (
                <div className="relative mt-3">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    placeholder="Search types..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                  />
                  {typeSearch && (
                    <button
                      type="button"
                      onClick={() => setTypeSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-3">
                {filteredTypes.map((type) => (
                  <button
                    key={type._id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, reportType: type._id }));
                      if (errors.reportType) setErrors((prev) => ({ ...prev, reportType: '' }));
                    }}
                    className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                      formData.reportType === type._id
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${formData.reportType === type._id ? 'text-primary-700' : 'text-gray-900'}`}>{type.name}</p>
                  </button>
                ))}
              </div>
              {typeSearch && filteredTypes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6">No types match "{typeSearch}"</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Where did it happen?</h3>
              <p className="text-sm text-gray-500 mb-3">Pick the location on the map. District & state are auto-detected.</p>
              {errors.latitude && <p className="text-sm text-danger-600 mb-2">{errors.latitude}</p>}
              {errors.location && <p className="text-sm text-danger-600 mb-2">{errors.location}</p>}
              <div className={`border rounded-xl overflow-hidden ${errors.latitude ? 'border-danger-300' : 'border-gray-200'}`}>
                <div
                  className="relative h-64 bg-gray-100 cursor-pointer"
                  onClick={() => setShowMapPicker(true)}
                >
                  {hasLocation ? (
                    <div className="absolute inset-0">
                      <iframe
                        title="Location preview"
                        className="w-full h-full border-0 pointer-events-none"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(formData.longitude) - 0.01},${parseFloat(formData.latitude) - 0.01},${parseFloat(formData.longitude) + 0.01},${parseFloat(formData.latitude) + 0.01}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-transparent" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm font-medium">Tap to pick location</p>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between">
                  <div className="text-xs text-gray-500 min-w-0 truncate">
                    {hasLocation ? (
                      <span>
                        {formData.district && <span className="font-medium text-gray-700">{formData.district}</span>}
                        {formData.state && <span className="text-gray-400 ml-1">{formData.state}</span>}
                        {!formData.district && !formData.state && (
                          <span>{parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400">No location selected</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowMapPicker(true); }}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 shrink-0 ml-3"
                  >
                    {hasLocation ? 'Change' : 'Pick Location'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">What are the details?</h3>
              <p className="text-sm text-gray-500">Add a brief description of the incident</p>
            </div>

            <div>
              <label className="input-label">Severity <span className="text-danger-500">*</span></label>
              <div className="flex gap-2">
                {SEVERITY_LEVELS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, severity: s.value }))}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                      formData.severity === s.value
                        ? s.value === 'Critical' ? 'border-red-500 bg-red-50 text-red-700'
                          : s.value === 'High' ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : s.value === 'Medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Title <span className="text-danger-500">*</span></label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input-field ${errors.title ? 'border-danger-500' : ''}`}
                placeholder="e.g. Flood in Chennai"
              />
              {errors.title && <p className="mt-1 text-sm text-danger-600">{errors.title}</p>}
            </div>

            <div>
              <label className="input-label">Description <span className="text-danger-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`input-field resize-y ${errors.description ? 'border-danger-500' : ''}`}
                placeholder="What happened? Any visible damage? How many people affected?"
              />
              {errors.description && <p className="mt-1 text-sm text-danger-600">{errors.description}</p>}
            </div>

            {hasLocation && (formData.district || formData.state) && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Auto-detected location</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {formData.district && <span className="text-gray-700"><span className="text-gray-400">District:</span> {formData.district}</span>}
                  {formData.state && <span className="text-gray-700"><span className="text-gray-400">State:</span> {formData.state}</span>}
                </div>
                {formData.address && <p className="text-xs text-gray-500 mt-1.5 truncate">{formData.address}</p>}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Review & Submit</h3>
              <p className="text-sm text-gray-500">Confirm your report details</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Type</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedType?.name || '—'}</p>
                </div>
                <button type="button" onClick={() => setCurrentStep(1)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Edit</button>
              </div>

              <div className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {formData.district && formData.state ? `${formData.district}, ${formData.state}` : hasLocation ? `${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)}` : '—'}
                  </p>
                  {formData.address && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[280px]">{formData.address}</p>}
                </div>
                <button type="button" onClick={() => setCurrentStep(1)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Edit</button>
              </div>

              <div className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Details</p>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Edit</button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-14">Title:</span>
                    <span className="text-sm font-medium text-gray-900">{formData.title || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-14">Severity:</span>
                    <span className={`badge-severity-${formData.severity?.toLowerCase()}`}>{formData.severity}</span>
                  </div>
                  {formData.description && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-2">{formData.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-gray-900 mb-3">Photos (optional)</p>
              {errors.images && <p className="text-sm text-danger-600 mb-3">{errors.images}</p>}
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-primary-300 transition-colors">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                </svg>
                <p className="text-xs text-gray-500">Tap to add photos (max 5)</p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img src={preview} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger-500 text-white rounded-full text-xs flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report an Incident</h1>
        <p className="text-gray-500 mt-1">Quick 3-step form — takes less than a minute</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-initial">
              <div className="flex items-center gap-2">
                <div className={`wizard-step-dot ${
                  currentStep === step.id ? 'wizard-step-dot-active' :
                  currentStep > step.id ? 'wizard-step-dot-completed' :
                  'wizard-step-dot-pending'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-xs font-semibold ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                  <p className="text-[10px] text-gray-400">{step.description}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`wizard-step-line mx-3 ${
                  currentStep > step.id ? 'wizard-step-line-completed' :
                  currentStep === step.id ? 'wizard-step-line-active' :
                  'wizard-step-line-pending'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {renderStepContent()}

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
          <button
            type="button"
            onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
            className="btn-secondary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < 3 ? (
            <button type="button" onClick={handleNext} className="btn-primary">
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary">
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          )}
        </div>
      </div>

      {showMapPicker && (
        <LocationPickerModal
          initialLat={hasLocation ? parseFloat(formData.latitude) : null}
          initialLng={hasLocation ? parseFloat(formData.longitude) : null}
          onSelect={handleLocationPick}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
};

export default ReportIncident;
