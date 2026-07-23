"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/utils";
import { useWishlist } from "@/context/WishlistContext";

interface UserProfileCardProps {
  user: {
    id: string;
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
  };
}

/**
 * UserProfileCard Component
 *
 * Displays active customer profile parameters and allows logout, edit, and avatar upload actions.
 * Styled in warm cream, soft shadows, and rose gold accents.
 */
export default function UserProfileCard({ user }: UserProfileCardProps) {
  const router = useRouter();
  const { wishlistCount } = useWishlist();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersCount, setOrdersCount] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editCountry, setEditCountry] = useState("");

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const supabase = getSupabaseClient();
      
      // Fetch profile columns (defensive select in case migrations haven't run yet)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (!profileError && profileData) {
        setProfile(profileData);
        setEditName(profileData.name || "");
        setEditPhone(profileData.phone || "");
        setEditAddress(profileData.address || "");
        setEditCity(profileData.city || "");
        setEditState(profileData.state || "");
        setEditCountry(profileData.country || "");
      } else if (profileError) {
        console.warn("[UserProfileCard] Error/missing profile fields:", profileError.message);
      }

      // Fetch total orders count
      if (user.email) {
        const { count, error: countError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("customer_email", user.email);
        if (!countError) {
          setOrdersCount(count || 0);
        }
      }
    } catch (e) {
      console.error("[UserProfileCard] Error loading data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user.id]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setErrorMsg(null);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setErrorMsg(error.message);
        setIsLoggingOut(false);
        return;
      }

      router.push("/signin");
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred during logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  const handleSave = async () => {
    try {
      setErrorMsg(null);
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editName,
          phone: editPhone,
          address: editAddress,
          city: editCity,
          state: editState,
          country: editCountry,
        })
        .eq("id", user.id);

      if (error) {
        setErrorMsg(error.message);
      } else {
        setIsEditing(false);
        await loadProfileData();
        window.dispatchEvent(new Event("certitude_profile_updated"));
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to save profile.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploading(true);
      setErrorMsg(null);
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const supabase = getSupabaseClient();
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      // Update avatar_url in profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      await loadProfileData();
      window.dispatchEvent(new Event("certitude_profile_updated"));
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleNewsletterToggle = async () => {
    try {
      setErrorMsg(null);
      const supabase = getSupabaseClient();
      const nextStatus = !profile?.newsletter_subscribed;
      
      const { error } = await supabase
        .from("profiles")
        .update({ newsletter_subscribed: nextStatus })
        .eq("id", user.id);
        
      if (error) {
        throw error;
      }
      
      await loadProfileData();
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to update subscription status.");
    }
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-stone-200/50 bg-white p-6 md:p-8 shadow-xl shadow-stone-200/30 text-stone-850 transition-all duration-300">
      {/* Top-Left Back Button */}
      {!isEditing && (
        <div className="flex justify-start mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800 cursor-pointer transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      )}

      {/* Header Info with Avatar */}
      <div className="flex items-center gap-5 border-b border-stone-100 pb-6 mb-6">
        <div className="relative group flex-shrink-0">
          <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[#E0A99E] bg-stone-50 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-[#C68B7D]">
                {profile?.name ? profile.name.slice(0, 2).toUpperCase() : (user.email ? user.email.slice(0, 2).toUpperCase() : "U")}
              </span>
            )}
          </div>
          {/* Avatar Upload overlay */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-extrabold uppercase tracking-wide">
            {uploading ? "..." : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <div className="text-left flex-1 min-w-0">
          <h3 className="text-lg font-bold text-stone-900 leading-tight truncate">
            {profile?.name || "Customer Profile"}
          </h3>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-0.5">
            {user.email === "admin@cloudcertitude.com" ? "Certitude Admin" : "Certitude Patron"}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-md bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-600">
          {errorMsg}
        </div>
      )}

      {/* Metrics Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-black text-stone-900">{ordersCount}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mt-1 block">Total Orders</span>
        </div>
        <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-black text-stone-900">{wishlistCount}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mt-1 block">Wishlist Items</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-stone-400 font-light">Loading profile data...</div>
      ) : isEditing ? (
        /* Edit Mode Form */
        <div className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-xs text-stone-800 focus:border-[#E0A99E]/80 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/80 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">Phone Number</label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-xs text-stone-800 focus:border-[#E0A99E]/80 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/80 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">Street Address</label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-xs text-stone-800 focus:border-[#E0A99E]/80 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/80 transition-all"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">City</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-xs text-stone-800 focus:border-[#E0A99E]/80 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/80 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">State</label>
              <input
                type="text"
                value={editState}
                onChange={(e) => setEditState(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-xs text-stone-800 focus:border-[#E0A99E]/80 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/80 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">Country</label>
              <input
                type="text"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-xs text-stone-800 focus:border-[#E0A99E]/80 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/80 transition-all"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Read Only Mode Details */
        <div className="space-y-4 text-left">
          <div className="flex justify-between border-b border-stone-50 pb-3">
            <span className="text-xs text-stone-500">Email Address</span>
            <span className="text-xs font-semibold text-stone-850">{user.email || "N/A"}</span>
          </div>
          <div className="flex justify-between border-b border-stone-50 pb-3">
            <span className="text-xs text-stone-500">Phone Number</span>
            <span className="text-xs font-semibold text-stone-850">{profile?.phone || "Not set"}</span>
          </div>
          <div className="flex justify-between border-b border-stone-50 pb-3">
            <span className="text-xs text-stone-500">Address</span>
            <span className="text-xs font-semibold text-stone-850">
              {profile?.address
                ? `${profile.address}, ${profile.city || ""}, ${profile.state || ""}, ${profile.country || ""}`.replace(/,\s*,/g, ",").replace(/^,\s*|,\s*$/g, "")
                : "Not set"}
            </span>
          </div>
          <div className="flex justify-between border-b border-stone-50 pb-3">
            <span className="text-xs text-stone-500">Account Created</span>
            <span className="text-xs font-semibold text-stone-850">
              {user.created_at ? formatDate(user.created_at) : "N/A"}
            </span>
          </div>
          <div className="flex justify-between border-b border-stone-50 pb-3">
            <span className="text-xs text-stone-500">Last Active</span>
            <span className="text-xs font-semibold text-stone-850">
              {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div className="flex flex-col text-left">
              <span className="text-xs text-stone-500">Newsletter Subscription</span>
              <span className="text-[10px] text-stone-400 mt-0.5">Receive news and seasonal updates</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${profile?.newsletter_subscribed ? "bg-emerald-500" : "bg-stone-300"}`} />
                <span className="text-xs font-semibold text-stone-850">
                  {profile?.newsletter_subscribed ? "Subscribed" : "Not Subscribed"}
                </span>
              </div>
              <button
                onClick={handleNewsletterToggle}
                className={`rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                  profile?.newsletter_subscribed
                    ? "bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100/50"
                    : "bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100/50"
                }`}
              >
                {profile?.newsletter_subscribed ? "Unsubscribe" : "Subscribe"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-6">
        <div>
          {isEditing ? (
            <button
              onClick={() => {
                setIsEditing(false);
                setErrorMsg(null);
              }}
              className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50 cursor-pointer shadow-sm mr-2"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => router.back()}
              className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50 cursor-pointer shadow-sm"
            >
              Back
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] cursor-pointer shadow-sm"
            >
              Save Changes
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] cursor-pointer shadow-sm"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-stone-50 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isLoggingOut ? "..." : "Sign Out"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
