import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Edit2, Save, X, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

const INDIAN_CITIES = [
  'Agartala','Agra','Ahmedabad','Ahmednagar','Aizawl','Ajmer','Akola','Aligarh','Allahabad','Ambala',
  'Amravati','Amritsar','Anand','Anantapur','Aurangabad','Bareilly','Bathinda','Belgaum','Bellary','Bengaluru',
  'Berhampore','Bhagalpur','Bharatpur','Bharuch','Bhavnagar','Bhilai','Bhilwara','Bhopal','Bhubaneswar','Bikaner',
  'Bilaspur','Bokaro','Brahmapur','Bulandshahr','Chandigarh','Chennai','Coimbatore','Cuttack','Darbhanga',
  'Davangere','Dehradun','Delhi','Dhanbad','Dharwad','Dibrugarh','Durg','Durgapur','Erode','Faridabad',
  'Firozabad','Gangtok','Gaya','Ghaziabad','Gorakhpur','Gulbarga','Guntur','Gurgaon','Guwahati','Gwalior',
  'Hapur','Hisar','Hospet','Howrah','Hubli','Hyderabad','Imphal','Indore','Itanagar','Jabalpur','Jaipur',
  'Jalandhar','Jalgaon','Jammu','Jamnagar','Jamshedpur','Jhansi','Jodhpur','Junagadh','Kakinada','Kalyan',
  'Kanpur','Karimnagar','Karnal','Kochi','Kohima','Kolhapur','Kolkata','Kollam','Kota','Kottayam',
  'Kozhikode','Kurnool','Latur','Lucknow','Ludhiana','Madurai','Malegaon','Mangalore','Mathura','Meerut',
  'Moradabad','Mumbai','Muzaffarnagar','Muzaffarpur','Mysore','Nagpur','Nanded','Nashik','Navi Mumbai',
  'Nellore','Noida','Ongole','Pali','Panaji','Panipat','Parbhani','Patiala','Patna','Pondicherry',
  'Pune','Raipur','Rajahmundry','Rajkot','Ranchi','Ratlam','Rohtak','Rourkela','Sagar','Saharanpur',
  'Salem','Sangli','Satara','Shimla','Shimoga','Siliguri','Solapur','Sonipat','Srinagar','Surat',
  'Thanjavur','Thane','Thiruvananthapuram','Thrissur','Tiruchirappalli','Tirunelveli','Tirupati','Tiruppur',
  'Tumkur','Udaipur','Ujjain','Vadodara','Varanasi','Vasai-Virar','Vijayawada','Visakhapatnam','Warangal','Yavatmal',
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [workType, setWorkType] = useState(user?.workType || 'full-time');
  const [platform, setPlatform] = useState(user?.platform || 'Zomato');
  const [preferredHours, setPreferredHours] = useState(user?.preferredHours || '10:00 AM - 10:00 PM');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropPreview, setShowCropPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load avatar from profile
  useEffect(() => {
    async function loadAvatar() {
      if (!user?.id) return;
      const { data } = await supabase.from('profiles').select('avatar_url').eq('user_id', user.id).single();
      if (data?.avatar_url) {
        // If it looks like a path (not a full URL), get a signed URL
        if (!data.avatar_url.startsWith('http')) {
          const { data: signedData } = await supabase.storage.from('avatars').createSignedUrl(data.avatar_url, 3600);
          if (signedData?.signedUrl) setAvatarUrl(signedData.signedUrl);
        } else {
          setAvatarUrl(data.avatar_url);
        }
      } else {
        // Check Google avatar
        const { data: session } = await supabase.auth.getSession();
        const googleAvatar = session?.session?.user?.user_metadata?.avatar_url;
        if (googleAvatar) setAvatarUrl(googleAvatar);
      }
    }
    loadAvatar();
  }, [user?.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowCropPreview(true);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile || !user?.id) return;
    setUploading(true);
    try {
      const ext = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, { upsert: true });
      
      if (uploadError) throw uploadError;

      // Store the file path (not a public URL) since the bucket is private
      await supabase.from('profiles').update({ avatar_url: filePath }).eq('user_id', user.id);
      
      // Get a signed URL for display
      const { data: signedData } = await supabase.storage.from('avatars').createSignedUrl(filePath, 3600);
      if (signedData?.signedUrl) setAvatarUrl(signedData.signedUrl);
      setShowCropPreview(false);
      setPreviewUrl(null);
      setSelectedFile(null);
      toast.success('Profile photo updated!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        name,
        city,
        work_type: workType,
        platform,
        preferred_hours: preferredHours,
      }).eq('user_id', user.id);
      if (error) throw error;
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = previewUrl || avatarUrl;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">{t('profile') || 'Profile'}</h1>

      {/* Avatar + Name centered */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center border-4 border-primary/20">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-14 w-14 text-muted-foreground" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform btn-3d"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">{user?.name || 'User'}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Crop/Preview Modal */}
      {showCropPreview && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setShowCropPreview(false); setPreviewUrl(null); }}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4 border border-border" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground">Preview Photo</h3>
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary/20">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 btn-3d" onClick={() => { setShowCropPreview(false); setPreviewUrl(null); }}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button className="flex-1 btn-3d" onClick={handleUploadAvatar} disabled={uploading}>
                <Save className="h-4 w-4 mr-1" /> {uploading ? 'Uploading...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Details */}
      <div className="elevated-card rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Personal Details</h3>
          {!editing ? (
            <Button variant="outline" size="sm" className="gap-2 btn-3d" onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="btn-3d" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" className="btn-3d" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            {editing ? (
              <Input value={name} onChange={e => setName(e.target.value)} />
            ) : (
              <p className="text-sm font-medium text-foreground p-2 bg-muted/50 rounded-lg">{user?.name || '—'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="text-sm font-medium text-foreground p-2 bg-muted/50 rounded-lg">{user?.email || '—'}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">City</Label>
            {editing ? (
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {INDIAN_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-foreground p-2 bg-muted/50 rounded-lg">{user?.city || '—'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Work Type</Label>
            {editing ? (
              <Select value={workType} onValueChange={v => setWorkType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-foreground p-2 bg-muted/50 rounded-lg capitalize">{user?.workType || '—'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Platform</Label>
            {editing ? (
              <Select value={platform} onValueChange={v => setPlatform(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zomato">Zomato</SelectItem>
                  <SelectItem value="Swiggy">Swiggy</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-foreground p-2 bg-muted/50 rounded-lg">{user?.platform || '—'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preferred Hours</Label>
            {editing ? (
              <Input value={preferredHours} onChange={e => setPreferredHours(e.target.value)} />
            ) : (
              <p className="text-sm font-medium text-foreground p-2 bg-muted/50 rounded-lg">{user?.preferredHours || '—'}</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-semibold text-foreground">
                {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Account ID</p>
              <p className="text-xs font-mono text-foreground truncate">{user?.id?.slice(0, 12) || '—'}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
