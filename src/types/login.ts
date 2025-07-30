export interface iLoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export interface iLoginPageFormProps {
  redirectTo?: string;
}