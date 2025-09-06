// src/types/portfolio.ts
export interface PortfolioView {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  userDepartment: string;
  bio: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  researchInterests: string;
  achievements: string;
  education: string;
  experience: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioCreateDto {
  bio: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  researchInterests: string;
  achievements: string;
  education: string;
  experience: string;
}
