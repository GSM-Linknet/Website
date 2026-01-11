import { apiClient } from "./api-client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile?: string | null;
  role: string;
  wilayahId?: string | null;
  cabangId?: string | null;
  unitId?: string | null;
  subUnitId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ProfileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<{ data: UserProfile }>("/user/profile");
    return response.data;
  },

  async updateProfile(data: { name?: string; profile?: string }): Promise<UserProfile> {
    const response = await apiClient.put<{ data: UserProfile }>("/user/profile", data);
    
    // Update localStorage with new profile data
    const userProfile = localStorage.getItem("user_profile");
    if (userProfile) {
      const parsed = JSON.parse(userProfile);
      const updated = { ...parsed, ...response.data };
      localStorage.setItem("user_profile", JSON.stringify(updated));
    }
    
    return response.data;
  },

  async uploadPhoto(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await apiClient.post<{ data: UserProfile }>("/user/profile/upload-photo", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Update localStorage with new profile data
    const userProfile = localStorage.getItem("user_profile");
    if (userProfile) {
      const parsed = JSON.parse(userProfile);
      const updated = { ...parsed, ...response.data };
      localStorage.setItem("user_profile", JSON.stringify(updated));
    }
    
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ data: { message: string } }>("/user/profile/change-password", data);
    return response.data;
  },
};
