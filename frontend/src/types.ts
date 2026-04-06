export interface SignatureFields {
  fullName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  photoUrl: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconUrl: string;
  platformId: string;
}

export interface StyleOptions {
  accentColor: string;
  separatorColor: string;
  iconColor: string;
}

export type TemplateId = 'professional' | 'minimal' | 'modern' | 'bold' | 'compact';

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  build: (fields: SignatureFields, style: StyleOptions) => string;
}
